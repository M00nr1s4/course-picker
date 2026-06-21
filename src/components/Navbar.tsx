"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as { name?: string; role?: string } | undefined;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-600">CoursePicker</span>
            <span className="text-sm text-gray-500 hidden sm:inline">选课助手</span>
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link href="/review" className="text-sm text-blue-600 hover:text-blue-800 font-medium">写评价</Link>
                {user?.role === "ADMIN" && (
                  <Link href="/admin/reviews" className="text-sm text-orange-600 hover:text-orange-800 font-medium">管理后台</Link>
                )}
                <span className="text-sm text-gray-600">{user?.name}</span>
                <button onClick={() => signOut()} className="text-sm text-gray-500 hover:text-gray-700">退出</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">登录</Link>
                <Link href="/auth/register" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">注册</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
