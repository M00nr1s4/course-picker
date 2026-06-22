import { NextRequest, NextResponse } from "next/server";
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
  teacher_title: { title: string; title_en: string; admin_title: string; admin_title_en: string };
}

async function fetchAllBNBUTeachers(): Promise<BNBUTeacher[]> {
  const all: BNBUTeacher[] = [];
  let page = 0;
  let lastPage = 1;
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

// GET: sync existing teachers + return unmatched BNBU teachers
export async function GET() {
  try {
    const bnbuTeachers = await fetchAllBNBUTeachers();
    if (bnbuTeachers.length === 0) {
      return NextResponse.json({ error: "没有获取到 BNBU 教师数据" }, { status: 500 });
    }

    const bnbuByUsername = new Map<string, BNBUTeacher>();
    const bnbuByName = new Map<string, BNBUTeacher>();
    for (const t of bnbuTeachers) {
      bnbuByUsername.set(t.username, t);
      bnbuByName.set(t.name.toLowerCase(), t);
      bnbuByName.set(t.name_en?.toLowerCase(), t);
      bnbuByName.set(t.name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, "").toLowerCase(), t);
    }

    const cpTeachers = await prisma.teacher.findMany();
    const matchedUsernames = new Set<string>();
    let matched = 0;
    let notFound = 0;

    for (const teacher of cpTeachers) {
      let bt = teacher.bnbuUsername ? bnbuByUsername.get(teacher.bnbuUsername) : undefined;
      if (!bt) bt = bnbuByName.get(teacher.name.toLowerCase());

      if (bt) {
        matchedUsernames.add(bt.username);
        await prisma.teacher.update({
          where: { id: teacher.id },
          data: {
            status: "ACTIVE",
            bnbuUsername: bt.username,
            title: bt.teacher_title?.title_en || bt.teacher_title?.title || teacher.title,
          },
        });
        matched++;
      } else {
        if (teacher.status !== "LEFT") {
          await prisma.teacher.update({ where: { id: teacher.id }, data: { status: "LEFT" } });
        }
        notFound++;
      }
    }

    const unmatched = bnbuTeachers.filter((t) => !matchedUsernames.has(t.username));

    return NextResponse.json({
      matched,
      notFound,
      total: cpTeachers.length,
      bnbuTotal: bnbuTeachers.length,
      unmatched: unmatched.slice(0, 200), // return first 200 for display
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST: import selected BNBU teachers
export async function POST(req: NextRequest) {
  try {
    const { usernames, majorId } = await req.json();

    if (!Array.isArray(usernames) || usernames.length === 0) {
      return NextResponse.json({ error: "请选择要导入的老师" }, { status: 400 });
    }
    if (!majorId) {
      return NextResponse.json({ error: "请选择专业" }, { status: 400 });
    }

    // Verify major exists
    const major = await prisma.major.findUnique({ where: { id: majorId } });
    if (!major) {
      return NextResponse.json({ error: "专业不存在" }, { status: 400 });
    }

    // Fetch BNBU teachers
    const bnbuTeachers = await fetchAllBNBUTeachers();
    const toImport = bnbuTeachers.filter((t) => usernames.includes(t.username));

    let imported = 0;
    for (const bt of toImport) {
      // Check if already exists
      const exists = await prisma.teacher.findFirst({
        where: { OR: [{ bnbuUsername: bt.username }, { name: bt.name }] },
      });
      if (exists) continue;

      await prisma.teacher.create({
        data: {
          name: bt.name,
          bnbuUsername: bt.username,
          title: bt.teacher_title?.title_en || bt.teacher_title?.title || bt.title || "Faculty",
          majorId: majorId,
          status: "ACTIVE",
        },
      });
      imported++;
    }

    return NextResponse.json({ imported, total: toImport.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
