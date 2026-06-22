import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
export const dynamic = "force-dynamic";
  const sort = req.nextUrl.searchParams.get("sort") || "name";
  const teachers = await prisma.teacher.findMany({
    where: { majorId: params.id },
    include: {
      reviews: {
        where: { status: "APPROVED" },
        select: { teachingAttitude: true, clarity: true, workloadReasonableness: true, gradingFriendliness: true },
      },
      _count: { select: { reviews: { where: { status: "APPROVED" } } } },
    },
  });

  const result = teachers.map((t) => {
    const r = t.reviews;
    const avg = r.length > 0
      ? Math.round(r.reduce((s, x) => s + x.teachingAttitude + x.clarity + x.workloadReasonableness + x.gradingFriendliness, 0) / (r.length * 4) * 10) / 10
      : null;
    return { id: t.id, name: t.name, title: t.title, majorId: t.majorId, majorName: "", avgRating: avg, reviewCount: t._count.reviews };
  });

  if (sort === "rating") result.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
  return NextResponse.json(result);
}
