import { courseDataFilePath, courseRepositoryPath, findCourse } from './coursePath.js'
import { fail, hasString, isRecord, stringArray } from './records.js'
import { loadRepositoryData } from './repository.js'
import { isDifficulty, isMaterialType, isSessionStatus, validateCatalog, validateContributionPayload, validateCourse } from './validation.js'
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
  owner: 'David-I7',
  repo: 'unihub',
  branch: 'main',
}

/**
 * ContributionProcessor encapsulates validation, state transitions,
 * and formatting of repository contributions.
 */
class ContributionProcessor {
  private repository: RepositorySnapshot
  private githubTarget: GithubTarget

  constructor(
    repository: RepositorySnapshot,
    githubTarget: GithubTarget = defaultGithubTarget
  ) {
    this.repository = repository
    this.githubTarget = githubTarget
  }

  processCourseContribution(options: {
    type: ContributionType
    mode: "issue" | "pull-request"
    path: CoursePath
    payload: unknown
  }): PreparedContribution {
    const { type, mode, path, payload } = options
    const targetCourse = findCourse(this.repository.courses, path)

    const applied = this.applyToCourse(type, payload, targetCourse)
    if (!applied.valid) return { ...applied, parsed: payload }

    return this.formatCourseReview({
      applied,
      parsed: payload,
      type,
      mode,
      path,
      currentCourse: targetCourse,
    })
  }

  applyToCourse(
    type: ContributionType,
    payload: unknown,
    targetCourse?: Course
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
      nextCourse.materialDifficulty = isDifficulty(singlePayload.materialDifficulty) ? singlePayload.materialDifficulty : nextCourse.materialDifficulty
      nextCourse.passingDifficulty = isDifficulty(singlePayload.passingDifficulty) ? singlePayload.passingDifficulty : nextCourse.passingDifficulty
    }

    return { ...validation, updatedCourse: nextCourse }
  }

  formatCourseReview(options: {
    applied: ValidationResult & { updatedCourse?: Course }
    parsed: unknown
    type: ContributionType
    mode: 'issue' | 'pull-request'
    path: CoursePath
    currentCourse?: Course
  }): PreparedContribution {
    const { applied, parsed, type, mode, path, currentCourse } = options
    const currentJson = JSON.stringify(currentCourse ? repositoryCourseJson(currentCourse) : null, null, 2)
    const changedJson = JSON.stringify(applied.updatedCourse ? repositoryCourseJson(applied.updatedCourse) : parsed, null, 2)
    const pathText = courseRepositoryPath(path)
    const diffText = jsonLineDiff(currentJson, changedJson)
    const body = [
      `Contribution type: ${type}`,
      `Target Course Path: ${pathText}`,
      '',
      'Current state:',
      '```json',
      currentJson,
      '```',
      '',
      'Diff:',
      '```diff',
      diffText,
      '```',
      '',
      'Updated state:',
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
        issueUrl: githubIssueUrl(this.githubTarget, `Contribution: ${type}`, body),
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
      githubLink: githubEditUrl(this.githubTarget, courseDataFilePath(path)),
    }
  }

  formatCatalogReview(options: {
    applied: ValidationResult & { updatedCatalog?: Catalog }
    parsed: unknown
    type: ContributionType
    mode: 'issue' | 'pull-request'
  }): PreparedContribution {
    const { applied, parsed, type, mode } = options
    const currentJson = JSON.stringify(this.repository.catalog, null, 2)
    const changedJson = JSON.stringify(applied.updatedCatalog, null, 2)
    const diffText = jsonLineDiff(currentJson, changedJson)
    const body = [
      `Contribution type: ${type}`,
      'Target Catalog File: public/data/catalog.json',
      '',
      'Current state:',
      '```json',
      currentJson,
      '```',
      '',
      'Diff:',
      '```diff',
      diffText,
      '```',
      '',
      'Updated state:',
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
        issueUrl: githubIssueUrl(this.githubTarget, `Contribution: ${type}`, body),
      }
    }

    return {
      ...applied,
      parsed,
      changedJson,
      prTitle: `Contribution: ${type} for Catalog`,
      prBody: body,
      githubLink: githubEditUrl(this.githubTarget, 'public/data/catalog.json'),
    }
  }
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

  const processor = new ContributionProcessor(repository, githubTarget)
  return processor.processCourseContribution({
    type: draft.type,
    mode: draft.mode,
    path: draft.path,
    payload: parsed,
  })
}

