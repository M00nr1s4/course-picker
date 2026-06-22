"use client";
import { useState } from "react";

interface Props { value: number; onChange: (v: number) => void; label?: string; }
export default function StarRatingInput({ value, onChange, label }: Props) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm text-[#6B7280] w-24 font-medium">{label}</span>}
      <div className="flex">{[1,2,3,4,5].map(s => (
        <button key={s} type="button" className={`text-2xl transition-all ${s<=(hover||value)?"text-[#F59E0B] drop-shadow-[0_1px_3px_rgba(245,158,11,0.4)] scale-110":"text-[#D1D5DB]"} hover:text-[#F59E0B] hover:scale-110`} onClick={()=>onChange(s)} onMouseEnter={()=>setHover(s)} onMouseLeave={()=>setHover(0)}>★</button>
      ))}</div>
    </div>
  );
}
