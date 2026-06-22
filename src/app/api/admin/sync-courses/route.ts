import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BNBU_BASE = "https://staff.bnbu.edu.cn";
const PAGE_SIZE = 200;

interface BNBUTeacher {
  id: number; name: string; name_en: string; email: string;
  username: string; title: string;
  info: { cn?: { academic?: string }; en?: { academic?: string } };
}

async function fetchAllBNBUTeachers(): Promise<BNBUTeacher[]> {
  const all: BNBUTeacher[] = [];
  let page = 0, lastPage = 1;
  while (page <= lastPage) {
    const url = `${BNBU_BASE}/teacher/teacher/list?access-token=&lang=cn&page=${page}&pageSize=${PAGE_SIZE}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.code !== 0) throw new Error(`BNBU API error at page ${page}`);
    all.push(...json.data.data);
    lastPage = json.data.last_page;
    page++;
  }
  return all;
}

function parseCourses(text: string | null | undefined): string[] {
  if (!text || !text.trim()) return [];
  return text.split("\n")
    .map((s) => s.replace(/^[•●\-]\s*/, "").trim())
    .filter((s) => s.length > 0 && s.length < 100);
}

export async function GET() {
  try {
    const bnbuTeachers = await fetchAllBNBUTeachers();
    if (bnbuTeachers.length === 0) {
      return NextResponse.json({ error: "没有获取到 BNBU 数据" }, { status: 500 });
    }

    // Build a lookup by username
    const bnbuByUsername = new Map(bnbuTeachers.map((t) => [t.username, t]));

    // Get all teachers in CoursePicker that have a bnbuUsername
    const cpTeachers = await prisma.teacher.findMany({
      where: { bnbuUsername: { not: null } },
      include: { courses: true },
    });

    let coursesCreated = 0;
    let coursesSkipped = 0;
    let teachersWithCourses = 0;
    const results: string[] = [];

    for (const teacher of cpTeachers) {
      if (!teacher.bnbuUsername) continue;

      const bnbuTeacher = bnbuByUsername.get(teacher.bnbuUsername);
      if (!bnbuTeacher) continue;

      // Parse courses from academic fields
      const cnCourses = parseCourses(bnbuTeacher.info?.cn?.academic);
      const enCourses = parseCourses(bnbuTeacher.info?.en?.academic);
      const allCourseNames = Array.from(new Set([...cnCourses, ...enCourses]));

      if (allCourseNames.length === 0) continue;

      const existingNames = new Set(teacher.courses.map((c) => c.name));
      let created = 0;
      let skipped = 0;

      for (let i = 0; i < allCourseNames.length; i++) {
        const courseName = allCourseNames[i];
        if (existingNames.has(courseName)) {
          skipped++;
          continue;
        }

        // Check if any other teacher already has this course
        const existingCourse = await prisma.course.findFirst({
          where: { name: courseName, teacherId: teacher.id },
        });
        if (existingCourse) { skipped++; continue; }

        const code = `BNBU-${teacher.bnbuUsername.slice(0, 8)}-${String(i + 1).padStart(2, "0")}`;

        await prisma.course.create({
          data: { name: courseName, code, teacherId: teacher.id },
        });
        created++;
      }

      if (created > 0) {
        teachersWithCourses++;
        coursesCreated += created;
        coursesSkipped += skipped;
        results.push(`${teacher.name}: +${created} 门课程`);
      }
    }

    return NextResponse.json({
      coursesCreated,
      coursesSkipped,
      teachersWithCourses,
      totalTeachers: cpTeachers.length,
      results: results.slice(0, 20),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
