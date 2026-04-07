import { fromZonedTime } from "date-fns-tz";
import { addMinutes, isBefore, isAfter, getDay } from "date-fns";
import { BusyInterval, SlotInterval } from "@/types";

/**
 * Given a date string "YYYY-MM-DD" interpreted in guestTimezone, return the day-of-week (0=Sun)
 * for that date in the host's timezone.
 */
export function getDayOfWeekForDate(
  dateStr: string,
  guestTimezone: string
): number {
  // Parse the date in the guest's timezone to get a proper Date object
  const dateInGuestTz = fromZonedTime(`${dateStr}T12:00:00`, guestTimezone);
  return getDay(dateInGuestTz);
}

interface GenerateSlotsOptions {
  availabilityStartTime: string; // "HH:MM"
  availabilityEndTime: string; // "HH:MM"
  availabilityTimezone: string;
  date: string; // "YYYY-MM-DD" in guest timezone
  guestTimezone: string;
  duration: number; // minutes
  busyIntervals: BusyInterval[];
}

export function generateSlots(opts: GenerateSlotsOptions): SlotInterval[] {
  const {
    availabilityStartTime,
    availabilityEndTime,
    availabilityTimezone,
    date,
    duration,
    busyIntervals,
  } = opts;

  // Convert host's availability window to UTC for the selected date
  const windowStart = fromZonedTime(
    `${date}T${availabilityStartTime}:00`,
    availabilityTimezone
  );
  const windowEnd = fromZonedTime(
    `${date}T${availabilityEndTime}:00`,
    availabilityTimezone
  );

  // Generate all candidate slots
  const slots: SlotInterval[] = [];
  let cursor = windowStart;

  while (!isAfter(addMinutes(cursor, duration), windowEnd)) {
    slots.push({
      startUtc: cursor.toISOString(),
      endUtc: addMinutes(cursor, duration).toISOString(),
    });
    cursor = addMinutes(cursor, duration);
  }

  const now = new Date();

  // Filter out slots that overlap with busy intervals or are in the past
  return slots.filter((slot) => {
    const slotStart = new Date(slot.startUtc);
    const slotEnd = new Date(slot.endUtc);

    // Remove past slots
    if (!isAfter(slotStart, now)) return false;

    // Check against busy intervals
    for (const busy of busyIntervals) {
      const busyStart = busy.start instanceof Date ? busy.start : new Date(busy.start);
      const busyEnd = busy.end instanceof Date ? busy.end : new Date(busy.end);

      // Overlap: busyStart < slotEnd AND busyEnd > slotStart
      if (isBefore(busyStart, slotEnd) && isAfter(busyEnd, slotStart)) {
        return false;
      }
    }

    return true;
  });
}
