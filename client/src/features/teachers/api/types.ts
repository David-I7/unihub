import type { CallerMembership } from "@/features/communities/api/types";

export type { CallerMembership };

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

export interface TeacherMetricRatingInput {
  metricId: number;
  value: number;
}

export interface CreateTeacherRatingRequest {
  title: string;
  description?: string;
  isAnonymous: boolean;
  values: TeacherMetricRatingInput[];
}

export interface UpdateTeacherRatingRequest {
  title: string;
  description?: string;
  isAnonymous: boolean;
  values: TeacherMetricRatingInput[];
}
