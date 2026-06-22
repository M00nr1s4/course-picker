import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const { name, code, teacherId } = await req.json();
  if (!name?.trim() || !code?.trim() || !teacherId)
    return NextResponse.json({ error: "课程名称、代码和授课老师不能为空" }, { status: 400 });
  const course = await prisma.course.create({ data: { name, code, teacherId } });
  return NextResponse.json(course, { status: 201 });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const cnt = await prisma.review.count({ where: { courseId: id } });
  if (cnt > 0) return NextResponse.json({ error: `该课程下有 ${cnt} 条评价，无法删除` }, { status: 400 });
  await prisma.course.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
