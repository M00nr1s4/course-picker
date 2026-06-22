import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const teacher = await prisma.teacher.findUnique({
    where: { id: params.id },
    include: {
      major: true,
      courses: true,
      reviews: {
        where: { status: "APPROVED" },
        select: { teachingAttitude: true, clarity: true, workloadReasonableness: true, gradingFriendliness: true },
      },
    },
  });

  if (!teacher) return NextResponse.json({ error: "老师不存在" }, { status: 404 });

  const r = teacher.reviews;
  const count = r.length;
  const avg = (f: "teachingAttitude" | "clarity" | "workloadReasonableness" | "gradingFriendliness") =>
    count > 0 ? Math.round((r.reduce((s, x) => s + x[f], 0) / count) * 10) / 10 : null;

  const overall = count > 0
    ? Math.round(r.reduce((s, x) => s + x.teachingAttitude + x.clarity + x.workloadReasonableness + x.gradingFriendliness, 0) / (count * 4) * 10) / 10
    : null;

  return NextResponse.json({
    id: teacher.id, name: teacher.name, title: teacher.title,
    majorId: teacher.majorId, majorName: teacher.major.name,
    courses: teacher.courses.map((c) => ({ id: c.id, name: c.name, code: c.code })),
    avgRatings: {
      teachingAttitude: avg("teachingAttitude"), clarity: avg("clarity"),
      workloadReasonableness: avg("workloadReasonableness"), gradingFriendliness: avg("gradingFriendliness"),
      overall,
    },
    reviewCount: count,
  });
}
