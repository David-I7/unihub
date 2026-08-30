import { Page } from "@/types/page";

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  estimatedAge?: number;
  averageRating: number;
  ratingsCount: number;
  createdAt: string;
}

export interface TeacherMetricRating {
  metricId: number;
  metricName: string;
  description?: string;
  averageRating: number;
  ratingsCount: number;
}

export interface TeacherRatingValue {
  metricId: number;
  metricName: string;
  value: number;
}

export interface TeacherRatingAuthor {
  id: string;
  username: string;
  active: boolean;
}

export interface TeacherRating {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
  isAnonymous: boolean;
  author?: TeacherRatingAuthor;
  values: TeacherRatingValue[];
}

export interface CourseIdentifier {
  id: number;
  name: string;
  slug: string;
  abbreviation: string;
  semester: number;
}

export interface TeacherDetail {
  id: string;
  firstName: string;
  lastName: string;
  estimatedAge?: number;
  averageRating: number;
  ratingsCount: number;
  createdAt: string;
  coursesTaught: CourseIdentifier[];
  detailedRatings: TeacherMetricRating[];
  ratings: Page<TeacherRating>;
}

export interface CreateTeacherRequest {
  firstName: string;
  lastName: string;
  estimatedAge?: number;
}

export interface UpdateTeacherRequest {
  firstName?: string;
  lastName?: string;
  estimatedAge?: number;
}
