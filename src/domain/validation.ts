import { z } from 'zod'
import { courseRepositoryPath } from './coursePath.js'
import { arrayOfRecords, fail, hasString, isRecord, stringArray } from './records.js'
import type { LoadedCourse, MaterialType, SessionStatus, ValidationResult, Course } from './types.js'

const materialTypeSchema = z.enum(['course', 'seminar', 'lab', 'assignment', 'exam', 'video', 'other'])
const sessionStatusSchema = z.enum(['scheduled', 'cancelled'])

const stringField = z.string().min(1)
const optionalString = z.string().optional()
const optionalStringArray = z.array(z.string()).optional()
const optionalNumber = z.number().optional()
const externalUrl = z.string().url().refine((value) => value.startsWith('http://') || value.startsWith('https://'), 'must be an external URL')

const materialSchema = z.object({
  id: stringField,
  type: materialTypeSchema,
  title: stringField,
  url: externalUrl,
  addedAt: stringField,
  updatedAt: stringField,
}).passthrough()

const assignmentDeadlineSchema = z.object({
  id: stringField,
  title: stringField,
  description: optionalString,
  dueAt: stringField,
  submissionUrl: optionalString,
  gradeWeight: optionalNumber,
  materialIds: optionalStringArray,
  addedAt: stringField,
  updatedAt: stringField,
}).passthrough()

const courseSessionSchema = z.object({
  id: stringField,
  title: stringField,
  startsAt: stringField,
  endsAt: stringField,
  location: optionalString,
  status: sessionStatusSchema,
  addedAt: stringField,
  updatedAt: stringField,
}).passthrough()

const examSchema = z.object({
  id: stringField,
  title: stringField,
  startsAt: optionalString,
  gradeWeight: optionalNumber,
  materialIds: optionalStringArray,
  addedAt: stringField,
  updatedAt: stringField,
}).passthrough()

const semesterCourseSchema = z.object({
  id: stringField,
  title: stringField,
}).passthrough()

const catalogSemesterSchema = z.object({
  id: stringField,
  label: stringField,
  order: z.number(),
  courses: z.array(semesterCourseSchema).optional(),
}).passthrough()

const catalogStudyYearSchema = z.object({
  id: stringField,
  label: stringField,
  order: z.number(),
  semesters: z.array(catalogSemesterSchema),
}).passthrough()

const catalogAcademicYearSchema = z.object({
  id: stringField,
  label: stringField,
  order: z.number(),
  studyYears: z.array(catalogStudyYearSchema),
}).passthrough()

const catalogSchema = z.object({
  academicYears: z.array(catalogAcademicYearSchema),
}).passthrough()

const courseSchema = z.object({
  id: stringField,
  title: stringField,
  professors: z.array(z.string()),
  description: optionalString,
  materials: z.array(materialSchema),
  assignmentDeadlines: z.array(assignmentDeadlineSchema),
  courseSessions: z.array(courseSessionSchema),
  exams: z.array(examSchema),
}).passthrough()

const editCourseMetadataSchema = z.object({
  title: stringField.optional(),
  professors: z.array(z.string()).optional(),
  description: optionalString,
}).passthrough()

export const repositorySchema = {
  catalog: catalogSchema,
  course: courseSchema,
}

export function validateCatalog(catalog: unknown): ValidationResult {
  const result = catalogSchema.safeParse(catalog)
  const errors = result.success ? [] : result.error.issues.map((issue) => zodIssueToMessage(issue)).map(rewordCatalogSchemaError)
  return { valid: errors.length === 0, errors, warnings: [] }
}

export function validateCourse(course: unknown): ValidationResult {
  if (!isRecord(course)) return fail('Course must be a JSON object.')

  const warnings: string[] = []
  const result = courseSchema.safeParse(course)
  const errors = result.success ? [] : result.error.issues.map((issue) => zodIssueToMessage(issue)).map((error) => rewordCourseSchemaError(error))

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
    if (!hasString(item, 'addedAt')) errors.push(`${itemId} requires addedAt.`)
    if (!hasString(item, 'updatedAt')) errors.push(`${itemId} requires updatedAt.`)
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
  return materialTypeSchema.safeParse(value).success
}

export function isSessionStatus(value: unknown): value is SessionStatus {
  return sessionStatusSchema.safeParse(value).success
}

