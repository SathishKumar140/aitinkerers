/**
 * The on-call agent's tools.
 *
 * A channel tool handler receives the LIVE thread, which is what makes the
 * proposal below possible: it posts a card and returns. A later click reports
 * the decision; it does not resume the agent or execute an action.
 *
 * The return value is what the *agent* reads back, not what the user sees.
 * Return raw data (it is JSON-stringified for you) or a short natural-language
 * confirmation — never `{ ok: true }`, and never hand-stringify.
 */
import {
  defineChannelTool,
  Message,
  Header,
  Section,
  Markdown,
  Context,
  Actions,
  Button,
} from "@copilotkit/channels";
import type { InteractionContext } from "@copilotkit/channels";
export { searchTheWeb } from "./search";
import { z } from "zod";

/**
 * Read the incident context already present in the conversation.
 */
export const readThread = defineChannelTool({
  name: "read_thread",
  description: "Read recent messages in this conversation (last 15). Call to recall group members, past decisions, or prior context.",
  parameters: z.object({}),
  async handler(_args, { thread }) {
    const all = await thread.getMessages();
    if (all.length === 0) {
      return "Thread is empty or history is unavailable. Ask for a brief summary.";
    }
    // Return only the last 15 messages, each truncated to 300 chars to keep
    // the tool result well within the context window.
    const recent = all.slice(-15).map((m: any) => ({
      role: m.role,
      text: typeof m.content === "string"
        ? m.content.slice(0, 300)
        : JSON.stringify(m.content).slice(0, 300),
    }));
    return recent;
  },
});

/**
 * Managed delivery cannot block on awaitChoice. Post a proposal and let a later
 * interaction report the decision. This demo has no production executor.
 * Inline handlers require one listener instance that stays running until click.
 */
export const proposeAction = defineChannelTool({
  name: "propose_action",
  description:
    "Post an action proposal for human review. This returns pending immediately. Stop after posting: do not execute the action or call write tools. A later click reports a decision only; it does not execute anything or resume you.",
  parameters: z.object({
    action: z.string().describe("The proposed action, in one plain sentence."),
    blastRadius: z
      .string()
      .describe(
        "What this affects if it goes wrong. Be specific and pessimistic.",
      ),
    reversible: z
      .boolean()
      .describe("Whether this can be undone in under a minute."),
  }),
  async handler({ action, blastRadius, reversible }, { thread }) {
    // The SDK retains inline action handlers after a message replacement. Queue
    // clicks and settle only after a successful update, so stale/opposite clicks
    // cannot overwrite a decision and a failed update remains retryable.
    let settled = false;
    let previousReport = Promise.resolve();
    const reportDecision = (
      approved: boolean,
      ctx: InteractionContext<boolean>,
    ) => {
      const report = async () => {
        if (settled) return;
        const decision = approved
          ? "Approved proposal. No action was executed."
          : "Held by the responder. No action was executed. Do not take the action or offer a workaround.";
        // Use the interaction's thread, whose delivery is live now.
        await ctx.thread.update(
          ctx.message.ref,
          `${decision}\n\nProposal: ${action}`,
        );
        settled = true;
      };
      previousReport = previousReport.then(report, report);
      return previousReport;
    };
    await thread.post(
      <Message accent="#C4145F">
        <Header>Review action proposal</Header>
        <Section>
          <Markdown>{`**${action}**\n\nBlast radius: ${blastRadius}`}</Markdown>
        </Section>
        <Context>
          {reversible
            ? "Reversible in under a minute"
            : "NOT easily reversible"}
        </Context>
        <Context>
          Demo proposal only. Clicking records a decision; it executes nothing.
        </Context>
        <Actions>
          <Button
            value={true}
            style="primary"
            onClick={async (ctx) => {
              await reportDecision(true, ctx);
            }}
          >
            Approve
          </Button>
          <Button
            value={false}
            style="danger"
            onClick={async (ctx) => {
              await reportDecision(false, ctx);
            }}
          >
            Hold
          </Button>
        </Actions>
      </Message>,
    );

    return "Proposal posted; decision pending. Stop here. Do not take the action, call write tools, or offer a workaround. A later click only reports the decision; no action is executed and the agent does not automatically resume.";
  },
});

import {
  buildGoogleCalendarUrl,
  createGoogleCalendarEventDirect,
  calendarEventSchema,
} from "agent-core";

/**
 * Direct Google Calendar event creator (with 1-Click fallback)
 */
export const createCalendarEvent = defineChannelTool({
  name: "create_calendar_event",
  description:
    "Schedule an event on Google Calendar for an outing, trip, or reservation. Automatically creates the event on Google Calendar if OAuth credentials are configured, or provides a 1-click Google Calendar button.",
  parameters: calendarEventSchema,
  async handler(args, { thread }) {
    const directResult = await createGoogleCalendarEventDirect(args);
    const dateLabel = args.date ? ` on ${args.date}` : "";
    const timeLabel = args.startTime ? ` at ${args.startTime}` : "";
    const calendarUrl = directResult.htmlLink || directResult.fallbackUrl;

    if (directResult.success) {
      await thread.post(
        <Message accent="#2E7D5B">
          <Header>✅ Added to Google Calendar</Header>
          <Section>
            <Markdown>{`**${args.title || args.venueName}** has been automatically scheduled in Google Calendar!\n\n📍 **Location:** ${args.location || args.venueName}\n⏰ **Schedule:**${dateLabel}${timeLabel} (${args.durationMinutes ?? 90} mins)`}</Markdown>
          </Section>
          {args.attendees && args.attendees.length > 0 && (
            <Context>{`Participants: ${args.attendees.join(", ")}`}</Context>
          )}
          <Actions>
            <Button value="open_cal" url={calendarUrl} style="primary">
              📅 Open in Google Calendar
            </Button>
          </Actions>
        </Message>,
      );

      return `Event automatically created in Google Calendar: ${calendarUrl}`;
    }

    // Fallback 1-click invite if credentials are not configured
    await thread.post(
      <Message accent="#2E7D5B">
        <Header>📅 Google Calendar Invite Ready</Header>
        <Section>
          <Markdown>{`**${args.title || args.venueName}**\n📍 **Location:** ${args.location || args.venueName}\n⏰ **Schedule:**${dateLabel}${timeLabel} (${args.durationMinutes ?? 90} mins)`}</Markdown>
        </Section>
        {args.attendees && args.attendees.length > 0 && (
          <Context>{`Participants: ${args.attendees.join(", ")}`}</Context>
        )}
        <Actions>
          <Button value="add_cal" url={calendarUrl} style="primary">
            📅 Add to Google Calendar
          </Button>
        </Actions>
      </Message>,
    );

    return `Calendar invite generated with 1-click button: ${calendarUrl}`;
  },
});
