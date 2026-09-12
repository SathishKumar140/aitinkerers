"use client";

import React from "react";
import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";
import { useGroup } from "@/lib/group-context";

interface RoamWelcomeScreenProps {
  input?: React.ReactNode;
}

export function RoamWelcomeScreen({ input }: RoamWelcomeScreenProps) {
  const { agent } = useAgent({ agentId: "default" });
  const { copilotkit } = useCopilotKit();
  const {
    members,
    settings,
    travelSettings,
    billSplitSettings,
    activeRecipe,
    setActiveRecipe,
    promptSummary,
    setIsConfigModalOpen,
  } = useGroup();

  const handleSendPrompt = async (promptText: string) => {
    try {
      agent.addMessage({
        id: crypto.randomUUID(),
        role: "user",
        content: promptText,
      });
      await copilotkit.runAgent({ agent });
    } catch (err) {
      console.error("Failed to run agent from prompt card", err);
    }
  };

  const memberNames = members.map((m) => m.name.split(" ")[0]).join(" & ");

  const promptCards = [
    {
      icon: "🎯",
      title: "Find Consensus Dinner",
      desc: `Balance ${memberNames}'s tastes and budgets in ${settings.neighborhood}.`,
      badge: "Outing Recipe",
      badgeColor: "#d97706",
      badgeBg: "#fffbeb",
      prompt: `We are planning a group outing in ${settings.neighborhood} for our crew: ${promptSummary}. Strict dietary inclusivity is ${settings.strictDietary ? "ENABLED (100% safe options required)" : "flexible"}. Find our top consensus dinner spot, calculate match scores, and draw a consensus_card with Google Maps and Google Calendar links.`,
    },
    {
      icon: "✈️",
      title: "Plan 4-Day Tokyo Trip",
      desc: `Flights, 4-star stays, daily itinerary & Google Calendar sync for ${travelSettings.destination}.`,
      badge: "Travel Recipe",
      badgeColor: "#2563eb",
      badgeBg: "#eff6ff",
      prompt: `Plan a 4-day group trip to ${travelSettings.destination} for: ${promptSummary}. Recommend direct flights from Singapore with airlines & prices, top 4-star hotels near transit, and draw a travel_plan_card with a 1-click Google Calendar schedule.`,
    },
    {
      icon: "💸",
      title: "Split Team Dinner Bill ($145)",
      desc: `Splitwise-style itemized split, member shares & 'who owes whom' settlements.`,
      badge: "Bill Split Recipe",
      badgeColor: "#059669",
      badgeBg: "#ecfdf5",
      prompt: `Split our team dinner bill of $145.00 SGD paid by Ramesh among: Sathish ($45 for vegetarian dishes), Alice ($40 for vegan bowl & mocktail), and Ramesh ($60 for smoked ribs & craft beer). Calculate the exact settlement matrix and draw a bill_split_card.`,
    },
    {
      icon: "🔔",
      title: "Flight Check-In & Travel Alert",
      desc: `Luggage guidelines, flight SQ638 status, online check-in, and weather alerts.`,
      badge: "Travel Alert",
      badgeColor: "#7c3aed",
      badgeBg: "#faf5ff",
      prompt: `Generate a travel notification alert for Singapore Airlines flight SQ638 check-in and weather advisory for ${travelSettings.destination}. Draw a travel_alert_card.`,
    },
  ];

  return (
    <div className="roam-welcome-container">
      {/* Hero Emblem & Tag */}
      <div className="roam-hero-badge-wrap">
        <div className="roam-hero-icon-pulse">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C8.134 2 5 5.134 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.134 15.866 2 12 2Z"
              fill="white"
              fillOpacity="0.22"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="9" r="3" fill="white" />
          </svg>
        </div>
        <div className="roam-hero-tag">
          <span className="roam-hero-tag-dot" />
          <span>Multiplayer AI · Dining · Travel · Bill Split</span>
        </div>
      </div>

      {/* Hero Headings */}
      <h1 className="roam-hero-title">
        Where should we go, travel, or split?
      </h1>
      <p className="roam-hero-subtitle">
        Instant group consensus for outings, complete travel itineraries &amp; effortless bill splitting.
      </p>


      {/* Pinned Group Constraints Strip with Edit Button */}
      <div className="roam-group-strip">
        <div className="roam-group-strip-header">
          <span>👥 Live Group ({members.length}):</span>
        </div>
        <div className="roam-group-strip-members">
          {members.map((m) => (
            <div key={m.id} className="roam-member-badge">
              <span className="roam-mini-avatar" style={{ background: m.avatarBg }}>
                {m.initials}
              </span>
              <span>
                <strong>{m.name.split(" ")[0]}:</strong> {m.diet} (&lt;${m.budget})
              </span>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setIsConfigModalOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 10px",
              borderRadius: "8px",
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(37,99,235,0.3)",
              marginLeft: "4px",
            }}
          >
            <span>✏️ Configure Group</span>
          </button>
        </div>
      </div>

      {/* Embedded Input Bar */}
      <div className="roam-hero-input-wrap">
        {input}
      </div>

      {/* Curated Prompt Action Cards Grid */}
      <div className="roam-prompt-grid">
        {promptCards.map((card) => (
          <button
            key={card.title}
            type="button"
            className="roam-prompt-card"
            onClick={() => handleSendPrompt(card.prompt)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%", marginBottom: "8px" }}>
              <span style={{ fontSize: "20px" }}>{card.icon}</span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "2px 7px",
                  borderRadius: "999px",
                  color: card.badgeColor,
                  background: card.badgeBg,
                  border: `1px solid ${card.badgeColor}22`,
                }}
              >
                {card.badge}
              </span>
            </div>
            <div style={{ fontWeight: 700, fontSize: "13.5px", color: "#0f172a", marginBottom: "4px" }}>
              {card.title}
            </div>
            <div style={{ fontSize: "11.5px", color: "#64748b", lineHeight: 1.45 }}>
              {card.desc}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
