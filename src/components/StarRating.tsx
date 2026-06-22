interface Props {
  value: number | null;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({ value, size = "md" }: Props) {
  if (value === null) return <span className="text-sm text-[#9CA3AF]">暂无评分</span>;

  const sz = size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-base";
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.5;

  return (
    <span className={`${sz} text-[#F59E0B] tracking-wider drop-shadow-[0_1px_2px_rgba(245,158,11,0.3)]`}>
      {"★".repeat(full)}{hasHalf ? "½" : ""}{"☆".repeat(5 - full - (hasHalf ? 1 : 0))}
      <span className="text-[#6B7280] ml-1.5 font-bold">{value.toFixed(1)}</span>
    </span>
  );
}
