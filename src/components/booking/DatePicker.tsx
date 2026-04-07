"use client";

import { DayPicker } from "react-day-picker";
import { isBefore, startOfToday } from "date-fns";
import "react-day-picker/dist/style.css";

interface DatePickerProps {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  availableDays: number[]; // 0-6
}

export function DatePicker({
  selected,
  onSelect,
  availableDays,
}: DatePickerProps) {
  const isDisabled = (date: Date) => {
    if (isBefore(date, startOfToday())) return true;
    return !availableDays.includes(date.getDay());
  };

  return (
    <div className="rdp-custom">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        disabled={isDisabled}
        fromDate={startOfToday()}
        showOutsideDays={false}
        className="border rounded-lg p-3"
        modifiersClassNames={{
          selected: "rdp-day_selected",
          today: "rdp-day_today",
        }}
      />
      <style>{`
        .rdp-custom .rdp-day_selected,
        .rdp-custom .rdp-day_selected:focus-visible,
        .rdp-custom .rdp-day_selected:not([disabled]):hover {
          background-color: hsl(221.2 83.2% 53.3%);
          color: white;
        }
        .rdp-custom .rdp-day:not([disabled]):hover {
          background-color: hsl(210 40% 96.1%);
        }
        .rdp-custom .rdp-day_today:not(.rdp-day_selected) {
          font-weight: bold;
          color: hsl(221.2 83.2% 53.3%);
        }
        .rdp-custom .rdp-nav_button:hover {
          background-color: hsl(210 40% 96.1%);
        }
      `}</style>
    </div>
  );
}
