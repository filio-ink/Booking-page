"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SlotInterval } from "@/types";
import { toZonedTime, format as formatTz } from "date-fns-tz";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Valid email required"),
  notes: z.string().max(500).optional(),
});
type FormData = z.infer<typeof schema>;

interface BookingFormProps {
  slot: SlotInterval;
  timezone: string;
  eventTypeId: string;
  eventTitle: string;
  duration: number;
  onBack: () => void;
}

export function BookingForm({
  slot,
  timezone,
  eventTypeId,
  eventTitle,
  duration,
  onBack,
}: BookingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const startDate = toZonedTime(new Date(slot.startUtc), timezone);
  const dateLabel = formatTz(startDate, "EEEE, MMMM d, yyyy", { timeZone: timezone });
  const timeLabel = formatTz(startDate, "h:mm a", { timeZone: timezone });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventTypeId,
        guestName: data.name,
        guestEmail: data.email,
        startTimeUtc: slot.startUtc,
        endTimeUtc: slot.endUtc,
        notes: data.notes || undefined,
        guestTimezone: timezone,
      }),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(
        typeof json.error === "object"
          ? Object.values(json.error).flat().join(", ")
          : json.error ?? "Something went wrong"
      );
      setLoading(false);
      return;
    }

    const { bookingId } = await res.json();
    router.push(`/booking/success?id=${bookingId}&tz=${encodeURIComponent(timezone)}`);
  };

  return (
    <div className="space-y-5">
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
          <div className="font-semibold">{eventTitle}</div>
          <div className="text-muted-foreground">{duration} min · {dateLabel}</div>
          <div className="font-medium text-primary">{timeLabel}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" placeholder="Jane Smith" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="email">Email address</Label>
          <Input id="email" type="email" placeholder="jane@example.com" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="notes">Additional notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Anything you'd like me to know..."
            rows={3}
            {...register("notes")}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Booking..." : "Confirm booking"}
        </Button>
      </form>
    </div>
  );
}
