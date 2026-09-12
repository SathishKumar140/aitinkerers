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

export interface GroupOutingSettings {
  title: string;
  neighborhood: string;
  time: string;
  strictDietary: boolean;
  transitStop: string;
}

interface GroupContextValue {
  members: GroupMember[];
  settings: GroupOutingSettings;
  addMember: (member: Omit<GroupMember, "id" | "initials">) => void;
  updateMember: (id: string, updates: Partial<GroupMember>) => void;
  removeMember: (id: string) => void;
  updateSettings: (updates: Partial<GroupOutingSettings>) => void;
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

const GroupContext = createContext<GroupContextValue | null>(null);

function makeInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<GroupMember[]>(defaultMembers);
  const [settings, setSettings] = useState<GroupOutingSettings>(defaultSettings);
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

  // Build real-time human prompt description of group constraints
  const promptSummary = members
    .map(
      (m) =>
        `${m.name} (${m.diet}${m.allergies ? `, ${m.allergies}` : ""}, budget <$${m.budget}, prefers ${m.vibe})`
    )
    .join("; ");

  return (
    <GroupContext.Provider
      value={{
        members,
        settings,
        addMember,
        updateMember,
        removeMember,
        updateSettings,
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
