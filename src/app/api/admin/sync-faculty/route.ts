import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { teachers } = await req.json();

    if (!Array.isArray(teachers)) {
      return NextResponse.json({ error: "无效的数据格式" }, { status: 400 });
    }

    // Build lookup maps
    const bnbuByUsername = new Map<string, any>();
    const bnbuByName = new Map<string, any>();

    for (const t of teachers) {
      bnbuByUsername.set(t.username, t);
      const cleanName = t.name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, "").toLowerCase();
      bnbuByName.set(cleanName, t);
      bnbuByName.set(t.name.toLowerCase(), t);
      if (t.name_en) bnbuByName.set(t.name_en.toLowerCase(), t);
    }

    // Get all CoursePicker teachers
    const cpTeachers = await prisma.teacher.findMany();

    let matched = 0;
    let notFound = 0;

    for (const teacher of cpTeachers) {
      let bnbuTeacher: any;

      // Try by username
      if (teacher.bnbuUsername) {
        bnbuTeacher = bnbuByUsername.get(teacher.bnbuUsername);
      }

      // Try by name
      if (!bnbuTeacher) {
        bnbuTeacher = bnbuByName.get(teacher.name.toLowerCase());
      }

      if (bnbuTeacher) {
        await prisma.teacher.update({
          where: { id: teacher.id },
          data: {
            status: "ACTIVE",
            bnbuUsername: bnbuTeacher.username,
            title: bnbuTeacher.teacher_title?.title_en || bnbuTeacher.teacher_title?.title || teacher.title,
          },
        });
        matched++;
      } else {
        await prisma.teacher.update({
          where: { id: teacher.id },
          data: { status: "LEFT" },
        });
        notFound++;
      }
    }

    return NextResponse.json({
      matched,
      notFound,
      total: cpTeachers.length,
      bnbuTotal: teachers.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
