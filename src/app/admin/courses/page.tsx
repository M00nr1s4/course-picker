"use client";
import { useState, useEffect } from "react";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [error, setError] = useState("");

  async function load() { const [cR,tR]=await Promise.all([fetch("/api/courses"),fetch("/api/teachers/search?q=")]); setCourses(await cR.json()); setTeachers((await tR.json()).teachers); }
  useEffect(()=>{load();},[]);
  async function add(e:React.FormEvent) { e.preventDefault(); setError(""); const r=await fetch("/api/admin/courses",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,code,teacherId})}); if(r.ok){setName("");setCode("");setTeacherId("");load();}else{const d=await r.json();setError(d.error);} }
  async function del(id:string) { if(!confirm("确定删除？")) return; const r=await fetch("/api/admin/courses",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})}); if(r.ok)load(); else {const d=await r.json();alert(d.error);} }

  return (
    <div>
      <form onSubmit={add} className="flex gap-2 mb-6 flex-wrap">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="课程名称" className="border rounded-lg px-3 py-2 w-40" />
        <input value={code} onChange={e=>setCode(e.target.value)} placeholder="课程代码" className="border rounded-lg px-3 py-2 w-28" />
        <select value={teacherId} onChange={e=>setTeacherId(e.target.value)} className="border rounded-lg px-3 py-2"><option value="">选择老师</option>{teachers.map((t:any)=><option key={t.id} value={t.id}>{t.name}</option>)}</select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">添加</button>
      </form>
      {error&&<p className="text-red-500 text-sm mb-2">{error}</p>}
      <div className="space-y-2">{courses.map((c:any)=><div key={c.id} className="flex justify-between items-center bg-white border border-gray-200 rounded-lg px-4 py-3"><div><span className="font-medium">{c.name}</span><span className="text-sm text-gray-400 ml-2">({c.code})</span><span className="text-sm text-gray-400 ml-2">{c.teacherName}</span></div><button onClick={()=>del(c.id)} className="text-sm text-red-500 hover:text-red-700">删除</button></div>)}</div>
    </div>
  );
}
