"use client";
import { useState, useEffect } from "react";

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [majorId, setMajorId] = useState("");
  const [error, setError] = useState("");

  async function load() { const [tR,mR]=await Promise.all([fetch("/api/teachers/search?q="),fetch("/api/majors")]); setTeachers((await tR.json()).teachers); setMajors(await mR.json()); }
  useEffect(()=>{load();},[]);
  async function add(e:React.FormEvent) { e.preventDefault(); setError(""); const r=await fetch("/api/admin/teachers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,title,majorId})}); if(r.ok){setName("");setTitle("");setMajorId("");load();}else{const d=await r.json();setError(d.error);} }
  async function del(id:string) { if(!confirm("确定删除？")) return; const r=await fetch("/api/admin/teachers",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})}); if(r.ok)load(); else {const d=await r.json();alert(d.error);} }

  return (
    <div>
      <form onSubmit={add} className="flex gap-2 mb-6 flex-wrap">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="姓名" className="border rounded-lg px-3 py-2 w-32" />
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="职称" className="border rounded-lg px-3 py-2 w-28" />
        <select value={majorId} onChange={e=>setMajorId(e.target.value)} className="border rounded-lg px-3 py-2"><option value="">选择专业</option>{majors.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">添加</button>
      </form>
      {error&&<p className="text-red-500 text-sm mb-2">{error}</p>}
      <div className="space-y-2">{teachers.map((t:any)=><div key={t.id} className="flex justify-between items-center bg-white border border-gray-200 rounded-lg px-4 py-3"><div><span className="font-medium">{t.name}</span><span className="text-sm text-gray-400 ml-2">{t.title}</span><span className="text-sm text-gray-400 ml-2">{t.majorName}</span></div><button onClick={()=>del(t.id)} className="text-sm text-red-500 hover:text-red-700">删除</button></div>)}</div>
    </div>
  );
}
