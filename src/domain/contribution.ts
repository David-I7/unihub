import { courseDataFilePath, courseRepositoryPath, findCourse } from './coursePath.js'
import { fail, hasString, isRecord, stringArray } from './records.js'
import { loadRepositoryData } from './repository.js'
import { isMaterialType, isSessionStatus, validateCatalog, validateContributionPayload, validateCourse } from './validation.js'
import type { AssignmentDeadline, Catalog, ContributionDraft, ContributionType, Course, CourseContext, CoursePath, CourseSession, Exam, Material, RepositorySnapshot, ValidationResult } from './types.js'

export type GithubTarget = {
  owner: string
  repo: string
  branch: string
}

export type PreparedContribution = ValidationResult & {
  issueBody?: string
  issueUrl?: string
  prTitle?: string
  prBody?: string
  githubLink?: string
  parsed?: unknown
  updatedCourse?: Course
  updatedCatalog?: Catalog
  changedJson?: string
  path?: CoursePath
}

export type GeneratedContributionDraft = {
  type: ContributionType
  mode: "issue" | "pull-request"
  path?: CoursePath
  context?: CourseContext
  input: Record<string, unknown>
}

const defaultGithubTarget: GithubTarget = {
  owner: 'example',
  repo: 'unihub',
  branch: 'main',
}

export function contributionPayloadFromText(draft: ContributionDraft): PreparedContribution {
  return prepareContribution({
    draft,
    repository: loadRepositoryData(),
    githubTarget: defaultGithubTarget,
  })
}

export function prepareContribution(options: {
  draft: ContributionDraft
  repository: RepositorySnapshot
  githubTarget?: GithubTarget
}): PreparedContribution {
  const { draft, repository, githubTarget = defaultGithubTarget } = options
  let parsed: unknown
  try {
    parsed = JSON.parse(draft.payloadText)
  } catch {
    return { valid: false, errors: ['Contribution JSON is malformed.'], warnings: [] }
  }

  const targetCourse = findCourse(repository.courses, draft.path)
  const applied = applyContribution(draft.type, parsed, targetCourse)
  if (!applied.valid) return { ...applied, parsed }

  return prepareReviewOutput({
    applied,
    parsed,
    type: draft.type,
    mode: draft.mode,
    path: draft.path,
    githubTarget,
  })
}

export function prepareGeneratedContribution(options: {
  draft: GeneratedContributionDraft
  repository: RepositorySnapshot
  githubTarget?: GithubTarget
  now?: () => string
}): PreparedContribution {
  const { draft, repository, githubTarget = defaultGithubTarget, now = () => new Date().toISOString() } = options
  if (isCatalogContributionType(draft.type)) {
    const generated = generateCatalogContribution(draft, repository)
    if (!generated.valid) return generated
    return prepareCatalogReviewOutput({
      applied: generated,
      parsed: generated.parsed,
      type: draft.type,
      mode: draft.mode,
      githubTarget,
    })
  }
  const generated = generateContributionPayload(draft, repository, now())
  if (!generated.valid) return generated
  if ((draft.type === 'add-assignment-deadline' || draft.type === 'add-exam') && Array.isArray(generated.payload)) {
    const targetCourse = findCourse(repository.courses, generated.path)
    if (!targetCourse) return fail('Existing Course contribution requires a valid target Course.')
    const nextCourse = structuredClone(targetCourse) as Course
    const materials = generated.payload.filter(isMaterialPayload) as Material[]
    const courseItems = generated.payload.filter((item) => !isMaterialPayload(item))
    nextCourse.materials = [...nextCourse.materials, ...materials]
    if (draft.type === 'add-assignment-deadline') nextCourse.assignmentDeadlines = [...nextCourse.assignmentDeadlines, ...(courseItems as AssignmentDeadline[])]
    if (draft.type === 'add-exam') nextCourse.exams = [...nextCourse.exams, ...(courseItems as Exam[])]
    const validation = validateCourse(nextCourse)
    if (!validation.valid) return { ...validation, parsed: generated.payload, path: generated.path }
    return prepareReviewOutput({
      applied: { ...validation, updatedCourse: nextCourse },
      parsed: generated.payload,
      type: draft.type,
      mode: draft.mode,
      path: generated.path,
      githubTarget,
    })
  }
  return prepareContribution({
    draft: {
      type: draft.type,
      mode: draft.mode,
      path: generated.path,
      payloadText: JSON.stringify(generated.payload),
    },
    repository,
    githubTarget,
  })
}

