import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BNBU_BASE = "https://staff.bnbu.edu.cn";
const PAGE_SIZE = 200;

interface BNBUTeacher {
  id: number;
  name: string;
  name_en: string;
  email: string;
  username: string;
  title: string;
  teacher_title: {
    title: string;
    title_en: string;
    admin_title: string;
    admin_title_en: string;
  };
  type: number;
  room: string;
}

async function fetchAllBNBUTeachers(): Promise<BNBUTeacher[]> {
  const all: BNBUTeacher[] = [];
  let page = 0;
  let lastPage = 1;

  while (page <= lastPage) {
    const url = `${BNBU_BASE}/teacher/teacher/list?access-token=&lang=cn&page=${page}&pageSize=${PAGE_SIZE}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.code !== 0) {
      throw new Error(`BNBU API error at page ${page}: code=${json.code}`);
    }

    all.push(...json.data.data);
    lastPage = json.data.last_page;
    page++;
  }

  return all;
}

export async function GET() {
  try {
    // Step 1: Fetch all BNBU teachers
    const bnbuTeachers = await fetchAllBNBUTeachers();

    if (bnbuTeachers.length === 0) {
      return NextResponse.json({ error: "没有获取到 BNBU 教师数据" }, { status: 500 });
    }

    // Step 2: Build lookup maps
    const bnbuByUsername = new Map<string, BNBUTeacher>();
    const bnbuByName = new Map<string, BNBUTeacher>();

    for (const t of bnbuTeachers) {
      bnbuByUsername.set(t.username, t);
      const cleanName = t.name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, "").toLowerCase();
      bnbuByName.set(cleanName, t);
      bnbuByName.set(t.name.toLowerCase(), t);
      if (t.name_en) bnbuByName.set(t.name_en.toLowerCase(), t);
    }

    // Step 3: Get all CoursePicker teachers
    const cpTeachers = await prisma.teacher.findMany();

    let matched = 0;
    let notFound = 0;

    for (const teacher of cpTeachers) {
      let bnbuTeacher: BNBUTeacher | undefined;

      if (teacher.bnbuUsername) {
        bnbuTeacher = bnbuByUsername.get(teacher.bnbuUsername);
      }

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
        if (teacher.status !== "LEFT") {
          await prisma.teacher.update({
            where: { id: teacher.id },
            data: { status: "LEFT" },
          });
        }
        notFound++;
      }
    }

    return NextResponse.json({
      matched,
      notFound,
      total: cpTeachers.length,
      bnbuTotal: bnbuTeachers.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}