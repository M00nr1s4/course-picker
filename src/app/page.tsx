import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TeacherCard from "@/components/TeacherCard";
import SearchBar from "@/components/SearchBar";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [majors, topTeachers] = await Promise.all([
    prisma.major.findMany({ include: { _count: { select: { teachers: true } } }, orderBy: { name: "asc" } }),
    prisma.teacher.findMany({
      where: { status: "ACTIVE" },
      include: { major: { select: { name: true } }, reviews: { where: { status: "APPROVED" }, select: { teachingAttitude: true, clarity: true, workloadReasonableness: true, gradingFriendliness: true } }, _count: { select: { reviews: { where: { status: "APPROVED" } } } } },
      orderBy: { reviews: { _count: "desc" } }, take: 6,
    }),
  ]);

  const rated = topTeachers.map((t) => {
    const r = t.reviews;
    const avg = r.length > 0 ? Math.round(r.reduce((s, x) => s + x.teachingAttitude + x.clarity + x.workloadReasonableness + x.gradingFriendliness, 0) / (r.length * 4) * 10) / 10 : null;
    return { id: t.id, name: t.name, title: t.title, majorId: t.majorId, majorName: t.major.name, avgRating: avg, reviewCount: t._count.reviews };
  }).sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-[#1d1d1f] tracking-tight leading-tight mb-3">
          选课助手
        </h1>
        <p className="text-lg text-[#86868b] max-w-md mx-auto mb-8 leading-relaxed">
          查看老师和课程的真实评价，做出更明智的选课决策
        </p>
        <SearchBar />
      </div>

      {/* Top teachers */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">高分老师</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{rated.map((t) => <TeacherCard key={t.id} {...t} />)}</div>
      </section>

      {/* Majors */}
      <section>
        <h2 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-5">按专业浏览</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {majors.map((m) => (
            <Link key={m.id} href={`/majors/${m.id}`} className="bg-white rounded-[14px] border border-gray-100 p-5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300">
              <h3 className="font-medium text-[#1d1d1f] text-[15px]">{m.name}</h3>
              <p className="text-sm text-[#86868b] mt-1">{m._count.teachers} 位老师</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
