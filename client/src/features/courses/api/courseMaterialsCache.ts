import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type {
  CourseMaterialsResponse,
  CourseMaterialFolder,
  CourseMaterialFile,
  CourseMaterialLink,
} from "./types";

export type CourseMaterialItem =
  | CourseMaterialFolder
  | CourseMaterialFile
  | CourseMaterialLink;

/**
 * Removes a folder, file, or link by ID from all matching course materials queries.
 */
export function removeCourseMaterialItem(
  queryClient: QueryClient,
  queryKey: QueryKey,
  itemId: string,
): void {
  queryClient.setQueriesData<CourseMaterialsResponse>({ queryKey }, (old) => {
    if (!old) return old;
    return {
      ...old,
      folders: old.folders ? old.folders.filter((f) => f.id !== itemId) : [],
      files: old.files ? old.files.filter((f) => f.id !== itemId) : [],
      links: old.links ? old.links.filter((l) => l.id !== itemId) : [],
    };
  });
}

/**
 * Updates a folder, file, or link by ID across all matching course materials queries.
 */
export function updateCourseMaterialItem<T extends CourseMaterialItem>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  itemId: string,
  patchFn: (item: T) => T,
): void {
  queryClient.setQueriesData<CourseMaterialsResponse>({ queryKey }, (old) => {
    if (!old) return old;
    return {
      ...old,
      folders: old.folders
        ? old.folders.map((f) =>
            f.id === itemId
              ? (patchFn(f as unknown as T) as unknown as CourseMaterialFolder)
              : f,
          )
        : [],
      files: old.files
        ? old.files.map((f) =>
            f.id === itemId
              ? (patchFn(f as unknown as T) as unknown as CourseMaterialFile)
              : f,
          )
        : [],
      links: old.links
        ? old.links.map((l) =>
            l.id === itemId
              ? (patchFn(l as unknown as T) as unknown as CourseMaterialLink)
              : l,
          )
        : [],
    };
  });
}
