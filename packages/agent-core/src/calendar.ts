import type { CalendarEventData } from "./schemas";

export function formatGoogleCalendarDateTime(
  dateStr?: string,
  timeStr?: string,
  durationMinutes = 90,
): { start: string; end: string } {
  // Use Singapore local time as default baseline (UTC+8)
  const now = new Date();
  let targetYear = now.getFullYear();
  let targetMonth = now.getMonth();
  let targetDay = now.getDate();

  if (dateStr) {
    const parts = dateStr.split("-").map(Number);
    const y = parts[0];
    const m = parts[1];
    const d = parts[2];
    if (
      typeof y === "number" &&
      typeof m === "number" &&
      typeof d === "number" &&
      !isNaN(y) &&
      !isNaN(m) &&
      !isNaN(d)
    ) {
      targetYear = y;
      targetMonth = m - 1;
      targetDay = d;
    }
  }

  let startHours = 19; // Default 7:30 PM
  let startMinutes = 30;
  if (timeStr) {
    const timeParts = timeStr.split(":").map(Number);
    const h = timeParts[0];
    const min = timeParts[1];
    if (typeof h === "number" && typeof min === "number" && !isNaN(h) && !isNaN(min)) {
      startHours = h;
      startMinutes = min;
    }
  }

  // Singapore is UTC+8, so subtract 8 hours for UTC representation
  const startUtcMs = Date.UTC(targetYear, targetMonth, targetDay, startHours - 8, startMinutes, 0);
  const startDate = new Date(startUtcMs);
  const endDate = new Date(startUtcMs + (durationMinutes || 90) * 60 * 1000);

  const toGCalString = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  return {
    start: toGCalString(startDate),
    end: toGCalString(endDate),
  };
}

export function buildGoogleCalendarUrl(event: CalendarEventData): string {
  const { start, end } = formatGoogleCalendarDateTime(
    event.date,
    event.startTime,
    event.durationMinutes,
  );

  const attendeeList = event.attendees?.length
    ? `\nParticipants: ${event.attendees.join(", ")}`
    : "";

  const fullDetails = `${event.description || `Group dining and outing organized by Project Roam.`}${attendeeList}\n\nVenue: ${event.venueName}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title || `Dinner at ${event.venueName}`,
    dates: `${start}/${end}`,
    details: fullDetails,
    location: event.location || `${event.venueName}, Singapore`,
  });

  if (event.attendees?.length) {
    const validEmails = event.attendees.filter((a) => a.includes("@"));
    if (validEmails.length > 0) {
      params.set("add", validEmails.join(","));
    }
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
