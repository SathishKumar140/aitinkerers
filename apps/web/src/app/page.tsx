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

export default function Home() {
  const [selectedId, setSelectedId] = useState<string>(incidents[0].id);
  const workplace = useWorkplace(selectedId);
  const selectIncident = (id: string) => setSelectedId(id);
  const [showSettings, setShowSettings] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  useConfigureSuggestions(
    {
      suggestions: [
        {
          title: "🎯 Find Consensus Dinner Spot",
          message:
            "Sathish is pure vegetarian with a $20 budget, and Ramesh wants craft beer and smoked BBQ under $35. Find our best consensus dinner spot near Tanjong Pagar or Chinatown. Draw a consensus_card with scores and maps link.",
        },
        {
          title: "🗺️ Plan 3-Stop Evening Itinerary",
          message:
            "Plan a 3-stop Friday evening itinerary around Tanjong Pagar (Dinner, Dessert, Drinks) with walking times and draw an itinerary_card.",
        },
        {
          title: "🍸 Late Night Mocktails & Drinks",
          message:
            "Recommend 2 cozy cocktail spots near Chinatown with non-alcoholic craft options and good vibes for conversation.",
        },
        {
          title: "📸 Scan & Arbitrate Attached Menu",
          message:
            "Inspect the attached menu image to verify if both Sathish (pure veg) and Ramesh (BBQ/beer) can eat comfortably, and check if prices stay within budget.",
        },
      ],
      available: "before-first-message",
    },
    [],
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #2563eb 0%, #10b981 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "1.15rem",
                boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
              }}
            >
              🧭
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
                    background: "rgba(16, 185, 129, 0.12)",
                    color: "#059669",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                  }}
                >
                  Group Concierge
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>
                Multiplayer Context Arbitration &amp; Multimodal Concierge
              </p>
            </div>

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
                marginLeft: "6px",
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
              <span>Singapore (Tanjong Pagar)</span>
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

          {/* Right Pane: AI Concierge & Generative UI Feed */}
          <main className="roam-chat-panel" aria-label="AI Concierge & Chat">
            {/* Floating Re-open Sidebar Button when collapsed */}
            {!isSidebarOpen && (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="roam-floating-expand-btn"
                title="Expand Group Context sidebar"
              >
                <span>🧭</span>
                <span>Open Group Context</span>
              </button>
            )}

            {/* Top Bar of Chat Panel */}
            <div
              style={{
                padding: "12px 24px",
                borderBottom: "1px solid #e2e8f0",
                background: "#ffffff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#10b981",
                    boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.2)",
                  }}
                />
                <div>
                  <span style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>
                    Roam Concierge
                  </span>
                  <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "8px" }}>
                    Multiplayer Context · Exa Places Grounding · Google Calendar
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
                  💡 Paste <strong>Cmd+V</strong> or drag menu flyers
                </span>

                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#475569",
                    cursor: "pointer",
                  }}
                >
                  ⚙️ Settings
                </button>
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

            {/* Embedded CopilotChat UI */}
            <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <CopilotChat
                className="ck-chat"
                labels={{
                  welcomeMessageText: "Where should the group go tonight?",
                  chatInputPlaceholder: "Ask Roam for consensus picks, itineraries, or drag & drop a menu…",
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
      </div>
    </>
  );
}

