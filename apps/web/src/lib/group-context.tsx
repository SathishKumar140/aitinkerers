"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface GroupMember {
  id: string;
  name: string;
  avatarBg: string;
  initials: string;
  diet: string;
  budget: number;
  allergies?: string;
  vibe: string;
}

export type RecipeType = "outing" | "travel" | "bill_split";

export interface GroupOutingSettings {
  title: string;
  neighborhood: string;
  time: string;
  strictDietary: boolean;
  transitStop: string;
}

export interface GroupTravelSettings {
  destination: string;
  dates: string;
  budgetTier: string;
  hotelPreference: string;
  flightPreference: string;
}

export interface GroupBillSplitSettings {
  title: string;
  totalAmount: number;
  currency: string;
  paidById: string;
  splitMethod: string;
}

interface GroupContextValue {
  activeRecipe: RecipeType;
  setActiveRecipe: (recipe: RecipeType) => void;
  members: GroupMember[];
  settings: GroupOutingSettings;
  travelSettings: GroupTravelSettings;
  billSplitSettings: GroupBillSplitSettings;
  addMember: (member: Omit<GroupMember, "id" | "initials">) => void;
  updateMember: (id: string, updates: Partial<GroupMember>) => void;
  removeMember: (id: string) => void;
  updateSettings: (updates: Partial<GroupOutingSettings>) => void;
  updateTravelSettings: (updates: Partial<GroupTravelSettings>) => void;
  updateBillSplitSettings: (updates: Partial<GroupBillSplitSettings>) => void;
  isConfigModalOpen: boolean;
  setIsConfigModalOpen: (open: boolean) => void;
  editingMember: GroupMember | null;
  setEditingMember: (member: GroupMember | null) => void;
  promptSummary: string;
}

const defaultMembers: GroupMember[] = [
  {
    id: "m1",
    name: "Sathish Kumar",
    avatarBg: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    initials: "SK",
    diet: "Pure Vegetarian",
    budget: 20,
    vibe: "Outdoor Seating",
  },
  {
    id: "m2",
    name: "Ramesh",
    avatarBg: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    initials: "RM",
    diet: "Smoked BBQ & Craft Beer",
    budget: 35,
    vibe: "Craft Brews",
  },
  {
    id: "m3",
    name: "Alice",
    avatarBg: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
    initials: "AL",
    diet: "Vegan & GF",
    allergies: "Nut Allergy",
    budget: 25,
    vibe: "Cozy Vibe",
  },
];

const defaultSettings: GroupOutingSettings = {
  title: "Singapore Outing: Dinner & Drinks",
  neighborhood: "Tanjong Pagar & Chinatown",
  time: "Tonight · 7:30 PM",
  strictDietary: true,
  transitStop: "Tanjong Pagar / Maxwell MRT",
};

const defaultTravelSettings: GroupTravelSettings = {
  destination: "Tokyo, Japan",
  dates: "Oct 15 – Oct 19, 2026 (4 Days)",
  budgetTier: "$1,200 – $1,600 SGD / person",
  hotelPreference: "Near JR Shinjuku/Ginza, 4★, quiet & rooftop lounge",
  flightPreference: "Direct flight from Singapore (SIN → HND/NRT), morning arrival",
};

const defaultBillSplitSettings: GroupBillSplitSettings = {
  title: "Team Dinner & Drinks at RedDot Brewhouse",
  totalAmount: 145,
  currency: "SGD",
  paidById: "m2", // Ramesh
  splitMethod: "Itemized by Order",
};

const GroupContext = createContext<GroupContextValue | null>(null);

function makeInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const [activeRecipe, setActiveRecipe] = useState<RecipeType>("outing");
  const [members, setMembers] = useState<GroupMember[]>(defaultMembers);
  const [settings, setSettings] = useState<GroupOutingSettings>(defaultSettings);
  const [travelSettings, setTravelSettings] = useState<GroupTravelSettings>(defaultTravelSettings);
  const [billSplitSettings, setBillSplitSettings] =
    useState<GroupBillSplitSettings>(defaultBillSplitSettings);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<GroupMember | null>(null);

  const addMember = (m: Omit<GroupMember, "id" | "initials">) => {
    const id = "m_" + Date.now();
    const newM: GroupMember = {
      ...m,
      id,
      initials: makeInitials(m.name || "Member"),
      avatarBg: m.avatarBg || "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    };
    setMembers((prev) => [...prev, newM]);
  };

  const updateMember = (id: string, updates: Partial<GroupMember>) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const name = updates.name !== undefined ? updates.name : m.name;
        return {
          ...m,
          ...updates,
          initials: makeInitials(name),
        };
      })
    );
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const updateSettings = (updates: Partial<GroupOutingSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const updateTravelSettings = (updates: Partial<GroupTravelSettings>) => {
    setTravelSettings((prev) => ({ ...prev, ...updates }));
  };

  const updateBillSplitSettings = (updates: Partial<GroupBillSplitSettings>) => {
    setBillSplitSettings((prev) => ({ ...prev, ...updates }));
  };

  const payer = members.find((m) => m.id === billSplitSettings.paidById) || members[0];

  // Build real-time prompt description based on active recipe
  let promptSummary = "";
  if (activeRecipe === "outing") {
    promptSummary = members
      .map(
        (m) =>
          `${m.name} (${m.diet}${m.allergies ? `, ${m.allergies}` : ""}, budget <$${m.budget}, prefers ${m.vibe})`
      )
      .join("; ");
  } else if (activeRecipe === "travel") {
    const travelerNames = members.map((m) => m.name.split(" ")[0]).join(", ");
    promptSummary = `Destination: ${travelSettings.destination}, Dates: ${travelSettings.dates}, Travelers: [${travelerNames}], Budget: ${travelSettings.budgetTier}, Hotels: ${travelSettings.hotelPreference}, Flights: ${travelSettings.flightPreference}`;
  } else {
    const memberNames = members.map((m) => m.name).join(", ");
    promptSummary = `Bill: "${billSplitSettings.title}", Total: ${billSplitSettings.currency} ${billSplitSettings.totalAmount}, Paid By: ${payer.name}, Split Among: [${memberNames}]`;
  }

  return (
    <GroupContext.Provider
      value={{
        activeRecipe,
        setActiveRecipe,
        members,
        settings,
        travelSettings,
        billSplitSettings,
        addMember,
        updateMember,
        removeMember,
        updateSettings,
        updateTravelSettings,
        updateBillSplitSettings,
        isConfigModalOpen,
        setIsConfigModalOpen,
        editingMember,
        setEditingMember,
        promptSummary,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const ctx = useContext(GroupContext);
  if (!ctx) {
    throw new Error("useGroup must be used within GroupProvider");
  }
  return ctx;
}

