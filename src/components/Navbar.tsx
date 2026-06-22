"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as { name?: string; role?: string } | undefined;

  return (
    <nav className="bg-white/90 backdrop-blur-xl border-b border-[#E5E7EB]/60 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex justify-between h-14 items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center text-white text-sm font-bold shadow-[0_4px_8px_rgba(124,58,237,0.25)] group-hover:scale-105 transition-transform">C</span>
            <span className="text-lg font-bold text-[#1F2937] tracking-tight">CoursePicker</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/feedback" className="text-sm text-[#6B7280] hover:text-[#7C3AED] transition-colors">意见反馈</Link>
            {session ? (
              <>
                <Link href="/review" className="text-sm font-semibold text-[#7C3AED] hover:text-[#6D28D9] transition-colors">写评价 ✏️</Link>
                {user?.role === "ADMIN" && (
                  <Link href="/admin/reviews" className="text-sm text-[#6B7280] hover:text-[#7C3AED] transition-colors">管理 ⚙️</Link>
                )}
                <span className="text-sm text-[#6B7280]">{user?.name}</span>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-[#6B7280] hover:text-[#1F2937] transition-colors">退出</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm text-[#7C3AED] font-semibold hover:text-[#6D28D9] transition-colors">登录</Link>
                <Link href="/auth/register" className="text-sm bg-[#7C3AED] text-white px-5 py-1.5 rounded-full hover:bg-[#6D28D9] shadow-[0_4px_10px_rgba(124,58,237,0.25)] hover:shadow-[0_6px_16px_rgba(124,58,237,0.35)] transition-all">注册 🎉</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
