"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/register", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email,name,password}) });
    if (!res.ok) { const d=await res.json(); setError(d.error||"注册失败"); return; }
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.ok) { router.push("/"); router.refresh(); }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">注册</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="邮箱" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        <input type="text" value={name} onChange={e=>setName(e.target.value)} required placeholder="昵称" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} placeholder="密码（至少6位）" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700">注册</button>
      </form>
      <p className="text-sm text-gray-500 text-center mt-4">已有账号？<Link href="/auth/login" className="text-blue-600 hover:underline ml-1">登录</Link></p>
    </div>
  );
}