function isCatalogContributionType(type: ContributionType): type is 'add-academic-year' | 'add-study-year' | 'add-semester' {
  return type === 'add-academic-year' || type === 'add-study-year' || type === 'add-semester'
}

function generateCatalogContribution(
  draft: GeneratedContributionDraft,
  repository: RepositorySnapshot,
): ValidationResult & { updatedCatalog?: Catalog; parsed?: unknown } {
  const input = draft.input
  const nextCatalog = structuredClone(repository.catalog) as Catalog

  if (draft.type === 'add-academic-year') {
    const id = text(input.academicYearId) || slugify(text(input.label) || text(input.title))
    if (!id) return fail('Academic Year id is required.')
    if (nextCatalog.academicYears.some((year) => year.id === id)) return fail(`Academic Year '${id}' already exists.`)
    const nextYear = {
      id,
      label: text(input.label) || id,
      order: number(input.order) ?? nextOrder(nextCatalog.academicYears),
      studyYears: [],
    }
    nextCatalog.academicYears.push(nextYear)
    return { ...validatedCatalog(nextCatalog), updatedCatalog: nextCatalog, parsed: nextYear }
  }

  const academicYearId = text(input.academicYearId) || draft.context?.academicYearId || ''
  const academicYear = nextCatalog.academicYears.find((year) => year.id === academicYearId)
  if (!academicYear) return fail(`Academic Year '${academicYearId || 'unknown'}' does not exist.`)

  if (draft.type === 'add-study-year') {
    const id = text(input.studyYearId) || slugify(text(input.label) || text(input.title))
    if (!id) return fail('Study Year id is required.')
    if (academicYear.studyYears.some((studyYear) => studyYear.id === id)) return fail(`Study Year '${id}' already exists in Academic Year '${academicYear.id}'.`)
    const nextStudyYear = {
      id,
      label: text(input.label) || id,
      order: number(input.order) ?? nextOrder(academicYear.studyYears),
      semesters: [],
    }
    academicYear.studyYears.push(nextStudyYear)
    return { ...validatedCatalog(nextCatalog), updatedCatalog: nextCatalog, parsed: nextStudyYear }
  }

  const studyYearId = text(input.studyYearId) || draft.context?.studyYearId || ''
  const studyYear = academicYear.studyYears.find((item) => item.id === studyYearId)
  if (!studyYear) return fail(`Study Year '${studyYearId || 'unknown'}' does not exist in Academic Year '${academicYear.id}'.`)

  const id = text(input.semesterId) || slugify(text(input.label) || text(input.title))
  if (!id) return fail('Semester id is required.')
  if (studyYear.semesters.some((semester) => semester.id === id)) return fail(`Semester '${id}' already exists in Study Year '${studyYear.id}'.`)

  const courseId = text(input.courseId)
  const courseTitle = text(input.courseTitle)
  const nextSemester = {
    id,
    label: text(input.label) || id,
    order: number(input.order) ?? nextOrder(studyYear.semesters),
    ...(courseId && courseTitle ? { courses: [{ id: courseId, title: courseTitle }] } : {}),
  }
  studyYear.semesters.push(nextSemester)
  return { ...validatedCatalog(nextCatalog), updatedCatalog: nextCatalog, parsed: nextSemester }
}

function validatedCatalog(catalog: Catalog): ValidationResult & { updatedCatalog?: Catalog } {
  const validation = validateCatalog(catalog)
  return validation.valid ? { ...validation, updatedCatalog: catalog } : validation
}

