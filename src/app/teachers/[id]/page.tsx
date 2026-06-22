import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import StarRating from "@/components/StarRating";

export const dynamic = "force-dynamic";

export default async function TeacherPage({ params }: { params: { id: string } }) {
  const teacher = await prisma.teacher.findUnique({
    where: { id: params.id },
    include: {
      major: true,
      courses: true,
      reviews: {
        where: { status: "APPROVED" },
        include: { user: { select: { name: true } }, course: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!teacher) notFound();

  const r = teacher.reviews;
  const count = r.length;
  const avg = (f: "teachingAttitude" | "clarity" | "workloadReasonableness" | "gradingFriendliness") =>
    count > 0 ? Math.round(r.reduce((s, x) => s + x[f], 0) / count * 10) / 10 : null;

  const overall = count > 0
    ? Math.round(r.reduce((s, x) => s + x.teachingAttitude + x.clarity + x.workloadReasonableness + x.gradingFriendliness, 0) / (count * 4) * 10) / 10
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{teacher.name}</h1>
            <p className="text-gray-500 mt-1">{teacher.title} · {teacher.major.name}</p>
          </div>
          {teacher.status === "LEFT" && (
            <span className="text-sm bg-red-100 text-red-600 px-2.5 py-1 rounded font-medium">已离职</span>
          )}
        </div>

        {count > 0 ? (
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-gray-900">{overall}</span>
              <StarRating value={overall} size="lg" />
              <span className="text-sm text-gray-400">({count} 条评价)</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-4"><span className="text-sm text-gray-600 w-24">教学态度</span><StarRating value={avg("teachingAttitude")} size="sm" /></div>
              <div className="flex items-center gap-4"><span className="text-sm text-gray-600 w-24">讲课清晰度</span><StarRating value={avg("clarity")} size="sm" /></div>
              <div className="flex items-center gap-4"><span className="text-sm text-gray-600 w-24">作业量合理度</span><StarRating value={avg("workloadReasonableness")} size="sm" /></div>
              <div className="flex items-center gap-4"><span className="text-sm text-gray-600 w-24">给分友好度</span><StarRating value={avg("gradingFriendliness")} size="sm" /></div>
            </div>
          </div>
        ) : <p className="text-gray-400 mt-4">暂无评分数据</p>}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">所授课程</h2>
        <div className="grid gap-2">
          {teacher.courses.map((c) => (
            <div key={c.id} className="flex items-center gap-2 text-sm">
              <span className="text-gray-900 font-medium">{c.name}</span>
              <span className="text-gray-400">({c.code})</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">学生评价 ({count})</h2>
        {r.length === 0 ? (
          <p className="text-gray-400">暂无已通过审核的评价</p>
        ) : (
          <div className="space-y-4">
            {r.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{review.user.name}</span>
                  <span className="text-xs text-gray-400">{review.course.name} · {new Date(review.createdAt).toLocaleDateString("zh-CN")}</span>
                </div>
                <div className="flex gap-4 text-sm text-gray-500 mb-2">
                  <span>教学态度: {review.teachingAttitude}★</span>
                  <span>清晰度: {review.clarity}★</span>
                  <span>作业量: {review.workloadReasonableness}★</span>
                  <span>给分: {review.gradingFriendliness}★</span>
                </div>
                {review.comment && <p className="text-sm text-gray-700">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
