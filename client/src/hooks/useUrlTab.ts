import { useSearchParams } from "react-router";
import { useCallback, useMemo } from "react";

interface UseUrlTabOptions<T extends string> {
  paramKey?: string;
  validTabs?: readonly T[];
}

/**
 * Synchronizes tab state with URL search query params.
 */
export function useUrlTab<T extends string>(
  defaultTab: T,
  options?: UseUrlTabOptions<T>,
): [T, (nextTab: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramKey = options?.paramKey ?? "tab";
  const validTabs = options?.validTabs;

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
          const next = new URLSearchParams(prev);
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
    [defaultTab, paramKey, setSearchParams],
  );

  return [currentTab, setTab];
}
