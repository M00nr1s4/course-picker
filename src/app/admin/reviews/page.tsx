"use client";
import { useState, useEffect } from "react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [filter, setFilter] = useState("PENDING");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/reviews?status=${filter}`);
    setReviews(await res.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, [filter]);

  async function action(id: string, a: "approve" | "reject") {
    const res = await fetch(`/api/admin/reviews/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({action:a}) });
    if (res.ok) setReviews(p => p.filter(r => r.id !== id));
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {["PENDING","APPROVED","REJECTED"].map(s => (
          <button key={s} onClick={()=>setFilter(s)} className={`px-3 py-1.5 text-sm rounded-lg ${filter===s?"bg-blue-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {s==="PENDING"?"待审核":s==="APPROVED"?"已通过":"已拒绝"}
          </button>
        ))}
      </div>
      {loading ? <p className="text-gray-400">加载中...</p> : reviews.length===0 ? <p className="text-gray-400">暂无数据</p> : (
        <div className="space-y-4">{reviews.map(r => (
          <div key={r.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div><span className="font-medium text-gray-900">{r.teacherName}</span><span className="text-gray-400 mx-1">·</span><span className="text-sm text-gray-500">{r.courseName} ({r.courseCode})</span></div>
              <span className="text-xs text-gray-400">{r.userName} ({r.userEmail})</span>
            </div>
            <div className="flex gap-3 text-sm text-gray-500 mb-2">
              <span>教学态度: {r.teachingAttitude}★</span><span>清晰度: {r.clarity}★</span><span>作业量: {r.workloadReasonableness}★</span><span>给分: {r.gradingFriendliness}★</span>
            </div>
            {r.comment && <p className="text-sm text-gray-700 mb-3 bg-gray-50 rounded p-2">{r.comment}</p>}
            {filter==="PENDING" && (
              <div className="flex gap-2">
                <button onClick={()=>action(r.id,"approve")} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">通过</button>
                <button onClick={()=>action(r.id,"reject")} className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">拒绝</button>
              </div>
            )}
          </div>
        ))}</div>
      )}
    </div>
  );
}
