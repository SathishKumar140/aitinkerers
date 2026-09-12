import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { resolveModel } from "./model";
import { SYSTEM_PROMPT } from "./prompt";
import { workplaceMcpServers } from "./capabilities/workplace";

/**
 * The agent factory.
 *
 * Return a FRESH agent per threadId — never share one stateful instance across
 * conversations. Channels clones the agent per turn anyway, but a factory is the
 * documented shape and keeps per-thread state honest.
 *
 * To swap in LangGraph, CrewAI, Mastra, Pydantic AI, or Google ADK, replace the
 * body with an HttpAgent pointed at your agent's AG-UI endpoint:
 *
 *   import { HttpAgent } from "@ag-ui/client";
 *   return new HttpAgent({ url: process.env.AGENT_URL! });
 *
 * Nothing else in the kit changes. That is the point of AG-UI.
 */
export type AgentFactoryOptions = {
  /** Disable workplace MCP for surfaces that should only see local app tools. */
  workplace?: boolean;
  /** Override the default incident prompt for a surface-specific starter. */
  prompt?: string;
  /** Override the model resolved from env — useful when a surface (e.g. Slack)
   * needs a faster/cheaper model than the web app. */
  model?: string;
  /** Override maxSteps for the BuiltInAgent loop (defaults to 10 for web/standalone, 1 for channels). */
  maxSteps?: number;
};

export function makeAgent(threadId: string, options: AgentFactoryOptions = {}) {
  const agent = new BuiltInAgent({
    model: options.model ?? resolveModel(),
    prompt: options.prompt ?? SYSTEM_PROMPT,

    // maxSteps defaults to 10 for standalone/web where BuiltInAgent loops,
    // or can be overridden to 1 for Channels where runAgentLoop controls iterations.
    maxSteps: options.maxSteps ?? 10,

    // The workplace, when one is configured. Empty array when it is not, so the
    // agent is never handed tools that would 401. Add your own MCP servers here
    // the same way — note HTTP transport takes `options` (with a wrapped
    // `options.fetch` for auth), not `headers`.
    mcpServers: options.workplace === false ? [] : [...workplaceMcpServers()],
  });
  agent.threadId = threadId;
  agent.state = {
    currentPlan: null,
    consensus: null,
    members: ["Ramesh Vishnoi", "Sathish Kumar"],
  };
  return agent;
}
