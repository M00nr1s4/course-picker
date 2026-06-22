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
      <h1 className="text-2xl font-bold text-[#1d1d1f] mb-8 text-center tracking-tight">注册</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="邮箱" className="w-full bg-[#f5f5f7] rounded-[12px] px-4 py-3.5 text-[15px] text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:bg-white transition-all" />
        <input type="text" value={name} onChange={e=>setName(e.target.value)} required placeholder="昵称" className="w-full bg-[#f5f5f7] rounded-[12px] px-4 py-3.5 text-[15px] text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:bg-white transition-all" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} placeholder="密码（至少6位）" className="w-full bg-[#f5f5f7] rounded-[12px] px-4 py-3.5 text-[15px] text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:bg-white transition-all" />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button type="submit" className="w-full bg-[#0071e3] text-white py-3 rounded-[12px] text-[15px] font-medium hover:bg-[#0077ed] transition-colors">注册</button>
      </form>
      <p className="text-sm text-[#86868b] text-center mt-6">已有账号？<Link href="/auth/login" className="text-[#0071e3] hover:underline">登录</Link></p>
    </div>
  );
}
