export interface MajorWithStats {
  id: string;
  name: string;
  teacherCount: number;
}

export interface TeacherWithStats {
  id: string;
  name: string;
  title: string;
  majorId: string;
  majorName: string;
  avgRating: number | null;
  reviewCount: number;
}

export interface TeacherDetail {
  id: string;
  name: string;
  title: string;
  majorId: string;
  majorName: string;
  courses: { id: string; name: string; code: string }[];
  avgRatings: {
    teachingAttitude: number | null;
    clarity: number | null;
    workloadReasonableness: number | null;
    gradingFriendliness: number | null;
    overall: number | null;
  };
  reviewCount: number;
}

export interface ReviewResponse {
  id: string;
  userId: string;
  userName: string;
  teacherId: string;
  courseId: string;
  courseName: string;
  teachingAttitude: number;
  clarity: number;
  workloadReasonableness: number;
  gradingFriendliness: number;
  comment: string;
  status: string;
  createdAt: string;
}

export interface SearchResult {
  teachers: TeacherWithStats[];
  courses: { id: string; name: string; code: string; teacherName: string }[];
  majors: { id: string; name: string }[];
}
