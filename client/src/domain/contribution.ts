import { courseRepositoryPath, findCourse } from './coursePath.js'
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
  parsed?: unknown
  updatedCourse?: Course
  updatedCatalog?: Catalog
  changedJson?: string
  path?: CoursePath
}

export type GeneratedContributionDraft = {
  type: ContributionType
  mode?: "issue" | "pull-request"
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
    mode?: "issue" | "pull-request"
    path: CoursePath
    payload: unknown
  }): PreparedContribution {
    const { type, path, payload } = options
    const targetCourse = findCourse(this.repository.courses, path)

    const applied = this.applyToCourse(type, payload, targetCourse)
    if (!applied.valid) return { ...applied, parsed: payload }

    return this.formatCourseReview({
      applied,
      parsed: payload,
      type,
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
    mode?: 'issue' | 'pull-request'
    path: CoursePath
    currentCourse?: Course
  }): PreparedContribution {
    const { applied, parsed, type, path, currentCourse } = options
    const currentJson = JSON.stringify(currentCourse ? repositoryCourseJson(currentCourse) : null, null, 2)
    const changedJson = JSON.stringify(applied.updatedCourse ? repositoryCourseJson(applied.updatedCourse) : parsed, null, 2)
    const pathText = courseRepositoryPath(path)
    const diffText = jsonLineDiff(currentJson, changedJson)
    const body = [
      `Contribution type: ${type}`,
      `Target Course Path: ${pathText}`,
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

    return {
      ...applied,
      parsed,
      path,
      changedJson,
      issueBody: body,
      issueUrl: githubIssueUrl(this.githubTarget, `Contribution: ${type}`, body),
    }
  }

  formatCatalogReview(options: {
    applied: ValidationResult & { updatedCatalog?: Catalog }
    parsed: unknown
    type: ContributionType
    mode?: 'issue' | 'pull-request'
  }): PreparedContribution {
    const { applied, parsed, type } = options
    const currentJson = JSON.stringify(this.repository.catalog, null, 2)
    const changedJson = JSON.stringify(applied.updatedCatalog, null, 2)
    const diffText = jsonLineDiff(currentJson, changedJson)
    const body = [
      `Contribution type: ${type}`,
      'Target Catalog File: public/data/catalog.json',
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

    return {
      ...applied,
      parsed,
      changedJson,
      issueBody: body,
      issueUrl: githubIssueUrl(this.githubTarget, `Contribution: ${type}`, body),
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
    if (!validation.valid) {
      const isSingleNewItem = courseItems.length === 1
      const cleanedErrors = isSingleNewItem
        ? validation.errors.map((err) => err.replace(/^Item \d+ /, ''))
        : validation.errors
      return { ...validation, errors: cleanedErrors, parsed: generated.payload, path: generated.path }
    }

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

  if (draft.type === 'add-study-year') {
    const academicYearId = text(input.academicYearId) || draft.context?.academicYearId || ''
    if (!academicYearId) return fail('Academic Year id is required.')
    const academicYear = nextCatalog.academicYears.find((year) => year.id === academicYearId)
    if (!academicYear) return fail(`Academic Year '${academicYearId || 'unknown'}' does not exist.`)

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

  // draft.type === 'add-semester'
  const academicYearPayload = isRecord(input.academicYear) ? input.academicYear : undefined
  const createAcademicYear = Boolean(input.createAcademicYear || academicYearPayload)

  let academicYearId = text(input.academicYearId) || (academicYearPayload ? text(academicYearPayload.id) : '') || draft.context?.academicYearId || ''
  let academicYearLabel = academicYearPayload ? text(academicYearPayload.label) : text(input.academicYearLabel)
  if (!academicYearId && academicYearLabel) {
    academicYearId = slugify(academicYearLabel)
  }

  let academicYear = nextCatalog.academicYears.find((year) => year.id === academicYearId)

  if (createAcademicYear || (academicYearLabel && !academicYear)) {
    if (!academicYearLabel && !academicYearId) return fail('Academic Year label is required for new Academic Year.')
    if (!academicYearId) academicYearId = slugify(academicYearLabel)
    if (!academicYear) {
      academicYear = {
        id: academicYearId,
        label: academicYearLabel || academicYearId,
        order: (academicYearPayload ? number(academicYearPayload.order) : number(input.academicYearOrder)) ?? nextOrder(nextCatalog.academicYears),
        studyYears: [],
      }
      nextCatalog.academicYears.push(academicYear)
    }
  }

  if (!academicYear) return fail(`Academic Year '${academicYearId || 'unknown'}' does not exist.`)

  const studyYearPayload = isRecord(input.studyYear) ? input.studyYear : undefined
  const createStudyYear = Boolean(input.createStudyYear || studyYearPayload)

  let studyYearId = text(input.studyYearId) || (studyYearPayload ? text(studyYearPayload.id) : '') || draft.context?.studyYearId || ''
  let studyYearLabel = studyYearPayload ? text(studyYearPayload.label) : text(input.studyYearLabel)
  if (!studyYearId && studyYearLabel) {
    studyYearId = slugify(studyYearLabel)
  }

  let studyYear = academicYear.studyYears.find((item) => item.id === studyYearId)

  if (createStudyYear || (studyYearLabel && !studyYear)) {
    if (!studyYearLabel && !studyYearId) return fail('Study Year label is required for new Study Year.')
    if (!studyYearId) studyYearId = slugify(studyYearLabel)
    if (!studyYear) {
      studyYear = {
        id: studyYearId,
        label: studyYearLabel || studyYearId,
        order: (studyYearPayload ? number(studyYearPayload.order) : number(input.studyYearOrder)) ?? nextOrder(academicYear.studyYears),
        semesters: [],
      }
      academicYear.studyYears.push(studyYear)
    }
  }

  if (!studyYear) return fail(`Study Year '${studyYearId || 'unknown'}' does not exist in Academic Year '${academicYear.id}'.`)

  const semesterPayload = isRecord(input.semester) ? input.semester : undefined
  const semesterLabel = (semesterPayload ? text(semesterPayload.label) : '') || text(input.label) || text(input.semesterLabel) || text(input.title)
  const semesterId = text(input.semesterId) || (semesterPayload ? text(semesterPayload.id) : '') || slugify(semesterLabel)
  if (!semesterId) return fail('Semester id is required.')
  if (studyYear.semesters.some((semester) => semester.id === semesterId)) {
    return fail(`Semester '${semesterId}' already exists in Study Year '${studyYear.id}'.`)
  }

  const courseId = text(input.courseId)
  const courseTitle = text(input.courseTitle)
  const nextSemester = {
    id: semesterId,
    label: semesterLabel || semesterId,
    order: (semesterPayload ? number(semesterPayload.order) : number(input.order)) ?? nextOrder(studyYear.semesters),
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
  mode?: 'issue' | 'pull-request'
  path: CoursePath
  currentCatalog: Catalog
  updatedCatalog?: Catalog
  githubTarget: GithubTarget
}): PreparedContribution {
  const { validation, parsed, path, currentCatalog, updatedCatalog, githubTarget } = options
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

    const professorsRaw = input.professors
    const professors = typeof professorsRaw === 'string'
      ? professorsRaw.split(',').map((p) => p.trim()).filter(Boolean)
      : stringArray(professorsRaw)
    if (professors.length === 0) {
      return { ...fail('New Course requires at least one professor.'), path: emptyPath(), payload: undefined }
    }

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
        professors,
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
    const items = Array.isArray(input.items) ? input.items : [input]
    const generated = []
    const used = [...usedIds(targetCourse)]
    const seenIds = new Set<string>()

    for (let index = 0; index < items.length; index += 1) {
      const item = isRecord(items[index]) ? items[index] : {}
      const material = generatedMaterial(item, timestamp, used)
      if (material.payload.id) {
        if (seenIds.has(material.payload.id)) {
          return { ...fail(`Duplicate item id '${material.payload.id}' in batch.`), path: draft.path, payload: undefined }
        }
        seenIds.add(material.payload.id)
        used.push(material.payload.id)
      }
      generated.push(material)
    }

    const errors: string[] = []
    const isBatch = items.length > 1
    generated.forEach((item, index) => {
      item.errors.forEach((err) => {
        const itemTitle = item.payload.title || item.payload.id || `item ${index + 1}`
        errors.push(isBatch ? `Item #${index + 1} (${itemTitle}): ${err}` : err)
      })
    })

    const payload = generated.map((item) => item.payload)
    return errors.length === 0
      ? { valid: true, errors: [], warnings: [], path: draft.path, payload: isBatch ? payload : payload[0] }
      : { valid: false, errors, warnings: [], path: draft.path, payload: undefined }
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
    const items = Array.isArray(input.items) ? input.items : [input]
    const allPayloads: unknown[] = []
    const used = [...usedIds(targetCourse)]
    const seenIds = new Set<string>()
    const errors: string[] = []
    const isBatch = items.length > 1

    for (let index = 0; index < items.length; index += 1) {
      const item = isRecord(items[index]) ? items[index] : {}
      const materialIds = [...stringArray(item.materialIds)]
      const inlineEnabled = item.createInlineMaterial !== false && item.hasInlineMaterial !== false
      const shouldInline = inlineEnabled && (Boolean(item.createInlineMaterial || item.hasInlineMaterial) || (Array.isArray(item.newMaterials) && item.newMaterials.length > 0))
      const newMaterials = shouldInline
        ? generatedInlineMaterials(item.newMaterials, 'assignment', timestamp, used)
        : { valid: true, errors: [], warnings: [], payload: [] }

      if (!newMaterials.valid) {
        newMaterials.errors.forEach((err) => errors.push(isBatch ? `Item #${index + 1}: ${err}` : err))
        continue
      }

      newMaterials.payload.forEach((mat) => {
        if (mat.id) {
          if (seenIds.has(mat.id)) errors.push(`Duplicate item id '${mat.id}' in batch.`)
          seenIds.add(mat.id)
          used.push(mat.id)
        }
      })
      materialIds.push(...newMaterials.payload.map((mat) => mat.id))

      const title = text(item.title)
      const assignmentId = uniqueId(slugify(title || 'assignment'), used)
      if (seenIds.has(assignmentId)) {
        errors.push(`Duplicate item id '${assignmentId}' in batch.`)
      }
      seenIds.add(assignmentId)
      used.push(assignmentId)

      if (!title) {
        const itemMsg = 'Title is required.'
        errors.push(isBatch ? `Item #${index + 1} (${assignmentId}): ${itemMsg}` : itemMsg)
      }
      if (!text(item.dueAt)) {
        const itemMsg = 'Due date is required.'
        errors.push(isBatch ? `Item #${index + 1} (${assignmentId}): ${itemMsg}` : itemMsg)
      }

      allPayloads.push(
        ...newMaterials.payload,
        {
          id: assignmentId,
          title,
          ...(text(item.description) ? { description: text(item.description) } : {}),
          dueAt: text(item.dueAt),
          ...(number(item.gradeWeight) !== undefined ? { gradeWeight: number(item.gradeWeight) } : {}),
          materialIds,
          addedAt: timestamp,
          updatedAt: timestamp,
        },
      )
    }

    return errors.length === 0
      ? { valid: true, errors: [], warnings: [], path: draft.path, payload: allPayloads }
      : { valid: false, errors, warnings: [], path: draft.path, payload: undefined }
  }

  if (draft.type === 'add-exam') {
    const items = Array.isArray(input.items) ? input.items : [input]
    const allPayloads: unknown[] = []
    const used = [...usedIds(targetCourse)]
    const seenIds = new Set<string>()
    const errors: string[] = []
    const isBatch = items.length > 1

    for (let index = 0; index < items.length; index += 1) {
      const item = isRecord(items[index]) ? items[index] : {}
      const materialIds = [...stringArray(item.materialIds)]
      const inlineEnabled = item.createInlineMaterial !== false && item.hasInlineMaterial !== false
      const shouldInline = inlineEnabled && (Boolean(item.createInlineMaterial || item.hasInlineMaterial) || (Array.isArray(item.newMaterials) && item.newMaterials.length > 0))
      const newMaterials = shouldInline
        ? generatedInlineMaterials(item.newMaterials, 'exam', timestamp, used)
        : { valid: true, errors: [], warnings: [], payload: [] }

      if (!newMaterials.valid) {
        newMaterials.errors.forEach((err) => errors.push(isBatch ? `Item #${index + 1}: ${err}` : err))
        continue
      }

      newMaterials.payload.forEach((mat) => {
        if (mat.id) {
          if (seenIds.has(mat.id)) errors.push(`Duplicate item id '${mat.id}' in batch.`)
          seenIds.add(mat.id)
          used.push(mat.id)
        }
      })
      materialIds.push(...newMaterials.payload.map((mat) => mat.id))

      const title = text(item.title)
      const explicitId = text(item.id)
      if (explicitId && seenIds.has(explicitId)) {
        errors.push(`Duplicate item id '${explicitId}' in batch.`)
      }
      const examId = explicitId || uniqueId(slugify(title || 'exam'), used)
      if (!explicitId && seenIds.has(examId)) {
        errors.push(`Duplicate item id '${examId}' in batch.`)
      }
      seenIds.add(examId)
      used.push(examId)

      if (!title) {
        const itemMsg = 'Exam requires title.'
        errors.push(isBatch ? `Item #${index + 1} (${examId}): ${itemMsg}` : itemMsg)
      }
      if (number(item.gradeWeight) === undefined) {
        const itemMsg = 'Exam requires Grade Weight.'
        errors.push(isBatch ? `Item #${index + 1} (${examId}): ${itemMsg}` : itemMsg)
      }

      allPayloads.push(
        ...newMaterials.payload,
        {
          id: examId,
          title,
          ...(text(item.startsAt) ? { startsAt: text(item.startsAt) } : {}),
          ...(text(item.description) ? { description: text(item.description) } : {}),
          ...(text(item.location) ? { location: text(item.location) } : {}),
          ...(number(item.gradeWeight) !== undefined ? { gradeWeight: number(item.gradeWeight) } : {}),
          materialIds,
          addedAt: timestamp,
          updatedAt: timestamp,
        },
      )
    }

    return errors.length === 0
      ? { valid: true, errors: [], warnings: [], path: draft.path, payload: allPayloads }
      : { valid: false, errors, warnings: [], path: draft.path, payload: undefined }
  }

  if (draft.type === 'add-course-session') {
    const items = Array.isArray(input.items) ? input.items : [input]
    const allPayloads: unknown[] = []
    const used = [...usedIds(targetCourse)]
    const seenIds = new Set<string>()
    const errors: string[] = []
    const isBatch = items.length > 1

    for (let index = 0; index < items.length; index += 1) {
      const item = isRecord(items[index]) ? items[index] : {}
      const title = text(item.title)
      const sessionId = uniqueId(slugify(title || 'course-session'), used)
      if (seenIds.has(sessionId)) {
        errors.push(`Duplicate item id '${sessionId}' in batch.`)
      }
      seenIds.add(sessionId)
      used.push(sessionId)

      if (!title) {
        const itemMsg = 'Title is required.'
        errors.push(isBatch ? `Item #${index + 1} (${sessionId}): ${itemMsg}` : itemMsg)
      }

      allPayloads.push({
        id: sessionId,
        title,
        startsAt: text(item.startsAt),
        endsAt: text(item.endsAt),
        ...(text(item.location) ? { location: text(item.location) } : {}),
        status: isSessionStatus(item.status) ? item.status : 'scheduled',
        addedAt: timestamp,
        updatedAt: timestamp,
      })
    }

    return errors.length === 0
      ? { valid: true, errors: [], warnings: [], path: draft.path, payload: isBatch ? allPayloads : allPayloads[0] }
      : { valid: false, errors, warnings: [], path: draft.path, payload: undefined }
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
