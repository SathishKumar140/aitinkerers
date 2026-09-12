/** Sample group outing context and constraints for Project Roam Concierge. Follow-ups are retrieved separately from Ambiguous. */
import type { WorkplaceTask } from "./followup-types";

export interface ParticipantConstraint {
  name: string;
  dietary: string;
  budget: string;
  location: string;
  vibe: string;
}

export interface ConsensusVenue {
  name: string;
  headline: string;
  category: string;
  priceTier: string;
  neighborhood: string;
  rating: string;
  matchScore: string;
  whyItWorks: Array<{ member: string; reason: string }>;
  mapUrl: string;
  sourceUrl: string;
}

export const incidents = [
  {
    id: "INC-1042",
    title: "Singapore Friday Team Dinner",
    city: "Singapore",
    service: "Checkout API", // preserved for backward-compatible test fixtures
    severity: "SEV 2",
    status: "Arbitrating Preferences",
    owner: "Charlie Tan",
    channel: "#team-social-sg",
    updated: "18:15 SGT",
    summary:
      "Team gathering to celebrate sprint completion. Alice, Bob, and Charlie need a dining spot that satisfies all dietary and budget restrictions.",
    impact:
      "Alice is strictly vegan & gluten-free; Bob has a strict budget under $20; Charlie wants Chinatown or Tanjong Pagar near MRT.",
    participants: [
      {
        name: "Alice",
        dietary: "Strictly Vegan & Gluten-Free 🌱",
        budget: "Flexible",
        location: "Near MRT",
        vibe: "Casual, clean",
      },
      {
        name: "Bob",
        dietary: "No seafood / allergy",
        budget: "Under $20 / person 💸",
        location: "Downtown / Central",
        vibe: "Great value",
      },
      {
        name: "Charlie",
        dietary: "None (Omnivore)",
        budget: "$20–$30",
        location: "Chinatown / Tanjong Pagar 📍",
        vibe: "Cozy group seating",
      },
    ] as ParticipantConstraint[],
    consensusVenue: {
      name: "Genesis Plant-Based Bistro",
      headline: "Consensus Choice: Genesis Bistro",
      category: "Asian Vegan & Gluten-Free",
      priceTier: "under $20 ($14–$18)",
      neighborhood: "Chinatown / Tanjong Pagar",
      rating: "4.8 ★ (Exa verified)",
      matchScore: "100% Group Match",
      whyItWorks: [
        { member: "Alice", reason: "100% plant-based with certified gluten-free kitchen options." },
        { member: "Bob", reason: "Mains average $14–$18, comfortably under his $20 budget." },
        { member: "Charlie", reason: "Located 3 min walk from Tanjong Pagar MRT with group seating." },
      ],
      mapUrl: "https://maps.google.com/?q=Genesis+Bistro+Singapore",
      sourceUrl: "https://example.com/genesis-bistro",
    } as ConsensusVenue,
    timeline: [
      {
        time: "17:30",
        author: "Alice",
        detail: "Let's celebrate sprint finish! Vegan & gluten-free options please 🌱",
      },
      {
        time: "17:45",
        author: "Bob",
        detail: "I'm on a tight budget, keep it under $20 if possible 💸",
      },
      {
        time: "18:00",
        author: "Charlie",
        detail: "Near Chinatown or Tanjong Pagar MRT would be ideal for everyone 📍",
      },
    ],
  },
  {
    id: "INC-1043",
    title: "SF Hackathon Team Celebration",
    city: "San Francisco",
    service: "Notifications", // preserved for backward-compatible test fixtures
    severity: "SEV 3",
    status: "Consensus Found",
    owner: "Alex Rivera",
    channel: "#agents-everywhere-sf",
    updated: "19:40 PST",
    summary:
      "Post-hackathon team dinner and drinks. Dave, Eve, and Frank are looking for food in the Mission with outdoor dog-friendly seating.",
    impact:
      "Dave requires Halal or vegetarian; Eve has a severe nut allergy and wants dog-friendly patio; Frank wants craft drinks near BART.",
    participants: [
      {
        name: "Dave",
        dietary: "Halal or Vegetarian 🥩",
        budget: "Under $30",
        location: "Mission District",
        vibe: "Outdoor patio",
      },
      {
        name: "Eve",
        dietary: "Severe nut allergy ⚠️",
        budget: "$20–$40",
        location: "Mission / Valencia",
        vibe: "Dog-friendly heated patio 🐕",
      },
      {
        name: "Frank",
        dietary: "Craft cider preference",
        budget: "Under $35",
        location: "Walking distance to 16th St BART",
        vibe: "Lively, celebratory",
      },
    ] as ParticipantConstraint[],
    consensusVenue: {
      name: "El Buen Sabor & Cantina Patio",
      headline: "Consensus Choice: El Buen Sabor",
      category: "Mexican Taqueria & Cantina",
      priceTier: "$ ($15–$25)",
      neighborhood: "Mission District, 18th & Valencia",
      rating: "4.7 ★ (Exa verified)",
      matchScore: "100% Group Match",
      whyItWorks: [
        { member: "Dave", reason: "Certified Halal-friendly grilled chicken and roasted veggie tacos." },
        { member: "Eve", reason: "Nut-free kitchen section with spacious dog-friendly heated outdoor patio." },
        { member: "Frank", reason: "Local craft cider list on tap, 4 blocks from 16th St BART." },
      ],
      mapUrl: "https://maps.google.com/?q=Valencia+St+Mission+SF",
      sourceUrl: "https://example.com/el-buen-sabor",
    } as ConsensusVenue,
    timeline: [
      {
        time: "18:45",
        author: "Support",
        detail: "Customers report delayed confirmation emails. Let's resolve and grab celebration food!",
      },
      {
        time: "19:15",
        author: "Alex Rivera",
        detail: "Hackathon project submitted! Looking for Mission District spots.",
      },
      {
        time: "19:35",
        author: "Eve",
        detail: "Bringing my dog so need outdoor heated patio, plus nut-free options 🐕",
      },
    ],
  },
] as const;

export type Incident = (typeof incidents)[number];
export type Outing = Incident;

export function findIncident(id: string): Incident {
  const incident = incidents.find((item) => item.id === id);
  if (!incident)
    throw new Error(
      `Unknown incident ${id}. Choose ${incidents.map((item) => item.id).join(" or ")}.`,
    );
  return incident;
}

export const findOuting = findIncident;

export function workspaceContext(
  selectedId: string,
  followups: WorkplaceTask[],
) {
  const selected = findIncident(selectedId);
  return {
    dataSource:
      "Fictional sample incidents & group outings. Follow-ups shown here were retrieved from Ambiguous for the selected incident. A proposal is not a saved task.",
    availableIncidents: incidents.map(({ id, title, status }) => ({
      id,
      title,
      status,
    })),
    selectedIncident: {
      ...selected,
      timeline: [...selected.timeline],
      participants: [...selected.participants],
      consensusVenue: selected.consensusVenue,
    },
    followups,
  };
}
