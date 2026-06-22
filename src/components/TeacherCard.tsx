import Link from "next/link";
import StarRating from "./StarRating";

interface TeacherCardProps {
  id: string; name: string; title: string; majorName: string;
  avgRating: number | null; reviewCount: number; status?: string;
}

export default function TeacherCard({ id, name, title, majorName, avgRating, reviewCount, status }: TeacherCardProps) {
  return (
    <Link href={`/teachers/${id}`}>
      <div className="bg-white rounded-[14px] border border-gray-100 p-5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-[#1d1d1f]">{name.charAt(0)}</span>
            </div>
            <div>
              <h3 className="font-semibold text-[#1d1d1f] text-[15px] leading-tight">{name}</h3>
              <p className="text-sm text-[#86868b] mt-0.5">{title}</p>
              <p className="text-xs text-[#aeaeb2] mt-1">{majorName}</p>
            </div>
          </div>
          <div className="text-right shrink-0 ml-4">
            <StarRating value={avgRating} size="sm" />
            <p className="text-xs text-[#aeaeb2] mt-1">{reviewCount} 条评价</p>
          </div>
        </div>
        {status === "LEFT" && (
          <div className="mt-3">
            <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">已离职</span>
          </div>
        )}
      </div>
    </Link>
  );
}
