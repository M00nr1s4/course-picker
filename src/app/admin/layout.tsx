import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const items = [
    { href: "/admin/reviews", label: "评价审核" },
    { href: "/admin/majors", label: "专业管理" },
    { href: "/admin/teachers", label: "老师管理" },
    { href: "/admin/courses", label: "课程管理" },
    { href: "/admin/sync", label: "师资同步" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">管理后台</h1>
      <div className="flex gap-8">
        <nav className="w-48 shrink-0 flex flex-col gap-1">
          {items.map((i) => (
            <Link key={i.href} href={i.href} className="px-3 py-2 text-sm rounded-lg hover:bg-gray-100 text-gray-700">{i.label}</Link>
          ))}
        </nav>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
