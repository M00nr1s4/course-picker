"use client";
import { useState, useEffect } from "react";

interface FeedbackItem {
  id: string;
  userName: string;
  userEmail: string;
  content: string;
  createdAt: string;
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/feedback");
    setFeedbacks(await res.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">意见反馈</h2>
      {loading ? (
        <p className="text-gray-400">加载中...</p>
      ) : feedbacks.length === 0 ? (
        <p className="text-gray-400">暂无反馈</p>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((f) => (
            <div key={f.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-700">{f.userName}</span>
                <span className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleString("zh-CN")}</span>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{f.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
