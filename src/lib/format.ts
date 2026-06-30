export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function formatTime(value: string) {
  return new Intl.DateTimeFormat('en', { timeStyle: 'short' }).format(new Date(value))
}
