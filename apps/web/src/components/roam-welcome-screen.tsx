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
  const { members, settings, promptSummary, setIsConfigModalOpen } = useGroup();

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
      badge: "Zero Compromise",
      badgeColor: "#059669",
      badgeBg: "#ecfdf5",
      prompt: `We are planning a group outing in ${settings.neighborhood} for our crew: ${promptSummary}. Strict dietary inclusivity is ${settings.strictDietary ? "ENABLED (100% safe options required)" : "flexible"}. Find our top consensus dinner spot, calculate match scores, and draw a consensus_card with maps and calendar links.`,
    },
    {
      icon: "🗺️",
      title: "Plan 3-Stop Evening Route",
      desc: `Dinner, artisan dessert & drinks near ${settings.neighborhood} with walkable times.`,
      badge: "Walkable",
      badgeColor: "#2563eb",
      badgeBg: "#eff6ff",
      prompt: `Plan a seamless 3-stop Friday evening itinerary around ${settings.neighborhood} (Dinner, Dessert, Drinks) with transit times suitable for: ${promptSummary}. Draw an itinerary_card.`,
    },
    {
      icon: "📸",
      title: "Scan Flyer / Menu",
      desc: "Drop or paste a menu flyer to audit dietary safety and verify budget limits.",
      badge: "Vision AI",
      badgeColor: "#7c3aed",
      badgeBg: "#faf5ff",
      prompt: `Analyze the attached menu or flyer. Check if every person in our group (${promptSummary}) can eat comfortably without exceeding their budget.`,
    },
    {
      icon: "🍸",
      title: "Late Night Drinks & Mocktails",
      desc: `Cozy craft cocktail lounges & mocktail bars with great conversation vibes.`,
      badge: "Vibe Match",
      badgeColor: "#d97706",
      badgeBg: "#fffbeb",
      prompt: `Recommend 2 cozy cocktail and mocktail spots near ${settings.neighborhood} with great non-alcoholic craft options and atmosphere for conversation.`,
    },
  ];

  return (
    <div className="roam-welcome-container">
      {/* Hero Emblem & Tag */}
      <div className="roam-hero-badge-wrap">
        <div className="roam-hero-icon-pulse">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2.2" strokeOpacity="0.9" />
            <path d="M12 6V12L15.5 14" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="2.5" fill="white" />
          </svg>
        </div>
        <div className="roam-hero-tag">
          <span className="roam-hero-tag-dot" />
          <span>Social Outings AI · Singapore</span>
        </div>
      </div>

      {/* Hero Headings */}
      <h1 className="roam-hero-title">
        Where should we go tonight?
      </h1>
      <p className="roam-hero-subtitle">
        Instant consensus for different diets, budgets, and vibes. Zero compromises.
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
