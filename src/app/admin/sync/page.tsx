"use client";
import { useState, useEffect } from "react";

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
      // Fetch all teachers from BNBU
      setLogs((p) => [...p, "正在连接 BNBU 师资系统..."]);
      const allTeachers: any[] = [];
      let page = 0;
      let lastPage = 1;
      const pageSize = 200;

      while (page <= lastPage) {
        const res = await fetch(`https://staff.bnbu.edu.cn/teacher/teacher/list?access-token=&lang=cn&page=${page}&pageSize=${pageSize}`);
        const json = await res.json();
        if (json.code !== 0) {
          setError(`API 请求失败: ${JSON.stringify(json)}`);
          setSyncing(false);
          return;
        }
        allTeachers.push(...json.data.data);
        lastPage = json.data.last_page;
        setLogs((p) => [...p, `  已获取第 ${page + 1}/${lastPage + 1} 页 (${json.data.data.length} 位老师)`]);
        page++;
      }

      setLogs((p) => [...p, `BNBU 共 ${allTeachers.length} 位老师，开始比对...`]);

      // Sync with backend
      const syncRes = await fetch("/api/admin/sync-faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teachers: allTeachers }),
      });

      if (!syncRes.ok) {
        setError(`同步请求失败: ${syncRes.status}`);
        setSyncing(false);
        return;
      }

      const syncResult = await syncRes.json();
      setLogs((p) => [...p, `  匹配成功 (在职): ${syncResult.matched}`]);
      setLogs((p) => [...p, `  未匹配 (已离职): ${syncResult.notFound}`]);
      setLogs((p) => [...p, `  已同步完成!`]);
      setResult(`同步完成！${syncResult.matched} 位老师在职工，${syncResult.notFound} 位已离职`);
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
