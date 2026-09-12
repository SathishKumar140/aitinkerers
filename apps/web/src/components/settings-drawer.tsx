"use client";

import React, { useState } from "react";
import type { WorkplaceState } from "@/lib/use-workplace";
import { WorkplaceFollowups } from "./workplace-followups";
import { useGroup } from "@/lib/group-context";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedId: string;
  workplace: WorkplaceState;
}

export function SettingsDrawer({
  isOpen,
  onClose,
  selectedId,
  workplace,
}: SettingsDrawerProps) {
  const [activeTab, setActiveTab] = useState<"workspace" | "integrations" | "preferences">("workspace");
  const { members, settings, setIsConfigModalOpen } = useGroup();

  if (!isOpen) return null;

  return (
    <div className="roam-drawer-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Settings and Workspace Memory">
      <div className="roam-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="roam-drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #2563eb 0%, #10b981 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "15px",
              }}
            >
              ⚙️
            </div>
            <div>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Settings &amp; Workspace
              </h2>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>
                Roam Multiplayer Memory &amp; Integrations
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Settings Drawer"
            className="roam-drawer-close"
          >
            ✕
          </button>
        </div>

        {/* Drawer Tab Switcher */}
        <div className="roam-drawer-tabs">
          <button
            type="button"
            onClick={() => setActiveTab("workspace")}
            className={`roam-drawer-tab ${activeTab === "workspace" ? "active" : ""}`}
          >
            💼 Ambiguous Tasks
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("integrations")}
            className={`roam-drawer-tab ${activeTab === "integrations" ? "active" : ""}`}
          >
            ⚡ Connected Tools
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preferences")}
            className={`roam-drawer-tab ${activeTab === "preferences" ? "active" : ""}`}
          >
            🎯 Arbitration Rules
          </button>
        </div>

        {/* Drawer Body */}
        <div className="roam-drawer-body">
          {activeTab === "workspace" && (
            <div>
              <div style={{ marginBottom: "16px", padding: "12px 14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#2563eb" }}>
                    Workplace Provider
                  </span>
                  <span style={{ fontSize: "11px", color: workplace.status?.status === "connected" ? "#059669" : "#64748b", fontWeight: 600 }}>
                    {workplace.status?.status === "connected" ? "● Connected" : "● Demo Mode"}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>
                  Tasks and follow-up items are managed through Ambiguous AI workspace memory with two-way sync and explicit user sign-off.
                </p>
              </div>
              <WorkplaceFollowups incidentId={selectedId} workplace={workplace} />
            </div>
          )}

          {activeTab === "integrations" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="roam-integration-row">
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{ fontSize: "20px" }}>🧭</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>Exa Places Grounding</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Live Singapore venue metadata &amp; dietary verification</div>
                  </div>
                </div>
                <span className="roam-tag roam-tag-emerald">Active</span>
              </div>

              <div className="roam-integration-row">
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{ fontSize: "20px" }}>📅</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>Google Calendar</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>One-click calendar sync with location &amp; attendee roster</div>
                  </div>
                </div>
                <span className="roam-tag roam-tag-blue">Ready</span>
              </div>

              <div className="roam-integration-row">
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{ fontSize: "20px" }}>🎙️</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>Twilio Voice &amp; WebRTC</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Real-time voice dialogue streaming on /voice</div>
                  </div>
                </div>
                <span className="roam-tag roam-tag-emerald">Enabled</span>
              </div>

              <div className="roam-integration-row">
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{ fontSize: "20px" }}>👁️</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>GPT-4o Vision Engine</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Clipboard &amp; screenshot flyer parsing for dishes and prices</div>
                  </div>
                </div>
                <span className="roam-tag roam-tag-purple">Active</span>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <h4 style={{ margin: 0, fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>
                    Active Group Constraints ({members.length} Members)
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setIsConfigModalOpen(true);
                    }}
                    style={{
                      background: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    ✏️ Configure
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11.5px", color: "#334155" }}>
                  {members.map((m) => (
                    <div key={m.id} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <span><strong>{m.name}:</strong> {m.diet}</span>
                      <span style={{ color: "#2563eb", fontWeight: 600 }}>&lt;${m.budget}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 4px", fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>
                  Arbitration Policy
                </h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>
                  <strong>{settings.strictDietary ? "Zero Dietary Compromise (Strict):" : "Flexible Matching:"}</strong> Any venue selected must provide guaranteed safe choices for pure vegetarian and allergen-sensitive group members.
                </p>
              </div>

              <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 4px", fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>
                  Geographic &amp; Transit Focal Point
                </h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>
                  Focus: <strong>{settings.neighborhood}</strong> within walking distance of {settings.transitStop}.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
