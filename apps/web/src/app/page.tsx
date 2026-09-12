"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CopilotChat,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { GenerativeUI } from "@/components/generative-ui";
import { AppControl } from "@/components/app-control";
import { incidents } from "@/lib/incidents";
import { useWorkplace } from "@/lib/use-workplace";
import { SettingsDrawer } from "@/components/settings-drawer";
import { GroupCanvas, type VisionResult } from "@/components/group-canvas";
import { RoamWelcomeScreen } from "@/components/roam-welcome-screen";
import { GroupProvider, useGroup } from "@/lib/group-context";
import { GroupConfigModal } from "@/components/group-config-modal";

export default function Home() {
  return (
    <GroupProvider>
      <HomeContent />
    </GroupProvider>
  );
}

function HomeContent() {
  const [selectedId, setSelectedId] = useState<string>(incidents[0].id);
  const workplace = useWorkplace(selectedId);
  const selectIncident = (id: string) => setSelectedId(id);
  const [showSettings, setShowSettings] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const {
    members,
    settings,
    travelSettings,
    billSplitSettings,
    activeRecipe,
    setActiveRecipe,
    setIsConfigModalOpen,
    promptSummary,
  } = useGroup();

  // Vision screenshot state
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [visionResult, setVisionResult] = useState<VisionResult | null>(null);
  const [visionError, setVisionError] = useState<string | null>(null);

  // Global paste listener for screenshots
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              setAttachedImage(reader.result as string);
              setVisionResult(null);
              setVisionError(null);
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleAnalyzeVision = async () => {
    if (!attachedImage) return;
    setAnalyzingImage(true);
    setVisionError(null);
    try {
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: attachedImage }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error ?? "Failed to analyze image");
      }
      setVisionResult(data.result);
    } catch (err) {
      setVisionError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzingImage(false);
    }
  };

  const recipeSuggestions =
    activeRecipe === "travel"
      ? [
          {
            title: "✈️ Plan 4-Day Tokyo Trip with Flights & Hotels",
            message: `Plan a 4-day group trip to Tokyo for our group: ${promptSummary}. Recommend direct flights from Singapore with airlines & prices, top 4-star hotels near transit, and draw a travel_plan_card with a 1-click Google Calendar schedule.`,
          },
          {
            title: "🏨 Curate Quiet 4-Star Stays with Rooftop Lounges",
            message: `Find 2 top-rated hotels in Tokyo for our group with quiet rooms, easy transit access, and rooftop lounges. Draw a flight_hotel_card.`,
          },
          {
            title: "📅 Schedule Trip Itinerary to Google Calendar",
            message: `Create a comprehensive day-by-day itinerary for our Tokyo trip and schedule all flight segments and key activities directly to Google Calendar.`,
          },
          {
            title: "🔔 Generate Flight Status & Check-In Alert",
            message: `Generate a travel notification alert for Singapore Airlines flight SQ638 check-in and luggage advisory. Draw a travel_alert_card.`,
          },
        ]
      : activeRecipe === "bill_split"
      ? [
          {
            title: "💸 Split Team Dinner Bill ($145 SGD by Ramesh)",
            message: `Split our team dinner bill of $145.00 SGD paid by Ramesh among: Sathish ($45 for vegetarian dishes), Alice ($40 for vegan bowl & drink), and Ramesh ($60 for smoked ribs & craft beer). Calculate the exact settlement matrix and draw a bill_split_card.`,
          },
          {
            title: "⚖️ Calculate 'Who Owes Whom' Settlements",
            message: `Given our group expenses for: ${promptSummary}, compute the debt settlement resolution showing the minimum number of PayNow transfers to settle up. Draw a bill_split_card.`,
          },
          {
            title: "🧾 Split Trip Lodging & Car Rental ($850)",
            message: `We incurred $600 for villa rental and $250 for car rental on our trip. Split equally among 3 travelers and show who needs to reimburse the payer.`,
          },
          {
            title: "✓ Mark All Group Debts as Settled",
            message: `Confirm that all outstanding balances for our dinner and drinks have been paid via PayNow and mark the bill as settled.`,
          },
        ]
      : [
          {
            title: "🎯 Find Consensus Dinner Spot",
            message: `Find our best consensus dinner spot in ${settings.neighborhood} for our group: ${promptSummary}. Ensure zero compromise on dietary restrictions. Draw a consensus_card with match scores, Google Maps link, and Google Calendar button.`,
          },
          {
            title: "🗺️ Plan 3-Stop Evening Itinerary",
            message: `Plan a 3-stop Friday evening itinerary around ${settings.neighborhood} (Dinner, Dessert, Drinks) with walking transit times for: ${promptSummary}. Draw an itinerary_card.`,
          },
          {
            title: "🍸 Late Night Mocktails & Drinks",
            message: `Recommend 2 cozy cocktail & mocktail spots near ${settings.neighborhood} with great atmosphere and craft non-alcoholic choices.`,
          },
          {
            title: "📸 Scan & Arbitrate Attached Menu",
            message: `Inspect the attached menu image to verify if every group member (${promptSummary}) can eat safely within budget.`,
          },
        ];

  useConfigureSuggestions(
    {
      suggestions: recipeSuggestions,
      available: "before-first-message",
    },
    [activeRecipe, promptSummary, settings.neighborhood, travelSettings.destination],
  );

  return (
    <>
      <GenerativeUI />
      <AppControl
        selectedId={selectedId}
        selectIncident={selectIncident}
        workplace={workplace}
      />

      <div className="roam-shell">
        {/* Top Product Navigation Bar */}
        <header className="roam-navbar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {/* Sleek SVG Brand Mark */}
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #2563eb 0%, #10b981 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
                flexShrink: 0,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.03em", color: "#0f172a" }}>
                  Roam
                </span>
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    background:
                      activeRecipe === "travel"
                        ? "rgba(37, 99, 235, 0.12)"
                        : activeRecipe === "bill_split"
                        ? "rgba(16, 185, 129, 0.12)"
                        : "rgba(217, 119, 6, 0.12)",
                    color:
                      activeRecipe === "travel"
                        ? "#2563eb"
                        : activeRecipe === "bill_split"
                        ? "#059669"
                        : "#d97706",
                    border: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  Multi-Recipe Assistant
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>
                Multiplayer Dining, Travel Planning &amp; Group Bill Splitting
              </p>
            </div>

            {/* Recipe / Skill Switcher Tabs */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "#f1f5f9",
                padding: "3px",
                borderRadius: "10px",
                marginLeft: "8px",
                gap: "2px",
                border: "1px solid #e2e8f0",
              }}
              role="tablist"
              aria-label="Select Recipe"
            >
              <button
                type="button"
                onClick={() => setActiveRecipe("outing")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "5px 11px",
                  borderRadius: "7px",
                  border: "none",
                  background: activeRecipe === "outing" ? "#ffffff" : "transparent",
                  color: activeRecipe === "outing" ? "#0f172a" : "#64748b",
                  fontWeight: activeRecipe === "outing" ? 700 : 500,
                  fontSize: "12px",
                  cursor: "pointer",
                  boxShadow: activeRecipe === "outing" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                <span>🍽️</span>
                <span>Outing</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveRecipe("travel")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "5px 11px",
                  borderRadius: "7px",
                  border: "none",
                  background: activeRecipe === "travel" ? "#ffffff" : "transparent",
                  color: activeRecipe === "travel" ? "#2563eb" : "#64748b",
                  fontWeight: activeRecipe === "travel" ? 700 : 500,
                  fontSize: "12px",
                  cursor: "pointer",
                  boxShadow: activeRecipe === "travel" ? "0 1px 3px rgba(37,99,235,0.15)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                <span>✈️</span>
                <span>Travel</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveRecipe("bill_split")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "5px 11px",
                  borderRadius: "7px",
                  border: "none",
                  background: activeRecipe === "bill_split" ? "#ffffff" : "transparent",
                  color: activeRecipe === "bill_split" ? "#059669" : "#64748b",
                  fontWeight: activeRecipe === "bill_split" ? 700 : 500,
                  fontSize: "12px",
                  cursor: "pointer",
                  boxShadow: activeRecipe === "bill_split" ? "0 1px 3px rgba(16,185,129,0.15)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                <span>💸</span>
                <span>Bill Split</span>
              </button>
            </div>

            {/* Configure Group & Constraints Button in Top Nav */}
            <button
              type="button"
              onClick={() => setIsConfigModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#eff6ff",
                color: "#2563eb",
                border: "1.5px solid #bfdbfe",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                marginLeft: "4px",
                boxShadow: "0 1px 2px rgba(37, 99, 235, 0.1)",
                transition: "all 0.15s ease",
              }}
              title="Configure Group Members, Dietary Restrictions & Budget Caps"
            >
              <span>👥</span>
              <span>Group ({members.length})</span>
            </button>

            {/* Toggle Sidebar Button in Navbar */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: isSidebarOpen ? "#f8fafc" : "#eff6ff",
                color: isSidebarOpen ? "#334155" : "#2563eb",
                border: `1px solid ${isSidebarOpen ? "#cbd5e1" : "#93c5fd"}`,
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                marginLeft: "2px",
                transition: "all 0.15s ease",
              }}
              title={isSidebarOpen ? "Collapse Context Sidebar" : "Expand Context Sidebar"}
            >
              <span style={{ fontSize: "12px" }}>{isSidebarOpen ? "◧" : "◨"}</span>
              <span>{isSidebarOpen ? "Hide Context" : "Show Context"}</span>
            </button>
          </div>


          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Location Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                background: "#f1f5f9",
                border: "1px solid #e2e8f0",
                fontSize: "12px",
                fontWeight: 600,
                color: "#334155",
              }}
            >
              <span>🇸🇬</span>
              <span>Singapore · {settings.neighborhood.split("&")[0].trim()}</span>
            </div>

            {/* Toggle Settings Sidebar Button */}
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: showSettings ? "#eff6ff" : "#ffffff",
                color: showSettings ? "#2563eb" : "#334155",
                border: "1px solid #cbd5e1",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                transition: "all 0.15s ease",
              }}
              title="Open Settings & Workspace Memory Sidebar"
            >
              <span>⚙️</span>
              <span>Settings</span>
            </button>

            {/* Voice Mode Button */}
            <Link
              href="/voice"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#0f172a",
                color: "#ffffff",
                padding: "7px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 2px 6px rgba(15, 23, 42, 0.2)",
                transition: "all 0.15s ease",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.3)",
                }}
              />
              🎙️ Voice Mode (WebRTC)
            </Link>
          </div>
        </header>

        {/* Dual-Pane Product Workspace */}
        <div className={`roam-layout ${!isSidebarOpen ? "sidebar-collapsed" : ""}`}>
          {/* Left Pane: Interactive Group Context Canvas */}
          <GroupCanvas
            attachedImage={attachedImage}
            onAttachImage={(img) => {
              setAttachedImage(img);
              setVisionResult(null);
              setVisionError(null);
            }}
            analyzingImage={analyzingImage}
            visionResult={visionResult}
            visionError={visionError}
            onAnalyzeVision={handleAnalyzeVision}
            workplace={workplace}
            showWorkplace={showSettings}
            onToggleWorkplace={() => setShowSettings((prev) => !prev)}
          />

          {/* Right Pane: AI Assistant & Generative UI Feed */}
          <main className="roam-chat-panel" aria-label="AI Assistant & Chat">
            {/* Top Bar of Chat Panel */}
            <div
              style={{
                padding: "12px 24px",
                borderBottom: "1px solid #e2e8f0",
                background: "#ffffff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="roam-live-pulse" />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: 700, fontSize: "13.5px", color: "#0f172a" }}>
                      Roam AI
                    </span>
                    <span
                      style={{
                        fontSize: "10.5px",
                        fontWeight: 700,
                        color:
                          activeRecipe === "travel"
                            ? "#2563eb"
                            : activeRecipe === "bill_split"
                            ? "#059669"
                            : "#d97706",
                        background:
                          activeRecipe === "travel"
                            ? "#eff6ff"
                            : activeRecipe === "bill_split"
                            ? "#ecfdf5"
                            : "#fffbeb",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        border: `1px solid ${
                          activeRecipe === "travel"
                            ? "#bfdbfe"
                            : activeRecipe === "bill_split"
                            ? "#a7f3d0"
                            : "#fde68a"
                        }`,
                      }}
                    >
                      {activeRecipe === "travel"
                        ? "✈️ Skill: Travel Planner"
                        : activeRecipe === "bill_split"
                        ? "💸 Skill: Bill Splitter"
                        : "🍽️ Skill: Outing & Dining"}
                    </span>
                  </div>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    Multiplayer Outings, Trip Planning &amp; Splitwise Group Settlements
                  </span>

                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {/* Image Attached Pill */}
                {attachedImage && (
                  <div className="roam-chat-attached-pill">
                    <img
                      src={attachedImage}
                      alt="Menu thumbnail"
                      style={{ width: "20px", height: "20px", borderRadius: "4px", objectFit: "cover" }}
                    />
                    <span style={{ fontSize: "11px", fontWeight: 600 }}>Flyer Attached</span>
                    <button
                      type="button"
                      onClick={handleAnalyzeVision}
                      disabled={analyzingImage}
                      className="roam-pill-btn"
                    >
                      {analyzingImage ? "Analyzing…" : "⚡ Analyze"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAttachedImage(null);
                        setVisionResult(null);
                      }}
                      className="roam-pill-close"
                      title="Remove attachment"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                  💡 <strong>Cmd+V</strong> or drag menu flyers
                </span>
              </div>
            </div>

            {/* Floating Ambiguous Action Approval Banner if action is proposed */}
            {workplace.proposal && (
              <div
                style={{
                  margin: "16px 24px 0",
                  background: "#ffffff",
                  border: "2px solid #2563eb",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  boxShadow: "0 10px 25px rgba(37, 99, 235, 0.15)",
                  zIndex: 20,
                  animation: "fadeIn 0.2s ease",
                }}
                aria-label="Approve Ambiguous task"
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      background: "#eff6ff",
                      color: "#2563eb",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    ⚡ Action Approval Required
                  </span>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    Workspace: <code>{workplace.proposal.workspaceId}</code> · Expires{" "}
                    {new Date(workplace.proposal.expiresAt).toLocaleTimeString()}
                  </span>
                </div>

                <h3 style={{ margin: "4px 0 6px", fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
                  {workplace.proposal.title}
                </h3>
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: "0.82rem",
                    color: "#334155",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.5,
                  }}
                >
                  {workplace.proposal.description}
                </p>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    type="button"
                    disabled={workplace.busy}
                    onClick={workplace.approve}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 18px",
                      borderRadius: "8px",
                      fontWeight: 700,
                      fontSize: "12.5px",
                      cursor: workplace.busy ? "not-allowed" : "pointer",
                      boxShadow: "0 2px 6px rgba(37, 99, 235, 0.3)",
                    }}
                  >
                    {workplace.busy ? "Saving to Ambiguous…" : "✓ Approve & Save to Ambiguous"}
                  </button>
                  <button
                    type="button"
                    disabled={workplace.busy}
                    onClick={workplace.deny}
                    style={{
                      background: "#f1f5f9",
                      color: "#475569",
                      border: "1px solid #cbd5e1",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      fontWeight: 600,
                      fontSize: "12.5px",
                      cursor: workplace.busy ? "not-allowed" : "pointer",
                    }}
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}

            {/* Success Notice */}
            {workplace.notice && (
              <div
                style={{
                  margin: "12px 24px 0",
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  color: "#166534",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                ✓ {workplace.notice}
              </div>
            )}

            {/* Embedded CopilotChat UI with Custom Roam Welcome Screen */}
            <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <CopilotChat
                className="ck-chat"
                welcomeScreen={RoamWelcomeScreen}
                labels={{
                  chatInputPlaceholder:
                    activeRecipe === "travel"
                      ? "Ask Roam to plan a trip, compare flights/hotels, or schedule to Google Calendar…"
                      : activeRecipe === "bill_split"
                      ? "Ask Roam to split a group bill, itemize shares, or calculate settlements…"
                      : "Ask Roam for consensus picks, itineraries, or drag & drop a menu flyer…",
                }}
              />

            </div>
          </main>
        </div>

        {/* Slide-over Settings & Workspace Memory Drawer */}
        <SettingsDrawer
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          selectedId={selectedId}
          workplace={workplace}
        />

        {/* Slide-over Group Members & Outing Constraints Modal */}
        <GroupConfigModal />
      </div>
    </>
  );
}

