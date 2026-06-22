import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
export const dynamic = "force-dynamic";
  const teacherId = req.nextUrl.searchParams.get("teacherId");
  const courses = await prisma.course.findMany({
    where: teacherId ? { teacherId } : {},
    include: { teacher: { select: { name: true } } },
    orderBy: { code: "asc" },
  });
  return NextResponse.json(
    courses.map((c) => ({ id: c.id, name: c.name, code: c.code, teacherId: c.teacherId, teacherName: c.teacher.name }))
  );
}
