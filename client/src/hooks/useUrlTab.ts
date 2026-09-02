import { useSearchParams } from "react-router";
import { useCallback, useMemo } from "react";

interface UseUrlTabOptions<T extends string> {
  paramKey?: string;
  validTabs?: readonly T[];
  resetParamsOnTabChange?: boolean;
  preserveKeys?: readonly string[];
}

/**
 * Synchronizes tab state with URL search query params.
 * When switching tabs, cleans up other query parameters unless explicitly preserved.
 */
export function useUrlTab<T extends string>(
  defaultTab: T,
  options?: UseUrlTabOptions<T>,
): [T, (nextTab: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramKey = options?.paramKey ?? "tab";
  const validTabs = options?.validTabs;
  const resetParamsOnTabChange = options?.resetParamsOnTabChange ?? true;

  const rawValue = searchParams.get(paramKey);

  const currentTab = useMemo<T>(() => {
    if (!rawValue) return defaultTab;
    if (validTabs && !validTabs.includes(rawValue as T)) {
      return defaultTab;
    }
    return rawValue as T;
  }, [rawValue, defaultTab, validTabs]);

  const setTab = useCallback(
    (nextTab: T) => {
      setSearchParams(
        (prev) => {
          let next: URLSearchParams;

          if (resetParamsOnTabChange) {
            next = new URLSearchParams();
            if (options?.preserveKeys) {
              for (const key of options.preserveKeys) {
                const val = prev.get(key);
                if (val !== null) next.set(key, val);
              }
            }
          } else {
            next = new URLSearchParams(prev);
          }

          if (nextTab === defaultTab) {
            next.delete(paramKey);
          } else {
            next.set(paramKey, nextTab);
          }
          return next;
        },
        { replace: true },
      );
    },
    [
      defaultTab,
      paramKey,
      resetParamsOnTabChange,
      options?.preserveKeys,
      setSearchParams,
    ],
  );

  return [currentTab, setTab];
}
