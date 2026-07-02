export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function formatTime(value: string) {
  return new Intl.DateTimeFormat('en', { timeStyle: 'short' }).format(new Date(value))
}

export function textValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function arrayValue(value: unknown): string[] {
  return Array.isArray(value) ? value as string[] : []
}

export function label(value: string): string {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

