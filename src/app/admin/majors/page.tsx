"use client";
import { useState, useEffect } from "react";

export default function AdminMajorsPage() {
  const [majors, setMajors] = useState<any[]>([]);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");

  async function load() { const r=await fetch("/api/majors"); setMajors(await r.json()); }
  useEffect(()=>{load();},[]);

  async function add(e:React.FormEvent) { e.preventDefault(); setError(""); const r=await fetch("/api/admin/majors",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:newName})}); if(r.ok){setNewName("");load();}else{const d=await r.json();setError(d.error);} }
  async function del(id:string) { if(!confirm("确定删除？")) return; const r=await fetch("/api/admin/majors",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})}); if(r.ok)load(); else {const d=await r.json();alert(d.error);} }

  return (
    <div>
      <form onSubmit={add} className="flex gap-2 mb-6">
        <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="新专业名称" className="flex-1 border border-gray-300 rounded-lg px-3 py-2" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">添加</button>
      </form>
      {error&&<p className="text-red-500 text-sm mb-2">{error}</p>}
      <div className="space-y-2">{majors.map(m=><div key={m.id} className="flex justify-between items-center bg-white border border-gray-200 rounded-lg px-4 py-3"><div><span className="font-medium">{m.name}</span><span className="text-sm text-gray-400 ml-2">{m.teacherCount} 位老师</span></div><button onClick={()=>del(m.id)} className="text-sm text-red-500 hover:text-red-700">删除</button></div>)}</div>
    </div>
  );
}
