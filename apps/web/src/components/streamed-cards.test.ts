import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  IncidentCard,
  Timeline,
  GroupConsensusCard,
  ItineraryCard,
  TravelPlanCard,
  FlightHotelCard,
  TravelAlertCard,
  BillSplitCard,
} from "./streamed-cards";


test("incident card renders loading content before any arguments arrive", () => {
  const html = renderToStaticMarkup(createElement(IncidentCard, {}));
  assert.match(html, /Preparing incident assessment/);
});

test("incident card preserves the headline while other fields are streaming", () => {
  const html = renderToStaticMarkup(createElement(IncidentCard, { headline: "Checkout unavailable" }));
  assert.match(html, /Checkout unavailable/);
  assert.match(html, /Gathering incident details/);
});

test("incident card tolerates partial arrays and nested entries", () => {
  const html = renderToStaticMarkup(createElement(IncidentCard, {
    tone: "att",
    facts: [null, {}, { label: "Impact" }, { label: "Since", value: "10:00" }],
    nextSteps: [null, "Check deployment"],
  }));
  assert.match(html, /var\(--muted\)/);
  assert.match(html, /Impact/);
  assert.match(html, /10:00/);
  assert.match(html, /Check deployment/);
  assert.match(html, /Loading/);
});

test("timeline renders loading content for empty and title-only arguments", () => {
  assert.match(renderToStaticMarkup(createElement(Timeline, {})), /Preparing timeline/);
  const html = renderToStaticMarkup(createElement(Timeline, { title: "Incident history" }));
  assert.match(html, /Incident history/);
  assert.match(html, /Preparing timeline/);
  assert.match(renderToStaticMarkup(createElement(Timeline, { columns: ["Time"] })), /Loading events/);
  assert.match(renderToStaticMarkup(createElement(Timeline, { rows: [["10:00"]] })), /Preparing timeline/);
  assert.match(renderToStaticMarkup(createElement(Timeline, { columns: null, rows: null })), /Preparing timeline/);
});

test("timeline tolerates partially streamed columns, rows, and cells", () => {
  const html = renderToStaticMarkup(createElement(Timeline, {
    columns: ["Time", null],
    rows: [null, [], ["10:00"], ["10:05", null]],
  }));
  assert.match(html, /Time/);
  assert.match(html, /10:00/);
  assert.match(html, /10:05/);
  assert.match(html, /Loading/);
});

test("complete incident and timeline arguments render their content", () => {
  const card = renderToStaticMarkup(createElement(IncidentCard, {
    headline: "Checkout restored", summary: "All customers can check out",
    facts: [{ label: "Errors", value: "0%" }], nextSteps: ["Monitor"], tone: "good",
  }));
  for (const text of ["Checkout restored", "All customers can check out", "Errors", "0%", "Monitor", "#2e7d5b"]) {
    assert.ok(card.includes(text));
  }
  assert.doesNotMatch(card, /Loading|Preparing|Gathering/);
  const timeline = renderToStaticMarkup(createElement(Timeline, {
    title: "Recovery", columns: ["Time", "Event"], rows: [["10:00", "Deployed"], ["10:10", "Recovered"]],
  }));
  for (const text of ["Recovery", "Time", "Event", "10:00", "Deployed", "10:10", "Recovered"]) {
    assert.ok(timeline.includes(text));
  }
  assert.doesNotMatch(timeline, /Loading|Preparing/);
});

test("group consensus card renders loading state and complete streamed state", () => {
  const emptyHtml = renderToStaticMarkup(createElement(GroupConsensusCard, {}));
  assert.match(emptyHtml, /Finding group consensus recommendation/);

  const fullHtml = renderToStaticMarkup(
    createElement(GroupConsensusCard, {
      venueName: "Genesis Plant-Based Bistro",
      headline: "Consensus Choice: Genesis Bistro",
      cuisineOrCategory: "Asian Vegan",
      priceTier: "under $20",
      neighborhood: "Tanjong Pagar",
      matchScore: "100% Match",
      participantConstraints: ["Alice: Vegan & GF", "Bob: <$20"],
      whyItWorks: [
        { member: "Alice", reason: "100% plant-based with GF menu" },
        { member: "Bob", reason: "Average mains $15" },
      ],
      mapUrl: "https://maps.google.com/?q=Genesis",
    }),
  );

  assert.match(fullHtml, /Genesis Plant-Based Bistro/);
  assert.match(fullHtml, /100% Match/);
  assert.match(fullHtml, /Alice: Vegan/);
  assert.match(fullHtml, /Average mains \$15/);
  assert.match(fullHtml, /Open in Maps/);
  assert.match(fullHtml, /Add to Google Calendar/);
});

