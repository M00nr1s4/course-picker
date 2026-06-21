import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.review.deleteMany();
  await prisma.course.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.major.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: { email: "admin@coursepicker.com", name: "管理员", password: adminPassword, role: "ADMIN" },
  });

  const studentPwd = await bcrypt.hash("student123", 10);
  const student = await prisma.user.create({
    data: { email: "student@test.com", name: "测试学生", password: studentPwd, role: "STUDENT" },
  });

  const cs = await prisma.major.create({ data: { name: "计算机科学与技术" } });
  const math = await prisma.major.create({ data: { name: "数学与应用数学" } });
  const eng = await prisma.major.create({ data: { name: "英语" } });

  const t1 = await prisma.teacher.create({ data: { name: "张教授", title: "教授", majorId: cs.id } });
  const t2 = await prisma.teacher.create({ data: { name: "李副教授", title: "副教授", majorId: cs.id } });
  const t3 = await prisma.teacher.create({ data: { name: "王教授", title: "教授", majorId: math.id } });
  const t4 = await prisma.teacher.create({ data: { name: "赵讲师", title: "讲师", majorId: math.id } });
  const t5 = await prisma.teacher.create({ data: { name: "陈教授", title: "教授", majorId: eng.id } });
  const t6 = await prisma.teacher.create({ data: { name: "刘副教授", title: "副教授", majorId: eng.id } });

  await prisma.course.createMany({
    data: [
      { name: "数据结构与算法", code: "CS201", teacherId: t1.id },
      { name: "操作系统原理", code: "CS301", teacherId: t1.id },
      { name: "计算机网络", code: "CS302", teacherId: t2.id },
      { name: "数据库系统概论", code: "CS303", teacherId: t2.id },
      { name: "数学分析", code: "MATH101", teacherId: t3.id },
      { name: "高等代数", code: "MATH102", teacherId: t3.id },
      { name: "概率论与数理统计", code: "MATH201", teacherId: t4.id },
      { name: "离散数学", code: "MATH202", teacherId: t4.id },
      { name: "综合英语", code: "ENG101", teacherId: t5.id },
      { name: "英语写作", code: "ENG201", teacherId: t5.id },
      { name: "英美文学导读", code: "ENG301", teacherId: t6.id },
      { name: "语言学概论", code: "ENG302", teacherId: t6.id },
    ],
  });

  const courses = await prisma.course.findMany();

  await prisma.review.create({
    data: { userId: student.id, teacherId: t5.id, courseId: courses[8].id,
      teachingAttitude: 5, clarity: 4, workloadReasonableness: 4, gradingFriendliness: 5,
      comment: "陈教授讲课非常生动，课堂氛围很好，作业量适中。", status: "APPROVED" },
  });
  await prisma.review.create({
    data: { userId: student.id, teacherId: t1.id, courseId: courses[0].id,
      teachingAttitude: 4, clarity: 5, workloadReasonableness: 3, gradingFriendliness: 4,
      comment: "张教授的算法课讲得非常清晰，但作业有一定难度。", status: "APPROVED" },
  });
  await prisma.review.create({
    data: { userId: student.id, teacherId: t3.id, courseId: courses[4].id,
      teachingAttitude: 3, clarity: 4, workloadReasonableness: 2, gradingFriendliness: 3,
      comment: "王教授水平很高，但作业量偏大。", status: "PENDING" },
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
