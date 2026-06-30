import { courseDataFilePath, courseRepositoryPath, findCourse } from './coursePath.js'
import { fail, hasString } from './records.js'
import { loadRepositoryData } from './repository.js'
import { validateContributionPayload } from './validation.js'
import type { AssignmentDeadline, ContributionDraft, ContributionType, Course, CourseSession, Exam, Material, RepositorySnapshot, ValidationResult } from './types.js'

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
  changedJson?: string
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

  const changedJson = JSON.stringify(applied.updatedCourse ?? parsed, null, 2)
  const pathText = courseRepositoryPath(draft.path)
  const warningText = applied.warnings.length ? applied.warnings.map((warning) => `- ${warning}`).join('\n') : 'None'
  const body = [
    `Contribution type: ${draft.type}`,
    `Target Course Path: ${pathText}`,
    '',
    'JSON:',
    '```json',
    changedJson,
    '```',
    '',
    'Validation warnings:',
    warningText,
  ].join('\n')

  if (draft.mode === 'issue') {
    return {
      ...applied,
      parsed,
      changedJson,
      issueBody: body,
      issueUrl: githubIssueUrl(githubTarget, `Contribution: ${draft.type}`, body),
    }
  }

  const prTitle = `Contribution: ${draft.type} for ${draft.path.courseId}`
  return {
    ...applied,
    parsed,
    changedJson,
    prTitle,
    prBody: body,
    githubLink: githubEditUrl(githubTarget, courseDataFilePath(draft.path)),
  }
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

function githubIssueUrl(target: GithubTarget, title: string, body: string): string {
  return `https://github.com/${target.owner}/${target.repo}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`
}

function githubEditUrl(target: GithubTarget, filePath: string): string {
  return `https://github.com/${target.owner}/${target.repo}/edit/${target.branch}/${filePath}`
}
