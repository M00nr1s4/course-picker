"use client";
import { useState } from "react";

interface Props { value: number; onChange: (v: number) => void; label?: string; }
export default function StarRatingInput({ value, onChange, label }: Props) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm text-[#86868b] w-24">{label}</span>}
      <div className="flex">{[1,2,3,4,5].map(s => (
        <button key={s} type="button" className={`text-2xl transition-colors ${s<=(hover||value)?"text-[#ff9f0a]":"text-[#d2d2d7]"} hover:text-[#ff9f0a]`} onClick={()=>onChange(s)} onMouseEnter={()=>setHover(s)} onMouseLeave={()=>setHover(0)}>★</button>
      ))}</div>
    </div>
  );
}
