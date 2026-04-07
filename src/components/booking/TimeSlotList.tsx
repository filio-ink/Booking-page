"use client";

import { toZonedTime, format as formatTz } from "date-fns-tz";
import { cn } from "@/lib/utils";
import { SlotInterval } from "@/types";

interface TimeSlotListProps {
  slots: SlotInterval[];
  timezone: string;
  selected: SlotInterval | null;
  onSelect: (slot: SlotInterval) => void;
  loading: boolean;
}

export function TimeSlotList({
  slots,
  timezone,
  selected,
  onSelect,
  loading,
}: TimeSlotListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-muted animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No available times on this day.
      </p>
    );
  }

  return (
    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
      {slots.map((slot) => {
        const start = toZonedTime(new Date(slot.startUtc), timezone);
        const label = formatTz(start, "h:mm a", { timeZone: timezone });
        const isSelected =
          selected?.startUtc === slot.startUtc;

        return (
          <button
            key={slot.startUtc}
            onClick={() => onSelect(slot)}
            className={cn(
              "w-full text-sm font-medium px-4 py-2.5 rounded-md border transition-all",
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-accent border-border"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
