"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { DatePicker } from "@/components/booking/DatePicker";
import { TimeSlotList } from "@/components/booking/TimeSlotList";
import { BookingForm } from "@/components/booking/BookingForm";
import { TimezoneDisplay } from "@/components/booking/TimezoneDisplay";
import { SlotInterval } from "@/types";
import { Clock, User } from "lucide-react";
import Link from "next/link";

interface Props {
  username: string;
  eventType: {
    id: string;
    title: string;
    description: string | null;
    duration: number;
    slug: string;
    color: string;
  };
  host: { name: string | null; image: string | null };
  availableDays: number[];
}

export function BookingPageClient({
  username,
  eventType,
  host,
  availableDays,
}: Props) {
  const [timezone, setTimezone] = useState("UTC");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [slots, setSlots] = useState<SlotInterval[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotInterval | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Detect browser timezone on mount
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(tz);
  }, []);

  const fetchSlots = useCallback(
    async (date: Date, tz: string) => {
      setLoadingSlots(true);
      setSlots([]);
      setSelectedSlot(null);
      const dateStr = format(date, "yyyy-MM-dd");
      const res = await fetch(
        `/api/slots?username=${username}&slug=${eventType.slug}&date=${dateStr}&timezone=${encodeURIComponent(tz)}`
      );
      const data = await res.json();
      setSlots(data.slots ?? []);
      setLoadingSlots(false);
    },
    [username, eventType.slug]
  );

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setShowForm(false);
    if (date) fetchSlots(date, timezone);
  };

  const handleTimezoneChange = (tz: string) => {
    setTimezone(tz);
    setSelectedSlot(null);
    setShowForm(false);
    if (selectedDate) fetchSlots(selectedDate, tz);
  };

  const handleSlotSelect = (slot: SlotInterval) => {
    setSelectedSlot(slot);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Event info */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl border p-6 h-full">
              {host.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={host.image}
                  alt={host.name ?? ""}
                  className="w-14 h-14 rounded-full mb-4 border-2 border-border"
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-full mb-4 flex items-center justify-center"
                  style={{ backgroundColor: eventType.color }}
                >
                  <User className="h-6 w-6 text-white" />
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-1">{host.name ?? username}</p>
              <h1 className="text-xl font-bold mb-2">{eventType.title}</h1>
              {eventType.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {eventType.description}
                </p>
              )}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{eventType.duration} minutes</span>
              </div>
              <div className="mt-4 pt-4 border-t">
                <TimezoneDisplay
                  timezone={timezone}
                  onChange={handleTimezoneChange}
                />
              </div>
            </div>
          </div>

          {/* Right: Date + Time or Form */}
          <div className="md:col-span-2">
            {showForm && selectedSlot ? (
              <div className="bg-white rounded-xl border p-6">
                <BookingForm
                  slot={selectedSlot}
                  timezone={timezone}
                  eventTypeId={eventType.id}
                  eventTitle={eventType.title}
                  duration={eventType.duration}
                  onBack={() => setShowForm(false)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border p-4">
                  <h2 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                    Select a date
                  </h2>
                  <DatePicker
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    availableDays={availableDays}
                  />
                </div>

                {selectedDate && (
                  <div className="bg-white rounded-xl border p-4">
                    <h2 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                      {format(selectedDate, "EEEE, MMM d")}
                    </h2>
                    <TimeSlotList
                      slots={slots}
                      timezone={timezone}
                      selected={selectedSlot}
                      onSelect={handleSlotSelect}
                      loading={loadingSlots}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-8">
          Powered by{" "}
          <Link href="/" className="text-primary hover:underline">
            BookingPage
          </Link>
        </p>
      </div>
    </div>
  );
}
