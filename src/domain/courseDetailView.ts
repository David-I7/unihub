import type { LoadedCourse, Material, MaterialType } from './types.js'

const generalMaterialTypes: MaterialType[] = ['course', 'seminar', 'lab', 'video', 'other']

export type CourseDetailView = {
  materialGroups: Array<{ type: MaterialType; label: string; materials: Material[] }>
  assignments: Array<{
    id: string
    title: string
    description?: string
    dueAt: string
    status: 'completed' | 'upcoming'
    submissionUrl?: string
    gradeWeight?: number
    materials: Material[]
  }>
  courseSessions: Array<{
    id: string
    title: string
    startsAt: string
    endsAt: string
    location: string
    status: 'cancelled' | 'completed' | 'scheduled'
  }>
  exams: Array<{
    id: string
    title: string
    startsAt?: string
    gradeWeight?: number
    materials: Material[]
  }>
  gradeBreakdown: {
    items: Array<{ title: string; weight: number }>
    total: number
    incomplete: boolean
  }
}

export function deriveCourseDetailView(course: LoadedCourse, nowTime: number): CourseDetailView {
  return {
    materialGroups: generalMaterialTypes
      .map((type) => ({
        type,
        label: `${capitalize(type)} Materials`,
        materials: course.materials.filter((material) => material.type === type),
      }))
      .filter((group) => group.materials.length > 0),
    assignments: [...course.assignmentDeadlines]
      .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt))
      .map((assignment) => ({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueAt: assignment.dueAt,
        status: Date.parse(assignment.dueAt) < nowTime ? 'completed' : 'upcoming',
        submissionUrl: assignment.submissionUrl,
        gradeWeight: assignment.gradeWeight,
        materials: resolveMaterials(course, assignment.materialIds, 'assignment'),
      })),
    courseSessions: [...course.courseSessions]
      .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
      .map((session) => ({
        id: session.id,
        title: session.title,
        startsAt: session.startsAt,
        endsAt: session.endsAt,
        location: session.location ?? 'Location to be announced',
        status: session.status === 'cancelled' ? 'cancelled' : Date.parse(session.endsAt) < nowTime ? 'completed' : 'scheduled',
      })),
    exams: [...course.exams]
      .sort((a, b) => dateOrInfinity(a.startsAt) - dateOrInfinity(b.startsAt))
      .map((exam) => ({
        id: exam.id,
        title: exam.title,
        startsAt: exam.startsAt,
        gradeWeight: exam.gradeWeight,
        materials: resolveMaterials(course, exam.materialIds, 'exam'),
      })),
    gradeBreakdown: deriveGradeBreakdown(course),
  }
}

function resolveMaterials(course: LoadedCourse, materialIds: string[] | undefined, type: 'assignment' | 'exam'): Material[] {
  const ids = new Set(materialIds ?? [])
  return course.materials.filter((material) => ids.has(material.id) && material.type === type)
}

function deriveGradeBreakdown(course: LoadedCourse) {
  const items = [
    ...course.assignmentDeadlines.filter((item) => item.gradeWeight !== undefined).map((item) => ({ title: item.title, weight: item.gradeWeight as number })),
    ...course.exams.filter((item) => item.gradeWeight !== undefined).map((item) => ({ title: item.title, weight: item.gradeWeight as number })),
  ]
  const total = items.reduce((sum, item) => sum + item.weight, 0)
  return { items, total, incomplete: total < 100 }
}

function dateOrInfinity(value: string | undefined): number {
  return value ? Date.parse(value) : Number.POSITIVE_INFINITY
}

function capitalize(value: string): string {
  return value[0].toUpperCase() + value.slice(1)
}
