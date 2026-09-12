"use client";

import { useFrontendTool, useAgentContext } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { findIncident, workspaceContext } from "@/lib/incidents";
import type { WorkplaceControls } from "@/lib/use-workplace";

async function toolResult<T>(action: () => Promise<T>) {
  try {
    return await action();
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Workplace operation failed. Check the page for setup details.",
    };
  }
}

export function AppControl({
  selectedId,
  selectIncident,
  workplace,
}: {
  selectedId: string;
  selectIncident: (id: string) => void;
  workplace: WorkplaceControls;
}) {
  const { status, propose, retrieve } = workplace;

  useAgentContext({
    description:
      "The Roam group outing workspace currently visible to the user, including multiplayer participant constraints (dietary, budget, location, vibe), consensus recommendations, and Ambiguous follow-ups. Call consensus_card to draw recommendations. CRITICAL: propose_followup only prepares an itinerary proposal for the user's approval button. Only clicking Approve & save to Ambiguous saves it; prose/chat approval never executes a write. Use retrieve_followup or refresh_followups for real reads. Never claim a task was saved without a provider record. Never invent record links.",
    value: {
      ...workspaceContext(
        selectedId,
        status?.status === "connected" ? status.tasks : [],
      ),
      workplace: status?.status ?? "unavailable",
      workplaceError: workplace.error,
      proposal: workplace.proposal ?? null,
      lastResult: workplace.notice,
    } as any,
  });

  useFrontendTool(
    {
      name: "select_incident",
      description:
        "Open an existing group outing or incident in the workspace. Use an ID from availableIncidents (e.g. INC-1042).",
      parameters: z.object({ incidentId: z.string() }),
      handler: async ({ incidentId }) => {
        const incident = findIncident(incidentId);
        selectIncident(incident.id);
        return `Opened ${incident.id}: ${incident.title}. The visible details, member constraints, and agent context now show this outing.`;
      },
    },
    [selectIncident],
  );

  useFrontendTool(
    {
      name: "select_outing",
      description:
        "Switch to a different group outing or event in the workspace.",
      parameters: z.object({ outingId: z.string() }),
      handler: async ({ outingId }) => {
        const outing = findIncident(outingId);
        selectIncident(outing.id);
        return `Switched to ${outing.id}: ${outing.title}. Context updated with participant constraints.`;
      },
    },
    [selectIncident],
  );

  useFrontendTool(
    {
      name: "propose_followup",
      description:
        "Prepare an Ambiguous task or itinerary item from the selected outing context. Show the exact title and details for the user's approval button. Does not save anything. CRITICAL: wait for the user to click Approve & save to Ambiguous in the page.",
      parameters: z.object({
        incidentId: z.string().describe("The outing/incident ID."),
        title: z.string().trim().min(1).max(200),
        details: z.string().trim().min(1).max(4000),
      }),
      handler: async (draft) =>
        toolResult(async () => ({
          status: "pending_approval",
          proposal: await propose(draft),
        })),
    },
    [propose],
  );

  useFrontendTool(
    {
      name: "retrieve_followup",
      description:
        "Retrieve an existing Ambiguous task by its actual ID. Read-only; never creates a duplicate.",
      parameters: z.object({ id: z.uuid() }),
      handler: async ({ id }) => toolResult(() => retrieve(id)),
    },
    [retrieve],
  );

  useFrontendTool(
    {
      name: "refresh_followups",
      description:
        "Read saved follow-ups for the currently selected outing from Ambiguous. Use after approval or browser refresh to verify persistence.",
      parameters: z.object({}),
      handler: async () => toolResult(() => workplace.refresh()),
    },
    [workplace.refresh],
  );

  return null;
}
