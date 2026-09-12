/**
 * Component tests.
 *
 * `renderToIR` lowers a Channels JSX tree to the platform-neutral IR the
 * adapter is actually handed — `{ type, props }` nodes — so these run with no
 * Slack app, no Intelligence project and no credentials of any kind.
 *
 * That matters for a hackathon kit: change a card, know in a second whether you
 * broke it. Node's built-in runner means there is nothing to install either.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderToIR } from "@copilotkit/channels";
import {
  GroupConsensusCard,
  ItineraryCard,
  IncidentCard,
  Timeline,
  TravelPlanCard,
  FlightHotelCard,
  TravelAlertCard,
  BillSplitCard,
} from "./components";


const ctx = { platform: "slack" as const, signal: new AbortController().signal };

/** The rendered IR as a searchable string. */
async function render(node: unknown): Promise<string> {
  return JSON.stringify(renderToIR((await node) as never));
}

const baseIncident = {
  severity: "sev2" as const,
  headline: "Checkout latency above 4s",
  impact: "~12% of checkouts, EU region",
  started: "02:14 UTC",
  known: [] as string[],
  trying: [] as string[],
};

describe("consensus_card", () => {
  const baseConsensus = {
    venueName: "Genesis Vegan Bistro",
    headline: "Consensus Choice: Genesis Bistro",
    cuisineOrCategory: "Asian Plant-Based & GF",
    priceTier: "under $20",
    neighborhood: "Chinatown / Tanjong Pagar",
    matchScore: "100% Match",
    participantConstraints: [
      "Alice: Strictly vegan & gluten-free",
      "Bob: Under $20 budget",
      "Charlie: Chinatown / Tanjong Pagar",
    ],
    whyItWorks: [
      { member: "Alice", reason: "Entire menu is 100% plant-based with certified GF options" },
      { member: "Bob", reason: "Lunch/dinner mains average $14-18, comfortably under $20" },
      { member: "Charlie", reason: "Located in Chinatown, 2 min walk from Tanjong Pagar MRT" },
    ],
    mapUrl: "https://maps.google.com/?q=Genesis+Bistro",
    sourceUrl: "https://example.com/genesis",
  };

  it("renders the consensus choice with green accent rail", async () => {
    const out = await render(GroupConsensusCard.render(baseConsensus, ctx));
    assert.ok(out.includes("#2E7D5B"), "should use green consensus accent");
    assert.ok(out.includes("Genesis Vegan Bistro"));
    assert.ok(out.includes("100% Match"));
  });

  it("lists all participant constraints and why it works for each member", async () => {
    const out = await render(GroupConsensusCard.render(baseConsensus, ctx));
    assert.ok(out.includes("Alice"));
    assert.ok(out.includes("Bob"));
    assert.ok(out.includes("Charlie"));
    assert.ok(out.includes("100% plant-based"));
    assert.ok(out.includes("comfortably under $20"));
  });

  it("includes navigation map button and website when provided", async () => {
    const out = await render(GroupConsensusCard.render(baseConsensus, ctx));
    assert.ok(out.includes("Open in Maps"));
    assert.ok(out.includes("https://maps.google.com/?q=Genesis+Bistro"));
  });
});

describe("itinerary_card", () => {
  it("renders scheduled stops with times and locations", async () => {
    const stops = [
      { time: "18:30", activity: "Meet at Tanjong Pagar MRT", location: "Exit A" },
      { time: "19:00", activity: "Dinner at Genesis Bistro", location: "Chinatown" },
      { time: "20:30", activity: "Drinks & dessert at Afterglow", location: "Keong Saik Rd" },
    ];
    const out = await render(ItineraryCard.render({ title: "Friday Team Night", stops }, ctx));
    assert.ok(out.includes("Friday Team Night"));
    assert.ok(out.includes("Genesis Bistro"));
    assert.ok(out.includes("3 stop(s) scheduled"));
  });
});

describe("incident_card", () => {
  it("colours the rail by severity, so the channel can triage by glance", async () => {
    const sev1 = await render(IncidentCard.render({ ...baseIncident, severity: "sev1" }, ctx));
    const resolved = await render(IncidentCard.render({ ...baseIncident, severity: "resolved" }, ctx));

    assert.ok(sev1.includes("#C4145F"), "sev1 should use the attention accent");
    assert.ok(resolved.includes("#2E7D5B"), "resolved should use the good accent");
    assert.notEqual(sev1, resolved);
  });

  it("labels the severity in words, not just colour", async () => {
    // Colour alone fails anyone colour-blind and every screen reader.
    const out = await render(IncidentCard.render({ ...baseIncident, severity: "sev1" }, ctx));
    assert.ok(out.includes("SEV1"));
    assert.ok(out.includes("customer-facing"));
  });

  it("omits the owner field entirely when the thread has not said who is driving", async () => {
    const without = await render(IncidentCard.render(baseIncident, ctx));
    const with_ = await render(IncidentCard.render({ ...baseIncident, owner: "priya" }, ctx));

    assert.ok(!without.includes("Driving"), "no owner should mean no Driving field");
    assert.ok(with_.includes("Driving"));
    assert.ok(with_.includes("priya"));
  });

  it("omits the known/trying sections when empty rather than drawing empty headings", async () => {
    const empty = await render(IncidentCard.render(baseIncident, ctx));
    assert.ok(!empty.includes("What we know"));
    assert.ok(!empty.includes("Being tried"));

    const filled = await render(
      IncidentCard.render(
        { ...baseIncident, known: ["Rollback did not help"], trying: ["Draining the queue"] },
        ctx,
      ),
    );
    assert.ok(filled.includes("What we know"));
    assert.ok(filled.includes("Rollback did not help"));
    assert.ok(filled.includes("Being tried"));
  });

  it("always carries impact and start time — the two things a late joiner needs", async () => {
    const out = await render(IncidentCard.render(baseIncident, ctx));
    assert.ok(out.includes("~12% of checkouts, EU region"));
    assert.ok(out.includes("02:14 UTC"));
  });
});

