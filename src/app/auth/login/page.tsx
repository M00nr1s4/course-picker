"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) setError("邮箱或密码错误");
    else { router.push("/"); router.refresh(); }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">登录</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="邮箱" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="密码" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700">登录</button>
      </form>
      <p className="text-sm text-gray-500 text-center mt-4">还没有账号？<Link href="/auth/register" className="text-blue-600 hover:underline ml-1">注册</Link></p>
    </div>
  );
}
