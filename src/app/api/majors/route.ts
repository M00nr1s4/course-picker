import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export async function GET() {
  const majors = await prisma.major.findMany({
    include: { _count: { select: { teachers: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(
    majors.map((m) => ({ id: m.id, name: m.name, teacherCount: m._count.teachers }))
  );
}

