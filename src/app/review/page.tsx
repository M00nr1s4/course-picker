"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import StarRatingInput from "@/components/StarRatingInput";

export default function ReviewPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [majors, setMajors] = useState<{id:string;name:string}[]>([]);
  const [teachers, setTeachers] = useState<{id:string;name:string;title:string}[]>([]);
  const [courses, setCourses] = useState<{id:string;name:string;code:string}[]>([]);
  const [selMajor, setSelMajor] = useState("");
  const [selTeacher, setSelTeacher] = useState("");
  const [selCourse, setSelCourse] = useState("");
  const [ratings, setRatings] = useState({teachingAttitude:0,clarity:0,workloadReasonableness:0,gradingFriendliness:0});
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetch("/api/majors").then(r=>r.json()).then(setMajors); }, []);
  useEffect(() => { if (selMajor) { fetch(`/api/majors/${selMajor}/teachers`).then(r=>r.json()).then((d:any[])=>setTeachers(d.map((t:any)=>({id:t.id,name:t.name,title:t.title})))); setSelTeacher(""); setSelCourse(""); } }, [selMajor]);
  useEffect(() => { if (selTeacher) { fetch(`/api/courses?teacherId=${selTeacher}`).then(r=>r.json()).then(setCourses); setSelCourse(""); } }, [selTeacher]);

  async function handleSubmit(e:React.FormEvent) {
    e.preventDefault(); setError("");
    if (!selTeacher || !selCourse) { setError("请选择老师和课程"); return; }
    if (Object.values(ratings).some(v=>v===0)) { setError("请完成所有维度的评分"); return; }
    setLoading(true);
    const res = await fetch("/api/reviews", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({teacherId:selTeacher,courseId:selCourse,...ratings,comment}) });
    if (res.status===401) { router.push("/auth/login"); return; }
    if (!res.ok) { const d=await res.json(); setError(d.error||"提交失败"); }
    else setSuccess(true);
    setLoading(false);
  }

  if (!session) return (<div className="max-w-2xl mx-auto px-4 py-16 text-center"><p className="text-gray-500">请先登录后再提交评价</p><button onClick={()=>router.push("/auth/login")} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">去登录</button></div>);
  if (success) return (<div className="max-w-2xl mx-auto px-4 py-16 text-center"><div className="text-4xl mb-4">&#10004;&#65039;</div><h2 className="text-xl font-semibold text-gray-900 mb-2">评价已提交</h2><p className="text-gray-500 mb-6">评价已提交，等待管理员审核后公开</p><button onClick={()=>router.push("/")} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">返回首页</button></div>);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">提交评价</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <select value={selMajor} onChange={e=>setSelMajor(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2"><option value="">请选择专业</option>{majors.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select>
        <select value={selTeacher} onChange={e=>setSelTeacher(e.target.value)} disabled={!selMajor} className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"><option value="">请选择老师</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.name} - {t.title}</option>)}</select>
        <select value={selCourse} onChange={e=>setSelCourse(e.target.value)} disabled={!selTeacher} className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"><option value="">请选择课程</option>{courses.map(c=><option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}</select>
        <div className="space-y-3">
          <StarRatingInput label="教学态度" value={ratings.teachingAttitude} onChange={v=>setRatings(p=>({...p,teachingAttitude:v}))} />
          <StarRatingInput label="讲课清晰度" value={ratings.clarity} onChange={v=>setRatings(p=>({...p,clarity:v}))} />
          <StarRatingInput label="作业量合理度" value={ratings.workloadReasonableness} onChange={v=>setRatings(p=>({...p,workloadReasonableness:v}))} />
          <StarRatingInput label="给分友好度" value={ratings.gradingFriendliness} onChange={v=>setRatings(p=>({...p,gradingFriendliness:v}))} />
        </div>
        <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={4} maxLength={500} placeholder="请分享你对这门课和老师的真实感受..." className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        <p className="text-xs text-gray-400 -mt-4">{comment.length}/500</p>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50">{loading?"提交中...":"提交评价"}</button>
      </form>
    </div>
  );
}
