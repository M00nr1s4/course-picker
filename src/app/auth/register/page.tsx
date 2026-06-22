"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState(""); const [name, setName] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const router = useRouter();
  async function handleSubmit(e:React.FormEvent) { e.preventDefault(); setError(""); const res = await fetch("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,name,password})}); if(!res.ok){const d=await res.json();setError(d.error||"注册失败");return;} const result = await signIn("credentials",{email,password,redirect:false}); if(result?.ok){router.push("/");router.refresh();} }
  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <div className="text-center mb-8">
        <span className="text-5xl">🎉</span>
        <h1 className="text-2xl font-extrabold text-[#1F2937] mt-3 tracking-tight">创建账号</h1>
        <p className="text-[#6B7280] mt-1">加入 CoursePicker 社区</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 bg-white rounded-[20px] border border-[#E5E7EB] px-4 py-1 focus-within:ring-2 focus-within:ring-[#7C3AED]/20 transition-all">
          <span className="text-lg">📧</span>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="邮箱" className="flex-1 bg-transparent py-3.5 text-[15px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none" />
        </div>
        <div className="flex items-center gap-3 bg-white rounded-[20px] border border-[#E5E7EB] px-4 py-1 focus-within:ring-2 focus-within:ring-[#7C3AED]/20 transition-all">
          <span className="text-lg">😊</span>
          <input type="text" value={name} onChange={e=>setName(e.target.value)} required placeholder="昵称" className="flex-1 bg-transparent py-3.5 text-[15px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none" />
        </div>
        <div className="flex items-center gap-3 bg-white rounded-[20px] border border-[#E5E7EB] px-4 py-1 focus-within:ring-2 focus-within:ring-[#7C3AED]/20 transition-all">
          <span className="text-lg">🔒</span>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} placeholder="密码（至少6位）" className="flex-1 bg-transparent py-3.5 text-[15px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none" />
        </div>
        {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
        <button type="submit" className="w-full bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white py-3.5 rounded-[20px] text-[15px] font-bold shadow-[0_6px_16px_rgba(124,58,237,0.3)] hover:shadow-[0_8px_24px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 transition-all">注册 🚀</button>
      </form>
      <p className="text-sm text-[#6B7280] text-center mt-6">已有账号？<Link href="/auth/login" className="text-[#7C3AED] font-semibold hover:underline">登录</Link></p>
    </div>
  );
}
