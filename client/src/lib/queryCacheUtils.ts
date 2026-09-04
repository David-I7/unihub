import type { QueryClient, QueryKey, InfiniteData } from "@tanstack/react-query";
import type { PaginatedResponse } from "@/api/types";

export interface OptimisticRollbackContext<TDetail = unknown, TList = unknown> {
  previousDetail?: [QueryKey, TDetail | undefined];
  previousQueries: [QueryKey, TList | undefined][];
}

/**
 * Restores query snapshots recorded in an OptimisticRollbackContext.
 */
export function rollbackOptimisticContext(
  queryClient: QueryClient,
  context?: OptimisticRollbackContext<unknown, unknown>,
): void {
  if (!context) return;

  if (context.previousDetail) {
    const [key, data] = context.previousDetail;
    queryClient.setQueryData(key, data);
  }

  for (const [key, data] of context.previousQueries) {
    queryClient.setQueryData(key, data);
  }
}

/**
 * Updates an item across all matching pages in all matching infinite queries.
 */
export function updateInfiniteQueryItem<T extends { id: string | number }>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  id: string | number,
  patchFn: (item: T) => T,
): void {
  queryClient.setQueriesData<InfiniteData<PaginatedResponse<T>>>(
    { queryKey },
    (old) => {
      if (!old?.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          content: page.content.map((item) =>
            item.id === id ? patchFn(item) : item,
          ),
        })),
      };
    },
  );
}

/**
 * Removes an item by ID across all matching pages in all matching infinite queries.
 */
export function removeInfiniteQueryItem<T extends { id: string | number }>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  id: string | number,
): void {
  queryClient.setQueriesData<InfiniteData<PaginatedResponse<T>>>(
    { queryKey },
    (old) => {
      if (!old?.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          content: page.content.filter((item) => item.id !== id),
        })),
      };
    },
  );
}

/**
 * Prepends a newly created item to page 0 of matching infinite queries.
 */
export function prependInfiniteQueryItem<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  item: T,
): void {
  queryClient.setQueriesData<InfiniteData<PaginatedResponse<T>>>(
    { queryKey },
    (old) => {
      if (!old?.pages || old.pages.length === 0) return old;
      const [firstPage, ...restPages] = old.pages;
      return {
        ...old,
        pages: [
          {
            ...firstPage,
            content: [item, ...firstPage.content],
          },
          ...restPages,
        ],
      };
    },
  );
}

/**
 * Patches a single detail query in place if it exists in cache.
 */
export function patchDetailQuery<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  patchFn: (old: T) => T,
): void {
  queryClient.setQueryData<T>(queryKey, (old) => {
    if (!old) return old;
    return patchFn(old);
  });
}

export interface CourseMaterialsCacheData {
  folders: Array<{ id: string; [key: string]: unknown }>;
  files: Array<{ id: string; [key: string]: unknown }>;
  links: Array<{ id: string; [key: string]: unknown }>;
}

/**
 * Removes a folder, file, or link by ID from all matching course materials queries.
 */
export function removeCourseMaterialItem(
  queryClient: QueryClient,
  queryKey: QueryKey,
  itemId: string,
): void {
  queryClient.setQueriesData<CourseMaterialsCacheData>({ queryKey }, (old) => {
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
export function updateCourseMaterialItem<T extends { id: string }>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  itemId: string,
  patchFn: (item: T) => T,
): void {
  queryClient.setQueriesData<CourseMaterialsCacheData>({ queryKey }, (old) => {
    if (!old) return old;
    return {
      ...old,
      folders: old.folders
        ? old.folders.map((f) =>
            f.id === itemId
              ? (patchFn(f as unknown as T) as unknown as typeof f)
              : f,
          )
        : [],
      files: old.files
        ? old.files.map((f) =>
            f.id === itemId
              ? (patchFn(f as unknown as T) as unknown as typeof f)
              : f,
          )
        : [],
      links: old.links
        ? old.links.map((l) =>
            l.id === itemId
              ? (patchFn(l as unknown as T) as unknown as typeof l)
              : l,
          )
        : [],
    };
  });
}

