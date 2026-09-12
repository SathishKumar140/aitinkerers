import { createChannel, Message, Section, Markdown, Actions, Button } from "@copilotkit/channels";
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
    {
      description: "Vision & Bill Extraction",
      value:
        "When users upload images of receipts, menus, or bills, inspect the image content parts using vision to extract items, amounts, and participants, then render a bill_split_card.",
    },
    {
      description: "Cross-skill flow",
      value:
        "When a user mentions a trip but does NOT provide specific dates, you MUST ask for the dates before generating the travel plan card. " +
        "After producing a travel_plan_card, proactively ask if the group would like to plan a bill split for the trip costs. " +
        "After producing a consensus_card for a dining outing, ask if they want to split the bill using bill_split_card. " +
        "Keep follow-up questions brief — one question at a time.",
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


/** Detect rough intent from the raw message text and content parts. */
function detectIntent(text: string, contentParts?: any[]) {
  const t = text.toLowerCase();
  const hasImages = contentParts?.some((p: any) => p.type === "image" || p.image);
  const isTravel = /\b(trip|travel|fly|flight|hotel|itinerary|visit|tokyo|bali|paris|london|bangkok|holiday|vacation|days?)\b/.test(t);
  const isOuting = /\b(dinner|lunch|restaurant|outing|eat|dine|food|venue|cafe|drinks?)\b/.test(t);
  const isBill = /\b(split|bill|pay|paid|cost|expense|share|sgd|\$)\b/.test(t) || hasImages;
  return { isTravel, isOuting, isBill, hasImages };
}

// A mention subscribes the conversation, so the agent then follows along instead
// of needing to be @-mentioned every single turn.
channel.onMention(async ({ thread, message }) => {
  console.log(`\n👉 [SLACK EVENT] @-mention received: "${message?.text || ""}" (conv: ${thread.conversationKey})`);
  try {
    await thread.subscribe();
    // Forward message text + image content parts so the model can see attachments.
    const prompt = message?.contentParts?.length
      ? [
          ...(message.text ? [{ type: "text" as const, text: message.text }] : []),
          ...message.contentParts,
        ]
      : undefined;
    await thread.runAgent({
      prompt,
      transcript: true,
      memory: { user: "read-write", project: "read-write" },
    });
    console.log(`✓ [SLACK EVENT] Agent finished reply for conv ${thread.conversationKey}\n`);

    // Post a cross-skill follow-up card based on detected intent and vision.
    const { isTravel, isOuting, isBill, hasImages } = detectIntent(message?.text || "", message?.contentParts);

    if (hasImages || (isBill && !isTravel && !isOuting)) {
      await thread.post(
        <Message accent="#2E7D5B">
          <Section>
            <Markdown>**Receipt detected! Let's settle up 💸**</Markdown>
          </Section>
          <Actions>
            <Button
              value="extract_bill"
              style="primary"
              onClick={async ({ thread }) => {
                await thread.runAgent({
                  prompt: "Extract all items, taxes, tips, and totals from the uploaded receipt image and generate a bill_split_card.",
                });
              }}
            >
              🧾 Extract &amp; split bill
            </Button>
          </Actions>
        </Message>,
      );
    } else if (isTravel && !isBill) {
      await thread.post(
        <Message accent="#1E3A5F">
          <Section>
            <Markdown>**A few things to complete your trip plan ✈️**</Markdown>
          </Section>
          <Actions>
            <Button
              value="ask_dates"
              style="primary"
              onClick={async ({ thread }) => {
                await thread.runAgent({
                  prompt: "Ask the group for specific travel dates — what exact dates are they planning? Confirm and update the itinerary.",
                });
              }}
            >
              📅 Set exact dates
            </Button>
            <Button
              value="plan_split"
              onClick={async ({ thread }) => {
                await thread.runAgent({
                  prompt: "Based on the trip budget discussed, create a bill_split_card showing how costs split equally among the travelers.",
                });
              }}
            >
              💸 Plan the bill split
            </Button>
            <Button
              value="find_flights"
              onClick={async ({ thread }) => {
                await thread.runAgent({
                  prompt: "Find flight and hotel options for this trip and render a flight_hotel_card.",
                });
              }}
            >
              ✈️ Flights &amp; hotels
            </Button>
          </Actions>
        </Message>,
      );
    } else if (isOuting && !isBill) {
      await thread.post(
        <Message accent="#2E7D5B">
          <Section>
            <Markdown>**Happy to help wrap this up 🍽️**</Markdown>
          </Section>
          <Actions>
            <Button
              value="book_cal"
              style="primary"
              onClick={async ({ thread }) => {
                await thread.runAgent({
                  prompt: "Create a Google Calendar event for the outing using create_calendar_event.",
                });
              }}
            >
              📅 Add to calendar
            </Button>
            <Button
              value="split_dinner"
              onClick={async ({ thread }) => {
                await thread.runAgent({
                  prompt: "Split the dinner bill equally among the group using bill_split_card.",
                });
              }}
            >
              💸 Split the bill
            </Button>
          </Actions>
        </Message>,
      );
    }
  } catch (err) {
    console.error(`❌ [SLACK EVENT] Agent error on mention (conv: ${thread.conversationKey}):`, err);
  }
});

// Non-mentioned turns only ever reach onMessage — gate them on the flag or the
// agent will answer every message in every channel it has been invited to.
channel.onMessage(async ({ thread, message }) => {
  const subscribed = await thread.isSubscribed();
  console.log(`👉 [SLACK EVENT] Message received: "${message?.text || ""}" (subscribed: ${subscribed})`);
  if (subscribed) {
    try {
      // Forward message text + image content parts for multimodal processing.
      const prompt = message?.contentParts?.length
        ? [
            ...(message.text ? [{ type: "text" as const, text: message.text }] : []),
            ...message.contentParts,
          ]
        : undefined;
      await thread.runAgent({
        prompt,
        transcript: true,
        memory: { user: "read-write", project: "read-write" },
      });
      console.log(`✓ [SLACK EVENT] Agent finished following up on conv ${thread.conversationKey}\n`);
    } catch (err) {
      console.error(`❌ [SLACK EVENT] Agent error on message (conv: ${thread.conversationKey}):`, err);
    }
  }
});

channel.onWelcome(async ({ thread, platform }) => {
  console.log(`👉 [SLACK EVENT] Bot joined / welcomed to channel on ${platform}`);
  await thread.post(welcomeMessage(platform));
});
