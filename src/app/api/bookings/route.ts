
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { format } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getOAuth2Client, createCalendarEvent, getFreeBusy } from "@/lib/google-calendar";
import { generateSlots, getDayOfWeekForDate } from "@/lib/slots";
import { sendGuestConfirmationEmail, sendHostNotificationEmail } from "@/lib/email";
import type { BusyInterval } from "@/types";

export const dynamic = "force-dynamic";

const createBookingSchema = z.object({
  eventTypeId: z.string(),
  guestName: z.string().min(1).max(100),
  guestEmail: z.string().email(),
  startTimeUtc: z.string().datetime(),
  endTimeUtc: z.string().datetime(),
  notes: z.string().max(500).optional(),
  guestTimezone: z.string().default("UTC"),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { eventTypeId, guestName, guestEmail, startTimeUtc, endTimeUtc, notes, guestTimezone } =
    parsed.data;

  const startTime = new Date(startTimeUtc);
  const endTime = new Date(endTimeUtc);

  // Load event type + host info
  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId, isActive: true },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          googleAccessToken: true,
          googleRefreshToken: true,
          availability: true,
        },
      },
    },
  });
  if (!eventType) {
    return NextResponse.json({ error: "Event type not found" }, { status: 404 });
  }

  const host = eventType.user;

  // Verify the slot is still available (race condition protection)
  const dateStr = format(startTime, "yyyy-MM-dd");
  const dayOfWeek = getDayOfWeekForDate(dateStr, guestTimezone);

  const avail = host.availability.find(
    (a) => a.dayOfWeek === dayOfWeek && a.isActive
  );
  if (!avail) {
    return NextResponse.json(
      { error: "This time slot is no longer available" },
      { status: 409 }
    );
  }

  const windowStart = fromZonedTime(`${dateStr}T${avail.startTime}:00`, avail.timezone);
  const windowEnd = fromZonedTime(`${dateStr}T${avail.endTime}:00`, avail.timezone);

  const busyIntervals: BusyInterval[] = [];

  // Check existing bookings
  const existingBookings = await prisma.booking.findMany({
    where: {
      eventType: { userId: host.id },
      status: "CONFIRMED",
      startTime: { gte: windowStart },
      endTime: { lte: windowEnd },
    },
  });
  for (const b of existingBookings) {
    busyIntervals.push({ start: b.startTime, end: b.endTime });
  }

  // Check Google Calendar
  try {
    const auth = getOAuth2Client(host.googleAccessToken, host.googleRefreshToken);
    // getFreeBusy already imported at top of file
    const googleBusy = await getFreeBusy(auth, "primary", windowStart, windowEnd);
    for (const b of googleBusy) {
      if (b.start && b.end) {
        busyIntervals.push({ start: new Date(b.start), end: new Date(b.end) });
      }
    }
  } catch {}

  const availableSlots = generateSlots({
    availabilityStartTime: avail.startTime,
    availabilityEndTime: avail.endTime,
    availabilityTimezone: avail.timezone,
    date: dateStr,
    guestTimezone,
    duration: eventType.duration,
    busyIntervals,
  });

  const slotExists = availableSlots.some(
    (s) =>
      new Date(s.startUtc).getTime() === startTime.getTime() &&
      new Date(s.endUtc).getTime() === endTime.getTime()
  );

  if (!slotExists) {
    return NextResponse.json(
      { error: "This time slot is no longer available" },
      { status: 409 }
    );
  }

  // Create the booking
  const booking = await prisma.booking.create({
    data: {
      eventTypeId,
      guestName,
      guestEmail,
      startTime,
      endTime,
      notes,
      status: "CONFIRMED",
    },
  });

  // Create Google Calendar event
  let googleEventId: string | null = null;
  try {
    const auth = getOAuth2Client(host.googleAccessToken, host.googleRefreshToken);
    googleEventId = await createCalendarEvent(auth, {
      summary: `${eventType.title} with ${guestName}`,
      description: notes,
      start: startTime,
      end: endTime,
      hostEmail: host.email,
      guestEmail,
      guestName,
    }) ?? null;

    if (googleEventId) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { googleEventId },
      });
    }
  } catch {
    // Calendar creation failure doesn't cancel the booking
  }

  // Send confirmation emails
  const hostTimezone = avail.timezone;
  const emailData = {
    guestName,
    guestEmail,
    hostName: host.name ?? "Your host",
    hostEmail: host.email,
    eventTitle: eventType.title,
    startTimeUtc: startTime.toISOString(),
    endTimeUtc: endTime.toISOString(),
    guestTimezone,
    hostTimezone,
    notes,
    bookingId: booking.id,
  };

  try {
    await Promise.all([
      sendGuestConfirmationEmail(emailData),
      sendHostNotificationEmail(emailData),
    ]);
  } catch {
    // Email failure doesn't cancel the booking
  }

  return NextResponse.json({ bookingId: booking.id }, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: {
      eventType: { userId: session.user.id },
      status: "CONFIRMED",
      startTime: { gte: new Date() },
    },
    include: {
      eventType: {
        select: {
          title: true,
          duration: true,
          color: true,
          user: { select: { name: true, username: true } },
        },
      },
    },
    orderBy: { startTime: "asc" },
    take: 50,
  });

  return NextResponse.json(bookings);
}
