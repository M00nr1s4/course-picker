import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const feedbacks = await prisma.feedback.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    feedbacks.map((f) => ({
      id: f.id,
      userName: f.user.name,
      userEmail: f.user.email,
      content: f.content,
      createdAt: f.createdAt.toISOString(),
    }))
  );
}
