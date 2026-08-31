export const teacherKeys = {
  all: ["teachers"] as const,
  lists: () => [...teacherKeys.all, "list"] as const,
  list: (
    communitySlug: string,
    filters?: { search?: string; studyYear?: string; semester?: number } | string,
  ) => {
    const filterObj =
      typeof filters === "string"
        ? { search: filters }
        : {
            search: filters?.search || "",
            studyYear: filters?.studyYear || "",
            semester: filters?.semester,
          };
    return [...teacherKeys.lists(), communitySlug, filterObj] as const;
  },
  details: () => [...teacherKeys.all, "detail"] as const,
  detail: (teacherId: string) =>
    [...teacherKeys.details(), teacherId] as const,
  ratings: (teacherId: string) =>
    [...teacherKeys.detail(teacherId), "ratings"] as const,
};
