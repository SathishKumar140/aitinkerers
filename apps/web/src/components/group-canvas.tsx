"use client";

import React, { useState, useRef } from "react";
import type { WorkplaceState } from "@/lib/use-workplace";
import { useGroup } from "@/lib/group-context";

export interface VisionResult {
  title: string;
  category: string;
  location: string;
  priceTier: string;
  dietaryTags: string[];
  highlights: string[];
  groupFit: string;
  summary: string;
}

interface GroupCanvasProps {
  attachedImage: string | null;
  onAttachImage: (dataUrl: string | null) => void;
  analyzingImage: boolean;
  visionResult: VisionResult | null;
  visionError: string | null;
  onAnalyzeVision: () => void;
  workplace: WorkplaceState;
  onToggleWorkplace: () => void;
  showWorkplace: boolean;
  onSendPreset?: (text: string) => void;
}

export function GroupCanvas({
  attachedImage,
  onAttachImage,
  analyzingImage,
  visionResult,
  visionError,
  onAnalyzeVision,
  workplace,
  onToggleWorkplace,
  showWorkplace,
}: GroupCanvasProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState<"context" | "members">("context");
  const { members, settings, setIsConfigModalOpen } = useGroup();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        onAttachImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const budgets = members.map((m) => m.budget);
  const minBudget = budgets.length > 0 ? Math.min(...budgets) : 20;
  const maxBudget = budgets.length > 0 ? Math.max(...budgets) : 35;

  return (
    <aside className="roam-canvas-panel" aria-label="Group Context Canvas">
      {/* Active Outing Card */}
      <div className="roam-card" style={{ padding: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span className="roam-tag roam-tag-blue" style={{ fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                🇸🇬 Active Outing
              </span>
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>
                {settings.time}
              </span>
            </div>
            <h2 style={{ fontSize: "1.12rem", fontWeight: 800, margin: 0, color: "#0f172a", letterSpacing: "-0.02em" }}>
              {settings.title}
            </h2>
          </div>
          <span
            style={{
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.25)",
              marginTop: "4px",
            }}
            title="Live Session Synced"
          />
        </div>

        <p style={{ margin: "0 0 10px", fontSize: "0.82rem", color: "#475569", lineHeight: 1.5 }}>
          📍 Target: <strong>{settings.neighborhood}</strong> · {settings.strictDietary ? "Zero compromise dietary filtering." : "Flexible matching."}
        </p>

        {/* Configure Group & Constraints Button */}
        <button
          type="button"
          onClick={() => setIsConfigModalOpen(true)}
          style={{
            width: "100%",
            marginBottom: "12px",
            padding: "7px 12px",
            background: "#eff6ff",
            border: "1.5px solid #bfdbfe",
            borderRadius: "8px",
            color: "#2563eb",
            fontWeight: 700,
            fontSize: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all 0.15s ease",
          }}
        >
          <span>✏️</span>
          <span>Configure Members &amp; Constraints</span>
        </button>

        {/* Quick Tabs */}
        <div style={{ display: "flex", gap: "6px", background: "#f1f5f9", padding: "3px", borderRadius: "8px" }}>
          <button
            type="button"
            onClick={() => setActiveTab("context")}
            style={{
              flex: 1,
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: activeTab === "context" ? 700 : 500,
              background: activeTab === "context" ? "#ffffff" : "transparent",
              color: activeTab === "context" ? "#0f172a" : "#64748b",
              border: "none",
              borderRadius: "6px",
              boxShadow: activeTab === "context" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            📊 Consensus Matrix
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("members")}
            style={{
              flex: 1,
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: activeTab === "members" ? 700 : 500,
              background: activeTab === "members" ? "#ffffff" : "transparent",
              color: activeTab === "members" ? "#0f172a" : "#64748b",
              border: "none",
              borderRadius: "6px",
              boxShadow: activeTab === "members" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            👥 Group Members ({members.length})
          </button>
        </div>
      </div>

      {activeTab === "context" ? (
        /* Consensus Compatibility Matrix */
        <div className="roam-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 700, color: "#1e293b" }}>
              🎯 Live Group Constraints
            </h3>
            <span className="roam-tag roam-tag-emerald">
              96% Arbitrated
            </span>
          </div>

          {/* Metric 1 */}
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", marginBottom: "4px" }}>
              <span style={{ fontWeight: 600, color: "#334155" }}>Dietary Inclusivity</span>
              <span style={{ fontWeight: 700, color: "#059669" }}>100% (Zero Compromise)</span>
            </div>
            <div style={{ width: "100%", height: "6px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ width: "100%", height: "100%", background: "#10b981", borderRadius: "999px" }} />
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "3px" }}>
              {members.map((m) => `${m.name.split(" ")[0]} (${m.diet})`).join(" + ")} dual-friendly menus.
            </div>
          </div>

          {/* Metric 2 */}
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", marginBottom: "4px" }}>
              <span style={{ fontWeight: 600, color: "#334155" }}>Budget Overlap</span>
              <span style={{ fontWeight: 700, color: "#2563eb" }}>94% Match</span>
            </div>
            <div style={{ width: "100%", height: "6px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ width: "94%", height: "100%", background: "#2563eb", borderRadius: "999px" }} />
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "3px" }}>
              Target range: ${minBudget} – ${maxBudget} per person across group preferences.
            </div>
          </div>

          {/* Metric 3 */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", marginBottom: "4px" }}>
              <span style={{ fontWeight: 600, color: "#334155" }}>Transit &amp; Atmosphere</span>
              <span style={{ fontWeight: 700, color: "#7c3aed" }}>92% Match</span>
            </div>
            <div style={{ width: "100%", height: "6px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ width: "92%", height: "100%", background: "#8b5cf6", borderRadius: "999px" }} />
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "3px" }}>
              Within 6 mins walk from {settings.transitStop}.
            </div>
          </div>
        </div>
      ) : (
        /* Member Roster List */
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {members.map((m) => (
            <div key={m.id} className="roam-member-chip">
              <div className="roam-avatar" style={{ background: m.avatarBg }}>
                {m.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>
                    {m.name}
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", background: "#eff6ff", padding: "1px 6px", borderRadius: "4px" }}>
                    &lt;${m.budget}
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  <span className="roam-tag roam-tag-emerald" style={{ fontSize: "10px" }}>
                    {m.diet}
                  </span>
                  {m.allergies && (
                    <span className="roam-tag roam-tag-amber" style={{ fontSize: "10px" }}>
                      ⚠️ {m.allergies}
                    </span>
                  )}
                  <span className="roam-tag roam-tag-purple" style={{ fontSize: "10px" }}>
                    {m.vibe}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setIsConfigModalOpen(true)}
            style={{
              padding: "9px 12px",
              background: "#ffffff",
              border: "1.5px dashed #cbd5e1",
              borderRadius: "10px",
              color: "#2563eb",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "all 0.15s ease",
            }}
          >
            <span>+ Add / Configure Members</span>
          </button>
        </div>
      )}

      {/* Multimodal Menu / Flyer Dropzone */}
      <div className="roam-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "14px" }}>📸</span>
            <h3 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 700, color: "#1e293b" }}>
              Multimodal Menu / Flyer
            </h3>
          </div>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>
            GPT-4o Vision
          </span>
        </div>

        {attachedImage ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ position: "relative", borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachedImage}
                alt="Uploaded flyer or menu"
                style={{ width: "100%", maxHeight: "160px", objectFit: "cover", display: "block" }}
              />
              <button
                type="button"
                onClick={() => onAttachImage(null)}
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  background: "rgba(15, 23, 42, 0.75)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
                title="Remove image"
              >
                ✕
              </button>
            </div>

            <button
              type="button"
              disabled={analyzingImage}
              onClick={onAnalyzeVision}
              style={{
                background: analyzingImage
                  ? "#94a3b8"
                  : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                color: "#ffffff",
                border: "none",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: analyzingImage ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 2px 6px rgba(37, 99, 235, 0.25)",
              }}
            >
              {analyzingImage ? "Analyzing items with GPT-4o…" : "✨ Extract Menu Items & Prices"}
            </button>

            {visionError && (
              <p style={{ color: "#dc2626", fontSize: "11px", margin: 0 }}>
                {visionError}
              </p>
            )}

            {visionResult && (
              <div
                style={{
                  padding: "10px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "8px",
                  fontSize: "11.5px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#166534" }}>
                  <span>{visionResult.title}</span>
                  <span>{visionResult.priceTier}</span>
                </div>
                <div style={{ color: "#475569", margin: "2px 0 6px" }}>
                  📍 {visionResult.location}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "4px" }}>
                  {visionResult.dietaryTags?.map((tag, i) => (
                    <span key={i} className="roam-tag roam-tag-emerald" style={{ fontSize: "9.5px", padding: "1px 5px" }}>
                      🌱 {tag}
                    </span>
                  ))}
                </div>
                <p style={{ margin: 0, color: "#1e293b", fontSize: "11px" }}>
                  <strong>Group Fit:</strong> {visionResult.groupFit}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`roam-dropzone ${isDragOver ? "active" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "4px" }}>📥</div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#1e293b" }}>
              Drop Menu / Flyer image here
            </div>
            <div style={{ fontSize: "10.5px", color: "#64748b", marginTop: "2px" }}>
              or paste directly with <code>Cmd + V</code>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => onAttachImage(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Connected Workspace & Integrations */}
      <div className="roam-card" style={{ padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>
            ⚡ Integrations &amp; Memory
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "11px",
              color: "#059669",
              fontWeight: 600,
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
            Connected
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 10px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px" }}>
              <span>💼</span>
              <span style={{ fontWeight: 600, color: "#1e293b" }}>Ambiguous Workspace</span>
            </div>
            <button
              type="button"
              onClick={onToggleWorkplace}
              style={{
                background: showWorkplace ? "#2563eb" : "#ffffff",
                color: showWorkplace ? "#ffffff" : "#2563eb",
                border: "1px solid #bfdbfe",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>⚙️</span>
              <span>{showWorkplace ? "Close Settings" : "Open Settings"}</span>
            </button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 10px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px" }}>
              <span>📅</span>
              <span style={{ fontWeight: 600, color: "#1e293b" }}>Google Calendar</span>
            </div>
            <span style={{ fontSize: "11px", color: "#059669", fontWeight: 600 }}>
              1-Click Sync Ready
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
