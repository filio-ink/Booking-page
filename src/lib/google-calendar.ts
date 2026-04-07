import { google } from "googleapis";

export function getOAuth2Client(
  accessToken: string | null,
  refreshToken: string | null
) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
  );
  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return auth;
}

export async function getFreeBusy(
  auth: ReturnType<typeof getOAuth2Client>,
  calendarId: string,
  timeMin: Date,
  timeMax: Date
): Promise<{ start: string; end: string }[]> {
  const calendar = google.calendar({ version: "v3", auth });
  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: [{ id: calendarId }],
    },
  });
  return (res.data.calendars?.[calendarId]?.busy as { start: string; end: string }[]) ?? [];
}

export async function createCalendarEvent(
  auth: ReturnType<typeof getOAuth2Client>,
  event: {
    summary: string;
    description?: string;
    start: Date;
    end: Date;
    hostEmail: string;
    guestEmail: string;
    guestName: string;
  }
): Promise<string | null | undefined> {
  const calendar = google.calendar({ version: "v3", auth });
  const res = await calendar.events.insert({
    calendarId: "primary",
    sendUpdates: "all",
    requestBody: {
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.start.toISOString(), timeZone: "UTC" },
      end: { dateTime: event.end.toISOString(), timeZone: "UTC" },
      attendees: [
        { email: event.hostEmail, displayName: "Host" },
        { email: event.guestEmail, displayName: event.guestName },
      ],
    },
  });
  return res.data.id;
}
