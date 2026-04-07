"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

const TIMEZONES: string[] = (() => {
  try {
    return (Intl as unknown as { supportedValuesOf: (key: string) => string[] })
      .supportedValuesOf("timeZone");
  } catch {
    return ["UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Asia/Tokyo"];
  }
})();

interface TimezoneDisplayProps {
  timezone: string;
  onChange: (tz: string) => void;
}

export function TimezoneDisplay({ timezone, onChange }: TimezoneDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
      <Select value={timezone} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-xs border-none shadow-none p-0 focus:ring-0 w-auto gap-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {TIMEZONES.map((tz) => (
            <SelectItem key={tz} value={tz} className="text-xs">
              {tz}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
