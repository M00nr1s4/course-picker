interface StarRatingProps {
  value: number | null;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({ value, size = "md" }: StarRatingProps) {
  if (value === null) return <span className="text-gray-400 text-sm">暂无评分</span>;

  const sizeClass = size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base";
  const full = Math.floor(value);
  const half = value - full >= 0.5;

  return (
    <span className={`${sizeClass} text-yellow-400`} title={`${value.toFixed(1)} 分`}>
      {"★".repeat(full)}
      {half ? "½" : ""}
      {"☆".repeat(5 - full - (half ? 1 : 0))}
      <span className="text-gray-500 ml-1">{value.toFixed(1)}</span>
    </span>
  );
}
