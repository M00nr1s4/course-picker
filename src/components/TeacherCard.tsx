import Link from "next/link";
import StarRating from "./StarRating";

interface TeacherCardProps {
  id: string;
  name: string;
  title: string;
  majorName: string;
  avgRating: number | null;
  reviewCount: number;
}

export default function TeacherCard({ id, name, title, majorName, avgRating, reviewCount }: TeacherCardProps) {
  return (
    <Link href={`/teachers/${id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-xs text-gray-400 mt-1">{majorName}</p>
          </div>
          <div className="text-right">
            <StarRating value={avgRating} size="sm" />
            <p className="text-xs text-gray-400 mt-1">{reviewCount} 条评价</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
