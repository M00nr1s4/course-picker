import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BASE_URL = "https://staff.bnbu.edu.cn";
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
  unit_ids?: number[];
}

interface BNBUResponse {
  code: number;
  data: {
    data: BNBUTeacher[];
    total: number;
    last_page: number;
    current_page: number;
  };
}

async function fetchAllTeachers(): Promise<BNBUTeacher[]> {
  const all: BNBUTeacher[] = [];
  let page = 0;
  let lastPage = 1;

  while (page <= lastPage) {
    const url = `${BASE_URL}/teacher/teacher/list?access-token=&lang=cn&page=${page}&pageSize=${PAGE_SIZE}`;
    const res = await fetch(url);
    const json: BNBUResponse = await res.json();

    if (json.code !== 0) {
      console.error(`API error at page ${page}:`, json);
      break;
    }

    all.push(...json.data.data);
    lastPage = json.data.last_page;
    console.log(`  Fetched page ${page + 1}/${lastPage + 1} (${json.data.data.length} teachers)`);
    page++;
  }

  return all;
}

async function sync() {
  console.log("Starting BNBU faculty sync...\n");

  // Step 1: Fetch all teachers from BNBU
  console.log("Fetching teacher list from BNBU...");
  const bnbuTeachers = await fetchAllTeachers();
  console.log(`  Total: ${bnbuTeachers.length} teachers\n`);

  // Step 2: Build lookup maps
  const bnbuByUsername = new Map<string, BNBUTeacher>();
  const bnbuByEmail = new Map<string, BNBUTeacher>();
  const bnbuByName = new Map<string, BNBUTeacher>();

  for (const t of bnbuTeachers) {
    bnbuByUsername.set(t.username, t);
    if (t.email) bnbuByEmail.set(t.email.toLowerCase(), t);
    // Also index names without prefix/title for better matching
    const cleanName = t.name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, "").toLowerCase();
    bnbuByName.set(cleanName, t);
    bnbuByName.set(t.name.toLowerCase(), t);
    if (t.name_en) bnbuByName.set(t.name_en.toLowerCase(), t);
  }

  // Step 3: Get all teachers from CoursePicker
  const cpTeachers = await prisma.teacher.findMany({
    include: { courses: true },
  });
  console.log(`CoursePicker has ${cpTeachers.length} teachers\n`);

  // Step 4: Match and update
  let matched = 0;
  let notFound = 0;
  let skipped = 0;

  for (const teacher of cpTeachers) {
    let bnbuTeacher: BNBUTeacher | undefined;

    // Try matching by bnbuUsername (most reliable)
    if (teacher.bnbuUsername) {
      bnbuTeacher = bnbuByUsername.get(teacher.bnbuUsername);
    }

    // Try matching by name
    if (!bnbuTeacher) {
      const nameLower = teacher.name.toLowerCase();
      bnbuTeacher = bnbuByName.get(nameLower);
    }

    if (bnbuTeacher) {
      // Update status to ACTIVE and store username
      await prisma.teacher.update({
        where: { id: teacher.id },
        data: {
          status: "ACTIVE",
          bnbuUsername: bnbuTeacher.username,
          title: bnbuTeacher.teacher_title?.title_en || bnbuTeacher.teacher_title?.title || teacher.title,
        },
      });
      matched++;
      console.log(`  ✓ MATCHED: ${teacher.name} → ${bnbuTeacher.name} (${bnbuTeacher.email})`);
    } else {
      // Mark as LEFT if teacher exists in CoursePicker but not in BNBU
      if (teacher.status !== "LEFT") {
        await prisma.teacher.update({
          where: { id: teacher.id },
          data: { status: "LEFT" },
        });
        console.log(`  ✗ LEFT: ${teacher.name} - not found in BNBU faculty list`);
      } else {
        skipped++;
      }
      notFound++;
    }
  }

  console.log(`\nSync complete!`);
  console.log(`  Matched (active): ${matched}`);
  console.log(`  Not found (left): ${notFound}`);
  console.log(`  Already marked left: ${skipped}`);
  console.log(`  Total BNBU teachers: ${bnbuTeachers.length}`);
  console.log(`  Total CoursePicker teachers: ${cpTeachers.length}`);
}

sync()
  .catch((e) => {
    console.error("Sync failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
