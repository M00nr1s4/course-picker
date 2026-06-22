"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function FeedbackPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!content.trim()) { setError("反馈内容不能为空"); return; }

    setLoading(true);
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (res.status === 401) { router.push("/auth/login"); return; }
    if (!res.ok) { const d = await res.json(); setError(d.error || "提交失败"); }
    else setSuccess(true);
    setLoading(false);
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">请先登录后再提交反馈</p>
        <button onClick={() => router.push("/auth/login")} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">去登录</button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">💬</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">感谢你的反馈！</h2>
        <p className="text-gray-500 mb-6">你的意见对我们很有帮助，我们会认真阅读每一条反馈。</p>
        <button onClick={() => { setSuccess(false); setContent(""); }} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">再写一条</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">意见反馈</h1>
      <p className="text-gray-500 mb-6">告诉我们你的想法、建议或遇到的问题，帮助我们改进。</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          maxLength={1000}
          placeholder="请详细描述你的建议或遇到的问题..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-400 text-right">{content.length}/1000</p>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? "提交中..." : "提交反馈"}
        </button>
      </form>
    </div>
  );
}
