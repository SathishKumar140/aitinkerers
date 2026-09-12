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

export interface TravelPlanCardProps {
  destination?: string;
  title?: string;
  dates?: string;
  travelers?: Array<string | null> | null;
  estimatedBudget?: string;
  highlights?: Array<string | null> | null;
  calendarUrl?: string;
  mapUrl?: string;
}

export function TravelPlanCard({
  destination,
  title,
  dates,
  travelers,
  estimatedBudget,
  highlights,
  calendarUrl,
  mapUrl,
}: TravelPlanCardProps) {
  const finalCalendarUrl =
    calendarUrl ||
    (destination
      ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
          title || `Trip to ${destination}`,
        )}&location=${encodeURIComponent(destination)}&details=${encodeURIComponent(
          `Trip to ${destination} planned with Project Roam.\nTravelers: ${
            travelers?.filter(Boolean).join(", ") || "Group"
          }`,
        )}`
      : undefined);

  const finalMapUrl =
    mapUrl ||
    (destination
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`
      : undefined);

  return (
    <article
      className="ck-card"
      style={{
        borderLeftColor: "#2563eb",
        borderLeftWidth: "4px",
        background: "#ffffff",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        borderRadius: "10px",
        padding: "1.25rem",
        color: "#111827",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
        <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
          {title ? `✈️ ${title}` : destination ? `Trip to ${destination}` : "Planning multi-day travel…"}
        </h3>
        <span
          style={{
            fontSize: "0.72rem",
            background: "#eff6ff",
            color: "#1d4ed8",
            border: "1px solid #bfdbfe",
            padding: "0.25rem 0.6rem",
            borderRadius: "999px",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          ✈️ Skill: Travel Planner
        </span>
      </div>

      <p style={{ margin: "0.35rem 0 1rem", color: "#475569", fontSize: "0.875rem", fontWeight: 500 }}>
        {[destination, dates, estimatedBudget].filter(Boolean).join(" · ") || "Configuring trip dates and budget…"}
      </p>

      {!!travelers?.length && (
        <div style={{ marginBottom: "0.85rem" }}>
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
            Travelers ({travelers.filter(Boolean).length})
          </strong>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {travelers.filter(Boolean).map((t, i) => (
              <span
                key={i}
                style={{
                  fontSize: "0.8rem",
                  background: "#f1f5f9",
                  color: "#1e293b",
                  padding: "0.2rem 0.55rem",
                  borderRadius: "6px",
                  fontWeight: 600,
                  border: "1px solid #e2e8f0",
                }}
              >
                👤 {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {!!highlights?.length && (
        <div style={{ marginBottom: "1rem" }}>
          <strong
            style={{
              display: "block",
              fontSize: "0.72rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#2563eb",
              fontWeight: 700,
              marginBottom: "0.35rem",
            }}
          >
            Itinerary Highlights
          </strong>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#1e293b", fontSize: "0.875rem", lineHeight: "1.6" }}>
            {highlights.map((h, i) => (
              <li key={i} style={{ color: "#334155" }}>
                {h || "Scheduling stops…"}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(finalCalendarUrl || finalMapUrl) && (
        <div style={{ display: "flex", gap: "0.6rem", marginTop: "1rem", flexWrap: "wrap" }}>
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
                background: "#eff6ff",
                color: "#1e40af",
                textDecoration: "none",
                border: "1px solid #bfdbfe",
              }}
            >
              📅 Add Trip to Google Calendar
            </a>
          )}
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
              }}
            >
              🗺️ Destination Map
            </a>
          )}
        </div>
      )}
    </article>
  );
}

export interface FlightHotelCardProps {
  destination?: string;
  title?: string;
  flights?: Array<{
    airline?: string;
    flightNumber?: string;
    route?: string;
    times?: string;
    price?: string;
    bookingUrl?: string;
  } | null> | null;
  hotels?: Array<{
    name?: string;
    neighborhood?: string;
    rating?: string;
    pricePerNight?: string;
    amenities?: Array<string | null> | null;
    bookingUrl?: string;
  } | null> | null;
}

export function FlightHotelCard({ destination, title, flights, hotels }: FlightHotelCardProps) {
  const defaultFlightsUrl = destination
    ? `https://www.google.com/travel/flights?q=flights+to+${encodeURIComponent(destination)}`
    : undefined;
  const defaultHotelsUrl = destination
    ? `https://www.google.com/travel/hotels?q=hotels+in+${encodeURIComponent(destination)}`
    : undefined;

  return (
    <article
      className="ck-card"
      style={{
        borderLeftColor: "#0284c7",
        borderLeftWidth: "4px",
        background: "#ffffff",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        borderRadius: "10px",
        padding: "1.25rem",
        color: "#111827",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
        <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
          {title ? `🏨 ${title}` : `Travel Recommendations${destination ? ` for ${destination}` : ""}`}
        </h3>
        <span
          style={{
            fontSize: "0.72rem",
            background: "#f0f9ff",
            color: "#0369a1",
            border: "1px solid #bae6fd",
            padding: "0.25rem 0.6rem",
            borderRadius: "999px",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          ✈️ Skill: Travel Planner
        </span>
      </div>

      {/* Flights Section */}
      <div style={{ marginTop: "1rem" }}>
        <strong style={{ fontSize: "0.8rem", color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          ✈️ Recommended Flights
        </strong>
        {!flights?.length ? (
          <p style={{ fontSize: "0.85rem", color: "#64748b" }}>Searching flights…</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.4rem" }}>
            {flights.map((f, i) => (
              <div
                key={i}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "0.6rem 0.85rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>
                    {f?.airline || "Flight"} {f?.flightNumber ? `(${f.flightNumber})` : ""}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#475569" }}>
                    {f?.route || "—"} · {f?.times || "Times pending"}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0284c7" }}>
                  {f?.price || "View fares"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hotels Section */}
      <div style={{ marginTop: "1rem" }}>
        <strong style={{ fontSize: "0.8rem", color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          🏨 Recommended Stays
        </strong>
        {!hotels?.length ? (
          <p style={{ fontSize: "0.85rem", color: "#64748b" }}>Searching hotels…</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.4rem" }}>
            {hotels.map((h, i) => (
              <div
                key={i}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "0.6rem 0.85rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>
                    {h?.name || "Hotel"} {h?.rating ? `(${h.rating})` : ""}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#475569" }}>
                    {h?.neighborhood || "Central"}
                    {h?.amenities?.length ? ` · ${h.amenities.filter(Boolean).join(", ")}` : ""}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#059669" }}>
                  {h?.pricePerNight || "Check rates"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "0.6rem", marginTop: "1rem" }}>
        {defaultFlightsUrl && (
          <a
            href={defaultFlightsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              padding: "0.4rem 0.8rem",
              borderRadius: "6px",
              background: "#0284c7",
              color: "#ffffff",
              textDecoration: "none",
            }}
          >
            ✈️ Search Flights on Google
          </a>
        )}
        {defaultHotelsUrl && (
          <a
            href={defaultHotelsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              padding: "0.4rem 0.8rem",
              borderRadius: "6px",
              background: "#f1f5f9",
              color: "#0f172a",
              textDecoration: "none",
              border: "1px solid #cbd5e1",
            }}
          >
            🏨 Search Hotels on Google
          </a>
        )}
      </div>
    </article>
  );
}

export interface TravelAlertCardProps {
  title?: string;
  tripName?: string;
  urgency?: string;
  category?: string;
  message?: string;
  actionLabel?: string;
  actionUrl?: string;
}

export function TravelAlertCard({
  title,
  tripName,
  urgency,
  category,
  message,
  actionLabel,
  actionUrl,
}: TravelAlertCardProps) {
  const isCritical = urgency === "critical";
  const isWarning = urgency === "warning";
  const accentColor = isCritical ? "#dc2626" : isWarning ? "#d97706" : "#2563eb";
  const badgeBg = isCritical ? "#fef2f2" : isWarning ? "#fffbeb" : "#eff6ff";
  const badgeColor = isCritical ? "#991b1b" : isWarning ? "#92400e" : "#1e40af";

  return (
    <article
      className="ck-card"
      style={{
        borderLeftColor: accentColor,
        borderLeftWidth: "4px",
        background: "#ffffff",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        borderRadius: "10px",
        padding: "1.25rem",
        color: "#111827",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
        <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#0f172a" }}>
          🔔 {title || "Travel Notification"}
        </h3>
        <span
          style={{
            fontSize: "0.72rem",
            background: badgeBg,
            color: badgeColor,
            border: `1px solid ${accentColor}44`,
            padding: "0.2rem 0.55rem",
            borderRadius: "999px",
            fontWeight: 700,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {urgency || "Info"}
        </span>
      </div>

      <div style={{ fontSize: "0.78rem", color: "#64748b", margin: "0.25rem 0 0.75rem" }}>
        {tripName ? `Trip: ${tripName}` : "Travel advisory"} {category ? `· ${category}` : ""}
      </div>

      <p style={{ margin: 0, color: "#334155", fontSize: "0.875rem", lineHeight: 1.55 }}>
        {message || "Checking travel status and alerts…"}
      </p>

      {actionUrl && (
        <div style={{ marginTop: "0.85rem" }}>
          <a
            href={actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              padding: "0.4rem 0.8rem",
              borderRadius: "6px",
              background: accentColor,
              color: "#ffffff",
              textDecoration: "none",
            }}
          >
            {actionLabel || "View Details"}
          </a>
        </div>
      )}
    </article>
  );
}

export interface BillSplitCardProps {
  title?: string;
  currency?: string;
  totalAmount?: number;
  paidBy?: string;
  splitMethod?: string;
  members?: Array<{ name?: string; share?: number; itemsSummary?: string } | null> | null;
  settlements?: Array<{ from?: string; to?: string; amount?: number } | null> | null;
}

export function BillSplitCard({
  title,
  currency = "SGD",
  totalAmount,
  paidBy,
  splitMethod = "Equal / Itemized",
  members,
  settlements,
}: BillSplitCardProps) {
  const [settled, setSettled] = React.useState(false);

  return (
    <article
      className="ck-card"
      style={{
        borderLeftColor: "#10b981",
        borderLeftWidth: "4px",
        background: "#ffffff",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        borderRadius: "10px",
        padding: "1.25rem",
        color: "#111827",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
        <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
          💸 {title || "Group Expense Split"}
        </h3>
        <span
          style={{
            fontSize: "0.72rem",
            background: "#ecfdf5",
            color: "#047857",
            border: "1px solid #a7f3d0",
            padding: "0.25rem 0.6rem",
            borderRadius: "999px",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          💸 Skill: Bill Splitter
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          margin: "0.6rem 0 1rem",
          padding: "0.6rem 0.85rem",
          background: "#f0fdf4",
          borderRadius: "8px",
          border: "1px solid #bbf7d0",
        }}
      >
        <div>
          <div style={{ fontSize: "0.72rem", color: "#166534", fontWeight: 700, textTransform: "uppercase" }}>
            Total Bill
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#14532d" }}>
            {currency} {totalAmount !== undefined ? totalAmount.toFixed(2) : "0.00"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "0.72rem", color: "#166534", fontWeight: 700, textTransform: "uppercase" }}>
            Paid By
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#166534", marginTop: "2px" }}>
            {paidBy || "—"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "0.72rem", color: "#166534", fontWeight: 700, textTransform: "uppercase" }}>
            Split Method
          </div>
          <div style={{ fontSize: "0.85rem", color: "#15803d", marginTop: "4px" }}>
            {splitMethod}
          </div>
        </div>
      </div>

      {/* Member shares */}
      {!!members?.length && (
        <div style={{ marginBottom: "1rem" }}>
          <strong
            style={{
              display: "block",
              fontSize: "0.72rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#047857",
              fontWeight: 700,
              marginBottom: "0.4rem",
            }}
          >
            Member Breakdown
          </strong>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            {members.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.4rem 0.6rem",
                  background: "#f8fafc",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                }}
              >
                <div>
                  <strong style={{ color: "#0f172a" }}>{m?.name || "Member"}</strong>
                  {m?.itemsSummary && <span style={{ color: "#64748b", marginLeft: "6px" }}>({m.itemsSummary})</span>}
                </div>
                <div style={{ fontWeight: 700, color: "#0f172a" }}>
                  {currency} {m?.share !== undefined ? m.share.toFixed(2) : "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debt settlements */}
      {!!settlements?.length && (
        <div style={{ marginBottom: "1rem" }}>
          <strong
            style={{
              display: "block",
              fontSize: "0.72rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#047857",
              fontWeight: 700,
              marginBottom: "0.4rem",
            }}
          >
            Settlement Resolution (&ldquo;Who Owes Whom&rdquo;)
          </strong>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {settlements.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.45rem 0.75rem",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>{s?.from}</span>
                  <span style={{ color: "#64748b", margin: "0 6px" }}>owes</span>
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>{s?.to}</span>
                </div>
                <span style={{ fontWeight: 800, color: "#047857" }}>
                  {currency} {s?.amount !== undefined ? s.amount.toFixed(2) : "0.00"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "0.6rem", marginTop: "1rem" }}>
        <button
          type="button"
          onClick={() => setSettled((prev) => !prev)}
          style={{
            background: settled ? "#15803d" : "#10b981",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            padding: "0.45rem 0.9rem",
            fontWeight: 700,
            fontSize: "0.825rem",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(16, 185, 129, 0.25)",
            transition: "all 0.15s ease",
          }}
        >
          {settled ? "✓ Marked as Settled" : "Mark All Settled"}
        </button>
      </div>
    </article>
  );
}

