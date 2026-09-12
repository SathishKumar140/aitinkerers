/**
 * Agent-rendered components for Project Roam.
 *
 * Registered on the Slack channel via `createChannel({ components: [...] })`.
 * CopilotKit Channels walks the tree returned by `render()`, translates each
 * intrinsic element into Slack Block Kit, and updates the thread.
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
          <Button value="maps" url={finalMapUrl} style="primary">📍 Open in Maps</Button>
          <Button value="cal" url={finalCalendarUrl}>📅 Add to Google Calendar</Button>
          {sourceUrl && <Button value="site" url={sourceUrl}>🌐 Website</Button>}
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
    destination: z.string().optional().describe("Destination or city."),
    stops: z
      .array(
        z.object({
          day: z.string().optional().describe("Day label, e.g. 'Day 1'."),
          time: z.string().describe("Time, e.g. '7:00 PM' or '19:30'."),
          activity: z.string().describe("Activity or venue."),
          location: z.string().describe("Address or neighborhood."),
          category: z.string().optional().describe("Category of activity."),
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
 * Travel Plan Card
 */
export const TravelPlanCard = defineChannelComponent({
  name: "travel_plan_card",
  description:
    "Draw a multi-day trip plan card with destination, dates, traveler list, itinerary highlights, and 1-click Google Calendar button.",
  parameters: z.object({
    destination: z.string().describe("Destination city or country."),
    title: z.string().describe("Trip title, e.g. 'Tokyo Autumn Discovery'."),
    dates: z.string().describe("Dates, e.g. 'Oct 15 - Oct 19, 2026'."),
    travelers: z.array(z.string()).default([]).describe("Traveler names."),
    estimatedBudget: z.string().optional().describe("Estimated budget range."),
    highlights: z.array(z.string()).min(1).describe("Daily itinerary highlights."),
    calendarUrl: z.string().url().optional().describe("Google Calendar URL."),
    mapUrl: z.string().url().optional().describe("Google Maps URL."),
  }),
  render({
    destination,
    title,
    dates,
    travelers,
    estimatedBudget,
    highlights,
    calendarUrl,
    mapUrl,
  }) {
    const finalCalendarUrl =
      calendarUrl ||
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        title,
      )}&location=${encodeURIComponent(destination)}&details=${encodeURIComponent(
        `Trip to ${destination} planned with Project Roam.\nTravelers: ${travelers.join(", ")}`,
      )}`;

    const finalMapUrl =
      mapUrl ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;

    return (
      <Message accent="#2563EB">
        <Header>{`✈️ ${title}`}</Header>
        <Context>{`Active Skill: Travel Planner · ${destination} · ${travelers.length} Travelers`}</Context>
        <Fields>
          <Field label="Dates">{dates}</Field>
          <Field label="Est. Budget">{estimatedBudget || "Flexible"}</Field>
        </Fields>
        {travelers.length > 0 && (
          <Section>
            <Markdown>{`*Travelers:*\n${travelers.map((t) => `• ${t}`).join("\n")}`}</Markdown>
          </Section>
        )}
        <Section>
          <Markdown>{`*Itinerary Highlights:*\n${highlights.map((h) => `• ${h}`).join("\n")}`}</Markdown>
        </Section>
        <Actions>
          <Button value="cal" url={finalCalendarUrl} style="primary">
            📅 Add Trip to Google Calendar
          </Button>
          <Button value="map" url={finalMapUrl}>🗺️ View Destination Map</Button>
        </Actions>
      </Message>
    );
  },
});

/**
 * Flight & Hotel Recommendation Card
 */
export const FlightHotelCard = defineChannelComponent({
  name: "flight_hotel_card",
  description:
    "Draw flight options and hotel recommendations with routes, times, ratings, and price tags.",
  parameters: z.object({
    destination: z.string(),
    title: z.string(),
    flights: z
      .array(
        z.object({
          airline: z.string(),
          flightNumber: z.string().optional(),
          route: z.string(),
          times: z.string(),
          price: z.string(),
          bookingUrl: z.string().url().optional(),
        }),
      )
      .default([]),
    hotels: z
      .array(
        z.object({
          name: z.string(),
          neighborhood: z.string(),
          rating: z.string(),
          pricePerNight: z.string(),
          amenities: z.array(z.string()).default([]),
          bookingUrl: z.string().url().optional(),
        }),
      )
      .default([]),
  }),
  render({ destination, title, flights, hotels }) {
    const flightsSummary = flights.length
      ? flights
          .map(
            (f) =>
              `• *${f.airline}* (${f.route}) · ${f.times} · ~*${f.price}*`,
          )
          .join("\n")
      : "No flights selected yet.";

    const hotelsSummary = hotels.length
      ? hotels
          .map(
            (h) =>
              `• *${h.name}* (${h.rating}) · ${h.neighborhood} · *${h.pricePerNight}*`,
          )
          .join("\n")
      : "No hotels selected yet.";

    const defaultFlightsUrl = `https://www.google.com/travel/flights?q=flights+to+${encodeURIComponent(destination)}`;
    const defaultHotelsUrl = `https://www.google.com/travel/hotels?q=hotels+in+${encodeURIComponent(destination)}`;

    return (
      <Message accent="#0284C7">
        <Header>{`🏨 ${title}`}</Header>
        <Context>{`Active Skill: Travel Planner · ${destination} Recommendations`}</Context>
        <Section>
          <Markdown>{`*✈️ Recommended Flights:*\n${flightsSummary}`}</Markdown>
        </Section>
        <Section>
          <Markdown>{`*🏨 Recommended Stays:*\n${hotelsSummary}`}</Markdown>
        </Section>
        <Actions>
          <Button value="flights" url={defaultFlightsUrl} style="primary">
            ✈️ Search Flights
          </Button>
          <Button value="hotels" url={defaultHotelsUrl}>🏨 Search Hotels</Button>
        </Actions>
      </Message>
    );
  },
});

