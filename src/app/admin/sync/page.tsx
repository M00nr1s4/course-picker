"use client";
import { useState, useEffect } from "react";

interface SyncResult {
  matched: number; notFound: number; total: number; bnbuTotal: number;
  unmatched: { username: string; name: string; title: string; email: string }[];
}

interface CourseResult { note?: string;
  coursesCreated: number; coursesSkipped: number; teachersWithCourses: number;
  totalTeachers: number; results: string[];
}

interface Major { id: string; name: string; }

export default function AdminSyncPage() {
  const [syncing, setSyncing] = useState(false);
  const [courseSyncing, setCourseSyncing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [courseResult, setCourseResult] = useState<CourseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [selectedMajor, setSelectedMajor] = useState("");

  useEffect(() => { fetch("/api/majors").then((r) => r.json()).then(setMajors); }, []);

  async function runSync() {
    setSyncing(true); setResult(null); setCourseResult(null); setError(null);
    setLogs(["正在同步 BNBU 师资数据..."]); setSelectedMajor("");

    try {
      const res = await fetch("/api/admin/sync-faculty");
      if (!res.ok) { const d = await res.json().catch(()=>({})); throw new Error(d.error||`请求失败 (${res.status})`); }
      const data: SyncResult = await res.json();
      setLogs(p=>[...p,`  BNBU 总教师数: ${data.bnbuTotal}`,`  已匹配 (在职): ${data.matched}`,`  未匹配 (已离职): ${data.notFound}`,data.unmatched.length>0?`  未导入的老师: ${data.unmatched.length} 人`:"  所有老师均在库中"]);
      setResult(data);
    } catch (e: any) { setError(e.message||"同步失败"); }
    setSyncing(false);
  }

  async function syncCourses() {
    setCourseSyncing(true); setCourseResult(null); setError(null);
    setLogs(p=>[...p,`\n正在同步课程数据...`]);

    try {
      const res = await fetch("/api/admin/sync-courses");
      if (!res.ok) { const d = await res.json().catch(()=>({})); throw new Error(d.error||`请求失败 (${res.status})`); }
      const data: CourseResult = await res.json();
      setLogs(p=>[...p,`  创建课程: ${data.coursesCreated} 门`,`  跳过已有: ${data.coursesSkipped} 门`,`  涉及老师: ${data.teachersWithCourses} 位`]);
      if (data.results.length > 0) data.results.forEach(r=>setLogs(p=>[...p,`  ${r}`]));
      setCourseResult(data);
    } catch (e: any) { setError(e.message||"课程同步失败"); }
    setCourseSyncing(false);
  }

  async function importUnmatched() {
    if (!result || !selectedMajor || result.unmatched.length === 0) return;
    setImporting(true); setError(null);

    try {
      const usernames = result.unmatched.map((t) => t.username);
      const res = await fetch("/api/admin/sync-faculty", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({usernames, majorId: selectedMajor}) });
      if (!res.ok) { const d = await res.json().catch(()=>({})); throw new Error(d.error||"导入失败"); }
      const data = await res.json();
      setLogs(p=>[...p,`  成功导入: ${data.imported} 位老师`]);
      setResult(null); setSelectedMajor("");
    } catch (e: any) { setError(e.message||"导入失败"); }
    setImporting(false);
  }

  
      {/* Course Sync Section */}
      {result && (
        <div className="mt-8">
          <hr className="border-[#E5E7EB] mb-6" />
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📚</span>
            <h2 className="text-lg font-bold text-[#1F2937]">课程同步</h2>
          </div>
          <p className="text-sm text-[#6B7280] mb-4">
            从 BNBU 老师资料的"教学"栏目中提取课程信息并同步到本网站。
          </p>
          <button onClick={syncCourses} disabled={courseSyncing} className="bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] transition-all disabled:opacity-50">{courseSyncing?"同步中...":"同步课程 📚"}</button>

          {courseResult && (
            <div className="mt-4 bg-[#ECFDF5] border border-[#6EE7B7] rounded-[20px] p-4">
              <p className="text-sm font-bold text-[#065F46] mb-1">✅ 课程同步完成</p>
              <p className="text-sm text-[#065F46]">新增 {courseResult.coursesCreated} 门，涉及 {courseResult.teachersWithCourses} 位老师</p>
              {courseResult.coursesSkipped > 0 && <p className="text-sm text-[#065F46]">{courseResult.coursesSkipped} 门已跳过</p>}
              <p className="text-xs text-[#065F46] mt-1 opacity-70">数据来源: {courseResult.note || "BNBU 教师资料"}</p>
              {courseResult.results.length > 0 && (
                <div className="mt-2 max-h-32 overflow-y-auto">
                  {courseResult.results.map((r,i) => <p key={i} className="text-xs text-[#065F46]">{r}</p>)}
                </div>
              )}
            </div>
          )}
          {courseResult && courseResult.coursesCreated === 0 && (
            <div className="mt-4 bg-[#FFFBEB] border border-[#FCD34D] rounded-[20px] p-4 text-sm text-[#92400E]">
              ⚠️ 未找到可导入的新课程。可能老师资料中未填写"教学"栏目，或课程已全部导入。
            </div>
          )}

          {/* Delete all courses - danger zone */}
          <div className="mt-6 p-4 border border-red-200 rounded-[20px] bg-red-50">
            <p className="text-sm font-bold text-red-700 mb-2">⚠️ 危险操作</p>
            <p className="text-xs text-red-600 mb-3">清空所有课程数据（包含已导入的课程），此操作不可撤销。</p>
            <button onClick={async()=>{if(!confirm("确定要删除所有课程吗？此操作不可撤销！"))return;try{const r=await fetch("/api/admin/sync-courses",{method:"DELETE"});if(r.ok){alert("所有课程已删除");setLogs(p=>[...p,"已清空所有课程"])}else{alert("删除失败")}}catch(e){alert("删除失败")}}} className="bg-red-500 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-red-600 transition-all">清空所有课程 🗑️</button>
          </div>
        </div>
      )}
const major = majors.find((m) => m.id === selectedMajor);

  return (
    <div>
      {/* Teacher Sync */}
      <h2 className="text-lg font-bold text-[#1F2937] mb-4">BNBU 师资同步 👨‍🏫</h2>
      <p className="text-sm text-[#6B7280] mb-4">从 BNBU 官网同步老师数据，自动标记已离职老师，并可一键导入新老师。</p>
      <button onClick={runSync} disabled={syncing} className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] transition-all disabled:opacity-50">{syncing?"同步中...":"开始同步 🚀"}</button>

      {logs.length > 0 && (
        <div className="mt-4 bg-[#FAFAFA] border border-[#E5E7EB] rounded-[20px] p-4 max-h-60 overflow-y-auto">
          {logs.map((log, i) => (<p key={i} className="text-sm text-[#1F2937] font-mono whitespace-pre-wrap">{log}</p>))}
        </div>
      )}

      {/* Import new teachers */}
      {result && result.unmatched.length > 0 && (
        <div className="mt-6 bg-[#FFFBEB] border border-[#FCD34D] rounded-[20px] p-5">
          <h3 className="font-bold text-[#1F2937] mb-2">发现 {result.unmatched.length} 位 BNBU 老师尚未导入</h3>
          <div className="mb-4 max-h-48 overflow-y-auto bg-white rounded-[16px] border p-2">
            {result.unmatched.slice(0, 50).map((t) => (
              <div key={t.username} className="text-sm py-1.5 px-2 border-b border-gray-100 last:border-0">
                <span className="font-medium">{t.name}</span><span className="text-[#6B7280] ml-2">{t.title}</span><span className="text-[#9CA3AF] ml-2">{t.email}</span>
              </div>
            ))}
            {result.unmatched.length > 50 && <p className="text-sm text-[#9CA3AF] text-center py-1">... 还有 {result.unmatched.length - 50} 位</p>}
          </div>
          <div className="flex items-center gap-3">
            <select value={selectedMajor} onChange={e=>setSelectedMajor(e.target.value)} className="border border-[#E5E7EB] rounded-[16px] px-4 py-2.5 text-sm bg-white"><option value="">请选择导入到哪个专业</option>{majors.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select>
            <button onClick={importUnmatched} disabled={importing||!selectedMajor} className="bg-[#10B981] text-white px-4 py-2.5 rounded-full text-sm font-bold hover:bg-[#059669] transition-all disabled:opacity-50">{importing?"导入中...":`导入全部到${major?"「"+major.name+"」":""}`}</button>
          </div>
        </div>
      )}

      {result && result.unmatched.length === 0 && (
        <div className="mt-4 bg-[#ECFDF5] border border-[#6EE7B7] text-[#065F46] rounded-[20px] p-4 text-sm font-medium">✅ 同步完成！所有 BNBU 老师均已在库中</div>
      )}

      {/* Course Sync */}
      {result && (
        <div className="mt-8">
          <hr className="border-[#E5E7EB] mb-6" />
          <h2 className="text-lg font-bold text-[#1F2937] mb-4">课程同步 📚</h2>
          <p className="text-sm text-[#6B7280] mb-4">从 BNBU 老师资料中提取课程信息并导入（首次导入后，已有课程不会重复添加）。</p>
          <button onClick={syncCourses} disabled={courseSyncing} className="bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] transition-all disabled:opacity-50">{courseSyncing?"同步中...":"同步课程 📚"}</button>

          {courseResult && (
            <div className="mt-4 bg-[#ECFDF5] border border-[#6EE7B7] rounded-[20px] p-4">
              <p className="text-sm font-bold text-[#065F46] mb-1">✅ 课程同步完成</p>
              <p className="text-sm text-[#065F46]">新增 {courseResult.coursesCreated} 门课程，{courseResult.teachersWithCourses} 位老师受到影响</p>
              {courseResult.coursesSkipped > 0 && <p className="text-sm text-[#065F46]">{courseResult.coursesSkipped} 门已有课程已跳过</p>}
            </div>
          )}
          {courseResult && courseResult.coursesCreated === 0 && (
            <div className="mt-2 text-sm text-[#6B7280]">没有找到可导入的新课程。可能老师资料中不包含课程信息，或课程已全部导入。</div>
          )}
        </div>
      )}

      {error && <div className="mt-4 bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] rounded-[20px] p-4 text-sm font-medium">错误: {error}</div>}
    </div>
  );
}
