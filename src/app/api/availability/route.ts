import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { NextResponse } from "next/server";

const availabilityDaySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  timezone: z.string(),
  isActive: z.boolean(),
});

const saveSchema = z.object({
  availability: z.array(availabilityDaySchema),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const availability = await prisma.availability.findMany({
    where: { userId: session.user.id },
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json(availability);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { availability } = parsed.data;

  // Replace all availability rows in a transaction
  const rows = await prisma.$transaction(async (tx) => {
    await tx.availability.deleteMany({ where: { userId: session.user.id } });
    await tx.availability.createMany({
      data: availability.map((day) => ({
        userId: session.user.id,
        ...day,
      })),
    });
    return tx.availability.findMany({
      where: { userId: session.user.id },
      orderBy: { dayOfWeek: "asc" },
    });
  });

  return NextResponse.json(rows);
}
