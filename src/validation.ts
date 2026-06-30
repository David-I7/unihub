import catalogSchema from './data/schema/catalog.schema.json' with { type: 'json' }
import courseSchema from './data/schema/course.schema.json' with { type: 'json' }
import { courseRepositoryPath } from './coursePath.js'
import { arrayOfRecords, fail, hasNumber, hasString, isRecord, stringArray } from './records.js'
import type { LoadedCourse, MaterialType, SessionStatus, ValidationResult } from './types.js'

type JsonSchema = {
  type?: 'object' | 'array' | 'string' | 'number'
  required?: string[]
  properties?: Record<string, JsonSchema>
  items?: JsonSchema
  enum?: unknown[]
  minLength?: number
}

export const repositorySchema = {
  catalog: catalogSchema,
  course: courseSchema,
}

export function validateCatalog(catalog: unknown): ValidationResult {
  const schemaErrors = validateJsonSchema(catalogSchema as JsonSchema, catalog, 'Catalog')
  const errors = schemaErrors.map(rewordCatalogSchemaError)
  return { valid: errors.length === 0, errors, warnings: [] }
}

export function validateCourse(course: unknown): ValidationResult {
  if (!isRecord(course)) return fail('Course must be a JSON object.')

  const warnings: string[] = []
  const errors = validateJsonSchema(courseSchema as JsonSchema, course, 'Course').map(rewordCourseSchemaError)

  if (Array.isArray(course.professors) && course.professors.length === 0) warnings.push('Course has no professors.')

  const materials = arrayOfRecords(course.materials)
  const assignments = arrayOfRecords(course.assignmentDeadlines)
  const sessions = arrayOfRecords(course.courseSessions)
  const exams = arrayOfRecords(course.exams)
  if (!materials || !assignments || !sessions || !exams) {
    errors.push('Course requires materials, assignmentDeadlines, courseSessions, and exams arrays.')
    return { valid: false, errors: unique(errors), warnings }
  }
  if (materials.length === 0) warnings.push('Course has no Materials.')

  const ids = new Set<string>()
  for (const item of [...materials, ...assignments, ...sessions, ...exams]) {
    if (!hasString(item, 'id')) {
      errors.push('Every Course item requires an id.')
      continue
    }
    const itemId = item.id
    if (ids.has(itemId)) errors.push(`Duplicate local id: ${itemId}.`)
    ids.add(itemId)
    if (!hasString(item, 'addedAt')) warnings.push(`${itemId} is missing optional addedAt.`)
  }

  const materialsById = new Map(materials.filter((material) => hasString(material, 'id')).map((material) => [material.id, material]))
  let totalWeight = 0

  for (const assignment of assignments) {
    totalWeight += numberValue(assignment.gradeWeight)
    for (const materialId of stringArray(assignment.materialIds)) {
      const material = materialsById.get(materialId)
      if (!material) errors.push(`${displayId(assignment)} references missing Material ${materialId}.`)
      if (material && material.type !== 'assignment') errors.push(`${displayId(assignment)} references non-assignment Material ${materialId}.`)
    }
  }

  for (const session of sessions) {
    if (hasString(session, 'startsAt') && hasString(session, 'endsAt') && Date.parse(session.endsAt) <= Date.parse(session.startsAt)) {
      errors.push(`${displayId(session)} Course Session ends before it starts.`)
    }
  }

  for (const exam of exams) {
    totalWeight += numberValue(exam.gradeWeight)
    if (!hasString(exam, 'startsAt')) warnings.push(`${displayId(exam)} Exam date is to be announced.`)
    for (const materialId of stringArray(exam.materialIds)) {
      const material = materialsById.get(materialId)
      if (!material) errors.push(`${displayId(exam)} references missing Material ${materialId}.`)
      if (material && material.type !== 'exam') errors.push(`${displayId(exam)} references non-exam Material ${materialId}.`)
    }
  }

  if (totalWeight > 100) errors.push('Grade Weight total cannot exceed 100.')
  if (totalWeight > 0 && totalWeight < 100) warnings.push('Grade Weight total is below 100 and incomplete.')

  return { valid: errors.length === 0, errors: unique(errors), warnings: unique(warnings) }
}

