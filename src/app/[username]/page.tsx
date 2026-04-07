import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar } from "lucide-react";

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      name: true,
      image: true,
      username: true,
      eventTypes: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          duration: true,
          slug: true,
          color: true,
        },
      },
    },
  });

  if (!user) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-10">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name ?? ""}
              className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-md">
              <span className="text-2xl font-bold text-white">
                {(user.name ?? params.username)[0].toUpperCase()}
              </span>
            </div>
          )}
          <h1 className="text-2xl font-bold">{user.name ?? params.username}</h1>
          <p className="text-muted-foreground mt-1">Select a meeting type to book time</p>
        </div>

        {/* Event Types */}
        {user.eventTypes.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No meeting types available yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {user.eventTypes.map((et) => (
              <Link
                key={et.id}
                href={`/${params.username}/${et.slug}`}
                className="block group"
              >
                <Card className="overflow-hidden border hover:shadow-md transition-shadow cursor-pointer">
                  <div className="h-1.5" style={{ backgroundColor: et.color }} />
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-semibold text-base group-hover:text-primary transition-colors">
                          {et.title}
                        </h2>
                        {et.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {et.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{et.duration} min</span>
                        </div>
                      </div>
                      <div className="text-muted-foreground group-hover:text-primary transition-colors ml-4">
                        →
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground mt-10">
          Powered by{" "}
          <Link href="/" className="text-primary hover:underline">
            BookingPage
          </Link>
        </p>
      </div>
    </div>
  );
}
