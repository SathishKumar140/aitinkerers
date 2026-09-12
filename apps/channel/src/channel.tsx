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
      description: "Cross-skill flow & Immediate Action",
      value:
        "When destination, dates, or approximate budget are provided, IMMEDIATELY call `travel_plan_card`, `itinerary_card`, and `flight_hotel_card`! " +
        "NEVER ask repetitive or already-confirmed questions (like re-asking budget, per-person vs total, or flight preferences). " +
        "NEVER withhold cards with phrases like 'Confirm one last detail so I can render proper cards next'. Render cards immediately with sensible defaults.",
    },
    {
      description: "Group Context & Channel Members",
      value:
        "This Slack channel (#outing) is a multiplayer group workspace with members: Ramesh Vishnoi (Ramesh) and Sathish Kumar. " +
        "When an individual member (e.g. Ramesh) asks for a trip plan, travel itinerary, dining recommendation, or bill split, the plan is for the ENTIRE GROUP (all channel members: Ramesh and Sathish Kumar). " +
        "In `travel_plan_card`, ALWAYS set `travelers` to include all group members (['Ramesh', 'Sathish Kumar']) unless a solo trip is explicitly requested. Do not choose only the requester as the traveler.",
    },
    {
      description: "Slack File Attachments",
      value:
        "Slack IDs starting with 'F' (e.g. 'F0C1GFRQPA8') represent uploaded receipt/menu file attachments, NOT user IDs. When an 'F...' token or image is received, treat it as an uploaded receipt image to extract items and generate a bill_split_card.",
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
  const raw = text.trim();
  const isSlackFileId = /^F[A-Z0-9]{8,12}$/i.test(raw);
  const hasImages = contentParts?.some((p: any) => p.type === "image" || p.image) || isSlackFileId || /\.(png|jpe?g|webp|gif)\b/i.test(t);
  const isTravel = /\b(trip|travel|fly|flight|hotel|itinerary|visit|tokyo|bali|paris|london|bangkok|holiday|vacation|days?)\b/.test(t);
  const isOuting = /\b(dinner|lunch|restaurant|outing|eat|dine|food|venue|cafe|drinks?)\b/.test(t);
  const isBill = /\b(split|bill|pay|paid|cost|expense|share|sgd|\$)\b/.test(t) || hasImages;
  return { isTravel, isOuting, isBill, hasImages, isSlackFileId };
}

// A mention subscribes the conversation, so the agent then follows along instead
// of needing to be @-mentioned every single turn.
channel.onMention(async ({ thread, message }) => {
  console.log(`\n👉 [SLACK EVENT] @-mention received: "${message?.text || ""}" (conv: ${thread.conversationKey})`);
  try {
    await thread.subscribe();
    const { isTravel, isOuting, isBill, hasImages, isSlackFileId } = detectIntent(message?.text || "", message?.contentParts);

    // Forward message text + image content parts so the model can see attachments.
    let prompt: any = message?.contentParts?.length
      ? [
          ...(message.text ? [{ type: "text" as const, text: message.text }] : []),
          ...message.contentParts,
        ]
      : undefined;
    if (isSlackFileId && !prompt) {
      prompt = `[Receipt image attached with Slack File ID ${message?.text?.trim()}]: Extract all items, taxes, tips, and totals from this uploaded receipt image and generate a bill_split_card.`;
    }

    await thread.runAgent(prompt ? { prompt } : undefined);
    console.log(`✓ [SLACK EVENT] Agent finished reply for conv ${thread.conversationKey}\n`);

    // Post a cross-skill follow-up card based on detected intent and vision.
    try {
      if (hasImages || isSlackFileId || (isBill && !isTravel && !isOuting)) {
        await thread.runAgent({
          prompt: [
            {
              type: "text" as const,
              text:
                "An image was just shared in this thread. If it shows a receipt, bill, or restaurant check: " +
                "1) Call read_thread to recall the group members from earlier in the conversation. " +
                "2) Extract every line item, subtotal, tax, and total from the image. " +
                "3) Call bill_split_card with the full breakdown and an equal settlement plan. " +
                "If it is NOT a bill image, describe what is in the image and respond naturally.",
            },
            ...(message.contentParts ?? []),
          ],
        });
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
                    prompt: "Based on the trip budget discussed, call read_thread to recall the travelers, then create a bill_split_card showing how costs split equally.",
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
                    prompt: "Call read_thread to recall who the group members are, then split the dinner bill equally using bill_split_card.",
                  });
                }}
              >
                💸 Split the bill
              </Button>
            </Actions>
          </Message>,
        );
      }
    } catch (cardErr) {
      console.warn("Follow-up card could not be posted:", cardErr);
    }
  } catch (err) {
    console.error(`❌ [SLACK EVENT] Agent error on mention (conv: ${thread.conversationKey}):`, err);
  }
});

// Non-mentioned turns only ever reach onMessage — gate them on the flag or the
// agent will answer every message in every channel it has been invited to.
channel.onMessage(async ({ thread, message }) => {
  const text = message?.text?.trim() || "";
  if (!text || text === "This message was deleted." || text.startsWith("pinned a message")) {
    console.log(`👉 [SLACK EVENT] Ignoring deleted/system message: "${text}"`);
    return;
  }

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
      await thread.runAgent(prompt ? { prompt } : undefined);
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
