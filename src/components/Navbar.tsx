"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as { name?: string; role?: string } | undefined;

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex justify-between h-14 items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-semibold text-[#1d1d1f] tracking-tight">CoursePicker</span>
            <span className="text-sm text-[#86868b] hidden sm:inline font-normal">选课助手</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/feedback" className="text-sm text-[#86868b] hover:text-[#1d1d1f] transition-colors">意见反馈</Link>
            {session ? (
              <>
                <Link href="/review" className="text-sm text-[#0071e3] hover:text-[#0077ed] font-medium transition-colors">写评价</Link>
                {user?.role === "ADMIN" && (
                  <Link href="/admin/reviews" className="text-sm text-[#86868b] hover:text-[#1d1d1f] transition-colors">管理</Link>
                )}
                <span className="text-sm text-[#86868b]">{user?.name}</span>
                <button onClick={() => signOut()} className="text-sm text-[#86868b] hover:text-[#1d1d1f] transition-colors">退出</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm text-[#0071e3] hover:text-[#0077ed] transition-colors">登录</Link>
                <Link href="/auth/register" className="text-sm bg-[#0071e3] text-white px-4 py-1.5 rounded-full hover:bg-[#0077ed] transition-colors">注册</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
