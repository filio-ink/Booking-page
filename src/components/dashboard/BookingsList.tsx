"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Mail, User } from "lucide-react";
import { toZonedTime, format as formatTz } from "date-fns-tz";

interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  status: string;
  eventType: {
    title: string;
    duration: number;
    color: string;
  };
}

export function BookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then(setBookings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="font-medium">No upcoming bookings</p>
        <p className="text-sm">Share your booking link to start receiving meetings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => {
        const startLocal = toZonedTime(new Date(booking.startTime), userTimezone);
        const endLocal = toZonedTime(new Date(booking.endTime), userTimezone);

        const dateStr = formatTz(startLocal, "EEEE, MMMM d, yyyy", { timeZone: userTimezone });
        const timeStr = `${formatTz(startLocal, "h:mm a", { timeZone: userTimezone })} – ${formatTz(endLocal, "h:mm a", { timeZone: userTimezone })}`;

        return (
          <Card key={booking.id} className="overflow-hidden">
            <div className="h-1" style={{ backgroundColor: booking.eventType.color }} />
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{booking.eventType.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {booking.eventType.duration} min
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    <span>{booking.guestName}</span>
                    <span>·</span>
                    <Mail className="h-3.5 w-3.5" />
                    <span>{booking.guestEmail}</span>
                  </div>
                  {booking.notes && (
                    <p className="text-sm text-muted-foreground italic">
                      &ldquo;{booking.notes}&rdquo;
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-sm font-medium justify-end">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{dateStr}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground justify-end mt-0.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{timeStr}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
