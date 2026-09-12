/**
 * Isomorphic schemas and types. Safe in a browser bundle — no Node imports.
 */
import { z } from "zod";

export const searchWebParameters = z.object({
  query: z.string().describe("What to search for, phrased as a natural-language question."),
  results: z
    .number()
    .int()
    .min(1)
    .max(10)
    .default(5)
    .describe("How many results to return. Keep it small; a thread is not a search page."),
});

export type SearchWebArgs = z.infer<typeof searchWebParameters>;

export interface SearchHit {
  title: string;
  url: string;
  published?: string;
  highlight?: string;
}

/** Group member constraints extracted during multiplayer arbitration */
export const groupConstraintSchema = z.object({
  member: z.string().describe("Name or username of the group participant."),
  dietary: z.string().optional().describe("Dietary requirements (e.g. vegan, halal, gluten-free)."),
  budget: z.string().optional().describe("Budget constraints (e.g. under $20, $$)."),
  location: z.string().optional().describe("Preferred area, neighborhood, or transit stop."),
  vibe: z.string().optional().describe("Vibe, noise level, or seating preference."),
  notes: z.string().optional().describe("Other specific preferences or requests."),
});

export type GroupConstraint = z.infer<typeof groupConstraintSchema>;

/** Individual rationale in consensus recommendation */
export const memberSatisfactionSchema = z.object({
  member: z.string().describe("The member's name."),
  reason: z.string().describe("Why this venue/option satisfies this member's constraint."),
});

export type MemberSatisfaction = z.infer<typeof memberSatisfactionSchema>;

/** Group consensus recommendation schema */
export const consensusCardSchema = z.object({
  venueName: z.string().describe("Name of the recommended venue or activity."),
  headline: z.string().describe("Short punchy summary in under 10 words."),
  cuisineOrCategory: z.string().describe("Cuisine, category, or activity type."),
  priceTier: z.string().describe("Price indicator, e.g. '$' (under $20), '$$' ($20-$40)."),
  neighborhood: z.string().describe("Neighborhood or location."),
  matchScore: z.string().optional().describe("Consensus match score, e.g. '100% Match'."),
  participantConstraints: z
    .array(z.string())
    .max(6)
    .default([])
    .describe("Summary list of participant constraints taken into account."),
  whyItWorks: z
    .array(memberSatisfactionSchema)
    .min(1)
    .describe("Point-by-point breakdown of how the venue satisfies each member."),
  sourceUrl: z.string().url().optional().describe("Official website or booking URL."),
  mapUrl: z.string().url().optional().describe("Google Maps or navigation link."),
  calendarUrl: z.string().url().optional().describe("1-Click Google Calendar event link."),
});

export type ConsensusCardData = z.infer<typeof consensusCardSchema>;

export const calendarEventSchema = z.object({
  title: z.string().optional().describe("Title of event, e.g. 'Dinner: Sathish & Ramesh @ RedDot Brewhouse'"),
  venueName: z.string().describe("Venue or restaurant name"),
  location: z.string().optional().describe("Address, neighborhood, or city"),
  description: z.string().optional().describe("Agenda, dietary notes, or table details"),
  date: z.string().optional().describe("Date in YYYY-MM-DD format"),
  startTime: z.string().optional().describe("Start time in HH:mm 24-hr format (e.g. '19:30')"),
  durationMinutes: z.number().optional().describe("Duration in minutes"),
  attendees: z.array(z.string()).optional().describe("Names or email addresses of attendees"),
});

export type CalendarEventData = z.infer<typeof calendarEventSchema>;
