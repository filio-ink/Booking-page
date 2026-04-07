import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { NextResponse } from "next/server";
import { generateSlug } from "@/lib/utils";

const createSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  duration: z.number().int().min(5).max(480),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const eventTypes = await prisma.eventType.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(eventTypes);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { title, description, duration, color } = parsed.data;
  const slug = parsed.data.slug || generateSlug(title);

  // Ensure slug uniqueness for this user
  const existing = await prisma.eventType.findUnique({
    where: { userId_slug: { userId: session.user.id, slug } },
  });
  if (existing) {
    return NextResponse.json(
      { error: { slug: ["You already have an event type with this URL"] } },
      { status: 400 }
    );
  }

  const eventType = await prisma.eventType.create({
    data: {
      userId: session.user.id,
      title,
      description,
      duration,
      slug,
      color: color ?? "#3B82F6",
    },
  });

  return NextResponse.json(eventType, { status: 201 });
}