export function applyContribution(
  type: ContributionType,
  payload: unknown,
  targetCourse?: Course,
): ValidationResult & { updatedCourse?: Course } {
  const processor = new ContributionProcessor({ catalog: { academicYears: [] }, courses: [] })
  return processor.applyToCourse(type, payload, targetCourse)
}

export const validateContribution = applyContribution

export function prepareGeneratedContribution(options: {
  draft: GeneratedContributionDraft
  repository: RepositorySnapshot
  githubTarget?: GithubTarget
  now?: () => string
}): PreparedContribution {
  const { draft, repository, githubTarget = defaultGithubTarget, now = () => new Date().toISOString() } = options
  const processor = new ContributionProcessor(repository, githubTarget)

  if (isCatalogContributionType(draft.type)) {
    const generated = generateCatalogContribution(draft, repository)
    if (!generated.valid) return generated
    return processor.formatCatalogReview({
      applied: generated,
      parsed: generated.parsed,
      type: draft.type,
      mode: draft.mode,
    })
  }

  const generated = generateContributionPayload(draft, repository, now())
  if (!generated.valid) return generated

  if (draft.type === 'add-new-course') {
    const targetCourse = generated.payload as Course
    const catalogUpdate = addCourseToCatalog(repository.catalog, generated.path, targetCourse.title)
    if (!catalogUpdate.valid) return { ...catalogUpdate, parsed: targetCourse, path: generated.path }
    const courseValidation = validateCourse(targetCourse)
    if (!courseValidation.valid) return { ...courseValidation, parsed: targetCourse, path: generated.path }
    return formatNewCourseReview({
      validation: courseValidation,
      parsed: targetCourse,
      mode: draft.mode,
      path: generated.path,
      currentCatalog: repository.catalog,
      updatedCatalog: catalogUpdate.updatedCatalog,
      githubTarget,
    })
  }

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

    return processor.formatCourseReview({
      applied: { ...validation, updatedCourse: nextCourse },
      parsed: generated.payload,
      type: draft.type,
      mode: draft.mode,
      path: generated.path,
      currentCourse: targetCourse,
    })
  }

  return processor.processCourseContribution({
    type: draft.type,
    mode: draft.mode,
    path: generated.path,
    payload: generated.payload,
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
  if (!academicYearId) return fail('Academic Year id is required.')
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
  if (!studyYearId) return fail('Study Year id is required.')
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

function addCourseToCatalog(catalog: Catalog, path: CoursePath, title: string): ValidationResult & { updatedCatalog?: Catalog } {
  const nextCatalog = structuredClone(catalog) as Catalog
  const academicYear = nextCatalog.academicYears.find((item) => item.id === path.academicYearId)
  if (!academicYear) return fail(`Academic Year '${path.academicYearId || 'unknown'}' does not exist.`)
  const studyYear = academicYear.studyYears.find((item) => item.id === path.studyYearId)
  if (!studyYear) return fail(`Study Year '${path.studyYearId || 'unknown'}' does not exist in Academic Year '${academicYear.id}'.`)
  const semester = studyYear.semesters.find((item) => item.id === path.semesterId)
  if (!semester) return fail(`Semester '${path.semesterId || 'unknown'}' does not exist in Study Year '${studyYear.id}'.`)
  const courses = semester.courses ?? []
  if (courses.some((course) => course.id === path.courseId)) return fail(`Course '${path.courseId}' already exists in Semester '${semester.id}'.`)
  semester.courses = [...courses, { id: path.courseId, title }]
  return validatedCatalog(nextCatalog)
}

function formatNewCourseReview(options: {
  validation: ValidationResult
  parsed: Course
  mode: 'issue' | 'pull-request'
  path: CoursePath
  currentCatalog: Catalog
  updatedCatalog?: Catalog
  githubTarget: GithubTarget
}): PreparedContribution {
  const { validation, parsed, mode, path, currentCatalog, updatedCatalog, githubTarget } = options
  const emptyCourseJson = JSON.stringify(null, null, 2)
  const courseJson = JSON.stringify(repositoryCourseJson(parsed), null, 2)
  const currentCatalogJson = JSON.stringify(currentCatalog, null, 2)
  const changedCatalogJson = JSON.stringify(updatedCatalog, null, 2)
  const courseDiff = jsonLineDiff(emptyCourseJson, courseJson)
  const catalogDiff = jsonLineDiff(currentCatalogJson, changedCatalogJson)
  const body = [
    'Course file diff:',
    '```diff',
    courseDiff,
    '```',
    '',
    'Course file new state:',
    '```json',
    courseJson,
    '```',
    '',
    'Catalog diff:',
    '```diff',
    catalogDiff,
    '```',
    '',
    'Catalog new state:',
    '```json',
    changedCatalogJson,
    '```',
  ].join('\n')

  if (mode === 'issue') {
    return {
      ...validation,
      parsed,
      path,
      updatedCourse: parsed,
      updatedCatalog,
      changedJson: courseJson,
      issueBody: body,
      issueUrl: githubIssueUrl(githubTarget, `Contribution: add-new-course`, body),
    }
  }

  return {
    ...validation,
    parsed,
    path,
    updatedCourse: parsed,
    updatedCatalog,
    changedJson: courseJson,
    prTitle: `Contribution: add-new-course for ${path.courseId}`,
    prBody: [
      body,
      '',
      'GitHub cannot atomically create the Course file and edit Catalog from one plain file URL; create the Course file with the link, then use this copied PR content for the Catalog diff.',
    ].join('\n'),
    githubLink: githubCreateUrl(githubTarget, courseDataFilePath(path), courseJson),
  }
}

function generateContributionPayload(
  draft: GeneratedContributionDraft,
  repository: RepositorySnapshot,
  timestamp: string,
): ValidationResult & { path: CoursePath; payload: unknown } {
  const input = draft.input
  if (draft.type === 'add-new-course') {
    if (!draft.context?.academicYearId || !draft.context.studyYearId || !draft.context.semesterId) return { ...fail('Add new Course requires Academic Year, Study Year, and Semester.'), path: emptyPath(), payload: undefined }
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
        materialDifficulty: isDifficulty(input.materialDifficulty) ? input.materialDifficulty : 'unknown',
        passingDifficulty: isDifficulty(input.passingDifficulty) ? input.passingDifficulty : 'unknown',
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
    if (Array.isArray(input.items)) {
      const generated = []
      const used = [...usedIds(targetCourse)]
      for (const item of input.items) {
        const material = generatedMaterial(isRecord(item) ? item : {}, timestamp, used)
        generated.push(material)
        if (material.payload.id) used.push(material.payload.id)
      }
      const errors = generated.flatMap((item) => item.errors)
      const payload = generated.map((item) => item.payload)
      return errors.length === 0 ? { valid: true, errors: [], warnings: [], path: draft.path, payload } : { valid: false, errors, warnings: [], path: draft.path, payload }
    }
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
          ...(text(input.description) ? { description: text(input.description) } : {}),
          ...(text(input.location) ? { location: text(input.location) } : {}),
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
        ...(isDifficulty(input.materialDifficulty) ? { materialDifficulty: input.materialDifficulty } : {}),
        ...(isDifficulty(input.passingDifficulty) ? { passingDifficulty: input.passingDifficulty } : {}),
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

function jsonLineDiff(before: string, after: string): string {
  if (before === after) return 'No changes.'
  const beforeLines = before.split('\n')
  const afterLines = after.split('\n')
  const lines: string[] = []
  const max = Math.max(beforeLines.length, afterLines.length)
  for (let index = 0; index < max; index += 1) {
    const beforeLine = beforeLines[index]
    const afterLine = afterLines[index]
    if (beforeLine === afterLine) {
      if (beforeLine !== undefined) lines.push(` ${beforeLine}`)
      continue
    }
    if (beforeLine !== undefined) lines.push(`-${beforeLine}`)
    if (afterLine !== undefined) lines.push(`+${afterLine}`)
  }
  return lines.join('\n')
}

function githubIssueUrl(target: GithubTarget, title: string, body: string): string {
  void body
  return `https://github.com/${target.owner}/${target.repo}/issues/new?title=${encodeURIComponent(title)}`
}

function githubEditUrl(target: GithubTarget, filePath: string): string {
  return `https://github.com/${target.owner}/${target.repo}/edit/${target.branch}/${filePath}`
}

function githubCreateUrl(target: GithubTarget, filePath: string, value: string): string {
  const normalized = filePath.replace(/^public\//, '')
  const slashIndex = normalized.lastIndexOf('/')
  const directory = slashIndex >= 0 ? normalized.slice(0, slashIndex) : ''
  const filename = slashIndex >= 0 ? normalized.slice(slashIndex + 1) : normalized
  return `https://github.com/${target.owner}/${target.repo}/new/${target.branch}/${directory}?filename=${encodeURIComponent(filename)}&value=${encodeURIComponent(value)}`
}
