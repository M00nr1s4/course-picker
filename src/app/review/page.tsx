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
  // Teacher search
  const [searchQ, setSearchQ] = useState(""); const [searchResults, setSearchResults] = useState<any[]>([]); const [showSearch, setShowSearch] = useState(false);

  useEffect(() => { fetch("/api/majors").then(r=>r.json()).then(setMajors); }, []);
  useEffect(() => { if (selMajor) { fetch(`/api/majors/${selMajor}/teachers`).then(r=>r.json()).then((d:any[])=>setTeachers(d.map(t=>({id:t.id,name:t.name,title:t.title})))); setSelTeacher(""); setSelCourse(""); } }, [selMajor]);
  useEffect(() => { if (selTeacher) { fetch(`/api/courses?teacherId=${selTeacher}`).then(r=>r.json()).then(setCourses); setSelCourse(""); } }, [selTeacher]);

  async function searchTeachers(q:string) {
    setSearchQ(q); if (!q.trim()) { setSearchResults([]); setShowSearch(false); return; }
    const res = await fetch(`/api/teachers/search?q=${encodeURIComponent(q)}`);
    const data = await res.json(); setSearchResults(data.teachers); setShowSearch(true);
  }

  function selectTeacher(t:{id:string;name:string;majorName:string;majorId:string}) {
    setSelMajor(t.majorId); setSelTeacher(t.id); setSearchQ(t.name); setShowSearch(false);
  }

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

  if (!session) return <div className="max-w-lg mx-auto px-6 py-20 text-center"><span className="text-5xl block mb-4">🔒</span><p className="text-[#6B7280] mb-4">请先登录后再提交评价</p><button onClick={()=>router.push("/auth/login")} className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white px-6 py-2.5 rounded-[20px] text-[15px] font-bold shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] transition-all">去登录 🚀</button></div>;
  if (success) return <div className="max-w-lg mx-auto px-6 py-20 text-center"><span className="text-6xl block mb-4">🎉</span><h2 className="text-xl font-extrabold text-[#1F2937] mb-2">评价已提交</h2><p className="text-[#6B7280] mb-6">等待管理员审核后公开</p><button onClick={()=>router.push("/")} className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white px-6 py-2.5 rounded-[20px] text-[15px] font-bold shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] transition-all">返回首页 🏠</button></div>;

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <span className="text-5xl">✏️</span>
        <h1 className="text-2xl font-extrabold text-[#1F2937] mt-3 tracking-tight">提交评价</h1>
        <p className="text-[#6B7280] mt-1">分享你对课程和老师的真实感受</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Teacher search */}
        <div className="relative">
          <p className="text-sm text-[#6B7280] mb-2 font-medium">直接搜索老师 🔍</p>
          <div className="flex items-center gap-3 bg-white rounded-[20px] border border-[#E5E7EB] px-4 py-1 focus-within:ring-2 focus-within:ring-[#7C3AED]/20 focus-within:shadow-[0_4px_12px_rgba(124,58,237,0.08)] transition-all">
            <span className="text-lg">🔍</span>
            <input type="text" value={searchQ} onChange={e=>searchTeachers(e.target.value)} onFocus={()=>searchResults.length>0&&setShowSearch(true)} placeholder="输入老师姓名搜索..." className="flex-1 bg-transparent py-3 text-[15px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none" />
          </div>
          {/* Search results dropdown */}
          {showSearch && searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-[#E5E7EB] rounded-[16px] shadow-[0_12px_36px_rgba(124,58,237,0.18)] max-h-48 overflow-y-auto">
              {searchResults.map(t=>(
                <button key={t.id} type="button" className="w-full text-left px-4 py-3 hover:bg-[#FAFAFA] text-[15px] transition-colors flex items-center gap-3" onClick={()=>selectTeacher(t)}>
                  <span>👨‍🏫</span>
                  <div><span className="font-semibold text-[#1F2937]">{t.name}</span><span className="text-[#6B7280] ml-2">{t.title}</span><span className="text-[#9CA3AF] ml-2 text-sm">{t.majorName}</span></div>
                </button>
              ))}
            </div>
          )}
          {showSearch && searchQ.trim() && searchResults.length === 0 && <p className="absolute text-sm text-[#9CA3AF] bg-white border border-[#E5E7EB] rounded-[16px] p-4 shadow-lg w-full mt-1 text-center">😅 未找到该老师</p>}
          <div className="mt-2 text-xs text-[#9CA3AF] text-center">或者通过以下分类选择</div>
        </div>

        <div className="border-t border-[#E5E7EB] pt-4 space-y-4">
          <div>
            <p className="text-sm text-[#6B7280] mb-2 font-medium">专业 🏫</p>
            <select value={selMajor} onChange={e=>{setSelMajor(e.target.value);setSearchQ("");}} className="w-full bg-white border border-[#E5E7EB] rounded-[16px] px-4 py-3.5 text-[15px] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"><option value="">请选择</option>{majors.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select>
          </div>
          <div>
            <p className="text-sm text-[#6B7280] mb-2 font-medium">老师 👨‍🏫</p>
            <select value={selTeacher} onChange={e=>setSelTeacher(e.target.value)} disabled={!selMajor} className="w-full bg-white border border-[#E5E7EB] rounded-[16px] px-4 py-3.5 text-[15px] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 transition-all disabled:opacity-50"><option value="">{selMajor?"请选择":"请先选择专业"}</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.name} - {t.title}</option>)}</select>
          </div>
          <div>
            <p className="text-sm text-[#6B7280] mb-2 font-medium">课程 📚</p>
            <select value={selCourse} onChange={e=>setSelCourse(e.target.value)} disabled={!selTeacher} className="w-full bg-white border border-[#E5E7EB] rounded-[16px] px-4 py-3.5 text-[15px] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 transition-all disabled:opacity-50"><option value="">{selTeacher?"请选择":"请先选择老师"}</option>{courses.map(c=><option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}</select>
          </div>
          <div className="bg-[#FAFAFA] rounded-[20px] p-5 space-y-3">
            <p className="text-sm text-[#6B7280] font-medium mb-2">评分 ⭐</p>
            {[["teachingAttitude","教学态度"],["clarity","讲课清晰度"],["workloadReasonableness","作业量合理度"],["gradingFriendliness","给分友好度"]].map(([k,l])=>(
              <StarRatingInput key={k} label={l} value={ratings[k as keyof typeof ratings]} onChange={v=>setRatings(p=>({...p,[k]:v}))} />
            ))}
          </div>
          <div>
            <p className="text-sm text-[#6B7280] mb-2 font-medium">文字评价（可选）💬</p>
            <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={4} maxLength={500} placeholder="分享你对这门课和老师的真实感受..." className="w-full bg-white border border-[#E5E7EB] rounded-[20px] px-5 py-3.5 text-[15px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 transition-all resize-none" />
            <p className="text-xs text-[#9CA3AF] text-right mt-1">{comment.length}/500</p>
          </div>
          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white py-3.5 rounded-[20px] text-[15px] font-bold shadow-[0_6px_16px_rgba(124,58,237,0.3)] hover:shadow-[0_8px_24px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-50">{loading?"提交中...":"提交评价 ✨"}</button>
      </div></form>
    </div>
  );
}
