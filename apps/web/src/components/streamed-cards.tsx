import React from "react";
import { buildGoogleCalendarUrl } from "agent-core/shared";

// Tool arguments arrive incrementally, before schema defaults are applied.
export interface IncidentCardProps {
  headline?: string;
  summary?: string;
  facts?: Array<{ label?: string; value?: string } | null> | null;
  nextSteps?: Array<string | null> | null;
  tone?: string;
}

export interface TimelineProps {
  title?: string;
  columns?: Array<string | null> | null;
  rows?: Array<Array<string | null> | null> | null;
}

export interface GroupConsensusCardProps {
  venueName?: string;
  headline?: string;
  cuisineOrCategory?: string;
  priceTier?: string;
  neighborhood?: string;
  matchScore?: string;
  participantConstraints?: Array<string | null> | null;
  whyItWorks?: Array<{ member?: string; reason?: string } | null> | null;
  mapUrl?: string;
  sourceUrl?: string;
  calendarUrl?: string;
}

export interface ItineraryCardProps {
  title?: string;
  stops?: Array<{ time?: string; activity?: string; location?: string } | null> | null;
}

const toneColor = { neutral: "var(--muted)", good: "#2e7d5b", attention: "var(--accent)" } as const;

export function GroupConsensusCard({
  venueName,
  headline,
  cuisineOrCategory,
  priceTier,
  neighborhood,
  matchScore,
  participantConstraints,
  whyItWorks,
  mapUrl,
  sourceUrl,
  calendarUrl,
}: GroupConsensusCardProps) {
  const finalMapUrl =
    mapUrl ||
    (venueName
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${venueName} ${neighborhood || "Singapore"}`,
        )}`
      : undefined);

  const finalCalendarUrl =
    calendarUrl ||
    (venueName
      ? buildGoogleCalendarUrl({
          title: headline ? `Dinner: ${venueName} (${headline})` : `Dinner at ${venueName}`,
          venueName,
          location: neighborhood || `${venueName}, Singapore`,
          description: whyItWorks
            ?.map((item) => `${item?.member || "Participant"}: ${item?.reason || ""}`)
            .join("\n"),
          attendees: whyItWorks
            ?.map((item) => item?.member)
            .filter(Boolean) as string[],
        })
      : undefined);

  return (
    <article
      className="ck-card"
      style={{
        borderLeftColor: "#059669",
        borderLeftWidth: "4px",
        background: "#ffffff",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        borderRadius: "10px",
        padding: "1.25rem",
        color: "#111827",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "0.75rem",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
          {venueName
            ? headline
              ? `${venueName} — ${headline}`
              : venueName
            : headline || "Finding group consensus recommendation…"}
        </h3>
        <span
          style={{
            fontSize: "0.75rem",
            background: "#ecfdf5",
            color: "#047857",
            border: "1px solid #a7f3d0",
            padding: "0.25rem 0.6rem",
            borderRadius: "999px",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {matchScore || "Consensus Pick"}
        </span>
      </div>

      <p
        style={{
          margin: "0.35rem 0 1rem",
          color: "#475569",
          fontSize: "0.875rem",
          fontWeight: 500,
        }}
      >
        {[cuisineOrCategory, priceTier, neighborhood].filter(Boolean).join(" · ") ||
          "Evaluating group constraints…"}
      </p>

      {!!participantConstraints?.length && (
        <div style={{ marginBottom: "1rem" }}>
          <strong
            style={{
              display: "block",
              fontSize: "0.72rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#64748b",
              fontWeight: 700,
              marginBottom: "0.35rem",
            }}
          >
            Group Constraints
          </strong>
          <ul
            style={{
              margin: 0,
              paddingLeft: "1.25rem",
              color: "#1e293b",
              fontSize: "0.875rem",
              lineHeight: "1.6",
            }}
          >
            {participantConstraints.map((c, i) => (
              <li key={i} style={{ color: "#334155" }}>
                {c || "Analyzing preferences…"}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!!whyItWorks?.length && (
        <div style={{ marginBottom: "1rem" }}>
          <strong
            style={{
              display: "block",
              fontSize: "0.72rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#059669",
              fontWeight: 700,
              marginBottom: "0.35rem",
            }}
          >
            Why It Works For Everyone
          </strong>
          <ul
            style={{
              margin: 0,
              paddingLeft: "1.25rem",
              color: "#0f172a",
              fontSize: "0.875rem",
              lineHeight: "1.6",
            }}
          >
            {whyItWorks.map((item, i) => (
              <li key={i} style={{ color: "#1e293b" }}>
                <strong style={{ color: "#0f172a", fontWeight: 600 }}>
                  {item?.member ? `${item.member}: ` : ""}
                </strong>
                {item?.reason || "Checking compatibility…"}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(finalMapUrl || finalCalendarUrl || sourceUrl) && (
        <div style={{ display: "flex", gap: "0.6rem", marginTop: "1rem", flexWrap: "wrap" }}>
          {finalMapUrl && (
            <a
              href={finalMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.825rem",
                fontWeight: 600,
                padding: "0.45rem 0.85rem",
                borderRadius: "6px",
                background: "#f1f5f9",
                color: "#0f172a",
                textDecoration: "none",
                border: "1px solid #cbd5e1",
                transition: "all 0.15s ease",
              }}
            >
              📍 Open in Maps
            </a>
          )}
          {finalCalendarUrl && (
            <a
              href={finalCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.825rem",
                fontWeight: 600,
                padding: "0.45rem 0.85rem",
                borderRadius: "6px",
                background: "#ecfdf5",
                color: "#065f46",
                textDecoration: "none",
                border: "1px solid #a7f3d0",
                transition: "all 0.15s ease",
              }}
            >
              📅 Add to Google Calendar
            </a>
          )}
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.825rem",
                fontWeight: 600,
                padding: "0.45rem 0.85rem",
                borderRadius: "6px",
                background: "#f1f5f9",
                color: "#0f172a",
                textDecoration: "none",
                border: "1px solid #cbd5e1",
              }}
            >
              🌐 Official Website
            </a>
          )}
        </div>
      )}
    </article>
  );
}

export function ItineraryCard({ title, stops }: ItineraryCardProps) {
  return (
    <article className="ck-card" style={{ borderLeftColor: "#3b82f6" }}>
      <h3>{title || "Group Itinerary"}</h3>
      {!stops?.length ? (
        <p>Planning schedule…</p>
      ) : (
        <div className="ck-scroll">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Activity</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {stops.map((stop, index) => (
                <tr key={index}>
                  <td>{stop?.time ?? "—"}</td>
                  <td>{stop?.activity ?? "Loading…"}</td>
                  <td>{stop?.location ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

export function IncidentCard({ headline, summary, facts, nextSteps, tone }: IncidentCardProps) {
  const color = tone === "good" || tone === "attention" ? toneColor[tone] : toneColor.neutral;
  return (
    <article className="ck-card" style={{ borderLeftColor: color }}>
      <h3>{headline || "Preparing incident assessment…"}</h3>
      <p>{summary || "Gathering incident details…"}</p>
      {!!facts?.length && (
        <dl className="ck-facts">
          {facts.map((fact, index) => (
            <div key={index}>
              <dt>{fact?.label || "Loading…"}</dt>
              <dd>{fact?.value || "Loading…"}</dd>
            </div>
          ))}
        </dl>
      )}
      {!!nextSteps?.length && (
        <ul className="ck-steps">
          {nextSteps.map((step, index) => (
            <li key={index}>{step || "Loading…"}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

export function Timeline({ title, columns, rows }: TimelineProps) {
  return (
    <article className="ck-card">
      {title && <h3>{title}</h3>}
      {!columns?.length ? (
        <p>Preparing timeline…</p>
      ) : (
        <div className="ck-scroll">
          <table>
            <thead>
              <tr>
                {columns.map((header, index) => (
                  <th key={index}>{header || "Loading…"}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!rows?.length ? (
                <tr><td colSpan={columns.length}>Loading events…</td></tr>
              ) : rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((_, cellIndex) => (
                    <td key={cellIndex}>{row?.[cellIndex] ?? "Loading…"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
