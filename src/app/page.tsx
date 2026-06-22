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
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#EC4899] px-6 pt-16 pb-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "40px 40px"}} />
        <div className="max-w-4xl mx-auto relative">
          <span className="inline-block text-5xl mb-4">🎓</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3 drop-shadow-lg">
            选课助手
          </h1>
          <p className="text-lg text-white/80 max-w-md mx-auto mb-8 leading-relaxed font-medium">
            查看老师和课程的真实评价，做出更明智的选课决策
          </p>
          <SearchBar />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-12">
        {/* Top teachers */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xl">🏆</span>
            <h2 className="text-xl font-bold text-[#1F2937] tracking-tight">高分老师排行榜</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{rated.map((t) => <TeacherCard key={t.id} {...t} />)}</div>
        </section>

        {/* Majors */}
        <section className="pb-16">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xl">🏫</span>
            <h2 className="text-xl font-bold text-[#1F2937] tracking-tight">按专业浏览</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {majors.map((m, i) => {
              const icons = ["💻","📐","🌍","🎨","🔬","📊"];
              const grad = ["from-[#7C3AED] to-[#A78BFA]","from-[#EC4899] to-[#F472B6]","from-[#F59E0B] to-[#FCD34D]","from-[#10B981] to-[#6EE7B7]","from-[#3B82F6] to-[#93C5FD]","from-[#EF4444] to-[#FCA5A5]"];
              return (
                <Link key={m.id} href={`/majors/${m.id}`} className="bg-white rounded-[20px] border border-[#E5E7EB] p-5 hover:shadow-[0_12px_32px_rgba(124,58,237,0.12)] hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-10 h-10 rounded-[12px] bg-gradient-to-br ${grad[i%grad.length]} flex items-center justify-center text-lg mb-3 shadow-md`}>{icons[i%icons.length]}</div>
                  <h3 className="font-bold text-[#1F2937] text-[15px]">{m.name}</h3>
                  <p className="text-sm text-[#6B7280] mt-1">{m._count.teachers} 位老师</p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
