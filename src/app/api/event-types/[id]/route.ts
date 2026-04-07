import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { NextResponse } from "next/server";

const updateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  duration: z.number().int().min(5).max(480).optional(),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  isActive: z.boolean().optional(),
});

async function getEventType(id: string, userId: string) {
  return prisma.eventType.findFirst({ where: { id, userId } });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const eventType = await getEventType(params.id, session.user.id);
  if (!eventType) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Check slug uniqueness if changing slug
  if (parsed.data.slug && parsed.data.slug !== eventType.slug) {
    const existing = await prisma.eventType.findFirst({
      where: {
        userId: session.user.id,
        slug: parsed.data.slug,
        NOT: { id: params.id },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: { slug: ["You already have an event type with this URL"] } },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.eventType.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const eventType = await getEventType(params.id, session.user.id);
  if (!eventType) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.eventType.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
