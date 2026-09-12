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

export function buildGoogleCalendarTripUrl(trip: {
  title: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  travelers?: string[];
}): string {
  const { start, end } = formatGoogleCalendarDateTime(trip.startDate, "09:00", 24 * 60 * 3); // default 3 days
  const attendeeList = trip.travelers?.length ? `\nTravelers: ${trip.travelers.join(", ")}` : "";
  const fullDetails = `${trip.description || `Trip to ${trip.destination} planned with Project Roam.`}${attendeeList}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: trip.title || `Trip to ${trip.destination}`,
    dates: `${start}/${end}`,
    details: fullDetails,
    location: trip.destination,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function isGoogleCalendarConfigured(): boolean {
  if (typeof process === "undefined" || !process.env) return false;
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN,
  );
}

export interface DirectCalendarResult {
  success: boolean;
  htmlLink?: string;
  eventId?: string;
  fallbackUrl: string;
  message: string;
}

/**
 * Creates an event directly in the user's primary Google Calendar via OAuth2 v3 REST API.
 * Gracefully falls back to 1-click URL if credentials are not present or if an error occurs.
 */
export async function createGoogleCalendarEventDirect(
  event: CalendarEventData,
): Promise<DirectCalendarResult> {
  const fallbackUrl = buildGoogleCalendarUrl(event);

  if (!isGoogleCalendarConfigured()) {
    return {
      success: false,
      fallbackUrl,
      message:
        "Direct Google Calendar API is not configured (missing GOOGLE_REFRESH_TOKEN in .env). Provided 1-click calendar link.",
    };
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN!;
    const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

    // 1. Obtain short-lived access token from Google OAuth2
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Failed to refresh Google OAuth token:", errText);
      return {
        success: false,
        fallbackUrl,
        message: `Failed to authenticate with Google Calendar: ${errText}`,
      };
    }

    const tokenData = (await tokenRes.json()) as { access_token?: string };
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      return {
        success: false,
        fallbackUrl,
        message: "Google OAuth response did not contain an access token.",
      };
    }

    // 2. Format RFC3339 timestamps
    const { start, end } = formatGoogleCalendarDateTime(
      event.date,
      event.startTime,
      event.durationMinutes,
    );

    // Convert to ISO 8601 string with Singapore timezone offset (+08:00)
    // start is like YYYYMMDDTHHmmssZ
    const toIsoWithOffset = (compact: string) => {
      const match = compact.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
      if (!match) return new Date().toISOString();
      return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}Z`;
    };

    const attendeeEmails = event.attendees
      ?.filter((a) => a.includes("@"))
      .map((email) => ({ email }));

    const eventPayload = {
      summary: event.title || `Dinner at ${event.venueName}`,
      location: event.location || `${event.venueName}, Singapore`,
      description: `${event.description || "Organized by Project Roam."}\n\nVenue: ${event.venueName}`,
      start: {
        dateTime: toIsoWithOffset(start),
      },
      end: {
        dateTime: toIsoWithOffset(end),
      },
      ...(attendeeEmails && attendeeEmails.length > 0 ? { attendees: attendeeEmails } : {}),
    };

    // 3. Insert into Google Calendar v3 API
    const calRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventPayload),
      },
    );

    if (!calRes.ok) {
      const errText = await calRes.text();
      console.error("Google Calendar API insertion failed:", errText);
      return {
        success: false,
        fallbackUrl,
        message: `Google Calendar insert failed (${calRes.status}): ${errText}`,
      };
    }

    const createdEvent = (await calRes.json()) as { id: string; htmlLink: string };

    return {
      success: true,
      eventId: createdEvent.id,
      htmlLink: createdEvent.htmlLink,
      fallbackUrl: createdEvent.htmlLink || fallbackUrl,
      message: `Successfully created Google Calendar event: "${eventPayload.summary}"!`,
    };
  } catch (error) {
    console.error("Error creating Google Calendar event directly:", error);
    return {
      success: false,
      fallbackUrl,
      message: `Direct Google Calendar API error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

