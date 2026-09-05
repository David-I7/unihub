import type {
  QueryClient,
  QueryKey,
  InfiniteData,
} from "@tanstack/react-query";
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
  id: string | number | ((item: T) => boolean),
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
          content: page.content.map((item) => {
            if (typeof id === "function") {
              return id(item) ? patchFn(item) : item;
            }
            return item.id === id ? patchFn(item) : item;
          }),
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
  id: string | number | ((item: T) => boolean),
): void {
  queryClient.setQueriesData<InfiniteData<PaginatedResponse<T>>>(
    { queryKey },
    (old) => {
      if (!old?.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          content: page.content.filter((item) => {
            if (typeof id === "function") {
              return id(item) ? false : true;
            }
            return item.id === id ? false : true;
          }),
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

export function updateQueryListItem<T extends { id: string | number }>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  id: string | number | ((item: T) => boolean),
  patchFn: (item: T) => T,
): void {
  queryClient.setQueriesData<T[]>({ queryKey }, (old) => {
    if (!old) return old;
    return old.map((item) => {
      if (typeof id === "function") {
        return id(item) ? patchFn(item) : item;
      }
      return item.id === id ? patchFn(item) : item;
    });
  });
}

export function removeQueryListItem<T extends { id: string | number }>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  id: string | number | ((item: T) => boolean),
): void {
  queryClient.setQueriesData<T[]>({ queryKey }, (old) => {
    if (!old) return old;
    return old.filter((item) => {
      if (typeof id === "function") {
        return id(item) ? false : true;
      }
      return item.id === id ? false : true;
    });
  });
}

export function prependQueryListItem<T extends { id: string | number }>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  item: T,
): void {
  queryClient.setQueriesData<T[]>({ queryKey }, (old) => {
    if (!old) return old;
    return [item, ...old];
  });
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
