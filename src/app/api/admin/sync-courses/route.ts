import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BNBU_BASE = "https://staff.bnbu.edu.cn";
const PAGE_SIZE = 200;

interface BNBUTeacher {
  id: number; name: string; username: string;
  info?: { cn?: { academic?: string }; en?: { academic?: string } };
}

async function fetchAllBNBUTeachers(): Promise<BNBUTeacher[]> {
  const all: BNBUTeacher[] = [];
  let page = 0, lastPage = 1;
  while (page <= lastPage) {
    const res = await fetch(`${BNBU_BASE}/teacher/teacher/list?access-token=&lang=cn&page=${page}&pageSize=${PAGE_SIZE}`);
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
  return text.split("\n").map(s => s.replace(/^[•●\-]\s*/, "").trim()).filter(s => s.length > 0 && s.length < 100);
}

// GET: sync courses from BNBU teacher info API ("教授课程" field)
export async function GET() {
  try {
    // Get all CoursePicker teachers with bnbuUsername
    const cpTeachers = await prisma.teacher.findMany({
      where: { bnbuUsername: { not: null } },
      include: { courses: true },
    });

    let coursesCreated = 0;
    let coursesSkipped = 0;
    let teachersWithCourses = 0;
    let apiFetched = 0;
    const results: string[] = [];

    
    // Pre-fetch BNBU teacher list once (performance)
    const bnbuList = await fetchAllBNBUTeachers();
    const bnbuByUsername = new Map(bnbuList.map(t => [t.username, t]));

for (const teacher of cpTeachers) {
      if (!teacher.bnbuUsername) continue;

      // Fetch teacher info from BNBU API (form-urlencoded)
      let courseNames: string[] = [];

      try {
        const res = await fetch(`${BNBU_BASE}/api/teacher/v1/teacher/info?access-token=&lang=cn`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded; charset=utf-8" },
          body: new URLSearchParams({ username: teacher.bnbuUsername }).toString(),
        });
        const json = await res.json();

        if (json.code === 0 && json.data?.content) {
          apiFetched++;
          for (const item of json.data.content) {
            if (item.field === "教授课程" || item.field === "courses_taught" || item.field === "教學") {
              courseNames = parseCourses(item.content);
              break;
            }
          }
        }
      } catch (e) {
        console.warn(`Failed to fetch info for ${teacher.bnbuUsername}:`, e);
      }

      // Fallback: parse from pre-fetched list API academic field
      if (courseNames.length === 0) {
        const bt = bnbuByUsername.get(teacher.bnbuUsername);
        if (bt) {
          courseNames = [
            ...parseCourses(bt.info?.cn?.academic),
            ...parseCourses(bt.info?.en?.academic),
          ];
        }
      }

      if (courseNames.length === 0) continue;

      const existingNames = new Set(teacher.courses.map(c => c.name));
      let created = 0;
      let skipped = 0;

      for (let i = 0; i < courseNames.length; i++) {
        const name = courseNames[i];
        if (existingNames.has(name)) { skipped++; continue; }

        const existing = await prisma.course.findFirst({ where: { name, teacherId: teacher.id } });
        if (existing) { skipped++; continue; }

        await prisma.course.create({
          data: {
            name,
            code: `BNBU-${teacher.bnbuUsername!.slice(0, 8)}-${String(i + 1).padStart(2, "0")}`,
            teacherId: teacher.id,
          },
        });
        created++;
      }

      if (created > 0) {
        teachersWithCourses++;
        coursesCreated += created;
        coursesSkipped += skipped;
        results.push(`${teacher.name}: +${created} 门`);
      }
    }

    return NextResponse.json({
      coursesCreated,
      coursesSkipped,
      teachersWithCourses,
      totalTeachers: cpTeachers.length,
      apiFetched,
      results: results.slice(0, 30),
      note: "课程数据来源：BNBU 教师详情页 - 教学栏目",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE: delete all courses
export async function DELETE() {
  try {
    const count = await prisma.course.deleteMany();
    return NextResponse.json({ deleted: count.count });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}