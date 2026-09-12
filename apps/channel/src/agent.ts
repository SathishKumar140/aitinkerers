import { AbstractAgent } from "@ag-ui/client";
import type { BaseEvent, RunAgentInput } from "@ag-ui/core";
import { makeAgent } from "agent-core";
import { Observable, type Subscription } from "rxjs";

type ChannelAgentFactory = (threadId: string) => AbstractAgent;

/**
 * Defensively repairs conversation messages so that any tool calls from prior turns
 * or aborted tool executions always have matching tool-result messages.
 * This prevents Vercel AI SDK's `MissingToolResultsError` when converting prompt messages.
 */
export function sanitizeMessages(messages: any[]): any[] {
  if (!Array.isArray(messages) || messages.length === 0) return messages;

  const answeredToolCallIds = new Set<string>();
  for (const m of messages) {
    if (m.role === "tool") {
      if (m.toolCallId) answeredToolCallIds.add(m.toolCallId);
      if (Array.isArray(m.content)) {
        for (const part of m.content) {
          if (part && typeof part === "object" && part.toolCallId) {
            answeredToolCallIds.add(part.toolCallId);
          }
        }
      }
    }
  }

  const repaired: any[] = [];
  for (const m of messages) {
    repaired.push(m);
    if (m.role === "assistant" && Array.isArray(m.toolCalls) && m.toolCalls.length > 0) {
      for (const tc of m.toolCalls) {
        if (tc?.id && !answeredToolCallIds.has(tc.id)) {
          repaired.push({
            id: `${tc.id}-recovered-result`,
            role: "tool",
            toolCallId: tc.id,
            content: JSON.stringify({ status: "rendered" }),
          });
          answeredToolCallIds.add(tc.id);
        }
      }
    }
  }

  return repaired;
}

/**
 * Channel-only facade that keeps AG-UI transcript/state on the outer agent while
 * delegating each low-level run to a fresh BuiltInAgent instance.
 *
 * Channels may re-enter the same turn after tool results as soon as the previous
 * observable completes. BuiltInAgent clears its private abort controller later,
 * in its async cleanup, so reusing one instance can trip its reentry guard. This
 * facade leaves AbstractAgent.runAgent untouched and swaps only run(input), which
 * gives every invocation a clean inner agent without changing the shared web and
 * mobile makeAgent factory.
 */
export class ChannelRunAgent extends AbstractAgent {
  private activeInner: AbstractAgent | undefined;

  constructor(
    private agentFactory: ChannelAgentFactory = makeAgent,
    threadId?: string,
  ) {
    super({ threadId });
    this.state = {
      currentPlan: null,
      consensus: null,
      members: ["Ramesh Vishnoi", "Sathish Kumar"],
    };
  }

  override run(input: RunAgentInput): Observable<BaseEvent> {
    return new Observable<BaseEvent>((subscriber) => {
      let inner: AbstractAgent | undefined;
      let subscription: Subscription | undefined;

      const release = () => {
        if (this.activeInner === inner) {
          this.activeInner = undefined;
        }
      };

      try {
        this.messages = sanitizeMessages(this.messages);
        const sanitizedInput: RunAgentInput = {
          ...input,
          messages: sanitizeMessages(input.messages),
        };

        inner = this.agentFactory(input.threadId);
        inner.threadId = input.threadId;
        this.activeInner = inner;
        subscription = inner.run(sanitizedInput).subscribe({
          next: (event) => {
            subscriber.next(event);
          },
          error: (error) => {
            release();
            subscriber.error(error);
          },
          complete: () => {
            release();
            subscriber.complete();
          },
        });
      } catch (error) {
        release();
        subscriber.error(error);
      }

      return () => {
        subscription?.unsubscribe();
        inner?.abortRun();
        release();
      };
    });
  }

  override abortRun() {
    this.activeInner?.abortRun();
    super.abortRun();
  }

  override clone(): ChannelRunAgent {
    const cloned = super.clone() as ChannelRunAgent;
    cloned.agentFactory = this.agentFactory;
    cloned.activeInner = undefined;
    return cloned;
  }
}

export function makeChannelAgent(threadId: string) {
  return new ChannelRunAgent((id) => makeAgent(id, { maxSteps: 1 }), threadId);
}
