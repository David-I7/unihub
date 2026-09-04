import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CourseMaterialLink, CreateMaterialLinkPayload } from "./types";
import { courseMaterialsKeys } from "./getCourseMaterials";

export interface CreateMaterialLinkVariables {
  communitySlug: string;
  studyYearSlug: string;
  courseSlug: string;
  payload: CreateMaterialLinkPayload;
}

export async function createMaterialLink({
  communitySlug,
  studyYearSlug,
  courseSlug,
  payload,
}: CreateMaterialLinkVariables): Promise<CourseMaterialLink> {
  const response = await client.post<CourseMaterialLink>(
    `/communities/${communitySlug}/study-years/${studyYearSlug}/courses/${courseSlug}/materials/links`,
    payload,
  );
  return response.data;
}

export function useCreateMaterialLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMaterialLink,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          ...courseMaterialsKeys.all,
          variables.communitySlug,
          variables.studyYearSlug,
          variables.courseSlug,
        ],
      });
    },
  });
}
