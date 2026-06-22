"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function FeedbackPage() {
  const { data: session } = useSession(); const router = useRouter();
  const [content, setContent] = useState(""); const [error, setError] = useState(""); const [success, setSuccess] = useState(false); const [loading, setLoading] = useState(false);

  async function handleSubmit(e:React.FormEvent) { e.preventDefault(); setError(""); if(!content.trim()){setError("反馈内容不能为空");return;} setLoading(true); const res=await fetch("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content})}); if(res.status===401){router.push("/auth/login");return;} if(!res.ok){const d=await res.json();setError(d.error||"提交失败");}else setSuccess(true); setLoading(false); }

  if (!session) return <div className="max-w-lg mx-auto px-6 py-20 text-center"><span className="text-5xl block mb-4">💬</span><p className="text-[#6B7280] mb-4">请先登录后再提交反馈</p><button onClick={()=>router.push("/auth/login")} className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white px-6 py-2.5 rounded-[20px] text-[15px] font-bold shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] transition-all">去登录 🚀</button></div>;

  if (success) return <div className="max-w-lg mx-auto px-6 py-20 text-center"><span className="text-6xl block mb-4">🎉</span><h2 className="text-xl font-extrabold text-[#1F2937] mb-2">感谢你的反馈！</h2><p className="text-[#6B7280] mb-6">我们会认真阅读每一条意见</p><button onClick={()=>{setSuccess(false);setContent("");}} className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white px-6 py-2.5 rounded-[20px] text-[15px] font-bold shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] transition-all">再写一条 ✍️</button></div>;

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <span className="text-5xl">💬</span>
        <h1 className="text-2xl font-extrabold text-[#1F2937] mt-3 tracking-tight">意见反馈</h1>
        <p className="text-[#6B7280] mt-1">告诉我们你的想法，帮助我们做得更好</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea value={content} onChange={e=>setContent(e.target.value)} rows={6} maxLength={1000} placeholder="请详细描述你的建议或遇到的问题..." className="w-full bg-white rounded-[20px] border border-[#E5E7EB] px-5 py-4 text-[15px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:shadow-[0_4px_12px_rgba(124,58,237,0.08)] transition-all resize-none" />
        <p className="text-xs text-[#9CA3AF] text-right">{content.length}/1000</p>
        {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white py-3.5 rounded-[20px] text-[15px] font-bold shadow-[0_6px_16px_rgba(124,58,237,0.3)] hover:shadow-[0_8px_24px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-50">{loading ? "提交中..." : "提交反馈 💬"}</button>
      </form>
    </div>
  );
}
