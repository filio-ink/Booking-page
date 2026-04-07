"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EventTypeCard } from "@/components/dashboard/EventTypeCard";
import { EventTypeForm } from "@/components/dashboard/EventTypeForm";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";

interface EventType {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  slug: string;
  color: string;
  isActive: boolean;
}

export default function EventTypesPage() {
  const { data: session } = useSession();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchEventTypes = () => {
    fetch("/api/event-types")
      .then((r) => r.json())
      .then(setEventTypes)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const username = session?.user?.username ?? "";

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Event Types</h1>
          <p className="text-muted-foreground mt-1">
            Create different meeting types for guests to book.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New event type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Event Type</DialogTitle>
            </DialogHeader>
            <EventTypeForm
              onSuccess={() => {
                setCreateOpen(false);
                fetchEventTypes();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : eventTypes.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
          <p className="font-medium mb-1">No event types yet</p>
          <p className="text-sm mb-4">Create your first event type to start accepting bookings.</p>
          <Button onClick={() => setCreateOpen(true)} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Create event type
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {eventTypes.map((et) => (
            <EventTypeCard
              key={et.id}
              eventType={et}
              username={username}
              onDelete={(id) =>
                setEventTypes((prev) => prev.filter((e) => e.id !== id))
              }
              onUpdate={fetchEventTypes}
            />
          ))}
        </div>
      )}
    </div>
  );
}
