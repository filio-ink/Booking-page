import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BookingPageClient } from "./BookingPageClient";

export default async function BookingPage({
  params,
}: {
  params: { username: string; slug: string };
}) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: { id: true, name: true, image: true, username: true },
  });
  if (!user) notFound();

  const eventType = await prisma.eventType.findFirst({
    where: { userId: user.id, slug: params.slug, isActive: true },
  });
  if (!eventType) notFound();

  const availability = await prisma.availability.findMany({
    where: { userId: user.id, isActive: true },
    select: { dayOfWeek: true },
  });

  const availableDays = availability.map((a) => a.dayOfWeek);

  return (
    <BookingPageClient
      username={params.username}
      eventType={{
        id: eventType.id,
        title: eventType.title,
        description: eventType.description,
        duration: eventType.duration,
        slug: eventType.slug,
        color: eventType.color,
      }}
      host={{ name: user.name, image: user.image }}
      availableDays={availableDays}
    />
  );
}