describe("timeline", () => {
  it("renders every event and counts them in the footer", async () => {
    const events = [
      { at: "02:14", what: "Alerts fired", who: "pagerduty" },
      { at: "02:19", what: "Rolled back web", who: "priya" },
      { at: "02:31", what: "Latency still high" },
    ];
    const out = await render(Timeline.render({ title: "Timeline", events }, ctx));

    for (const event of events) assert.ok(out.includes(event.what), `missing "${event.what}"`);
    assert.ok(out.includes("3 event(s)"));
  });

  it("fills the who column with a dash rather than leaving a hole", async () => {
    const out = await render(
      Timeline.render({ title: "T", events: [{ at: "02:31", what: "no owner" }] }, ctx),
    );
    assert.ok(out.includes("—"));
  });
});

describe("travel_plan_card", () => {
  it("renders destination, dates, and google calendar link", async () => {
    const out = await render(
      TravelPlanCard.render(
        {
          destination: "Tokyo, Japan",
          title: "Tokyo Autumn Discovery",
          dates: "Oct 15 - Oct 19, 2026",
          travelers: ["Sathish", "Ramesh"],
          estimatedBudget: "$1,200 SGD",
          highlights: ["Arrive HND & Shinjuku dinner", "Meiji Shrine & Shibuya"],
        },
        ctx,
      ),
    );
    assert.ok(out.includes("Tokyo Autumn Discovery"));
    assert.ok(out.includes("Tokyo, Japan"));
    assert.ok(out.includes("Oct 15 - Oct 19, 2026"));
    assert.ok(out.includes("calendar.google.com"));
    assert.ok(out.includes("#2563EB"));
  });
});

describe("flight_hotel_card", () => {
  it("renders flight options and hotel recommendations", async () => {
    const out = await render(
      FlightHotelCard.render(
        {
          destination: "Tokyo",
          title: "Top Flights & Hotels",
          flights: [
            {
              airline: "Singapore Airlines",
              route: "SIN → HND",
              times: "07:10 - 15:20",
              price: "$680 SGD",
            },
          ],
          hotels: [
            {
              name: "Hotel Gracery Shinjuku",
              neighborhood: "Shinjuku",
              rating: "4.5★",
              pricePerNight: "$160/night",
              amenities: ["Near JR Transit"],
            },
          ],
        },
        ctx,
      ),
    );
    assert.ok(out.includes("Top Flights & Hotels"));
    assert.ok(out.includes("Singapore Airlines"));
    assert.ok(out.includes("Hotel Gracery Shinjuku"));
    assert.ok(out.includes("flights+to+Tokyo"));
  });
});

describe("travel_alert_card", () => {
  it("renders alert notifications with proper urgency styling", async () => {
    const out = await render(
      TravelAlertCard.render(
        {
          title: "Flight Check-In Open",
          tripName: "Tokyo Trip",
          urgency: "warning",
          category: "checkin",
          message: "Online check-in is now open for SQ638.",
          actionLabel: "Check In",
          actionUrl: "https://example.com/checkin",
        },
        ctx,
      ),
    );
    assert.ok(out.includes("Flight Check-In Open"));
    assert.ok(out.includes("Tokyo Trip"));
    assert.ok(out.includes("WARNING"));
    assert.ok(out.includes("#D97706"));
  });
});

describe("bill_split_card", () => {
  it("renders member shares, total amount, and settlements", async () => {
    const out = await render(
      BillSplitCard.render(
        {
          title: "Team Dinner",
          currency: "SGD",
          totalAmount: 145,
          paidBy: "Ramesh",
          splitMethod: "Equal / Itemized",
          members: [
            { name: "Sathish", share: 45, itemsSummary: "Veg Platter" },
            { name: "Alice", share: 40, itemsSummary: "Vegan Bowl" },
            { name: "Ramesh", share: 60, itemsSummary: "BBQ & Beer" },
          ],
          settlements: [
            { from: "Sathish", to: "Ramesh", amount: 45 },
            { from: "Alice", to: "Ramesh", amount: 40 },
          ],
        },
        ctx,
      ),
    );
    assert.ok(out.includes("Team Dinner"));
    assert.ok(out.includes("145.00"));
    assert.ok(out.includes("Ramesh"));
    assert.ok(out.includes("Sathish"));
    assert.ok(out.includes("owes"));
  });
});

