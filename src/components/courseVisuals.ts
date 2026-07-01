import type { CoursePath } from '@/domain'

const courseAccents = [
  { bg: '#dbeafe', fg: '#1d4ed8', ring: '#93c5fd' },
  { bg: '#dcfce7', fg: '#15803d', ring: '#86efac' },
  { bg: '#fef3c7', fg: '#b45309', ring: '#fcd34d' },
  { bg: '#ffe4e6', fg: '#be123c', ring: '#fda4af' },
  { bg: '#ede9fe', fg: '#6d28d9', ring: '#c4b5fd' },
  { bg: '#cffafe', fg: '#0e7490', ring: '#67e8f9' },
  { bg: '#fae8ff', fg: '#a21caf', ring: '#f0abfc' },
  { bg: '#e0f2fe', fg: '#0369a1', ring: '#7dd3fc' },
]

export function courseInitials(title: string): string {
  const words = title
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .split(/[\s-]+/)
    .filter(Boolean)

  if (words.length === 0) return 'UH'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return words.slice(0, 2).map((word) => word[0]).join('').toUpperCase()
}

export function courseAccent(path: CoursePath) {
  const key = `${path.academicYearId}/${path.studyYearId}/${path.semesterId}/${path.courseId}`
  const hash = [...key].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 0)
  return courseAccents[hash % courseAccents.length]
}
