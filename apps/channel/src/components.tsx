/**
 * Agent-rendered components for Project Roam Concierge.
 *
 * `defineChannelComponent` turns a component into a tool the agent can call to
 * draw UI itself. In Slack, a native card is easier to scan than long prose,
 * and lets the whole group see why a recommendation fits everyone.
 *
 * One tree renders as Slack Block Kit, Teams Adaptive Cards, and Discord
 * components. A surface that cannot render a node skips it rather than failing.
 */
import {
  defineChannelComponent,
  Message,
  Header,
  Section,
  Markdown,
  Fields,
  Field,
  Context,
  Divider,
  Actions,
  Button,
  Table,
  Row,
  Cell,
} from "@copilotkit/channels";
import { z } from "zod";
import { buildGoogleCalendarUrl } from "agent-core";

/**
 * Group Consensus Card for Project Roam.
 * Shows the chosen venue/spot, participant constraints satisfied, and "Why It Works For Everyone".
 */
export const GroupConsensusCard = defineChannelComponent({
  name: "consensus_card",
  description:
    "Draw the group consensus recommendation as an interactive native card: venue name, cuisine/vibe, price, neighborhood, and a breakdown of why it satisfies each participant. Call this after arbitrating group constraints and finding a matching venue.",
  parameters: z.object({
    venueName: z.string().describe("Name of the recommended venue or spot."),
    headline: z.string().describe("Punchy headline, e.g. 'Consensus Choice: Genesis Bistro'."),
    cuisineOrCategory: z.string().describe("Cuisine or category, e.g. 'Asian Vegan & Gluten-Free'."),
    priceTier: z.string().describe("Price indicator (e.g. '$', '$$', 'under $20')."),
    neighborhood: z.string().describe("Neighborhood or area (e.g. 'Chinatown / Tanjong Pagar')."),
    matchScore: z.string().optional().describe("Match confidence, e.g. '100% Group Match'."),
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
      .describe("Point-by-point breakdown for each participant."),
    sourceUrl: z.string().url().optional().describe("Official website or booking URL."),
    mapUrl: z.string().url().optional().describe("Google Maps URL."),
  }),
  render({
    venueName,
    headline,
    cuisineOrCategory,
    priceTier,
    neighborhood,
    matchScore,
    participantConstraints,
    whyItWorks,
    sourceUrl,
    mapUrl,
  }) {
    const finalMapUrl =
      mapUrl ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${venueName} ${neighborhood || "Singapore"}`,
      )}`;

    const finalCalendarUrl = buildGoogleCalendarUrl({
      title: headline ? `Dinner: ${venueName} (${headline})` : `Dinner at ${venueName}`,
      venueName,
      location: neighborhood || `${venueName}, Singapore`,
      description: whyItWorks?.map((item) => `${item.member}: ${item.reason}`).join("\n"),
      attendees: whyItWorks?.map((item) => item.member).filter(Boolean) as string[],
    });

    return (
      <Message accent="#2E7D5B">
        <Header>{headline ? `${venueName} — ${headline}` : venueName}</Header>
        <Context>{`${matchScore ?? "Group Consensus"} · ${cuisineOrCategory} · ${priceTier}`}</Context>
        <Fields>
          <Field label="Location">{neighborhood}</Field>
          <Field label="Price">{priceTier}</Field>
        </Fields>
        {participantConstraints.length > 0 && (
          <Section>
            <Markdown>{`*Group constraints satisfied:*\n${participantConstraints.map((c) => `• ${c}`).join("\n")}`}</Markdown>
          </Section>
        )}
        <Section>
          <Markdown>{`*Why it works for everyone:*\n${whyItWorks.map((item) => `• *${item.member}*: ${item.reason}`).join("\n")}`}</Markdown>
        </Section>
        <Actions>
          <Button url={finalMapUrl} style="primary">📍 Open in Maps</Button>
          <Button url={finalCalendarUrl}>📅 Add to Google Calendar</Button>
          {sourceUrl && <Button url={sourceUrl}>🌐 Website</Button>}
          <Button
            value="confirm_consensus"
            onClick={async ({ thread }) => {
              await thread.post(
                <Message accent="#2E7D5B">
                  <Header>🎉 Outing Confirmed for {venueName}!</Header>
                  <Section>
                    <Markdown>{`The group has locked in **${venueName}** (${neighborhood || "Singapore"})!\n\nClick below to add this event to your personal Google Calendar:`}</Markdown>
                  </Section>
                  <Actions>
                    <Button url={finalCalendarUrl} style="primary">
                      📅 Add to Google Calendar
                    </Button>
                  </Actions>
                </Message>,
              );
            }}
          >
            Vote / Confirm
          </Button>
        </Actions>
      </Message>
    );
  },
});

/**
 * Ordered group schedule or multi-stop itinerary.
 */
