import { prisma } from "@/lib/prisma";
import { toZonedTime, format as formatTz } from "date-fns-tz";
import Link from "next/link";
import { CheckCircle2, Calendar, Clock, User, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: { id?: string; tz?: string };
}) {
  const timezone = searchParams.tz ?? "UTC";

  if (!searchParams.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Booking not found.</p>
      </div>
    );
  }

  const booking = await prisma.booking.findUnique({
    where: { id: searchParams.id },
    include: {
      eventType: {
        select: {
          title: true,
          duration: true,
          color: true,
          user: { select: { name: true, email: true, username: true } },
        },
      },
    },
  });

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Booking not found.</p>
      </div>
    );
  }

  const startLocal = toZonedTime(booking.startTime, timezone);
  const endLocal = toZonedTime(booking.endTime, timezone);
  const dateStr = formatTz(startLocal, "EEEE, MMMM d, yyyy", { timeZone: timezone });
  const timeStr = `${formatTz(startLocal, "h:mm a", { timeZone: timezone })} – ${formatTz(endLocal, "h:mm a", { timeZone: timezone })}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500 mb-4">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">You&apos;re scheduled!</h1>
          <p className="text-muted-foreground mt-2">
            A confirmation has been sent to your email.
          </p>
        </div>

        <Card className="overflow-hidden">
          <div className="h-1.5" style={{ backgroundColor: booking.eventType.color }} />
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">{booking.eventType.title}</p>
                  <p className="text-sm text-muted-foreground">{dateStr}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium">{timeStr}</p>
                  <p className="text-xs text-muted-foreground">{timezone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm">{booking.guestName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                <p className="text-sm">{booking.guestEmail}</p>
              </div>
            </div>

            {booking.notes && (
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{booking.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href={`/${booking.eventType.user.username}`}>
            <Button variant="outline">Book another meeting</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
