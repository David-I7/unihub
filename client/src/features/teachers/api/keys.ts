export const teacherKeys = {
  all: ["teachers"] as const,
  allLists: () => [...teacherKeys.all, "lists"] as const,
  communityList: (communitySlug: string) =>
    [...teacherKeys.allLists(), communitySlug] as const,
  list: (
    communitySlug: string,
    filters?:
      | {
          search?: string;
          studyYear?: string;
          semester?: number;
          sort?: string;
          size?: number;
        }
      | string,
  ) => {
    const filterObj =
      typeof filters === "string"
        ? { search: filters }
        : {
            search: filters?.search || "",
            studyYear: filters?.studyYear || "",
            semester: filters?.semester,
            sort: filters?.sort,
            size: filters?.size,
          };
    return [...teacherKeys.communityList(communitySlug), filterObj] as const;
  },
  details: () => [...teacherKeys.all, "detail"] as const,
  detail: (teacherId: string) => [...teacherKeys.details(), teacherId] as const,
  ratings: (teacherId: string) =>
    [...teacherKeys.detail(teacherId), "ratings"] as const,
};
