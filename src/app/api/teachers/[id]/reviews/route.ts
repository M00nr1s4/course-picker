import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const reviews = await prisma.review.findMany({
    where: { teacherId: params.id, status: "APPROVED" },
    include: { user: { select: { name: true } }, course: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    reviews.map((r) => ({
      id: r.id, userName: r.user.name, courseName: r.course.name,
      teachingAttitude: r.teachingAttitude, clarity: r.clarity,
      workloadReasonableness: r.workloadReasonableness, gradingFriendliness: r.gradingFriendliness,
      comment: r.comment, createdAt: r.createdAt.toISOString(),
    }))
  );
}