export function applyContribution(
  type: ContributionType,
  payload: unknown,
  targetCourse?: Course,
): ValidationResult & { updatedCourse?: Course } {
  const validation = validateContributionPayload(type, payload, targetCourse)
  if (!validation.valid) {
    return { ...validation }
  }

  if (type === 'add-new-course') {
    return { ...validation, updatedCourse: payload as Course }
  }
  if (!targetCourse) return fail('Existing Course contribution requires a valid target Course.')

  const nextCourse = structuredClone(targetCourse) as Course
  const payloads = Array.isArray(payload) ? payload : [payload]

  if (type === 'add-material') nextCourse.materials = [...nextCourse.materials, ...(payloads as Material[])]
  if (type === 'update-material') {
    const update = payload as Material
    nextCourse.materials = nextCourse.materials.map((material) => (material.id === update.id ? { ...material, ...update } : material))
  }
  if (type === 'add-assignment-deadline') nextCourse.assignmentDeadlines = [...nextCourse.assignmentDeadlines, ...(payloads as AssignmentDeadline[])]
  if (type === 'add-exam') nextCourse.exams = [...nextCourse.exams, ...(payloads as Exam[])]
  if (type === 'add-course-session') nextCourse.courseSessions = [...nextCourse.courseSessions, ...(payloads as CourseSession[])]
  if (type === 'edit-course-metadata') {
    const singlePayload = payload as Record<string, unknown>
    nextCourse.title = String(singlePayload.title ?? nextCourse.title)
    nextCourse.professors = Array.isArray(singlePayload.professors) ? singlePayload.professors.map(String) : nextCourse.professors
    nextCourse.description = hasString(singlePayload, 'description') ? singlePayload.description : nextCourse.description
  }

  return { ...validation, updatedCourse: nextCourse }
}

export const validateContribution = applyContribution

