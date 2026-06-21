"use client";
import { useState } from "react";

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

export default function StarRatingInput({ value, onChange, label }: StarRatingInputProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm text-gray-600 w-24">{label}</span>}
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`text-2xl transition-colors ${
              star <= (hover || value) ? "text-yellow-400" : "text-gray-300"
            } hover:text-yellow-400`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}
