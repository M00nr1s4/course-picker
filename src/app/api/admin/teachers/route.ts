import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const { name, title, majorId } = await req.json();
  if (!name?.trim() || !majorId) return NextResponse.json({ error: "老师姓名和专业不能为空" }, { status: 400 });
  const teacher = await prisma.teacher.create({ data: { name, title: title || "讲师", majorId } });
  return NextResponse.json(teacher, { status: 201 });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const cnt = await prisma.course.count({ where: { teacherId: id } });
  if (cnt > 0) return NextResponse.json({ error: `该老师还有 ${cnt} 门课程，请先删除课程` }, { status: 400 });
  await prisma.teacher.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
