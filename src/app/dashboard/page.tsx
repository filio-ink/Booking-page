import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookingsList } from "@/components/dashboard/BookingsList";
import { CopyLinkButton } from "@/components/shared/CopyLinkButton";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, name: true },
  });

  if (!user?.username) redirect("/dashboard/settings");

  const bookingPageUrl = `${process.env.NEXTAUTH_URL}/${user.username}`;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Upcoming meetings</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.name ?? session.user.email}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CopyLinkButton url={bookingPageUrl} />
          <Link
            href={`/${user.username}`}
            target="_blank"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            View page
          </Link>
        </div>
      </div>
      <BookingsList />
    </div>
  );
}