function generateContributionPayload(
  draft: GeneratedContributionDraft,
  repository: RepositorySnapshot,
  timestamp: string,
): ValidationResult & { path: CoursePath; payload: unknown } {
  const input = draft.input
  if (draft.type === 'add-new-course') {
    if (!draft.context) return { ...fail('Add new Course requires Academic Year, Study Year, and Semester.'), path: emptyPath(), payload: undefined }
    const title = text(input.title)
    if (!title) return { ...fail('Course title is required.'), path: emptyPath(), payload: undefined }
    const courseId = uniqueId(slugify(title), repository.courses.filter((course) => course.path.academicYearId === draft.context?.academicYearId && course.path.studyYearId === draft.context?.studyYearId && course.path.semesterId === draft.context?.semesterId).map((course) => course.id))
    const path = { ...draft.context, courseId }
    return {
      valid: true,
      errors: [],
      warnings: [],
      path,
      payload: {
        id: courseId,
        title,
        professors: stringArray(input.professors),
        ...(text(input.description) ? { description: text(input.description) } : {}),
        materials: [],
        assignmentDeadlines: [],
        courseSessions: [],
        exams: [],
      },
    }
  }

  if (!draft.path) return { ...fail('Contribution requires a target Course Path.'), path: emptyPath(), payload: undefined }
  const targetCourse = findCourse(repository.courses, draft.path)
  if (!targetCourse) return { ...fail('Existing Course contribution requires a valid target Course.'), path: draft.path, payload: undefined }

  if (draft.type === 'add-material') {
    const material = generatedMaterial(input, timestamp, usedIds(targetCourse))
    return material.valid ? { ...material, path: draft.path, payload: material.payload } : { ...material, path: draft.path, payload: undefined }
  }

  if (draft.type === 'update-material') {
    const materialId = text(input.materialId)
    const existing = targetCourse.materials.find((material) => material.id === materialId)
    if (!existing) return { ...fail(`Material '${materialId || 'unknown'}' does not exist in target Course.`), path: draft.path, payload: undefined }
    if (input.type !== undefined && !isMaterialType(input.type)) return { ...fail('Contribution has an invalid Material type.'), path: draft.path, payload: undefined }
    return {
      valid: true,
      errors: [],
      warnings: [],
      path: draft.path,
      payload: {
        id: existing.id,
        type: materialType(input.type, existing.type),
        title: text(input.title) || existing.title,
        url: text(input.url) || existing.url,
        addedAt: existing.addedAt,
        updatedAt: timestamp,
      },
    }
  }

  if (draft.type === 'add-assignment-deadline') {
    const materialIds = [...stringArray(input.materialIds)]
    const newMaterials = generatedInlineMaterials(input.newMaterials, 'assignment', timestamp, usedIds(targetCourse))
    if (!newMaterials.valid) return { ...newMaterials, path: draft.path, payload: undefined }
    materialIds.push(...newMaterials.payload.map((material) => material.id))
    return {
      valid: true,
      errors: [],
      warnings: [],
      path: draft.path,
      payload: [
        ...newMaterials.payload,
        {
          id: uniqueId(slugify(text(input.title) || 'assignment'), [...usedIds(targetCourse), ...newMaterials.payload.map((material) => material.id)]),
          title: text(input.title),
          ...(text(input.description) ? { description: text(input.description) } : {}),
          dueAt: text(input.dueAt),
          ...(text(input.submissionUrl) ? { submissionUrl: text(input.submissionUrl) } : {}),
          ...(number(input.gradeWeight) !== undefined ? { gradeWeight: number(input.gradeWeight) } : {}),
          materialIds,
          addedAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    }
  }

  if (draft.type === 'add-exam') {
    const materialIds = [...stringArray(input.materialIds)]
    const newMaterials = generatedInlineMaterials(input.newMaterials, 'exam', timestamp, usedIds(targetCourse))
    if (!newMaterials.valid) return { ...newMaterials, path: draft.path, payload: undefined }
    materialIds.push(...newMaterials.payload.map((material) => material.id))
    return {
      valid: true,
      errors: [],
      warnings: [],
      path: draft.path,
      payload: [
        ...newMaterials.payload,
        {
          id: uniqueId(slugify(text(input.title) || 'exam'), [...usedIds(targetCourse), ...newMaterials.payload.map((material) => material.id)]),
          title: text(input.title),
          ...(text(input.startsAt) ? { startsAt: text(input.startsAt) } : {}),
          ...(number(input.gradeWeight) !== undefined ? { gradeWeight: number(input.gradeWeight) } : {}),
          materialIds,
          addedAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    }
  }

  if (draft.type === 'add-course-session') {
    return {
      valid: true,
      errors: [],
      warnings: [],
      path: draft.path,
      payload: {
        id: uniqueId(slugify(text(input.title) || 'course-session'), usedIds(targetCourse)),
        title: text(input.title),
        startsAt: text(input.startsAt),
        endsAt: text(input.endsAt),
        ...(text(input.location) ? { location: text(input.location) } : {}),
        status: isSessionStatus(input.status) ? input.status : 'scheduled',
        addedAt: timestamp,
        updatedAt: timestamp,
      },
    }
  }

  if (draft.type === 'edit-course-metadata') {
    return {
      valid: true,
      errors: [],
      warnings: [],
      path: draft.path,
      payload: {
        ...(text(input.title) ? { title: text(input.title) } : {}),
        professors: stringArray(input.professors),
        ...(text(input.description) ? { description: text(input.description) } : {}),
      },
    }
  }

  return { ...fail(`Unsupported Contribution type: ${draft.type}.`), path: draft.path, payload: undefined }
}

function generatedMaterial(input: Record<string, unknown>, timestamp: string, used: string[]): ValidationResult & { payload: Material } {
  if (!isMaterialType(input.type)) {
    return {
      ...fail('Contribution has an invalid Material type.'),
      payload: { id: '', type: 'other', title: '', url: '', addedAt: timestamp, updatedAt: timestamp },
    }
  }
  const type = input.type
  const material = {
    id: uniqueId(slugify(text(input.title) || 'material'), used),
    type,
    title: text(input.title),
    url: text(input.url),
    addedAt: timestamp,
    updatedAt: timestamp,
  }
  return { valid: true, errors: [], warnings: [], payload: material }
}

function generatedInlineMaterials(value: unknown, type: 'assignment' | 'exam', timestamp: string, used: string[]): ValidationResult & { payload: Material[] } {
  const items = Array.isArray(value) ? value : []
  const materials: Material[] = []
  const errors: string[] = []
  for (const item of items) {
    if (!isRecord(item)) {
      errors.push('Inline Material must be a JSON object.')
      continue
    }
    const generated = generatedMaterial({ ...item, type }, timestamp, [...used, ...materials.map((material) => material.id)])
    materials.push(generated.payload)
  }
  return { valid: errors.length === 0, errors, warnings: [], payload: materials }
}

function prepareReviewOutput(options: {
  applied: ValidationResult & { updatedCourse?: Course }
  parsed: unknown
  type: ContributionType
  mode: 'issue' | 'pull-request'
  path: CoursePath
  githubTarget: GithubTarget
}): PreparedContribution {
  const { applied, parsed, type, mode, path, githubTarget } = options
  const changedJson = JSON.stringify(applied.updatedCourse ? repositoryCourseJson(applied.updatedCourse) : parsed, null, 2)
  const pathText = courseRepositoryPath(path)
  const body = [
    `Contribution type: ${type}`,
    `Target Course Path: ${pathText}`,
    '',
    'JSON:',
    '```json',
    changedJson,
    '```',
  ].join('\n')

  if (mode === 'issue') {
    return {
      ...applied,
      parsed,
      path,
      changedJson,
      issueBody: body,
      issueUrl: githubIssueUrl(githubTarget, `Contribution: ${type}`, body),
    }
  }

  const prTitle = `Contribution: ${type} for ${path.courseId}`
  return {
    ...applied,
    parsed,
    path,
    changedJson,
    prTitle,
    prBody: body,
    githubLink: githubEditUrl(githubTarget, courseDataFilePath(path)),
  }
}

function prepareCatalogReviewOutput(options: {
  applied: ValidationResult & { updatedCatalog?: Catalog }
  parsed: unknown
  type: ContributionType
  mode: 'issue' | 'pull-request'
  githubTarget: GithubTarget
}): PreparedContribution {
  const { applied, parsed, type, mode, githubTarget } = options
  const changedJson = JSON.stringify(applied.updatedCatalog, null, 2)
  const body = [
    `Contribution type: ${type}`,
    'Target Catalog File: public/data/catalog.json',
    '',
    'JSON:',
    '```json',
    changedJson,
    '```',
  ].join('\n')

  if (mode === 'issue') {
    return {
      ...applied,
      parsed,
      changedJson,
      issueBody: body,
      issueUrl: githubIssueUrl(githubTarget, `Contribution: ${type}`, body),
    }
  }

  return {
    ...applied,
    parsed,
    changedJson,
    prTitle: `Contribution: ${type} for Catalog`,
    prBody: body,
    githubLink: githubEditUrl(githubTarget, 'public/data/catalog.json'),
  }
}

function slugify(value: string): string {
  const slug = value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return slug || 'item'
}

function uniqueId(base: string, used: string[]): string {
  const existing = new Set(used)
  if (!existing.has(base)) return base
  let index = 2
  while (existing.has(`${base}-${index}`)) index += 1
  return `${base}-${index}`
}

function nextOrder(items: Array<{ order: number }>): number {
  return items.reduce((max, item) => Math.max(max, item.order), 0) + 1
}

function usedIds(course: Course): string[] {
  return [
    course.id,
    ...course.materials.map((item) => item.id),
    ...course.assignmentDeadlines.map((item) => item.id),
    ...course.courseSessions.map((item) => item.id),
    ...course.exams.map((item) => item.id),
  ]
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function number(value: unknown): number | undefined {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

function materialType(value: unknown, fallback: Material['type']): Material['type'] {
  return isMaterialType(value) ? value : fallback
}

function emptyPath(): CoursePath {
  return { academicYearId: '', studyYearId: '', semesterId: '', courseId: '' }
}

function isMaterialPayload(value: unknown): value is Material {
  return isRecord(value) && typeof value.url === 'string' && isMaterialType(value.type)
}

function repositoryCourseJson(course: Course): Course {
  const repositoryCourse = { ...(course as Course & { path?: unknown }) }
  delete repositoryCourse.path
  return repositoryCourse
}

function githubIssueUrl(target: GithubTarget, title: string, body: string): string {
  return `https://github.com/${target.owner}/${target.repo}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`
}

function githubEditUrl(target: GithubTarget, filePath: string): string {
  return `https://github.com/${target.owner}/${target.repo}/edit/${target.branch}/${filePath}`
}
