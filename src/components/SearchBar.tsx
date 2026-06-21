"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchResult } from "@/types";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleInput(value: string) {
    setQuery(value);
    if (value.trim().length < 1) {
      setShowDropdown(false);
      return;
    }
    const res = await fetch(`/api/teachers/search?q=${encodeURIComponent(value)}`);
    const data = await res.json();
    setResults(data);
    setShowDropdown(true);
  }

  return (
    <div ref={ref} className="relative w-full max-w-lg">
      <div className="relative">
        <input
          type="text"
          placeholder="搜索老师、课程或专业..."
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => query.trim() && setShowDropdown(true)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {showDropdown && results && (
        <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.teachers.length > 0 && (
            <div className="p-2">
              <p className="text-xs text-gray-500 px-2 py-1 font-semibold">老师</p>
              {results.teachers.map((t) => (
                <button
                  key={t.id}
                  className="w-full text-left px-2 py-1.5 hover:bg-gray-100 rounded text-sm"
                  onClick={() => { router.push(`/teachers/${t.id}`); setShowDropdown(false); setQuery(""); }}
                >
                  {t.name} - {t.title}
                  <span className="text-gray-400 ml-2">{t.majorName}</span>
                </button>
              ))}
            </div>
          )}
          {results.courses.length > 0 && (
            <div className="p-2 border-t">
              <p className="text-xs text-gray-500 px-2 py-1 font-semibold">课程</p>
              {results.courses.map((c) => (
                <button
                  key={c.id}
                  className="w-full text-left px-2 py-1.5 hover:bg-gray-100 rounded text-sm"
                  onClick={() => { router.push(`/teachers/${c.id}`); setShowDropdown(false); setQuery(""); }}
                >
                  {c.name} ({c.code})
                  <span className="text-gray-400 ml-2">{c.teacherName}</span>
                </button>
              ))}
            </div>
          )}
          {results.majors.length > 0 && (
            <div className="p-2 border-t">
              <p className="text-xs text-gray-500 px-2 py-1 font-semibold">专业</p>
              {results.majors.map((m) => (
                <button
                  key={m.id}
                  className="w-full text-left px-2 py-1.5 hover:bg-gray-100 rounded text-sm"
                  onClick={() => { router.push(`/majors/${m.id}`); setShowDropdown(false); setQuery(""); }}
                >
                  {m.name}
                </button>
              ))}
            </div>
          )}
          {results.teachers.length === 0 && results.courses.length === 0 && results.majors.length === 0 && (
            <p className="text-sm text-gray-400 p-4 text-center">未找到结果</p>
          )}
        </div>
      )}
    </div>
  );
}
