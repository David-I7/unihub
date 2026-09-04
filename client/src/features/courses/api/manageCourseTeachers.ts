import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CourseHome } from "./types";
import { courseHomeKeys } from "./getCourseHome";
import { studyYearHomeKeys } from "@/features/studyYears/api/getStudyYearHome";
import { teacherKeys } from "@/features/teachers/api/keys";

export interface CourseTeacherVariables {
  communitySlug: string;
  studyYearSlug: string;
  courseSlug: string;
  teacherId: string;
}

export async function addCourseTeacher({
  communitySlug,
  studyYearSlug,
  courseSlug,
  teacherId,
}: CourseTeacherVariables): Promise<CourseHome> {
  const response = await client.post<CourseHome>(
    `/communities/${communitySlug}/study-years/${studyYearSlug}/courses/${courseSlug}/teachers/${teacherId}`,
  );
  return response.data;
}

export async function removeCourseTeacher({
  communitySlug,
  studyYearSlug,
  courseSlug,
  teacherId,
}: CourseTeacherVariables): Promise<CourseHome> {
  const response = await client.delete<CourseHome>(
    `/communities/${communitySlug}/study-years/${studyYearSlug}/courses/${courseSlug}/teachers/${teacherId}`,
  );
  return response.data;
}

export function useAddCourseTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCourseTeacher,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        courseHomeKeys.byCourse(
          variables.communitySlug,
          variables.studyYearSlug,
          variables.courseSlug,
        ),
        data,
      );
      queryClient.invalidateQueries({
        queryKey: studyYearHomeKeys.byStudyYear(
          variables.communitySlug,
          variables.studyYearSlug,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: teacherKeys.lists(),
      });
    },
  });
}

export function useRemoveCourseTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeCourseTeacher,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        courseHomeKeys.byCourse(
          variables.communitySlug,
          variables.studyYearSlug,
          variables.courseSlug,
        ),
        data,
      );
      queryClient.invalidateQueries({
        queryKey: studyYearHomeKeys.byStudyYear(
          variables.communitySlug,
          variables.studyYearSlug,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: teacherKeys.lists(),
      });
    },
  });
}
