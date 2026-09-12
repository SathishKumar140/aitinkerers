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

/** Recipe / Skill types */
export const recipeTypeSchema = z.enum(["outing", "travel", "bill_split"]);
export type RecipeType = z.infer<typeof recipeTypeSchema>;

/** Travel Plan Card Schema */
export const travelPlanCardSchema = z.object({
  destination: z.string().describe("Destination city or country (e.g. 'Tokyo, Japan')."),
  title: z.string().describe("Trip title, e.g. 'Tokyo Autumn Discovery'."),
  dates: z.string().describe("Travel dates or duration, e.g. 'Oct 15 - Oct 19, 2026'."),
  travelers: z.array(z.string()).default([]).describe("Names of travelers in group."),
  estimatedBudget: z.string().optional().describe("Estimated budget range per person."),
  highlights: z.array(z.string()).min(1).describe("Key daily highlights or itinerary stops."),
  calendarUrl: z.string().url().optional().describe("1-Click Google Calendar event link."),
  mapUrl: z.string().url().optional().describe("Google Maps navigation link."),
});

export type TravelPlanCardData = z.infer<typeof travelPlanCardSchema>;

/** Flight & Hotel Recommendation Schema */
export const flightRecommendationSchema = z.object({
  airline: z.string().describe("Airline name, e.g. 'Singapore Airlines'."),
  flightNumber: z.string().optional().describe("Flight number, e.g. 'SQ638'."),
  route: z.string().describe("Route, e.g. 'SIN → HND'."),
  times: z.string().describe("Departure & arrival, e.g. '07:10 - 15:20'."),
  price: z.string().describe("Estimated price, e.g. '$680 SGD'."),
  bookingUrl: z.string().url().optional().describe("Link to Google Flights or airline."),
});

export type FlightRecommendation = z.infer<typeof flightRecommendationSchema>;

export const hotelRecommendationSchema = z.object({
  name: z.string().describe("Hotel name, e.g. 'Hotel Gracery Shinjuku'."),
  neighborhood: z.string().describe("Neighborhood, e.g. 'Shinjuku'."),
  rating: z.string().describe("Star or user rating, e.g. '4.5★'."),
  pricePerNight: z.string().describe("Price per night, e.g. '$160/night'."),
  amenities: z.array(z.string()).default([]).describe("Key amenities, e.g. ['Near JR Transit', 'Breakfast']"),
  bookingUrl: z.string().url().optional().describe("Link to Google Hotels or booking site."),
});

export type HotelRecommendation = z.infer<typeof hotelRecommendationSchema>;

export const flightHotelCardSchema = z.object({
  destination: z.string().describe("Destination city."),
  title: z.string().describe("Card headline, e.g. 'Top Flights & Stays for Tokyo'."),
  flights: z.array(flightRecommendationSchema).default([]).describe("Curated flight options."),
  hotels: z.array(hotelRecommendationSchema).default([]).describe("Curated hotel recommendations."),
});

export type FlightHotelCardData = z.infer<typeof flightHotelCardSchema>;

/** Travel Alert / Notification Schema */
export const travelAlertCardSchema = z.object({
  title: z.string().describe("Alert title, e.g. 'Flight SQ638 Check-In Open'."),
  tripName: z.string().describe("Associated trip, e.g. 'Tokyo Trip'."),
  urgency: z.enum(["info", "warning", "critical"]).default("info"),
  category: z.enum(["flight", "checkin", "weather", "packing", "reminder"]).default("reminder"),
  message: z.string().describe("Detailed notification body."),
  actionLabel: z.string().optional().describe("Action button label, e.g. 'Check In Online'."),
  actionUrl: z.string().url().optional().describe("Action URL."),
});

export type TravelAlertCardData = z.infer<typeof travelAlertCardSchema>;

/** Bill Split / Splitwise Schema */
export const memberShareSchema = z.object({
  name: z.string().describe("Member name."),
  share: z.number().describe("Total amount owed or assigned to this member."),
  itemsSummary: z.string().optional().describe("What this member ordered or incurred."),
});

export type MemberShare = z.infer<typeof memberShareSchema>;

export const settlementSchema = z.object({
  from: z.string().describe("Who pays."),
  to: z.string().describe("Who receives."),
  amount: z.number().describe("Amount to transfer."),
});

export type Settlement = z.infer<typeof settlementSchema>;

export const billSplitCardSchema = z.object({
  title: z.string().describe("Title of bill/expense, e.g. 'Dinner & Drinks at RedDot Brewhouse'."),
  currency: z.string().default("SGD").optional().describe("Currency, e.g. 'SGD', 'USD'."),
  totalAmount: z.number().describe("Total bill amount."),
  paidBy: z.string().describe("Member who originally paid the entire bill."),
  splitMethod: z.string().default("Equal / Itemized").optional().describe("Description of split method used."),
  members: z.array(memberShareSchema).min(1).describe("Member-by-member breakdown."),
  settlements: z.array(settlementSchema).default([]).optional().describe("Calculated debt settlement ('Who owes whom')."),
});

export type BillSplitCardData = z.infer<typeof billSplitCardSchema>;


