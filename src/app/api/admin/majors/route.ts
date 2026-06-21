import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "专业名称不能为空" }, { status: 400 });
  const existing = await prisma.major.findUnique({ where: { name } });
  if (existing) return NextResponse.json({ error: "该专业已存在" }, { status: 409 });
  const major = await prisma.major.create({ data: { name } });
  return NextResponse.json(major, { status: 201 });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const cnt = await prisma.teacher.count({ where: { majorId: id } });
  if (cnt > 0) return NextResponse.json({ error: `该专业下还有 ${cnt} 位老师，无法删除` }, { status: 400 });
  await prisma.major.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
