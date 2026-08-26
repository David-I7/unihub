import type { Teacher } from "@/features/teachers/api/types";
import type { ResourceOwner } from "@/types/domain";

export interface CourseMaterialFolder {
  id: string;
  name: string;
  parentFolderId: string | null;
  createdAt: string;
  owner: ResourceOwner;
}

export interface CourseMaterialFile {
  id: string;
  title: string;
  description?: string;
  storageKey: string;
  mediaType: string;
  size: number;
  createdAt: string;
  owner: ResourceOwner;
}

export interface CourseMaterialLink {
  id: string;
  title: string;
  description?: string;
  url: string;
  linkType: string;
  createdAt: string;
  owner: ResourceOwner;
}

export interface CourseMaterialsResponse {
  folders: CourseMaterialFolder[];
  files: CourseMaterialFile[];
  links: CourseMaterialLink[];
}

export interface Course {
  id: number;
  name: string;
  slug: string;
  abbreviation: string;
  semester: number;
  creditPoints: number;
  archived: boolean;
  description?: string;
  createdAt?: string;
}

export interface CourseTeachers {
  course: Course;
  teachers: Teacher[];
}
