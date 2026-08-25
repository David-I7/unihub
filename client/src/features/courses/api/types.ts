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

export interface CourseExam {
  id: string;
  title: string;
  description: string;
  scheduledDate: string;
  estimatedDurationMinutes: number;
  createdAt: string;
  owner: ResourceOwner;
}

export interface CourseLecture {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: "ONLINE" | "IN_PERSON";
  createdAt: string;
  owner: ResourceOwner;
}

export interface CourseAssignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  estimatedDurationMinutes: number;
  createdAt: string;
  owner: ResourceOwner;
}
