"use client";

import { useState, useRef } from "react";

interface VisionResult {
  title: string;
  category: string;
  location: string;
  priceTier: string;
  dietaryTags: string[];
  highlights: string[];
  groupFit: string;
  summary: string;
}

export function VisionAnalyzer({
  onSendToChat,
}: {
  onSendToChat?: (text: string) => void;
}) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VisionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error ?? "Failed to analyze image");
      }
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        borderRadius: "10px",
        padding: "1rem",
        marginBottom: "1.25rem",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.2rem" }}>📸</span>
          <div>
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#111" }}>
              Roam Multimodal Vision
            </h3>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>
              Upload or paste a flyer, menu, or venue screenshot to extract group details
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: "#f3f4f6",
            border: "1px solid #d1d5db",
            padding: "0.35rem 0.75rem",
            borderRadius: "6px",
            fontSize: "0.82rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {image ? "Replace Image" : "Choose Image / Screenshot"}
        </button>
      </div>

      {image && (
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginTop: "0.75rem" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt="Uploaded flyer or menu"
            style={{
              maxHeight: "140px",
              maxWidth: "200px",
              borderRadius: "6px",
              objectFit: "cover",
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          />
          <div style={{ flex: 1 }}>
            <button
              type="button"
              disabled={loading}
              onClick={handleAnalyze}
              style={{
                background: loading ? "#9ca3af" : "#2563eb",
                color: "#fff",
                border: "none",
                padding: "0.45rem 0.9rem",
                borderRadius: "6px",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Analyzing with GPT-4o Vision…" : "✨ Analyze with GPT-4o Vision"}
            </button>
            {error && (
              <p style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "0.5rem" }}>
                {error}
              </p>
            )}
          </div>
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: "1rem",
            background: "rgba(37, 99, 235, 0.04)",
            border: "1px solid rgba(37, 99, 235, 0.2)",
            borderRadius: "8px",
            padding: "0.85rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ margin: 0, color: "#1e40af", fontSize: "1rem" }}>
              {result.title}
            </h4>
            <span
              style={{
                fontSize: "0.75rem",
                background: "#2563eb",
                color: "#fff",
                padding: "0.1rem 0.5rem",
                borderRadius: "999px",
                fontWeight: 600,
              }}
            >
              {result.priceTier || "$$"} · {result.category}
            </span>
          </div>
          <p style={{ fontSize: "0.85rem", color: "#374151", margin: "0.3rem 0" }}>
            📍 {result.location}
          </p>

          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", margin: "0.4rem 0" }}>
            {result.dietaryTags?.map((tag, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: "0.75rem",
                  background: "#dcfce7",
                  color: "#166534",
                  padding: "0.15rem 0.45rem",
                  borderRadius: "4px",
                  fontWeight: 600,
                }}
              >
                🌱 {tag}
              </span>
            ))}
          </div>

          <p style={{ fontSize: "0.85rem", color: "#1f2937", margin: "0.4rem 0" }}>
            <strong>Group Fit:</strong> {result.groupFit}
          </p>

          {result.highlights?.length > 0 && (
            <div style={{ fontSize: "0.82rem", color: "#4b5563" }}>
              <strong>Highlights:</strong> {result.highlights.join(" · ")}
            </div>
          )}

          {onSendToChat && (
            <button
              type="button"
              onClick={() =>
                onSendToChat(
                  `I analyzed a flyer/menu for "${result.title}" (${result.location}, ${result.priceTier}). Dietary tags: ${result.dietaryTags.join(", ")}. Can you arbitrate if this fits our group's constraints?`,
                )
              }
              style={{
                marginTop: "0.6rem",
                background: "#10b981",
                color: "#fff",
                border: "none",
                padding: "0.35rem 0.75rem",
                borderRadius: "5px",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              💬 Ask Roam if this fits our group
            </button>
          )}
        </div>
      )}
    </div>
  );
}
