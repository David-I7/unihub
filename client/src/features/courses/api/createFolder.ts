import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CourseMaterialFolder, CreateFolderPayload } from "./types";
import { courseMaterialsKeys } from "./getCourseMaterials";

export interface CreateFolderVariables {
  communitySlug: string;
  studyYearSlug: string;
  courseSlug: string;
  payload: CreateFolderPayload;
}

export async function createFolder({
  communitySlug,
  studyYearSlug,
  courseSlug,
  payload,
}: CreateFolderVariables): Promise<CourseMaterialFolder> {
  const response = await client.post<CourseMaterialFolder>(
    `/communities/${communitySlug}/study-years/${studyYearSlug}/courses/${courseSlug}/folders`,
    payload,
  );
  return response.data;
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: courseMaterialsKeys.all,
      });
    },
  });
}
