import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import StarRating from "@/components/StarRating";

export const dynamic = "force-dynamic";

export default async function MajorPage({ params, searchParams }: { params: { id: string }; searchParams: { sort?: string } }) {
  const major = await prisma.major.findUnique({ where: { id: params.id } });
  if (!major) notFound();

  const teachers = await prisma.teacher.findMany({
    where: { status: "ACTIVE", majorId: params.id },
    include: { reviews: { where: { status: "APPROVED" }, select: { teachingAttitude: true, clarity: true, workloadReasonableness: true, gradingFriendliness: true } }, _count: { select: { reviews: { where: { status: "APPROVED" } } } } },
  });

  const result = teachers.map((t) => {
    const r = t.reviews;
    const avg = r.length > 0 ? Math.round(r.reduce((s, x) => s + x.teachingAttitude + x.clarity + x.workloadReasonableness + x.gradingFriendliness, 0) / (r.length * 4) * 10) / 10 : null;
    return { id: t.id, name: t.name, title: t.title, majorId: t.majorId, majorName: major.name, avgRating: avg, reviewCount: t._count.reviews };
  });
  if (searchParams.sort === "rating") result.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));

  const icons = ["💻","📐","🌍","🎨","🔬","📊"];
  const majorIcon = icons[major.name.length % icons.length];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#7C3AED] transition-colors font-medium">← 返回首页</Link>
      <div className="flex items-center gap-4 mt-4 mb-8">
        <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center text-2xl shadow-md">{majorIcon}</div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F2937] tracking-tight">{major.name}</h1>
          <p className="text-[#6B7280] mt-0.5">{result.length} 位老师</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <a href={`/majors/${params.id}`} className={`px-4 py-1.5 text-sm rounded-full font-medium transition-all ${!searchParams.sort ? "bg-[#7C3AED] text-white shadow-[0_2px_8px_rgba(124,58,237,0.2)]" : "bg-white text-[#6B7280] border border-[#E5E7EB] hover:border-[#7C3AED]/30"}`}>按姓名 🔤</a>
        <a href={`/majors/${params.id}?sort=rating`} className={`px-4 py-1.5 text-sm rounded-full font-medium transition-all ${searchParams.sort === "rating" ? "bg-[#7C3AED] text-white shadow-[0_2px_8px_rgba(124,58,237,0.2)]" : "bg-white text-[#6B7280] border border-[#E5E7EB] hover:border-[#7C3AED]/30"}`}>按评分 ⭐</a>
      </div>

      <div className="grid gap-3">{result.map((t) => {
        const { id, name, title, majorName, avgRating, reviewCount } = t;
        const colors = ["#7C3AED","#EC4899","#F59E0B","#10B981","#3B82F6"];
        const color = colors[name.length % colors.length];
        return (
          <Link key={id} href={`/teachers/${id}`}>
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-5 hover:shadow-[0_12px_32px_rgba(124,58,237,0.12)] hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-[14px] flex items-center justify-center text-white text-base font-bold shadow-md shrink-0" style={{backgroundColor: color}}>{name.charAt(0)}</div>
                  <div>
                    <h3 className="font-bold text-[#1F2937] text-[15px]">{name}</h3>
                    <p className="text-sm text-[#6B7280] mt-0.5">{title}</p>
                    <p className="text-xs text-[#9CA3AF] mt-1">{majorName}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <StarRating value={avgRating} size="sm" />
                  <p className="text-xs text-[#9CA3AF] mt-1">{reviewCount} 条评价</p>
                </div>
              </div>
            </div>
          </Link>
        );
      })}</div>
    </div>
  );
}
