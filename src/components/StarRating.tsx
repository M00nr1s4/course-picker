interface Props {
  value: number | null;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({ value, size = "md" }: Props) {
  if (value === null) return <span className="text-sm text-[#aeaeb2]">暂无评分</span>;

  const sz = size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-base";
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.5;

  return (
    <span className={`${sz} text-[#ff9f0a] tracking-wide`} title={`${value.toFixed(1)} 分`}>
      {"★".repeat(full)}{hasHalf ? "½" : ""}{"☆".repeat(5 - full - (hasHalf ? 1 : 0))}
      <span className="text-[#86868b] ml-1.5 font-medium">{value.toFixed(1)}</span>
    </span>
  );
}