export function validateContributionPayload(
  type: string,
  payload: unknown,
  targetCourse?: Course,
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (type === 'add-new-course') {
    return validateCourse(payload)
  }

  const isBatchable = ['add-material', 'add-assignment-deadline', 'add-exam', 'add-course-session'].includes(type)
  const payloads = Array.isArray(payload) ? payload : [payload]

  if (Array.isArray(payload) && !isBatchable) {
    return fail(`Contribution type '${type}' does not support multiple items.`)
  }

  if (Array.isArray(payload) && !payload.every(isRecord)) {
    return fail('Contribution payload array must contain only JSON objects.')
  }

  const itemSchema = contributionItemSchema(type)
  if (!itemSchema) return fail(`Unsupported Contribution type: ${type}.`)

  for (let i = 0; i < payloads.length; i++) {
    const item = payloads[i]
    const prefix = Array.isArray(payload) ? `Item ${i + 1}` : 'Contribution'
    const result = itemSchema.safeParse(item)
    if (!result.success) {
      errors.push(...result.error.issues.map((issue) => zodIssueToMessage(issue, prefix)).map((error) => rewordCourseSchemaError(error, type)))
    }

    if (!isRecord(item)) continue

    const itemId = String(item.id ?? '')
    if (item.id === undefined && type !== 'edit-course-metadata') {
      errors.push(`${prefix} requires id.`)
    }

    if (item.addedAt === undefined && type !== 'edit-course-metadata' && type !== 'update-material') {
      errors.push(`${itemId || prefix} requires addedAt.`)
    }
    if (item.updatedAt === undefined && type !== 'edit-course-metadata') {
      errors.push(`${itemId || prefix} requires updatedAt.`)
    }

    if (type === 'add-course-session') {
      if (hasString(item, 'startsAt') && hasString(item, 'endsAt') && Date.parse(item.endsAt) <= Date.parse(item.startsAt)) {
        errors.push(`${itemId || prefix} Course Session ends before it starts.`)
      }
    }

    if (type === 'add-exam') {
      if (!hasString(item, 'startsAt')) {
        warnings.push(`${itemId || prefix} Exam date is to be announced.`)
      }
    }

    if (targetCourse && itemId) {
      const existsInMaterials = Array.isArray(targetCourse.materials) && targetCourse.materials.some((m) => m.id === itemId)
      const existsInAssignments = Array.isArray(targetCourse.assignmentDeadlines) && targetCourse.assignmentDeadlines.some((a) => a.id === itemId)
      const existsInSessions = Array.isArray(targetCourse.courseSessions) && targetCourse.courseSessions.some((s) => s.id === itemId)
      const existsInExams = Array.isArray(targetCourse.exams) && targetCourse.exams.some((e) => e.id === itemId)
      if (type === 'update-material') {
        if (!existsInMaterials) {
          errors.push(`Material '${itemId}' does not exist in target Course.`)
        }
      } else if (existsInMaterials || existsInAssignments || existsInSessions || existsInExams) {
        errors.push(`Duplicate ID: '${itemId}' already exists in target Course.`)
      }

      if (type === 'add-assignment-deadline' || type === 'add-exam') {
        const materialIds = stringArray(item.materialIds)
        for (const matId of materialIds) {
          const material = Array.isArray(targetCourse.materials) && targetCourse.materials.find((m) => m.id === matId)
          if (!material) {
            errors.push(`${itemId || prefix} references missing Material ${matId}.`)
          } else {
            const expectedType = type === 'add-assignment-deadline' ? 'assignment' : 'exam'
            if (material.type !== expectedType) {
              errors.push(`${itemId || prefix} references non-${expectedType} Material ${matId}.`)
            }
          }
        }
      }
    }
  }

  if (Array.isArray(payload)) {
    const batchIds = new Set<string>()
    for (let i = 0; i < payloads.length; i++) {
      const item = payloads[i]
      if (isRecord(item) && typeof item.id === 'string') {
        if (batchIds.has(item.id)) {
          errors.push(`Duplicate ID in batch: '${item.id}'.`)
        }
        batchIds.add(item.id)
      }
    }
  }

  return { valid: errors.length === 0, errors: unique(errors), warnings: unique(warnings) }
}

function contributionItemSchema(type: string): z.ZodType | undefined {
  if (type === 'add-material') return materialSchema
  if (type === 'update-material') return materialSchema
  if (type === 'add-assignment-deadline') return assignmentDeadlineSchema
  if (type === 'add-exam') return examSchema
  if (type === 'add-course-session') return courseSessionSchema
  if (type === 'edit-course-metadata') return editCourseMetadataSchema
  return undefined
}

