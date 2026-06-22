import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import StarRating from "@/components/StarRating";

export const dynamic = "force-dynamic";

export default async function TeacherPage({ params }: { params: { id: string } }) {
  const teacher = await prisma.teacher.findUnique({
    where: { id: params.id },
    include: { major: true, courses: true, reviews: { where: { status: "APPROVED" }, include: { user: { select: { name: true } }, course: { select: { name: true } } }, orderBy: { createdAt: "desc" } } },
  });
  if (!teacher) notFound();

  const r = teacher.reviews; const count = r.length;
  const avg = (f: "teachingAttitude"|"clarity"|"workloadReasonableness"|"gradingFriendliness") => count > 0 ? Math.round(r.reduce((s, x) => s + x[f], 0) / count * 10) / 10 : null;
  const overall = count > 0 ? Math.round(r.reduce((s, x) => s + x.teachingAttitude + x.clarity + x.workloadReasonableness + x.gradingFriendliness, 0) / (count * 4) * 10) / 10 : null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/" className="text-sm text-[#86868b] hover:text-[#1d1d1f] transition-colors">← 返回首页</Link>

      {/* Teacher header */}
      <div className="bg-white rounded-[16px] border border-gray-100 p-8 mt-4 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">{teacher.name}</h1>
              {teacher.status === "LEFT" && <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">已离职</span>}
            </div>
            <p className="text-[#86868b]">{teacher.title} · {teacher.major.name}</p>
          </div>
        </div>
        {count > 0 ? (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-4xl font-bold text-[#1d1d1f]">{overall}</span>
              <div><StarRating value={overall} size="lg" /><span className="text-sm text-[#aeaeb2] ml-2">{count} 条评价</span></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[["teachingAttitude","教学态度"],["clarity","讲课清晰度"],["workloadReasonableness","作业量合理度"],["gradingFriendliness","给分友好度"]].map(([k,l]) => (
                <div key={k} className="bg-[#f5f5f7] rounded-[12px] p-4 text-center">
                  <p className="text-xs text-[#86868b] mb-1">{l}</p>
                  <p className="text-lg font-semibold text-[#1d1d1f]">{avg(k as any)?.toFixed(1) ?? "-"}</p>
                  <StarRating value={avg(k as any)} size="sm" />
                </div>
              ))}
            </div>
          </div>
        ) : <p className="text-[#aeaeb2] mt-4">暂无评分数据</p>}
      </div>

      {/* Courses */}
      <div className="bg-white rounded-[16px] border border-gray-100 p-6 mb-4">
        <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4 tracking-tight">所授课程</h2>
        <div className="grid gap-2">{teacher.courses.map((c) => (
          <div key={c.id} className="flex items-center gap-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center shrink-0"><span className="text-xs font-medium text-[#86868b]">{c.code.slice(0,2)}</span></div>
            <span className="text-[15px] text-[#1d1d1f]">{c.name}</span>
            <span className="text-sm text-[#aeaeb2]">({c.code})</span>
          </div>
        ))}</div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-[16px] border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4 tracking-tight">学生评价 ({count})</h2>
        {r.length === 0 ? <p className="text-[#aeaeb2]">暂无已通过审核的评价</p> : (
          <div className="space-y-4">{r.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-[#1d1d1f]">{review.user.name}</span>
                <span className="text-xs text-[#aeaeb2]">{review.course.name} · {new Date(review.createdAt).toLocaleDateString("zh-CN")}</span>
              </div>
              <div className="flex gap-3 text-sm text-[#86868b] mb-2">
                <span>教学态度: {review.teachingAttitude}★</span><span>清晰度: {review.clarity}★</span><span>作业量: {review.workloadReasonableness}★</span><span>给分: {review.gradingFriendliness}★</span>
              </div>
              {review.comment && <p className="text-sm text-[#1d1d1f] leading-relaxed">{review.comment}</p>}
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}
