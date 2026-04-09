
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  name: z.string().min(1).max(100).optional(),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { username, name } = parsed.data;

  // Check uniqueness (exclude current user)
  const existing = await prisma.user.findFirst({
    where: { username, NOT: { id: session.user.id } },
  });
  if (existing) {
    return NextResponse.json(
      { error: { username: ["Username is already taken"] } },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { username, ...(name ? { name } : {}) },
    select: { id: true, username: true, name: true, email: true },
  });

  return NextResponse.json(user);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, username: true, name: true, email: true, image: true },
  });

  return NextResponse.json(user);
}
