import {
  useState,
  useCallback,
  useMemo,
  type ChangeEvent,
  type FocusEvent,
  type SyntheticEvent,
} from "react";
import { type ZodType, ZodError } from "zod";

export type FormErrors<T> = Partial<Record<keyof T, string>>;
export type FormTouched<T> = Partial<Record<keyof T, boolean>>;
export type FormDirty<T> = Partial<Record<keyof T, boolean>>;

export function isFieldValueEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  // Normalized empty value handling (null, undefined, empty string after trimming)
  const isAEmpty =
    a === null ||
    a === undefined ||
    (typeof a === "string" && a.trim() === "");
  const isBEmpty =
    b === null ||
    b === undefined ||
    (typeof b === "string" && b.trim() === "");
  if (isAEmpty && isBEmpty) return true;
  if (isAEmpty !== isBEmpty) return false;

  // Strings trimmed comparison
  if (typeof a === "string" && typeof b === "string") {
    return a.trim() === b.trim();
  }

  // Arrays comparison
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, index) => isFieldValueEqual(val, sortedB[index]));
  }

  // Objects comparison
  if (
    typeof a === "object" &&
    typeof b === "object" &&
    a !== null &&
    b !== null
  ) {
    const keysA = Object.keys(a as Record<string, unknown>);
    const keysB = Object.keys(b as Record<string, unknown>);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k) =>
      isFieldValueEqual(
        (a as Record<string, unknown>)[k],
        (b as Record<string, unknown>)[k],
      ),
    );
  }

  return false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface UseFormOptions<T extends Record<string, any>> {
  initialValues: T;
  schema?: ZodType<T>;
  onSubmit: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useForm<T extends Record<string, any>>({
  initialValues,
  schema,
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormOptions<T>) {
  const [baseValues, setBaseValues] = useState<T>(initialValues);
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<FormTouched<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const formatZodErrors = useCallback((zodError: ZodError): FormErrors<T> => {
    const formatted: FormErrors<T> = {};
    for (const issue of zodError.issues) {
      const field = issue.path[0] as keyof T;
      if (field && !formatted[field]) {
        formatted[field] = issue.message;
      }
    }
    return formatted;
  }, []);

  const validate = useCallback(
    (currentValues: T): { isValid: boolean; errors: FormErrors<T> } => {
      if (!schema) return { isValid: true, errors: {} };

      const result = schema.safeParse(currentValues);
      if (result.success) {
        return { isValid: true, errors: {} };
      }

      const formatted = formatZodErrors(result.error);
      return { isValid: false, errors: formatted };
    },
    [schema, formatZodErrors],
  );

  const setValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValues((prev) => {
        const next = { ...prev, [field]: value };
        if (validateOnChange && schema) {
          const strVal = String(value ?? "");
          if (strVal.length > 0) {
            const { errors: newErrors } = validate(next);
            setErrors((prevErr) => ({
              ...prevErr,
              [field]: newErrors[field],
            }));
          } else {
            setErrors((prevErr) => ({
              ...prevErr,
              [field]: undefined,
            }));
          }
        } else {
          // Clear error if user is typing and validateOnChange is false
          setErrors((prevErr) => ({
            ...prevErr,
            [field]: undefined,
          }));
        }
        return next;
      });
    },
    [validateOnChange, schema, validate],
  );

  const setFieldError = useCallback(
    <K extends keyof T>(field: K, message: string) => {
      setErrors((prev) => ({ ...prev, [field]: message }));
    },
    [],
  );

  const clearErrors = useCallback(() => {
    setErrors({});
    setServerError(null);
  }, []);

  const handleChange = useCallback(
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const { name, value, type } = e.target;
      const val =
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
      setValue(name as keyof T, val as T[keyof T]);
    },
    [setValue],
  );

  const handleBlur = useCallback(
    (
      e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
      const field = e.target.name as keyof T;
      setTouched((prev) => ({ ...prev, [field]: true }));

      if (validateOnBlur && schema) {
        const strVal = String(values[field] ?? "");
        if (strVal.length > 0) {
          const { errors: newErrors } = validate(values);
          setErrors((prevErr) => ({
            ...prevErr,
            [field]: newErrors[field],
          }));
        } else {
          setErrors((prevErr) => ({
            ...prevErr,
            [field]: undefined,
          }));
        }
      }
    },
    [validateOnBlur, schema, validate, values],
  );

  const isInvalid = useCallback(
    (name: keyof T): boolean => {
      return Boolean(touched[name] && errors[name]);
    },
    [touched, errors],
  );

  const dirtyFields = useMemo(() => {
    const dirty: FormDirty<T> = {};
    for (const key in values) {
      if (!isFieldValueEqual(values[key], baseValues[key])) {
        dirty[key] = true;
      }
    }
    return dirty;
  }, [values, baseValues]);

  const isDirty = useMemo(() => {
    return Object.keys(dirtyFields).length > 0;
  }, [dirtyFields]);

  const getDirtyValues = useCallback((): Partial<T> => {
    const dirtyPayload: Partial<T> = {};
    for (const key in values) {
      if (!isFieldValueEqual(values[key], baseValues[key])) {
        dirtyPayload[key] = values[key];
      }
    }
    return dirtyPayload;
  }, [values, baseValues]);

  const reset = useCallback(
    (newValues?: Partial<T>) => {
      const nextValues = newValues
        ? { ...initialValues, ...newValues }
        : initialValues;
      setBaseValues(nextValues);
      setValues(nextValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
      setServerError(null);
    },
    [initialValues],
  );

  const handleSubmit = useCallback(
    async (e?: SyntheticEvent) => {
      if (e) e.preventDefault();

      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {} as FormTouched<T>);
      setTouched(allTouched);

      const { isValid, errors: validationErrors } = validate(values);
      setErrors(validationErrors);

      if (!isValid) return;

      setIsSubmitting(true);
      setServerError(null);

      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, onSubmit],
  );

  const getFieldProps = useCallback(
    (name: keyof T) => {
      const fieldName = String(name);
      return {
        id: fieldName,
        name: fieldName,
        value: (values[name] as string | number | readonly string[]) ?? "",
        onChange: handleChange,
        onBlur: handleBlur,
        "aria-invalid": isInvalid(name) ? true : undefined,
      };
    },
    [values, handleChange, handleBlur, isInvalid],
  );

  return {
    values,
    baseValues,
    errors,
    touched,
    dirtyFields,
    isDirty,
    getDirtyValues,
    isSubmitting,
    serverError,
    setValues,
    setBaseValues,
    setValue,
    setErrors,
    setFieldError,
    clearErrors,
    setTouched,
    setServerError,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    getFieldProps,
    isInvalid,
  };
}