function zodIssueToMessage(issue: z.core.$ZodIssue, prefix?: string): string {
  const path = [prefix, ...issue.path.map(String)].filter(Boolean).join('.')
  const displayPath = path || 'Value'
  if (issue.code === 'invalid_type') return `${displayPath} must be ${issue.expected === 'object' ? 'a JSON object' : articleFor(issue.expected)}.`
  if (issue.code === 'too_small' && issue.origin === 'string') return `${displayPath} must be a non-empty string.`
  if (issue.code === 'invalid_value' && 'values' in issue) return `${displayPath} must be one of ${issue.values.join(', ')}.`
  return `${displayPath}: ${issue.message}`
}

function articleFor(expected: string): string {
  if (expected === 'array') return 'an array'
  if (expected === 'string') return 'a string'
  if (expected === 'number') return 'a number'
  return expected
}

function rewordCatalogSchemaError(error: string): string {
  if (error.includes('studyYears')) return error.replace(/academicYears\.\d+/, 'Academic Year entry')
  if (error.includes('semesters')) return error.replace(/academicYears\.\d+\.studyYears\.\d+/, 'Study Year entry')
  if (error.includes('academicYears')) return 'Catalog must define academicYears.'
  return error
}

function rewordCourseSchemaError(error: string, type?: string): string {
  const itemId = itemIndexDisplay(error)
  const isSingle = itemId === 'Contribution'
  const subject = isSingle ? '' : `${itemId} `

  if (error === 'Course must be a JSON object.') return 'Course must be a JSON object.'
  if (error.includes('Course.id')) return 'Course requires id.'
  if (error.includes('Course.title')) return 'Course requires title.'
  if (error.includes('Course.professors')) return 'Course requires professors.'
  if (error.includes('Course.materials') && !error.includes('.')) return 'Course requires materials, assignmentDeadlines, courseSessions, and exams arrays.'
  if (error.includes('Course.assignmentDeadlines') && !error.includes('.')) return 'Course requires materials, assignmentDeadlines, courseSessions, and exams arrays.'
  if (error.includes('Course.courseSessions') && !error.includes('.')) return 'Course requires materials, assignmentDeadlines, courseSessions, and exams arrays.'
  if (error.includes('Course.exams') && !error.includes('.')) return 'Course requires materials, assignmentDeadlines, courseSessions, and exams arrays.'

  const isMaterial = type ? ['add-material', 'update-material'].includes(type) : error.includes('materials')
  const isAssignment = type ? type === 'add-assignment-deadline' : error.includes('assignmentDeadlines')
  const isSession = type ? type === 'add-course-session' : error.includes('courseSessions')
  const isExam = type ? type === 'add-exam' : error.includes('exams')

  if (isMaterial) {
    if (error.includes('type')) return `${subject}Material has an invalid Material type.`
    if (error.includes('external URL')) return `${subject}Material requires an external URL.`
    if (error.includes('title') || error.includes('url')) return `${subject}Material requires title and url.`
  }

  if (isAssignment) {
    if (error.includes('title')) return `${subject}Assignment Deadline requires title.`
    if (error.includes('dueAt')) return `${subject}Assignment Deadline requires dueAt.`
  }

  if (isSession) {
    if (error.includes('startsAt') || error.includes('endsAt')) return `${subject}Course Session requires startsAt and endsAt.`
    if (error.includes('status')) return `${itemId} has an invalid Session Status.`
    if (error.includes('title')) return `${subject}Course Session requires title.`
  }

  if (isExam) {
    if (error.includes('title')) return `${subject}Exam requires title.`
  }

  if (error.includes('addedAt')) return `${itemId} requires addedAt.`
  if (error.includes('updatedAt')) return `${itemId} requires updatedAt.`

  return error
}

function itemIndexDisplay(error: string): string {
  const dotIndexMatch = error.match(/\.(\d+)\./)
  if (dotIndexMatch) return `Item ${Number(dotIndexMatch[1]) + 1}`
  const itemPrefixMatch = error.match(/Item (\d+)/)
  if (itemPrefixMatch) return `Item ${itemPrefixMatch[1]}`
  if (error.includes('Contribution')) return 'Contribution'
  return 'Unnamed item'
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
