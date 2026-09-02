import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { useDebounce } from "./useDebounce";

export type FilterFieldType = "string" | "number" | "boolean" | "enum";

export interface FieldSchema<T> {
  type?: FilterFieldType;
  defaultValue: T;
  paramKey?: string;
  allowedValues?: readonly T[];
  parse?: (raw: string) => T;
  serialize?: (value: T) => string | undefined;
}

export type FilterSchema<T> = {
  [K in keyof T]: FieldSchema<T[K]>;
};

export interface UseUrlFiltersOptions {
  replace?: boolean;
}

/**
 * Reusable hook for synchronizing state, filters, and sort options with URL search query params.
 */
export function useUrlFilters<T>(
  schema: FilterSchema<T>,
  options: UseUrlFiltersOptions = {},
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const replace = options.replace ?? true;

  const filters = useMemo(() => {
    const result = {} as T;

    for (const key in schema) {
      const field = schema[key];
      const paramName = field.paramKey ?? key;
      const rawValue = searchParams.get(paramName);

      if (rawValue === null || rawValue === "") {
        result[key] = field.defaultValue;
        continue;
      }

      if (field.parse) {
        try {
          result[key] = field.parse(rawValue);
        } catch {
          result[key] = field.defaultValue;
        }
        continue;
      }

      if (field.allowedValues && field.allowedValues.length > 0) {
        if (field.allowedValues.includes(rawValue as unknown as T[Extract<keyof T, string>])) {
          result[key] = rawValue as unknown as T[Extract<keyof T, string>];
        } else {
          result[key] = field.defaultValue;
        }
        continue;
      }

      switch (field.type) {
        case "number": {
          const parsed = Number(rawValue);
          result[key] = (Number.isNaN(parsed) ? field.defaultValue : parsed) as T[Extract<keyof T, string>];
          break;
        }
        case "boolean": {
          result[key] = (rawValue === "true") as unknown as T[Extract<keyof T, string>];
          break;
        }
        default: {
          result[key] = rawValue as unknown as T[Extract<keyof T, string>];
          break;
        }
      }
    }

    return result;
  }, [searchParams, schema]);

  const setFilters = useCallback(
    (updates: Partial<T> | ((prev: T) => Partial<T>)) => {
      setSearchParams(
        (prevParams) => {
          const nextParams = new URLSearchParams(prevParams);
          const patch = typeof updates === "function" ? updates(filters) : updates;

          for (const key in patch) {
            const field = schema[key as keyof T];
            if (!field) continue;

            const paramName = field.paramKey ?? key;
            const nextVal = patch[key as keyof T];

            if (nextVal === undefined || nextVal === null || nextVal === field.defaultValue || nextVal === "") {
              nextParams.delete(paramName);
            } else if (field.serialize) {
              const serialized = field.serialize(nextVal);
              if (serialized === undefined || serialized === "") {
                nextParams.delete(paramName);
              } else {
                nextParams.set(paramName, serialized);
              }
            } else {
              nextParams.set(paramName, String(nextVal));
            }
          }

          return nextParams;
        },
        { replace },
      );
    },
    [filters, replace, schema, setSearchParams],
  );

  const setFilter = useCallback(
    <K extends keyof T>(key: K, value: T[K] | ((prev: T[K]) => T[K])) => {
      const nextValue =
        typeof value === "function" ? (value as (prev: T[K]) => T[K])(filters[key]) : value;
      setFilters({ [key]: nextValue } as unknown as Partial<T>);
    },
    [filters, setFilters],
  );

  const resetFilters = useCallback(
    (keys?: Array<keyof T>) => {
      setSearchParams(
        (prevParams) => {
          const nextParams = new URLSearchParams(prevParams);
          const targetKeys = keys ?? (Object.keys(schema) as Array<keyof T>);

          for (const key of targetKeys) {
            const field = schema[key];
            if (!field) continue;
            const paramName = field.paramKey ?? (key as string);
            nextParams.delete(paramName);
          }

          return nextParams;
        },
        { replace },
      );
    },
    [replace, schema, setSearchParams],
  );

  return {
    filters,
    setFilters,
    setFilter,
    resetFilters,
    searchParams,
    setSearchParams,
  };
}

/**
 * Synchronizes local text input state with a debounced external callback.
 * Adjusts state during render when the external value changes without triggering cascading effects.
 */
export function useDebouncedInput(
  externalValue: string,
  onCommit: (val: string) => void,
  delay = 300,
) {
  const [value, setValue] = useState(externalValue);
  const [prevExternal, setPrevExternal] = useState(externalValue);

  if (prevExternal !== externalValue) {
    setPrevExternal(externalValue);
    setValue(externalValue);
  }

  const debouncedValue = useDebounce(value.trim(), delay);

  useEffect(() => {
    if (debouncedValue !== externalValue) {
      onCommit(debouncedValue);
    }
  }, [debouncedValue, externalValue, onCommit]);

  return [value, setValue, debouncedValue] as const;
}

