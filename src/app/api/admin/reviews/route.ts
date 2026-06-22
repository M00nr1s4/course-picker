import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") || "PENDING";
  const reviews = await prisma.review.findMany({
    where: { status: status as any },
    include: {
      user: { select: { name: true, email: true } },
      teacher: { select: { name: true, title: true } },
      course: { select: { name: true, code: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(
    reviews.map((r) => ({
      id: r.id, userName: r.user.name, userEmail: r.user.email,
      teacherName: r.teacher.name, teacherTitle: r.teacher.title,
      courseName: r.course.name, courseCode: r.course.code,
      teachingAttitude: r.teachingAttitude, clarity: r.clarity,
      workloadReasonableness: r.workloadReasonableness, gradingFriendliness: r.gradingFriendliness,
      comment: r.comment, createdAt: r.createdAt.toISOString(),
    }))
  );
}
