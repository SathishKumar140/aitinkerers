"use client";

import React, { useState } from "react";
import { useGroup, type GroupMember } from "@/lib/group-context";

export function GroupConfigModal() {
  const {
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
  } = useGroup();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [diet, setDiet] = useState("Pure Vegetarian");
  const [budget, setBudget] = useState(25);
  const [allergies, setAllergies] = useState("");
  const [vibe, setVibe] = useState("Outdoor Seating");

  if (!isConfigModalOpen) return null;

  const dietOptions = [
    "Pure Vegetarian",
    "Smoked BBQ & Meat Lover",
    "Vegan & Plant-Based",
    "Halal Certified",
    "Gluten-Free (Celiac)",
    "Pescatarian",
    "No Restrictions",
  ];

  const vibeOptions = [
    "Outdoor Seating",
    "Craft Beer & Cocktails",
    "Quiet Conversation",
    "Rooftop & City Views",
    "Lively Music & Vibe",
    "Casual Street Eats",
  ];

  const neighborhoodOptions = [
    "Tanjong Pagar & Chinatown",
    "Telok Ayer & Amoy Street",
    "Marina Bay & Downtown",
    "Bugis & Kampong Glam",
    "Robertson Quay & Clarke Quay",
    "Holland Village & Dempsey Hill",
  ];

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const colors = [
      "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
      "linear-gradient(135deg, #059669 0%, #047857 100%)",
      "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
      "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    ];
    const randomColor = colors[members.length % colors.length];

    addMember({
      name: name.trim(),
      diet,
      budget: Number(budget),
      allergies: allergies.trim() || undefined,
      vibe,
      avatarBg: randomColor,
    });

    setName("");
    setAllergies("");
    setBudget(25);
    setIsAdding(false);
  };

  const handleQuickAddPreset = (presetName: string, presetDiet: string, presetBudget: number, presetVibe: string) => {
    addMember({
      name: presetName,
      diet: presetDiet,
      budget: presetBudget,
      vibe: presetVibe,
      avatarBg: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    });
  };

  return (
    <div
      className="roam-drawer-overlay"
      onClick={() => {
        setIsConfigModalOpen(false);
        setEditingMember(null);
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Configure Group Members & Outing Constraints"
    >
      <div className="roam-drawer" style={{ width: "520px" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="roam-drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #2563eb 0%, #10b981 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              👥
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>
                Group Members &amp; Constraints
              </h2>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>
                Configure individual diets, budgets, and outing rules
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsConfigModalOpen(false);
              setEditingMember(null);
            }}
            className="roam-drawer-close"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="roam-drawer-body">
          {/* Section 1: Target Location & Rules */}
          <div style={{ marginBottom: "22px", padding: "14px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>📍 Outing Parameters</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "4px" }}>
                  Neighborhood
                </label>
                <select
                  value={settings.neighborhood}
                  onChange={(e) => updateSettings({ neighborhood: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontSize: "12px",
                    color: "#1e293b",
                    fontWeight: 500,
                  }}
                >
                  {neighborhoodOptions.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "4px" }}>
                  Target Time
                </label>
                <input
                  type="text"
                  value={settings.time}
                  onChange={(e) => updateSettings({ time: e.target.value })}
                  placeholder="e.g. Tonight · 7:30 PM"
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontSize: "12px",
                    color: "#1e293b",
                  }}
                />
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", color: "#334155" }}>
              <input
                type="checkbox"
                checked={settings.strictDietary}
                onChange={(e) => updateSettings({ strictDietary: e.target.checked })}
                style={{ width: "16px", height: "16px", accentColor: "#10b981", cursor: "pointer" }}
              />
              <span style={{ fontWeight: 600 }}>Zero Dietary Compromise:</span>
              <span style={{ color: "#64748b", fontSize: "11.5px" }}>Must 100% accommodate veg/allergy needs</span>
            </label>
          </div>

          {/* Section 2: Active Members List */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
              Active Members ({members.length})
            </div>
            {!isAdding && (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  padding: "5px 12px",
                  borderRadius: "8px",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
                }}
              >
                <span>+ Add Member</span>
              </button>
            )}
          </div>

          {/* Add Member Form */}
          {isAdding && (
            <form onSubmit={handleSaveNew} style={{ padding: "16px", background: "#eff6ff", borderRadius: "12px", border: "1.5px solid #93c5fd", marginBottom: "16px" }}>
              <div style={{ fontWeight: 700, fontSize: "13px", color: "#1d4ed8", marginBottom: "12px" }}>
                Add New Group Member
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Farhan, Priya, David"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      fontSize: "12.5px",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Budget Limit ($)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      fontSize: "12.5px",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Dietary Preference
                  </label>
                  <select
                    value={diet}
                    onChange={(e) => setDiet(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      fontSize: "12px",
                    }}
                  >
                    {dietOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Vibe / Atmosphere
                  </label>
                  <select
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      fontSize: "12px",
                    }}
                  >
                    {vibeOptions.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Allergies (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nut Allergy, Shellfish, Lactose"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontSize: "12px",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    color: "#475569",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: "#2563eb",
                    border: "none",
                    color: "#ffffff",
                    padding: "6px 16px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Save Member
                </button>
              </div>
            </form>
          )}

          {/* Members List Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {members.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "9px",
                      background: m.avatarBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: "13px",
                      flexShrink: 0,
                    }}
                  >
                    {m.initials}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: 700, fontSize: "13.5px", color: "#0f172a" }}>
                        {m.name}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#2563eb",
                          background: "#eff6ff",
                          padding: "1px 7px",
                          borderRadius: "999px",
                          border: "1px solid #bfdbfe",
                        }}
                      >
                        &lt;${m.budget}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                      <span style={{ fontSize: "11px", color: "#059669", background: "#ecfdf5", padding: "1px 6px", borderRadius: "4px" }}>
                        {m.diet}
                      </span>
                      {m.allergies && (
                        <span style={{ fontSize: "11px", color: "#dc2626", background: "#fef2f2", padding: "1px 6px", borderRadius: "4px" }}>
                          ⚠️ {m.allergies}
                        </span>
                      )}
                      <span style={{ fontSize: "11px", color: "#6b7280", background: "#f3f4f6", padding: "1px 6px", borderRadius: "4px" }}>
                        {m.vibe}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(m.id)}
                      title="Remove Member"
                      style={{
                        background: "#fff1f2",
                        border: "1px solid #fecdd3",
                        color: "#e11d48",
                        borderRadius: "6px",
                        width: "28px",
                        height: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Preset Buttons */}
          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
              Quick Presets
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              <button
                type="button"
                onClick={() => handleQuickAddPreset("Zack", "Halal Certified", 30, "Lively Music & Vibe")}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  color: "#334155",
                  cursor: "pointer",
                }}
              >
                + Add Halal Foodie
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddPreset("Chloe", "Vegan & Plant-Based", 22, "Quiet Conversation")}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  color: "#334155",
                  cursor: "pointer",
                }}
              >
                + Add Vegan Member
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddPreset("Marcus", "Smoked BBQ & Meat Lover", 45, "Craft Beer & Cocktails")}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  color: "#334155",
                  cursor: "pointer",
                }}
              >
                + Add BBQ Fan (&lt;$45)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 20px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => setIsConfigModalOpen(false)}
            style={{
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              padding: "8px 22px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
            }}
          >
            Done &amp; Update Outing
          </button>
        </div>
      </div>
    </div>
  );
}
