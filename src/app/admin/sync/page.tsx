"use client";
import { useState } from "react";

export default function AdminSyncPage() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  async function runSync() {
    setSyncing(true);
    setResult(null);
    setError(null);
    setLogs([]);

    try {
      setLogs((p) => [...p, "正在连接 BNBU 师资系统并同步..."]);

      const res = await fetch("/api/admin/sync-faculty");

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `请求失败 (${res.status})`);
      }

      const data = await res.json();

      setLogs((p) => [...p, `  BNBU 总教师数: ${data.bnbuTotal}`]);
      setLogs((p) => [...p, `  CoursePicker 教师数: ${data.total}`]);
      setLogs((p) => [...p, `  匹配成功 (在职): ${data.matched}`]);
      setLogs((p) => [...p, `  未匹配 (已离职): ${data.notFound}`]);
      setLogs((p) => [...p, `  同步完成!`]);
      setResult(`同步完成！${data.matched} 位老师在职，${data.notFound} 位已离职`);
    } catch (e: any) {
      setError(e.message || "同步失败");
    }

    setSyncing(false);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">BNBU 师资同步</h2>
      <p className="text-sm text-gray-500 mb-4">
        从 BNBU 官网同步老师数据，自动标记已离职老师。
      </p>

      <button
        onClick={runSync}
        disabled={syncing}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {syncing ? "同步中..." : "开始同步"}
      </button>

      {logs.length > 0 && (
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
          {logs.map((log, i) => (
            <p key={i} className="text-sm text-gray-700 font-mono">{log}</p>
          ))}
        </div>
      )}

      {result && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-700 rounded-lg p-4">
          {result}
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          错误: {error}
        </div>
      )}
    </div>
  );
}
