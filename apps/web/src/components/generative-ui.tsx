"use client";

/**
 * Generative UI, controlled tier.
 *
 * `useComponent` gives the agent a catalog of *your* React components and lets
 * it choose one and fill in the props. The interface stays on-brand and
 * pixel-perfect because you wrote it — the agent only decides what to show.
 *
 * These are deliberately the same components the Slack surface registers
 * with `defineChannelComponent`. Same agent, same intent, native rendering on
 * each surface — which is the whole claim this kit is making.
 *
 * Renderers receive streamed partial arguments before schema defaults apply.
 */
import { useComponent, useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { z } from "zod";

import {
  GroupConsensusCard,
  ItineraryCard,
  IncidentCard,
  Timeline,
} from "./streamed-cards";

export function GenerativeUI() {
  useComponent({
    name: "consensus_card",
    description:
      "Draw the group consensus recommendation as a native interactive card: venue name, cuisine/vibe, price, neighborhood, and a breakdown of why it satisfies each participant.",
    parameters: z.object({
      venueName: z.string().describe("Name of the recommended venue or spot."),
      headline: z.string().describe("Short headline, e.g. 'Consensus Choice: Genesis Bistro'."),
      cuisineOrCategory: z.string().describe("Cuisine, category, or activity type."),
      priceTier: z.string().describe("Price indicator (e.g. '$', 'under $20')."),
      neighborhood: z.string().describe("Neighborhood or location."),
      matchScore: z.string().optional().describe("Match confidence, e.g. '100% Match'."),
      participantConstraints: z
        .array(z.string())
        .max(6)
        .default([])
        .describe("Summary list of participant constraints taken into account."),
      whyItWorks: z
        .array(
          z.object({
            member: z.string(),
            reason: z.string(),
          }),
        )
        .min(1)
        .describe("Point-by-point breakdown for each member."),
      sourceUrl: z.string().url().optional().describe("Official website or booking URL."),
      mapUrl: z.string().url().optional().describe("Google Maps URL."),
      calendarUrl: z.string().url().optional().describe("1-Click Google Calendar event link."),
    }),
    render: GroupConsensusCard,
  });

  useComponent({
    name: "itinerary_card",
    description:
      "Draw an ordered group itinerary or schedule with times, stops, and activities.",
    parameters: z.object({
      title: z.string().optional(),
      stops: z.array(
        z.object({
          time: z.string(),
          activity: z.string(),
          location: z.string(),
        }),
      ),
    }),
    render: ItineraryCard,
  });

  useComponent({
    name: "incident_card",
    description:
      "Draw the current state of the incident as a card. Call this once you have read the context, and again when the picture changes.",
    parameters: z.object({
      headline: z.string().describe("What is broken, in under ten words."),
      summary: z.string().describe("Who or what is affected."),
      facts: z.array(z.object({ label: z.string(), value: z.string() })).max(4).default([]),
      nextSteps: z.array(z.string()).max(3).default([]),
      tone: z.enum(["neutral", "good", "attention"]).default("neutral"),
    }),
    render: IncidentCard,
  });

  useComponent({
    name: "timeline",
    description:
      "Draw an ordered timeline of what happened when. Call this when there are three or more events worth ordering.",
    parameters: z.object({
      title: z.string().optional(),
      columns: z.array(z.string()).min(1).max(4),
      rows: z.array(z.array(z.string())),
    }),
    render: Timeline,
  });

  /**
   * The approval gate, web idiom.
   *
   * Same contract as `confirm_action` in the Slack surface: the agent must ask
   * before anything irreversible, and cannot proceed past a refusal.
   */
  useHumanInTheLoop({
    name: "propose_action",
    description:
      "Ask for approval before anything that touches production or external systems. Call this FIRST and only continue if it returns approval.",
    parameters: z.object({
      action: z.string().describe("What you are about to do, in one plain sentence."),
      blastRadius: z.string().describe("What this affects if it goes wrong."),
    }),
    render: ({ args, respond, result }) => {
      if (!respond) {
        return (
          <article className="ck-card ck-card--gate">
            <p className="ck-gate-done">{result ? String(result) : "Waiting…"}</p>
          </article>
        );
      }
      return (
        <article className="ck-card ck-card--gate">
          <h3>{args.action ?? "Confirm this action"}</h3>
          <p>{args.blastRadius}</p>
          <div className="ck-actions">
            <button
              type="button"
              className="ck-btn ck-btn--primary"
              onClick={() =>
                respond("Approved by the user. Proceed, then report exactly what you did.")
              }
            >
              Approve
            </button>
            <button
              type="button"
              className="ck-btn"
              onClick={() =>
                respond(
                  "The user declined. Do not take the action, do not offer a workaround, and say plainly that nothing was changed.",
                )
              }
            >
              Cancel
            </button>
          </div>
        </article>
      );
    },
  });

  // Hooks register into the chat stream, so this component renders nothing.
  return null;
}