/**
 * Travel Alert / Notification Card
 */
export const TravelAlertCard = defineChannelComponent({
  name: "travel_alert_card",
  description:
    "Draw a travel notification card (check-in reminders, flight alerts, weather warnings, or packing reminders).",
  parameters: z.object({
    title: z.string(),
    tripName: z.string(),
    urgency: z.enum(["info", "warning", "critical"]).default("info"),
    category: z.enum(["flight", "checkin", "weather", "packing", "reminder"]).default("reminder"),
    message: z.string(),
    actionLabel: z.string().optional(),
    actionUrl: z.string().url().optional(),
  }),
  render({ title, tripName, urgency, message, actionLabel, actionUrl }) {
    const accent =
      urgency === "critical"
        ? "#DC2626"
        : urgency === "warning"
        ? "#D97706"
        : "#2563EB";

    return (
      <Message accent={accent}>
        <Header>{`🔔 ${title}`}</Header>
        <Context>{`Active Skill: Travel Planner · ${tripName} · ${urgency.toUpperCase()}`}</Context>
        <Section>
          <Markdown>{message}</Markdown>
        </Section>
        {actionUrl && (
          <Actions>
            <Button value="action" url={actionUrl} style="primary">
              {actionLabel || "View Details"}
            </Button>
          </Actions>
        )}
      </Message>
    );
  },
});

/**
 * Splitwise-Style Group Bill Split Card
 */
export const BillSplitCard = defineChannelComponent({
  name: "bill_split_card",
  description:
    "Draw an itemized group bill split card with member shares and 'who owes whom' debt settlements.",
  parameters: z.object({
    title: z.string().describe("Bill description, e.g. 'Dinner at RedDot Brewhouse'."),
    currency: z.string().optional().default("SGD"),
    totalAmount: z.number().describe("Total bill amount."),
    paidBy: z.string().describe("Name of person who paid."),
    splitMethod: z.string().optional().default("Equal / Itemized"),
    members: z
      .array(
        z.object({
          name: z.string(),
          share: z.number(),
          itemsSummary: z.string().optional(),
        }),
      )
      .min(1),
    settlements: z
      .array(
        z.object({
          from: z.string(),
          to: z.string(),
          amount: z.number(),
        }),
      )
      .optional()
      .default([]),
  }),
  render({
    title,
    currency = "SGD",
    totalAmount,
    paidBy,
    splitMethod = "Equal / Itemized",
    members,
    settlements = [],
  }) {
    return (
      <Message accent="#10B981">
        <Header>{`💸 ${title} (${currency} ${totalAmount.toFixed(2)})`}</Header>
        <Context>{`Active Skill: Group Bill Splitter · Payer: ${paidBy}`}</Context>
        <Fields>
          <Field label="Total Bill">{`${currency} ${totalAmount.toFixed(2)}`}</Field>
          <Field label="Paid By">{paidBy}</Field>
        </Fields>
        <Section>
          <Markdown>
            {`*Member Breakdown (${splitMethod}):*\n` +
              members
                .map(
                  (m) =>
                    `• *${m.name}*: ${currency} ${m.share.toFixed(2)}${
                      m.itemsSummary ? ` (${m.itemsSummary})` : ""
                    }`,
                )
                .join("\n")}
          </Markdown>
        </Section>
        {settlements.length > 0 && (
          <Section>
            <Markdown>
              {`*Settlements ("Who Owes Whom"):*\n` +
                settlements
                  .map(
                    (s) =>
                      `• *${s.from}* owes *${s.to}*: *${currency} ${s.amount.toFixed(2)}*`,
                  )
                  .join("\n")}
            </Markdown>
          </Section>
        )}
        <Actions>
          <Button
            value="settled"
            style="primary"
            onClick={async ({ thread }) => {
              await thread.post(
                <Message accent="#10B981">
                  <Header>🎉 Bill Settled!</Header>
                  <Section>
                    <Markdown>{`All balances for **${title}** have been marked as settled by the group.`}</Markdown>
                  </Section>
                </Message>,
              );
            }}
          >
            ✓ Mark Settled
          </Button>
        </Actions>
      </Message>
    );
  },
});

/**
 * The Roam welcome message posted when the bot joins a channel.
 */
export function welcomeMessage(platform: string) {
  return (
    <Message accent="#2563EB">
      <Header>Roam — Your Group Planning Assistant</Header>
      <Section>
        <Markdown>
          {"Ready to help on " +
            platform +
            "! @-mention me anytime to:\n\n" +
            "• 🍽️ **Outings & Dining:** Consensus restaurant picks, Google Calendar invite.\n" +
            "• ✈️ **Travel:** Multi-day itineraries, flights, hotels & calendar schedule.\n" +
            "• 💸 **Bill Splitting:** Splitwise-style settlements."}
        </Markdown>
      </Section>
      <Actions>
        <Button
          value="outing"
          style="primary"
          onClick={async ({ thread }) => {
            await thread.runAgent({
              prompt: "Find the best group consensus dinner spot from this thread.",
            });
          }}
        >
          🍽️ Plan Outing
        </Button>
        <Button
          value="travel"
          onClick={async ({ thread }) => {
            await thread.runAgent({
              prompt: "Plan a group trip based on this thread.",
            });
          }}
        >
          ✈️ Plan Travel
        </Button>
        <Button
          value="split"
          onClick={async ({ thread }) => {
            await thread.runAgent({
              prompt: "Split the bill mentioned in this thread.",
            });
          }}
        >
          💸 Split Bill
        </Button>
      </Actions>
    </Message>
  );
}

