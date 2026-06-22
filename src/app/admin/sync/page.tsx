"use client";
import { useState, useEffect } from "react";

interface SyncResult {
  matched: number;
  notFound: number;
  total: number;
  bnbuTotal: number;
  unmatched: { username: string; name: string; title: string; email: string }[];
}

interface Major {
  id: string;
  name: string;
}

export default function AdminSyncPage() {
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [selectedMajor, setSelectedMajor] = useState("");

  useEffect(() => {
    fetch("/api/majors").then((r) => r.json()).then(setMajors);
  }, []);

  async function runSync() {
    setSyncing(true);
    setResult(null);
    setError(null);
    setLogs(["正在同步 BNBU 师资数据..."]);
    setSelectedMajor("");

    try {
      const res = await fetch("/api/admin/sync-faculty");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `请求失败 (${res.status})`);
      }
      const data: SyncResult = await res.json();
      setLogs((p) => [
        ...p,
        `  BNBU 总教师数: ${data.bnbuTotal}`,
        `  已匹配 (在职): ${data.matched}`,
        `  未匹配 (已离职): ${data.notFound}`,
        data.unmatched.length > 0 ? `  未导入的老师: ${data.unmatched.length} 人` : "  所有老师均在库中",
      ]);
      setResult(data);
    } catch (e: any) {
      setError(e.message || "同步失败");
    }
    setSyncing(false);
  }

  async function importUnmatched() {
    if (!result || !selectedMajor || result.unmatched.length === 0) return;
    setImporting(true);
    setError(null);

    try {
      const usernames = result.unmatched.map((t) => t.username);
      const res = await fetch("/api/admin/sync-faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames, majorId: selectedMajor }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "导入失败");
      }
      const data = await res.json();
      setLogs((p) => [...p, `  成功导入: ${data.imported} 位老师`]);
      setResult(null); // reset after import
      setSelectedMajor("");
    } catch (e: any) {
      setError(e.message || "导入失败");
    }
    setImporting(false);
  }

  const major = majors.find((m) => m.id === selectedMajor);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">BNBU 师资同步</h2>
      <p className="text-sm text-gray-500 mb-4">
        从 BNBU 官网同步老师数据，自动标记已离职老师，并可一键导入新老师。
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

      {result && result.unmatched.length > 0 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            发现 {result.unmatched.length} 位 BNBU 老师尚未导入
          </h3>

          <div className="mb-4 max-h-48 overflow-y-auto bg-white rounded border p-2">
            {result.unmatched.slice(0, 50).map((t) => (
              <div key={t.username} className="text-sm py-1 border-b border-gray-100 last:border-0">
                <span className="font-medium">{t.name}</span>
                <span className="text-gray-400 ml-2">{t.title}</span>
                <span className="text-gray-400 ml-2">{t.email}</span>
              </div>
            ))}
            {result.unmatched.length > 50 && (
              <p className="text-sm text-gray-400 text-center py-1">... 还有 {result.unmatched.length - 50} 位</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">请选择导入到哪个专业</option>
              {majors.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <button
              onClick={importUnmatched}
              disabled={importing || !selectedMajor}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              {importing ? "导入中..." : `导入全部到${major ? "「" + major.name + "」" : ""}`}
            </button>
          </div>
        </div>
      )}

      {result && result.unmatched.length === 0 && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-700 rounded-lg p-4">
          同步完成！所有 BNBU 老师均已在库中
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
