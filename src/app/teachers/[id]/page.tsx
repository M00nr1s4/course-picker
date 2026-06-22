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

  const colors = ["#7C3AED","#EC4899","#F59E0B","#10B981"];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#7C3AED] transition-colors font-medium">← 返回首页</Link>

      {/* Teacher header */}
      <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-8 mt-4 mb-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-[18px] bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0">{teacher.name.charAt(0)}</div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-[#1F2937] tracking-tight">{teacher.name}</h1>
              {teacher.status === "LEFT" && <span className="text-xs bg-red-50 text-red-500 px-2.5 py-0.5 rounded-full font-medium">已离职</span>}
            </div>
            <p className="text-[#6B7280] mt-0.5">{teacher.title} · {teacher.major.name}</p>
          </div>
        </div>
        {count > 0 ? (
          <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl font-extrabold text-[#1F2937]">{overall}</span>
              <div><StarRating value={overall} size="lg" /><span className="text-sm text-[#9CA3AF] ml-2">{count} 条评价</span></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[["teachingAttitude","教学态度","🧑‍🏫"],["clarity","讲课清晰度","💡"],["workloadReasonableness","作业量","📝"],["gradingFriendliness","给分","🎯"]].map(([k,l,emoji],i) => (
                <div key={k} className={`rounded-[16px] p-4 text-center bg-gradient-to-br from-[${colors[i]}]/10 to-[${colors[i]}]/5 border border-[${colors[i]}]/15`}>
                  <span className="text-lg">{emoji}</span>
                  <p className="text-xs text-[#6B7280] mb-1 font-medium">{l}</p>
                  <p className="text-lg font-extrabold text-[#1F2937]">{avg(k as any)?.toFixed(1) ?? "-"}</p>
                  <StarRating value={avg(k as any)} size="sm" />
                </div>
              ))}
            </div>
          </div>
        ) : <p className="text-[#9CA3AF] mt-4">📭 暂无评分数据</p>}
      </div>

      {/* Courses */}
      <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">📚</span>
          <h2 className="text-lg font-bold text-[#1F2937] tracking-tight">所授课程</h2>
        </div>
        <div className="grid gap-2">{teacher.courses.map((c) => (
          <div key={c.id} className="flex items-center gap-3 py-2.5 px-3 bg-[#FAFAFA] rounded-[14px]">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold">{c.code.slice(0,2)}</div>
            <span className="font-semibold text-[#1F2937]">{c.name}</span>
            <span className="text-sm text-[#9CA3AF] ml-auto">({c.code})</span>
          </div>
        ))}</div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">💬</span>
          <h2 className="text-lg font-bold text-[#1F2937] tracking-tight">学生评价 ({count})</h2>
        </div>
        {r.length === 0 ? <p className="text-[#9CA3AF]">📭 暂无已通过审核的评价</p> : (
          <div className="space-y-4">{r.map((review) => (
            <div key={review.id} className="border-b border-[#E5E7EB] pb-4 last:border-0 last:pb-0">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center text-white text-xs font-bold">{review.user.name.charAt(0)}</div>
                  <span className="text-sm font-semibold text-[#1F2937]">{review.user.name}</span>
                </div>
                <span className="text-xs text-[#9CA3AF]">{review.course.name} · {new Date(review.createdAt).toLocaleDateString("zh-CN")}</span>
              </div>
              <div className="flex gap-3 text-sm text-[#6B7280] mb-2 flex-wrap">
                <span>🧑‍🏫 {review.teachingAttitude}★</span><span>💡 {review.clarity}★</span><span>📝 {review.workloadReasonableness}★</span><span>🎯 {review.gradingFriendliness}★</span>
              </div>
              {review.comment && <p className="text-sm text-[#1F2937] leading-relaxed">{review.comment}</p>}
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}