test("itinerary card renders schedule table", () => {
  const emptyHtml = renderToStaticMarkup(createElement(ItineraryCard, {}));
  assert.match(emptyHtml, /Planning schedule/);

  const fullHtml = renderToStaticMarkup(
    createElement(ItineraryCard, {
      title: "Friday Team Dinner",
      stops: [
        { time: "18:30", activity: "Meetup", location: "MRT Exit A" },
        { time: "19:00", activity: "Dinner", location: "Genesis Bistro" },
      ],
    }),
  );

  assert.match(fullHtml, /Friday Team Dinner/);
  assert.match(fullHtml, /MRT Exit A/);
  assert.match(fullHtml, /Genesis Bistro/);
});

test("travel plan card renders destination, dates, and skill badge", () => {
  const emptyHtml = renderToStaticMarkup(createElement(TravelPlanCard, {}));
  assert.match(emptyHtml, /Planning multi-day travel/);

  const fullHtml = renderToStaticMarkup(
    createElement(TravelPlanCard, {
      destination: "Tokyo, Japan",
      title: "Tokyo Autumn Discovery",
      dates: "Oct 15 - Oct 19, 2026",
      travelers: ["Sathish", "Ramesh"],
      estimatedBudget: "$1,200 SGD",
      highlights: ["Shinjuku night walk", "Meiji Shrine & Harajuku"],
    }),
  );

  assert.match(fullHtml, /Tokyo Autumn Discovery/);
  assert.match(fullHtml, /Skill: Travel Planner/);
  assert.match(fullHtml, /Sathish/);
  assert.match(fullHtml, /Shinjuku night walk/);
  assert.match(fullHtml, /Add Trip to Google Calendar/);
});

test("flight hotel card renders flights and stays", () => {
  const fullHtml = renderToStaticMarkup(
    createElement(FlightHotelCard, {
      destination: "Tokyo",
      title: "Tokyo Travel Picks",
      flights: [
        {
          airline: "Singapore Airlines",
          flightNumber: "SQ638",
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
    }),
  );

  assert.match(fullHtml, /Tokyo Travel Picks/);
  assert.match(fullHtml, /Singapore Airlines/);
  assert.match(fullHtml, /Hotel Gracery Shinjuku/);
  assert.match(fullHtml, /Skill: Travel Planner/);
});

test("travel alert card renders urgency and message", () => {
  const fullHtml = renderToStaticMarkup(
    createElement(TravelAlertCard, {
      title: "Flight Check-In Open",
      tripName: "Tokyo Trip",
      urgency: "warning",
      category: "checkin",
      message: "Online check-in is now open for SQ638.",
    }),
  );

  assert.match(fullHtml, /Flight Check-In Open/);
  assert.match(fullHtml, /warning/i);
  assert.match(fullHtml, /Online check-in is now open/);
});

test("bill split card renders total, payer, members and settlements", () => {
  const fullHtml = renderToStaticMarkup(
    createElement(BillSplitCard, {
      title: "Team Dinner & Drinks",
      currency: "SGD",
      totalAmount: 145,
      paidBy: "Ramesh",
      members: [
        { name: "Sathish", share: 45, itemsSummary: "Veg Platter" },
        { name: "Alice", share: 40, itemsSummary: "Vegan Bowl" },
        { name: "Ramesh", share: 60, itemsSummary: "BBQ & Beer" },
      ],
      settlements: [
        { from: "Sathish", to: "Ramesh", amount: 45 },
        { from: "Alice", to: "Ramesh", amount: 40 },
      ],
    }),
  );

  assert.match(fullHtml, /Team Dinner &amp; Drinks/);
  assert.match(fullHtml, /145.00/);
  assert.match(fullHtml, /Ramesh/);
  assert.match(fullHtml, /Sathish/);
  assert.match(fullHtml, /Skill: Bill Splitter/);
  assert.match(fullHtml, /Mark All Settled/);
});

