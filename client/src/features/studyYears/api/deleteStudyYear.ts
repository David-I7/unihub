import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { communityKeys } from "@/features/communities";
import { studyYearHomeKeys } from "./getStudyYearHome";
import { studyYearCoursesKeys } from "./getStudyYearCourses";

export interface DeleteStudyYearVariables {
  communitySlug: string;
  studyYearSlug: string;
}

export async function deleteStudyYear({
  communitySlug,
  studyYearSlug,
}: DeleteStudyYearVariables): Promise<void> {
  await client.delete(
    `/communities/${communitySlug}/study-years/${studyYearSlug}`,
  );
}

export function useDeleteStudyYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStudyYear,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: communityKeys.homeDetail(variables.communitySlug),
      });
      queryClient.invalidateQueries({
        queryKey: communityKeys.communityStudyYears(variables.communitySlug),
      });
      queryClient.removeQueries({
        queryKey: studyYearHomeKeys.byStudyYear(
          variables.communitySlug,
          variables.studyYearSlug,
        ),
      });
      queryClient.removeQueries({
        queryKey: studyYearCoursesKeys.courses(
          variables.communitySlug,
          variables.studyYearSlug,
        ),
      });
    },
  });
}
