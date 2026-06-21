import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  if (!q.trim()) return NextResponse.json({ teachers: [], courses: [], majors: [] });

  const [teachers, courses, majors] = await Promise.all([
    prisma.teacher.findMany({
      where: { name: { contains: q } },
      include: { major: { select: { name: true } } },
    }),
    prisma.course.findMany({
      where: { OR: [{ name: { contains: q } }, { code: { contains: q } }] },
      include: { teacher: { select: { name: true } } },
    }),
    prisma.major.findMany({ where: { name: { contains: q } } }),
  ]);

  return NextResponse.json({
    teachers: teachers.map((t) => ({
      id: t.id, name: t.name, title: t.title, majorId: t.majorId, majorName: t.major.name, avgRating: null, reviewCount: 0,
    })),
    courses: courses.map((c) => ({ id: c.id, name: c.name, code: c.code, teacherName: c.teacher.name })),
    majors: majors.map((m) => ({ id: m.id, name: m.name })),
  });
}
