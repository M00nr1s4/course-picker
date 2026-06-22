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
        <div className="absolute left-4 top-3.5 text-lg">🔍</div>
        <input
          type="text"
          placeholder="搜索老师、课程或专业..."
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => query.trim() && setShow(true)}
          className="w-full pl-12 pr-5 py-3.5 bg-white rounded-[20px] text-[15px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 shadow-[0_2px_12px_rgba(0,0,0,0.06)] focus:shadow-[0_4px_20px_rgba(124,58,237,0.12)] transition-all border border-[#E5E7EB]"
        />
      </div>
      {show && results && (
        <div className="absolute mt-2 w-full bg-white border border-[#E5E7EB] rounded-[20px] shadow-[0_12px_36px_rgba(124,58,237,0.18)] z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            {results.teachers.map((t) => (
              <button key={t.id} className="w-full text-left px-4 py-3 hover:bg-[#FAFAFA] rounded-[14px] text-[15px] transition-colors flex items-center gap-3" onClick={() => { router.push(`/teachers/${t.id}`); setShow(false); setQuery(""); }}>
                <span className="text-lg">👨‍🏫</span>
                <div>
                  <span className="font-semibold text-[#1F2937]">{t.name}</span>
                  <span className="text-[#6B7280] ml-2">{t.title}</span>
                  <span className="text-[#9CA3AF] ml-2 text-sm">{t.majorName}</span>
                </div>
              </button>
            ))}
            {results.courses.map((c) => (
              <button key={c.id} className="w-full text-left px-4 py-3 hover:bg-[#FAFAFA] rounded-[14px] text-[15px] transition-colors flex items-center gap-3" onClick={() => { router.push(`/teachers/${c.id}`); setShow(false); setQuery(""); }}>
                <span className="text-lg">📚</span>
                <div>
                  <span className="font-semibold text-[#1F2937]">{c.name}</span>
                  <span className="text-[#6B7280] ml-2">({c.code})</span>
                  <span className="text-[#9CA3AF] ml-2 text-sm">{c.teacherName}</span>
                </div>
              </button>
            ))}
            {results.majors.map((m) => (
              <button key={m.id} className="w-full text-left px-4 py-3 hover:bg-[#FAFAFA] rounded-[14px] text-[15px] transition-colors flex items-center gap-3" onClick={() => { router.push(`/majors/${m.id}`); setShow(false); setQuery(""); }}>
                <span className="text-lg">🏫</span>
                <span className="font-semibold text-[#1F2937]">{m.name}</span>
              </button>
            ))}
            {results.teachers.length === 0 && results.courses.length === 0 && results.majors.length === 0 && (
              <p className="text-sm text-[#9CA3AF] p-6 text-center">😅 未找到结果</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
