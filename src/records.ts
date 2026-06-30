export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function hasString(value: unknown, key: string): value is Record<string, string> {
  return isRecord(value) && typeof value[key] === 'string' && value[key].length > 0
}

export function hasNumber(value: unknown, key: string): value is Record<string, number> {
  return isRecord(value) && typeof value[key] === 'number'
}

export function arrayOfRecords(value: unknown): Record<string, unknown>[] | undefined {
  return Array.isArray(value) && value.every(isRecord) ? value : undefined
}

export function fail(error: string) {
  return { valid: false, errors: [error], warnings: [] }
}

export function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}
