import { createChannel } from "@copilotkit/channels";
import { isSearchConfigured, isWorkplaceConfigured, WORKPLACE_CONTEXT } from "agent-core";
import { makeChannelAgent } from "./agent";
import { required } from "./env";
import {
  GroupConsensusCard,
  ItineraryCard,
  IncidentCard,
  Timeline,
  TravelPlanCard,
  FlightHotelCard,
  TravelAlertCard,
  BillSplitCard,
  welcomeMessage,
} from "./components";
import { createCalendarEvent, proposeAction, readThread, searchTheWeb } from "./tools";

// Tools are registered only when their credential is present, so the agent is
// never handed a tool that will fail when it calls it.
const tools = [
  readThread,
  createCalendarEvent,
  proposeAction,
  ...(isSearchConfigured() ? [searchTheWeb] : []),
];

export const channel = createChannel({
  // Must equal the Channel Code in Intelligence, character for character. A
  // mismatch leaves the Channel at "Waiting for runtime" and is validated at
  // startup, not here.
  name: required("CHANNEL_CODE"),

  // Required. "platform" derives the canonical user from provider + workspace +
  // platform user id. Do NOT move this onto CopilotRuntime — that one is for
  // web requests and must be absent on a Channels-only runtime.
  identifyUser: "platform",

  agent: makeChannelAgent,
  tools,
  components: [
    GroupConsensusCard,
    ItineraryCard,
    IncidentCard,
    Timeline,
    TravelPlanCard,
    FlightHotelCard,
    TravelAlertCard,
    BillSplitCard,
  ],

  // Injected into the agent's prompt on every run.
  context: [
    {
      description: "Rendering",
      value:
        "You can draw native UI by calling consensus_card, itinerary_card, travel_plan_card, flight_hotel_card, travel_alert_card, or bill_split_card. Prefer them over prose whenever presenting recommendations, trips, schedules, or bill settlements.",
    },
    ...(isWorkplaceConfigured()
      ? [{ description: "Workplace", value: WORKPLACE_CONTEXT }]
      : []),
    {
      description: "Surface",
      value:
        "This is a chat thread in a channel people are actively working in. Read the conversation carefully to pick up group member constraints, travel plans, or bills.",
    },
  ],
});


// A mention subscribes the conversation, so the agent then follows along instead
// of needing to be @-mentioned every single turn.
channel.onMention(async ({ thread, message }) => {
  console.log(`\n👉 [SLACK EVENT] @-mention received: "${message?.text || ""}" (conv: ${thread.conversationKey})`);
  await thread.subscribe();
  await thread.runAgent();
  console.log(`✓ [SLACK EVENT] Agent finished reply for conv ${thread.conversationKey}\n`);
});

// Non-mentioned turns only ever reach onMessage — gate them on the flag or the
// agent will answer every message in every channel it has been invited to.
channel.onMessage(async ({ thread, message }) => {
  const subscribed = await thread.isSubscribed();
  console.log(`👉 [SLACK EVENT] Message received: "${message?.text || ""}" (subscribed: ${subscribed})`);
  if (subscribed) {
    await thread.runAgent();
    console.log(`✓ [SLACK EVENT] Agent finished following up on conv ${thread.conversationKey}\n`);
  }
});

channel.onWelcome(async ({ thread, platform }) => {
  console.log(`👉 [SLACK EVENT] Bot joined / welcomed to channel on ${platform}`);
  await thread.post(welcomeMessage(platform));
});
