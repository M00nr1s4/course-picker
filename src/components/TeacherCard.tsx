import Link from "next/link";
import StarRating from "./StarRating";

interface TeacherCardProps {
  id: string; name: string; title: string; majorName: string;
  avgRating: number | null; reviewCount: number; status?: string;
}

const colors = ["#7C3AED","#EC4899","#F59E0B","#10B981","#3B82F6","#EF4444"];

export default function TeacherCard({ id, name, title, majorName, avgRating, reviewCount, status }: TeacherCardProps) {
  const color = colors[name.length % colors.length];
  return (
    <Link href={`/teachers/${id}`}>
      <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-5 hover:shadow-[0_12px_32px_rgba(124,58,237,0.12)] hover:-translate-y-1 transition-all duration-300 cursor-pointer">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 text-white text-base font-bold shadow-md" style={{backgroundColor: color}}>
              {name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-[#1F2937] text-[15px] leading-tight">{name}</h3>
              <p className="text-sm text-[#6B7280] mt-0.5">{title}</p>
              <p className="text-xs text-[#9CA3AF] mt-1">{majorName}</p>
            </div>
          </div>
          <div className="text-right shrink-0 ml-4">
            <StarRating value={avgRating} size="sm" />
            <p className="text-xs text-[#9CA3AF] mt-1">{reviewCount} 条评价</p>
          </div>
        </div>
        {status === "LEFT" && (
          <div className="mt-3">
            <span className="text-xs bg-red-50 text-red-500 px-2.5 py-0.5 rounded-full font-medium">已离职</span>
          </div>
        )}
      </div>
    </Link>
  );
}
