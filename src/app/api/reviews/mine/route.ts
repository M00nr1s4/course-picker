import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
export const dynamic = "force-dynamic";
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const reviews = await prisma.review.findMany({
    where: { userId: (session.user as any).id },
    include: { teacher: { select: { name: true } }, course: { select: { name: true, code: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    reviews.map((r) => ({
      id: r.id, teacherName: r.teacher.name, courseName: r.course.name, courseCode: r.course.code,
      teachingAttitude: r.teachingAttitude, clarity: r.clarity,
      workloadReasonableness: r.workloadReasonableness, gradingFriendliness: r.gradingFriendliness,
      comment: r.comment, status: r.status, createdAt: r.createdAt.toISOString(),
    }))
  );
}
