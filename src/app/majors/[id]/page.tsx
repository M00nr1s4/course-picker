import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TeacherCard from "@/components/TeacherCard";

export default async function MajorPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { sort?: string };
}) {
  const major = await prisma.major.findUnique({ where: { id: params.id } });
  if (!major) notFound();

  const teachers = await prisma.teacher.findMany({
    where: { majorId: params.id },
    include: {
      reviews: {
        where: { status: "APPROVED" },
        select: { teachingAttitude: true, clarity: true, workloadReasonableness: true, gradingFriendliness: true },
      },
      _count: { select: { reviews: { where: { status: "APPROVED" } } } },
    },
  });

  const result = teachers.map((t) => {
    const r = t.reviews;
    const avg = r.length > 0
      ? Math.round(r.reduce((s, x) => s + x.teachingAttitude + x.clarity + x.workloadReasonableness + x.gradingFriendliness, 0) / (r.length * 4) * 10) / 10
      : null;
    return { id: t.id, name: t.name, title: t.title, majorId: t.majorId, majorName: major.name, avgRating: avg, reviewCount: t._count.reviews };
  });

  if (searchParams.sort === "rating") {
    result.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{major.name}</h1>
      <p className="text-gray-500 mb-6">{result.length} 位老师</p>

      <div className="flex gap-2 mb-6">
        <a href={`/majors/${params.id}`} className={`px-3 py-1.5 text-sm rounded-lg ${!searchParams.sort ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>按姓名排序</a>
        <a href={`/majors/${params.id}?sort=rating`} className={`px-3 py-1.5 text-sm rounded-lg ${searchParams.sort === "rating" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>按评分排序</a>
      </div>

      <div className="grid gap-4">{result.map((t) => <TeacherCard key={t.id} {...t} />)}</div>
    </div>
  );
}
