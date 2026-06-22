import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
export const dynamic = "force-dynamic";
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  try {
    const { teacherId, courseId, teachingAttitude, clarity, workloadReasonableness, gradingFriendliness, comment } = await req.json();
    if (!teacherId || !courseId) return NextResponse.json({ error: "请选择老师和课程" }, { status: 400 });

    const ratings = [teachingAttitude, clarity, workloadReasonableness, gradingFriendliness];
    for (const r of ratings) {
      if (!Number.isInteger(r) || r < 1 || r > 5) return NextResponse.json({ error: "评分必须在1-5之间" }, { status: 400 });
    }

    const course = await prisma.course.findFirst({ where: { id: courseId, teacherId } });
    if (!course) return NextResponse.json({ error: "该课程不属于所选老师" }, { status: 400 });

    const existing = await prisma.review.findUnique({
      where: { userId_teacherId_courseId: { userId: (session.user as any).id, teacherId, courseId } },
    });
    if (existing) return NextResponse.json({ error: "你已经评价过该老师的这门课程" }, { status: 409 });

    const review = await prisma.review.create({
      data: {
        userId: (session.user as any).id, teacherId, courseId,
        teachingAttitude, clarity, workloadReasonableness, gradingFriendliness,
        comment: comment || "",
      },
    });

    return NextResponse.json({ review: { id: review.id, status: review.status } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "提交失败" }, { status: 500 });
  }
}
