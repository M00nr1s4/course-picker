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
    return { id: t.id, name: t.name, title: t.title, majorId: t.majorId, majorName: major.name, avgRating: avg, reviewCount: t._count.reviews, status: t.status };
  });
  if (searchParams.sort === "rating") result.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-[#86868b] hover:text-[#1d1d1f] transition-colors">← 返回首页</Link>
        <h1 className="text-2xl font-bold text-[#1d1d1f] mt-3 tracking-tight">{major.name}</h1>
        <p className="text-[#86868b] mt-1">{result.length} 位老师</p>
      </div>

      <div className="flex gap-2 mb-6">
        <a href={`/majors/${params.id}`} className={`px-4 py-1.5 text-sm rounded-full transition-colors ${!searchParams.sort ? "bg-[#0071e3] text-white" : "bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed]"}`}>按姓名</a>
        <a href={`/majors/${params.id}?sort=rating`} className={`px-4 py-1.5 text-sm rounded-full transition-colors ${searchParams.sort === "rating" ? "bg-[#0071e3] text-white" : "bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed]"}`}>按评分</a>
      </div>

      <div className="grid gap-3">{result.map((t) => {
        const { id, name, title, majorName, avgRating, reviewCount } = t;
        return (
          <Link key={id} href={`/teachers/${id}`}>
            <div className="bg-white rounded-[14px] border border-gray-100 p-5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-[#1d1d1f] text-[15px]">{name}</h3>
                  <p className="text-sm text-[#86868b] mt-0.5">{title}</p>
                  <p className="text-xs text-[#aeaeb2] mt-1">{majorName}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <StarRating value={avgRating} size="sm" />
                  <p className="text-xs text-[#aeaeb2] mt-1">{reviewCount} 条评价</p>
                </div>
              </div>
            </div>
          </Link>
        );
      })}</div>
    </div>
  );
}
