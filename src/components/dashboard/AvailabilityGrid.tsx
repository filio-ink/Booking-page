"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DAY_NAMES, TIME_OPTIONS, formatTimeLabel } from "@/lib/utils";

interface AvailabilityDay {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isActive: boolean;
}

const DEFAULT_AVAILABILITY: AvailabilityDay[] = DAY_NAMES.map((_, i) => ({
  dayOfWeek: i,
  startTime: "09:00",
  endTime: "17:00",
  timezone: "UTC",
  isActive: i >= 1 && i <= 5, // Mon-Fri active by default
}));

// Get all IANA timezones supported by the browser
const TIMEZONES: string[] = (() => {
  try {
    return (Intl as unknown as { supportedValuesOf: (key: string) => string[] })
      .supportedValuesOf("timeZone");
  } catch {
    return ["UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Asia/Tokyo"];
  }
})();

export function AvailabilityGrid() {
  const [availability, setAvailability] =
    useState<AvailabilityDay[]>(DEFAULT_AVAILABILITY);
  const [timezone, setTimezone] = useState("UTC");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/availability")
      .then((r) => r.json())
      .then((data: AvailabilityDay[]) => {
        if (data.length > 0) {
          // Merge fetched data into the 7-slot array
          const merged = DEFAULT_AVAILABILITY.map((def) => {
            const found = data.find((d) => d.dayOfWeek === def.dayOfWeek);
            return found ?? def;
          });
          setAvailability(merged);
          setTimezone(data[0]?.timezone ?? "UTC");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateDay = (dayOfWeek: number, patch: Partial<AvailabilityDay>) => {
    setAvailability((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const payload = availability.map((d) => ({ ...d, timezone }));
    await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ availability: payload }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Label className="text-sm font-medium whitespace-nowrap">Timezone</Label>
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger className="w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {TIMEZONES.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {availability.map((day) => (
          <div
            key={day.dayOfWeek}
            className="flex items-center gap-4 p-3 rounded-lg border bg-card"
          >
            <Switch
              checked={day.isActive}
              onCheckedChange={(v) => updateDay(day.dayOfWeek, { isActive: v })}
            />
            <span className="w-24 text-sm font-medium">
              {DAY_NAMES[day.dayOfWeek]}
            </span>

            {day.isActive ? (
              <div className="flex items-center gap-2">
                <Select
                  value={day.startTime}
                  onValueChange={(v) => updateDay(day.dayOfWeek, { startTime: v })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {TIME_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {formatTimeLabel(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground text-sm">to</span>
                <Select
                  value={day.endTime}
                  onValueChange={(v) => updateDay(day.dayOfWeek, { endTime: v })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {TIME_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {formatTimeLabel(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Unavailable</span>
            )}
          </div>
        ))}
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : saved ? "Saved!" : "Save availability"}
      </Button>
    </div>
  );
}
