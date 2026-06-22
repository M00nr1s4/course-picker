"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import StarRatingInput from "@/components/StarRatingInput";

export default function ReviewPage() {
  const { data: session } = useSession(); const router = useRouter();
  const [majors, setMajors] = useState<{id:string;name:string}[]>([]);
  const [teachers, setTeachers] = useState<{id:string;name:string;title:string}[]>([]);
  const [courses, setCourses] = useState<{id:string;name:string;code:string}[]>([]);
  const [selMajor, setSelMajor] = useState(""); const [selTeacher, setSelTeacher] = useState(""); const [selCourse, setSelCourse] = useState("");
  const [ratings, setRatings] = useState({teachingAttitude:0,clarity:0,workloadReasonableness:0,gradingFriendliness:0});
  const [comment, setComment] = useState(""); const [error, setError] = useState(""); const [success, setSuccess] = useState(false); const [loading, setLoading] = useState(false);

  useEffect(() => { fetch("/api/majors").then(r=>r.json()).then(setMajors); }, []);
  useEffect(() => { if (selMajor) { fetch(`/api/majors/${selMajor}/teachers`).then(r=>r.json()).then((d:any[])=>setTeachers(d.map(t=>({id:t.id,name:t.name,title:t.title})))); setSelTeacher(""); setSelCourse(""); } }, [selMajor]);
  useEffect(() => { if (selTeacher) { fetch(`/api/courses?teacherId=${selTeacher}`).then(r=>r.json()).then(setCourses); setSelCourse(""); } }, [selTeacher]);

  async function handleSubmit(e:React.FormEvent) {
    e.preventDefault(); setError("");
    if (!selTeacher || !selCourse) { setError("请选择老师和课程"); return; }
    if (Object.values(ratings).some(v=>v===0)) { setError("请完成所有维度的评分"); return; }
    setLoading(true);
    const res = await fetch("/api/reviews", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({teacherId:selTeacher,courseId:selCourse,...ratings,comment}) });
    if (res.status===401) { router.push("/auth/login"); return; }
    if (!res.ok) { const d=await res.json(); setError(d.error||"提交失败"); } else setSuccess(true);
    setLoading(false);
  }

  if (!session) return <div className="max-w-lg mx-auto px-6 py-20 text-center"><p className="text-[#86868b] mb-4">请先登录后再提交评价</p><button onClick={()=>router.push("/auth/login")} className="bg-[#0071e3] text-white px-6 py-2.5 rounded-[12px] text-[15px] font-medium hover:bg-[#0077ed] transition-colors">去登录</button></div>;
  if (success) return <div className="max-w-lg mx-auto px-6 py-20 text-center"><div className="text-5xl mb-4">✅</div><h2 className="text-xl font-semibold text-[#1d1d1f] mb-2">评价已提交</h2><p className="text-[#86868b] mb-6">等待管理员审核后公开</p><button onClick={()=>router.push("/")} className="bg-[#0071e3] text-white px-6 py-2.5 rounded-[12px] text-[15px] font-medium hover:bg-[#0077ed] transition-colors">返回首页</button></div>;

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-[#1d1d1f] mb-8 tracking-tight">提交评价</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p className="text-sm text-[#86868b] mb-2 font-medium">专业</p>
          <select value={selMajor} onChange={e=>setSelMajor(e.target.value)} className="w-full bg-[#f5f5f7] rounded-[12px] px-4 py-3.5 text-[15px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:bg-white transition-all"><option value="">请选择</option>{majors.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select>
        </div>
        <div>
          <p className="text-sm text-[#86868b] mb-2 font-medium">老师</p>
          <select value={selTeacher} onChange={e=>setSelTeacher(e.target.value)} disabled={!selMajor} className="w-full bg-[#f5f5f7] rounded-[12px] px-4 py-3.5 text-[15px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:bg-white transition-all disabled:opacity-50"><option value="">请选择</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.name} - {t.title}</option>)}</select>
        </div>
        <div>
          <p className="text-sm text-[#86868b] mb-2 font-medium">课程</p>
          <select value={selCourse} onChange={e=>setSelCourse(e.target.value)} disabled={!selTeacher} className="w-full bg-[#f5f5f7] rounded-[12px] px-4 py-3.5 text-[15px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:bg-white transition-all disabled:opacity-50"><option value="">请选择</option>{courses.map(c=><option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}</select>
        </div>
        <div className="bg-[#f5f5f7] rounded-[16px] p-5 space-y-3">
          <p className="text-sm text-[#86868b] font-medium mb-2">评分</p>
          {[["teachingAttitude","教学态度"],["clarity","讲课清晰度"],["workloadReasonableness","作业量合理度"],["gradingFriendliness","给分友好度"]].map(([k,l])=>(
            <StarRatingInput key={k} label={l} value={ratings[k as keyof typeof ratings]} onChange={v=>setRatings(p=>({...p,[k]:v}))} />
          ))}
        </div>
        <div>
          <p className="text-sm text-[#86868b] mb-2 font-medium">文字评价（可选）</p>
          <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={4} maxLength={500} placeholder="分享你对这门课和老师的真实感受..." className="w-full bg-[#f5f5f7] rounded-[12px] px-4 py-3.5 text-[15px] text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:bg-white transition-all resize-none" />
          <p className="text-xs text-[#aeaeb2] text-right mt-1">{comment.length}/500</p>
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-[#0071e3] text-white py-3 rounded-[12px] text-[15px] font-medium hover:bg-[#0077ed] transition-colors disabled:opacity-50">{loading?"提交中...":"提交评价"}</button>
      </form>
    </div>
  );
}
