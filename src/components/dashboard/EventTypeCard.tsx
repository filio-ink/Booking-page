"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EventTypeForm } from "./EventTypeForm";
import { CopyLinkButton } from "@/components/shared/CopyLinkButton";
import { Clock, Edit2, ExternalLink, Trash2 } from "lucide-react";

interface EventType {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  slug: string;
  color: string;
  isActive: boolean;
}

interface EventTypeCardProps {
  eventType: EventType;
  username: string;
  onDelete: (id: string) => void;
  onUpdate: () => void;
}

export function EventTypeCard({
  eventType,
  username,
  onDelete,
  onUpdate,
}: EventTypeCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const bookingUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${username}/${eventType.slug}`;

  const handleDelete = async () => {
    if (!confirm(`Delete "${eventType.title}"?`)) return;
    setDeleting(true);
    await fetch(`/api/event-types/${eventType.id}`, { method: "DELETE" });
    onDelete(eventType.id);
    setDeleting(false);
  };

  return (
    <Card className="overflow-hidden">
      <div className="h-1.5" style={{ backgroundColor: eventType.color }} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base truncate">{eventType.title}</h3>
              {!eventType.isActive && (
                <Badge variant="secondary" className="text-xs">
                  Inactive
                </Badge>
              )}
            </div>
            {eventType.description && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {eventType.description}
              </p>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{eventType.duration} min</span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <CopyLinkButton url={bookingUrl} />
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Event Type</DialogTitle>
                </DialogHeader>
                <EventTypeForm
                  initialData={{ ...eventType, description: eventType.description ?? undefined }}
                  onSuccess={() => {
                    setEditOpen(false);
                    onUpdate();
                  }}
                />
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
