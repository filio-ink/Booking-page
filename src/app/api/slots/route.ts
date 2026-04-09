
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fromZonedTime } from "date-fns-tz";
import { getOAuth2Client, getFreeBusy } from "@/lib/google-calendar";
import { generateSlots, getDayOfWeekForDate } from "@/lib/slots";
import type { BusyInterval } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const slug = searchParams.get("slug");
  const date = searchParams.get("date"); // "YYYY-MM-DD"
  const timezone = searchParams.get("timezone") ?? "UTC";

  if (!username || !slug || !date) {
    return NextResponse.json(
      { error: "Missing required params: username, slug, date" },
      { status: 400 }
    );
  }

  // 1. Resolve user
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      googleAccessToken: true,
      googleRefreshToken: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 2. Resolve event type
  const eventType = await prisma.eventType.findFirst({
    where: { userId: user.id, slug, isActive: true },
  });
  if (!eventType) {
    return NextResponse.json({ error: "Event type not found" }, { status: 404 });
  }

  // 3. Get day of week for selected date (using guest's timezone)
  const dayOfWeek = getDayOfWeekForDate(date, timezone);

  // 4. Get host availability for that day
  const avail = await prisma.availability.findFirst({
    where: { userId: user.id, dayOfWeek, isActive: true },
  });
  if (!avail) {
    return NextResponse.json({ slots: [] });
  }

  // 5. Compute the availability window in UTC
  const windowStart = fromZonedTime(
    `${date}T${avail.startTime}:00`,
    avail.timezone
  );
  const windowEnd = fromZonedTime(
    `${date}T${avail.endTime}:00`,
    avail.timezone
  );

  // 6. Fetch busy times from Google Calendar
  const busyIntervals: BusyInterval[] = [];
  try {
    const auth = getOAuth2Client(
      user.googleAccessToken,
      user.googleRefreshToken
    );
    const googleBusy = await getFreeBusy(auth, "primary", windowStart, windowEnd);
    for (const b of googleBusy) {
      if (b.start && b.end) {
        busyIntervals.push({ start: new Date(b.start), end: new Date(b.end) });
      }
    }
  } catch {
    // If Google Calendar fails (no token etc.), continue without it
  }

  // 7. Fetch existing bookings from our DB
  const existingBookings = await prisma.booking.findMany({
    where: {
      eventType: { userId: user.id },
      status: "CONFIRMED",
      startTime: { gte: windowStart },
      endTime: { lte: windowEnd },
    },
  });
  for (const b of existingBookings) {
    busyIntervals.push({ start: b.startTime, end: b.endTime });
  }

  // 8. Generate and return available slots
  const slots = generateSlots({
    availabilityStartTime: avail.startTime,
    availabilityEndTime: avail.endTime,
    availabilityTimezone: avail.timezone,
    date,
    guestTimezone: timezone,
    duration: eventType.duration,
    busyIntervals,
  });

  return NextResponse.json({ slots });
}