export const ItineraryCard = defineChannelComponent({
  name: "itinerary_card",
  description:
    "Draw an ordered group itinerary or schedule with times, stops, and activities. Call this when coordinating multiple stops or times for a team outing or offsite.",
  parameters: z.object({
    title: z.string().default("Group Itinerary"),
    stops: z
      .array(
        z.object({
          time: z.string().describe("Time, e.g. '7:00 PM' or '19:30'."),
          activity: z.string().describe("Activity or venue."),
          location: z.string().describe("Address or neighborhood."),
          notes: z.string().optional().describe("Special notes or reservations."),
        }),
      )
      .min(1)
      .max(12),
  }),
  render({ title, stops }) {
    return (
      <Message accent="#2E7D5B">
        <Header>{title}</Header>
        <Table
          columns={[{ header: "Time" }, { header: "Activity" }, { header: "Location" }]}
        >
          {stops.map((stop) => (
            <Row>
              <Cell>{stop.time}</Cell>
              <Cell>{stop.activity}</Cell>
              <Cell>{stop.location}</Cell>
            </Row>
          ))}
        </Table>
        <Divider />
        <Context>{`${stops.length} stop(s) scheduled`}</Context>
      </Message>
    );
  },
});

/** Severity drives the colour rail, so the channel can triage by glance. */
const SEVERITY = {
  sev1: { accent: "#C4145F", label: "SEV1 · customer-facing" },
  sev2: { accent: "#8A5C10", label: "SEV2 · degraded" },
  sev3: { accent: "#5B6478", label: "SEV3 · internal" },
  resolved: { accent: "#2E7D5B", label: "RESOLVED" },
} as const;

/**
 * Backward-compatible incident card for reference and legacy tests.
 */
export const IncidentCard = defineChannelComponent({
  name: "incident_card",
  description:
    "Draw the current state of an issue or decision as a glanceable card.",
  parameters: z.object({
    severity: z.enum(["sev1", "sev2", "sev3", "resolved"]),
    headline: z.string().describe("Headline in under ten words."),
    impact: z.string().describe("Who or what is affected."),
    started: z.string().describe("When it started."),
    known: z.array(z.string()).max(4).default([]),
    trying: z.array(z.string()).max(3).default([]),
    owner: z.string().optional(),
  }),
  render({ severity, headline, impact, started, known, trying, owner }) {
    const sev = SEVERITY[severity];
    return (
      <Message accent={sev.accent}>
        <Header>{headline}</Header>
        <Context>{sev.label}</Context>
        <Fields>
          <Field label="Impact">{impact}</Field>
          <Field label="Started">{started}</Field>
          {owner && <Field label="Driving">{owner}</Field>}
        </Fields>
        {known.length > 0 && (
          <Section>
            <Markdown>{`*What we know*\n${known.map((k) => `• ${k}`).join("\n")}`}</Markdown>
          </Section>
        )}
        {trying.length > 0 && (
          <Section>
            <Markdown>{`*Being tried*\n${trying.map((t) => `• ${t}`).join("\n")}`}</Markdown>
          </Section>
        )}
      </Message>
    );
  },
});

/**
 * Backward-compatible timeline component.
 */
export const Timeline = defineChannelComponent({
  name: "timeline",
  description: "Draw an ordered timeline of events or schedule items.",
  parameters: z.object({
    title: z.string().default("Timeline"),
    events: z
      .array(
        z.object({
          at: z.string().describe("Time."),
          what: z.string().describe("Description."),
          who: z.string().optional(),
        }),
      )
      .min(1)
      .max(12),
  }),
  render({ title, events }) {
    return (
      <Message>
        <Header>{title}</Header>
        <Table
          columns={[{ header: "When" }, { header: "What" }, { header: "Who" }]}
        >
          {events.map((event) => (
            <Row>
              <Cell>{event.at}</Cell>
              <Cell>{event.what}</Cell>
              <Cell>{event.who ?? "—"}</Cell>
            </Row>
          ))}
        </Table>
        <Divider />
        <Context>{`${events.length} event(s) · newest last`}</Context>
      </Message>
    );
  },
});

/**
 * The Roam welcome message in Slack threads.
 */
export function welcomeMessage(platform: string) {
  return (
    <Message accent="#2E7D5B">
      <Header>Roam: Multiplayer Group Concierge</Header>
      <Section>
        <Markdown>
          {"When planning a team dinner, drinks, or group outing, @-mention me in this " +
            platform +
            " thread. I read everyone's preferences and dietary needs to find the consensus spot that works for everyone!"}
        </Markdown>
      </Section>
      <Fields>
        <Field label="I will">Extract preferences, arbitrate conflicts, search live venues</Field>
        <Field label="I won't">Finalize bookings without group confirmation</Field>
      </Fields>
      <Actions>
        <Button
          value="arbitrate"
          style="primary"
          onClick={async ({ thread }) => {
            await thread.runAgent({
              prompt:
                "Read this thread, extract everyone's constraints (diet, budget, location, vibe), and find the best group consensus spot.",
            });
          }}
        >
          Arbitrate group choices
        </Button>
      </Actions>
    </Message>
  );
}
