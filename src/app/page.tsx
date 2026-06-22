import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TeacherCard from "@/components/TeacherCard";
import SearchBar from "@/components/SearchBar";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [majors, topTeachers] = await Promise.all([
    prisma.major.findMany({
      include: { _count: { select: { teachers: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.teacher.findMany({
      include: {
        major: { select: { name: true } },
        reviews: {
          where: { status: "APPROVED" },
          select: { teachingAttitude: true, clarity: true, workloadReasonableness: true, gradingFriendliness: true },
        },
        _count: { select: { reviews: { where: { status: "APPROVED" } } } },
      },
      orderBy: { reviews: { _count: "desc" } },
      take: 6,
    }),
  ]);

  const teachersWithRating = topTeachers
    .map((t) => {
      const r = t.reviews;
      const avg = r.length > 0
        ? Math.round(r.reduce((s, x) => s + x.teachingAttitude + x.clarity + x.workloadReasonableness + x.gradingFriendliness, 0) / (r.length * 4) * 10) / 10
        : null;
      return { id: t.id, name: t.name, title: t.title, majorId: t.majorId, majorName: t.major.name, avgRating: avg, reviewCount: t._count.reviews };
    })
    .sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">选课助手</h1>
        <p className="text-gray-500 mb-6">查看老师和课程的真实评价，做出更明智的选课决策</p>
        <div className="flex justify-center"><SearchBar /></div>
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">高分老师排行榜</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teachersWithRating.map((t) => <TeacherCard key={t.id} {...t} />)}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">按专业浏览</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {majors.map((m) => (
            <Link key={m.id} href={`/majors/${m.id}`} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-medium text-gray-900">{m.name}</h3>
              <p className="text-sm text-gray-500">{m._count.teachers} 位老师</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
