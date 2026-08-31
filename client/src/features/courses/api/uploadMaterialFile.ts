import client from "@/api/client";
import axios, { type AxiosProgressEvent } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CourseMaterialFile,
  CreateMaterialFilePayload,
  PresignedUploadUrlRequest,
  PresignedUploadUrlResponse,
} from "./types";
import { courseMaterialsKeys } from "./getCourseMaterials";

export interface RequestPresignedUrlVariables {
  communitySlug: string;
  studyYearSlug: string;
  courseSlug: string;
  request: PresignedUploadUrlRequest;
}

export async function requestPresignedUploadUrl({
  communitySlug,
  studyYearSlug,
  courseSlug,
  request,
}: RequestPresignedUrlVariables): Promise<PresignedUploadUrlResponse> {
  const response = await client.post<PresignedUploadUrlResponse>(
    `/communities/${communitySlug}/study-years/${studyYearSlug}/courses/${courseSlug}/materials/upload-url`,
    request,
  );
  return response.data;
}

export interface UploadBinaryVariables {
  uploadUrl: string;
  file: File;
  signal?: AbortSignal;
  onProgress?: (percentage: number) => void;
}

export async function uploadBinaryToStorage({
  uploadUrl,
  file,
  signal,
  onProgress,
}: UploadBinaryVariables): Promise<void> {
  await axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    signal,
    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentage = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        onProgress(percentage);
      }
    },
  });
}

export interface CreateMaterialFileVariables {
  communitySlug: string;
  studyYearSlug: string;
  courseSlug: string;
  payload: CreateMaterialFilePayload;
}

export async function createMaterialFile({
  communitySlug,
  studyYearSlug,
  courseSlug,
  payload,
}: CreateMaterialFileVariables): Promise<CourseMaterialFile> {
  const response = await client.post<CourseMaterialFile>(
    `/communities/${communitySlug}/study-years/${studyYearSlug}/courses/${courseSlug}/materials/files`,
    payload,
  );
  return response.data;
}

export interface FullUploadFlowVariables {
  communitySlug: string;
  studyYearSlug: string;
  courseSlug: string;
  file: File;
  title: string;
  description?: string;
  folderId?: string | null;
  signal?: AbortSignal;
  onProgress?: (percentage: number) => void;
}

export async function uploadMaterialFileFlow({
  communitySlug,
  studyYearSlug,
  courseSlug,
  file,
  title,
  description,
  folderId,
  signal,
  onProgress,
}: FullUploadFlowVariables): Promise<CourseMaterialFile> {
  // 1. Request presigned upload URL
  const { uploadUrl, storageKey } = await requestPresignedUploadUrl({
    communitySlug,
    studyYearSlug,
    courseSlug,
    request: {
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
    },
  });

  // 2. Direct binary upload to storage
  await uploadBinaryToStorage({
    uploadUrl,
    file,
    signal,
    onProgress,
  });

  // 3. Confirm file record creation
  const created = await createMaterialFile({
    communitySlug,
    studyYearSlug,
    courseSlug,
    payload: {
      title,
      description: description?.trim() || undefined,
      folderId: folderId || null,
      storageKey,
      mediaType: file.type || "application/octet-stream",
      size: file.size,
    },
  });

  return created;
}

export function useUploadMaterialFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadMaterialFileFlow,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: courseMaterialsKeys.all,
      });
    },
  });
}