export function validateRepository(catalog: unknown, courses: LoadedCourse[]): ValidationResult {
  const catalogResult = validateCatalog(catalog)
  const errors = [...catalogResult.errors]
  const warnings = [...catalogResult.warnings]
  const semesterCourseIds = new Set<string>()
  for (const course of courses) {
    const key = courseRepositoryPath({ ...course.path, courseId: course.id })
    if (semesterCourseIds.has(key)) errors.push(`Duplicate Course id within Semester: ${course.id}.`)
    semesterCourseIds.add(key)
    if (course.id !== course.path.courseId) errors.push(`${course.id} does not match its Course Path.`)
    const courseResult = validateCourse(course)
    errors.push(...courseResult.errors)
    warnings.push(...courseResult.warnings)
  }
  return { valid: errors.length === 0, errors: unique(errors), warnings: unique(warnings) }
}

export function isMaterialType(value: unknown): value is MaterialType {
  return ['course', 'seminar', 'lab', 'assignment', 'exam', 'other'].includes(String(value))
}

export function isSessionStatus(value: unknown): value is SessionStatus {
  return value === 'scheduled' || value === 'cancelled'
}

function validateJsonSchema(schema: JsonSchema, value: unknown, path: string): string[] {
  const errors: string[] = []
  if (schema.type === 'object') {
    if (!isRecord(value)) return [`${path} must be a JSON object.`]
    for (const requiredKey of schema.required ?? []) {
      if (value[requiredKey] === undefined) errors.push(`${path} requires ${requiredKey}.`)
    }
    for (const [key, propertySchema] of Object.entries(schema.properties ?? {})) {
      if (value[key] !== undefined) errors.push(...validateJsonSchema(propertySchema, value[key], `${path}.${key}`))
    }
    return errors
  }
  if (schema.type === 'array') {
    if (!Array.isArray(value)) return [`${path} must be an array.`]
    return value.flatMap((item, index) => validateJsonSchema(schema.items ?? {}, item, `${path}[${index}]`))
  }
  if (schema.type === 'string') {
    if (typeof value !== 'string') return [`${path} must be a string.`]
    if (schema.minLength !== undefined && value.length < schema.minLength) return [`${path} must be a non-empty string.`]
  }
  if (schema.type === 'number' && !hasNumber({ value }, 'value')) return [`${path} must be a number.`]
  if (schema.enum && !schema.enum.includes(value)) return [`${path} must be one of ${schema.enum.join(', ')}.`]
  return errors
}

function rewordCatalogSchemaError(error: string): string {
  if (error.includes('studyYears')) return error.replace(/Catalog\.academicYears\[\d+\]/, 'Academic Year entry')
  if (error.includes('semesters')) return error.replace(/Catalog\.academicYears\[\d+\]\.studyYears\[\d+\]/, 'Study Year entry')
  if (error.includes('Catalog.academicYears')) return 'Catalog must define academicYears.'
  return error
}

function rewordCourseSchemaError(error: string): string {
  const itemId = itemIndexDisplay(error)
  if (error === 'Course must be a JSON object.') return 'Course must be a JSON object.'
  if (error.includes('Course.id')) return 'Course requires id.'
  if (error.includes('Course.title')) return 'Course requires title.'
  if (error.includes('Course.professors')) return 'Course requires professors.'
  if (error.includes('Course.materials') && !error.includes('[')) return 'Course requires materials, assignmentDeadlines, courseSessions, and exams arrays.'
  if (error.includes('Course.assignmentDeadlines') && !error.includes('[')) return 'Course requires materials, assignmentDeadlines, courseSessions, and exams arrays.'
  if (error.includes('Course.courseSessions') && !error.includes('[')) return 'Course requires materials, assignmentDeadlines, courseSessions, and exams arrays.'
  if (error.includes('Course.exams') && !error.includes('[')) return 'Course requires materials, assignmentDeadlines, courseSessions, and exams arrays.'
  if (error.includes('materials') && error.includes('.type')) return `${itemId} has an invalid Material type.`
  if (error.includes('materials') && (error.includes('.title') || error.includes('.url'))) return `${itemId} Material requires title and url.`
  if (error.includes('assignmentDeadlines') && error.includes('.dueAt')) return `${itemId} Assignment Deadline requires dueAt.`
  if (error.includes('courseSessions') && (error.includes('.startsAt') || error.includes('.endsAt'))) return `${itemId} Course Session requires startsAt and endsAt.`
  if (error.includes('courseSessions') && error.includes('.status')) return `${itemId} has an invalid Session Status.`
  return error
}

function itemIndexDisplay(error: string): string {
  const match = error.match(/\[(\d+)\]/)
  return match ? `Item ${Number(match[1]) + 1}` : 'Unnamed item'
}

function displayId(value: Record<string, unknown>): string {
  return typeof value.id === 'string' ? value.id : 'Unnamed item'
}

function numberValue(value: unknown): number {
  return typeof value === 'number' ? value : 0
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)]
}
