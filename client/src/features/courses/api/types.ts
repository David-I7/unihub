import type { Teacher, TeacherSummary } from "@/features/teachers/api/types";
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
  readme?: string;
  createdAt: string;
}

export interface CourseCardInfo {
  id: number;
  name: string;
  slug: string;
  abbreviation: string;
  semester: number;
  creditPoints: number;
  archived: boolean;
  description?: string;
  teachers: TeacherSummary[];
}

export interface CourseHome {
  course: Course;
  teachers: Teacher[];
}

export type CourseTeachers = CourseHome;

export type MaterialLinkType =
  | "VIDEO"
  | "DRIVE"
  | "GITHUB"
  | "DOCS"
  | "DOCX"
  | "OTHER";

export interface CreateFolderPayload {
  name: string;
  parentFolderId?: string | null;
}

export interface UpdateFolderPayload {
  name?: string;
  parentFolderId?: string | null;
  moveToRoot?: boolean;
}

export interface PresignedUploadUrlRequest {
  fileName: string;
  contentType: string;
  size: number;
}

export interface PresignedUploadUrlResponse {
  uploadUrl: string;
  storageKey: string;
}

export interface CreateMaterialFilePayload {
  title: string;
  description?: string;
  folderId?: string | null;
  storageKey: string;
  mediaType: string;
  size: number;
}

export interface CreateMaterialLinkPayload {
  title: string;
  description?: string;
  folderId?: string | null;
  url: string;
  linkType: MaterialLinkType;
}

export interface UpdateMaterialPayload {
  title?: string;
  description?: string;
  folderId?: string | null;
  moveToRoot?: boolean;
  url?: string;
  linkType?: MaterialLinkType;
}

export interface DownloadUrlResponse {
  downloadUrl: string;
}

export interface CourseIndentifiers {
  id: number;
  name: string;
  slug: string;
  abbreviation: string;
  semester: number;
}

export type CourseIdentifiers = CourseIndentifiers;

export interface CreateCoursePayload {
  name: string;
  slug: string;
  abbreviation: string;
  semester: number;
  creditPoints?: number;
  description?: string;
  readme?: string;
  teacherIds?: string[];
}

export interface UpdateCoursePayload {
  name?: string;
  slug?: string;
  abbreviation?: string;
  semester?: number;
  creditPoints?: number;
  description?: string;
  readme?: string;
  archived?: boolean;
  teacherIds?: string[];
}

export interface EditCourseReadmePayload {
  readme: string;
}
