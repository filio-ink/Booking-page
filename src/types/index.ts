export interface SlotInterval {
  startUtc: string;
  endUtc: string;
}

export interface AvailabilityDay {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isActive: boolean;
}

export interface EventTypePublic {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  slug: string;
  color: string;
}

export interface BookingWithEventType {
  id: string;
  guestName: string;
  guestEmail: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  status: string;
  createdAt: string;
  eventType: {
    id: string;
    title: string;
    duration: number;
    color: string;
    user: {
      name: string | null;
      username: string | null;
    };
  };
}

export interface BusyInterval {
  start: Date;
  end: Date;
}
