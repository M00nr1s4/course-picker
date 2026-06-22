"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchResult } from "@/types";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [show, setShow] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function f(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setShow(false); }
    document.addEventListener("mousedown", f);
    return () => document.removeEventListener("mousedown", f);
  }, []);

  async function handleInput(v: string) {
    setQuery(v);
    if (v.trim().length < 1) { setShow(false); return; }
    const res = await fetch(`/api/teachers/search?q=${encodeURIComponent(v)}`);
    setResults(await res.json());
    setShow(true);
  }

  return (
    <div ref={ref} className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <svg className="absolute left-4 top-3.5 h-5 w-5 text-[#aeaeb2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="搜索老师、课程或专业..."
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => query.trim() && setShow(true)}
          className="w-full pl-12 pr-5 py-3.5 bg-[#f5f5f7] rounded-[14px] text-[15px] text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:bg-white transition-all"
        />
      </div>
      {show && results && (
        <div className="absolute mt-2 w-full bg-white border border-gray-100 rounded-[14px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-50 max-h-80 overflow-y-auto backdrop-blur-xl">
          {results.teachers.length > 0 && (
            <div className="p-2">
              {results.teachers.map((t) => (
                <button key={t.id} className="w-full text-left px-3 py-2.5 hover:bg-[#f5f5f7] rounded-[10px] text-[15px] transition-colors" onClick={() => { router.push(`/teachers/${t.id}`); setShow(false); setQuery(""); }}>
                  <span className="font-medium text-[#1d1d1f]">{t.name}</span>
                  <span className="text-[#86868b] ml-2">{t.title}</span>
                  <span className="text-[#aeaeb2] ml-2 text-sm">{t.majorName}</span>
                </button>
              ))}
            </div>
          )}
          {results.courses.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              {results.courses.map((c) => (
                <button key={c.id} className="w-full text-left px-3 py-2.5 hover:bg-[#f5f5f7] rounded-[10px] text-[15px] transition-colors" onClick={() => { router.push(`/teachers/${c.id}`); setShow(false); setQuery(""); }}>
                  <span className="font-medium text-[#1d1d1f]">{c.name}</span>
                  <span className="text-[#86868b] ml-2">({c.code})</span>
                  <span className="text-[#aeaeb2] ml-2 text-sm">{c.teacherName}</span>
                </button>
              ))}
            </div>
          )}
          {results.majors.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              {results.majors.map((m) => (
                <button key={m.id} className="w-full text-left px-3 py-2.5 hover:bg-[#f5f5f7] rounded-[10px] text-[15px] transition-colors" onClick={() => { router.push(`/majors/${m.id}`); setShow(false); setQuery(""); }}>{m.name}</button>
              ))}
            </div>
          )}
          {results.teachers.length === 0 && results.courses.length === 0 && results.majors.length === 0 && (
            <p className="text-sm text-[#aeaeb2] p-5 text-center">未找到结果</p>
          )}
        </div>
      )}
    </div>
  );
}
