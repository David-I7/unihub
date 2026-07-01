import { prepareGeneratedContribution, type GithubTarget } from './contribution.js'
import type { ContributionType, LoadedCourse, RepositorySnapshot, ValidationResult } from './types.js'

export type SuggestionSection = 'course-info' | 'materials' | 'assignments' | 'lectures' | 'exams'

export type SuggestionIntent =
  | 'add-material'
  | 'fix-material'
  | 'broken-material-link'
  | 'add-assignment'
  | 'fix-assignment'
  | 'changed-assignment-deadline'
  | 'add-lecture'
  | 'fix-lecture'
  | 'cancel-lecture'
  | 'changed-lecture-time-location'
  | 'add-exam'
  | 'fix-exam'
  | 'changed-exam-date-location'
  | 'exam-date-not-announced'
  | 'fix-course-title'
  | 'fix-course-professors'
  | 'fix-course-description'

export type PreparedSuggestion = ValidationResult & {
  summary?: string
  issueTitle?: string
  issueBody?: string
  issueUrl?: string
}

export type SuggestionIntentOption = {
  value: SuggestionIntent
  label: string
}

const defaultGithubTarget: GithubTarget = {
  owner: 'David-I7',
  repo: 'unihub',
  branch: 'main',
}

const githubHandoffCopy = [
  'UniHub uses GitHub for maintainer review.',
  '',
  'We will open a prefilled issue with your suggestion. You can review it on GitHub before submitting.',
  '',
  'After submitting on GitHub, maintainers will review your suggestion there.',
].join('\n')

export function prepareSuggestion(options: {
  repository: RepositorySnapshot
  course: LoadedCourse
  section: SuggestionSection
  intent: SuggestionIntent
  input: Record<string, unknown>
  githubTarget?: GithubTarget
  now?: () => string
}): PreparedSuggestion {
  const { repository, course, section, intent, input, githubTarget = defaultGithubTarget, now } = options
  if (requiresNote(intent) && !text(input.note)) {
    return {
      valid: false,
      errors: ['Corrections to existing Course information require a note or source.'],
      warnings: [],
    }
  }

  const contributionType = contributionTypeForIntent(intent)
  const contribution = prepareGeneratedContribution({
    repository,
    githubTarget,
    now,
    draft: {
      type: contributionType,
      mode: 'issue',
      path: course.path,
      input: contributionInputForSuggestion(section, intent, input, course),
    },
  })
  if (!contribution.valid) return { valid: false, errors: contribution.errors, warnings: contribution.warnings }

  const summary = suggestionSummary(course, intent, input)
  const issueTitle = `Suggestion: ${issueTitleAction(intent)} to ${course.title}`
  const issueBody = [
    'Suggestion summary',
    '',
    summary,
    '',
    text(input.note) ? `Student note/source: ${text(input.note)}` : undefined,
    '',
    'Generated Contribution details for maintainers',
    '',
    contribution.issueBody,
  ].filter((line) => line !== undefined).join('\n')

  return {
    valid: true,
    errors: [],
    warnings: contribution.warnings,
    summary,
    issueTitle,
    issueBody,
    issueUrl: githubIssueUrl(githubTarget, issueTitle, issueBody),
  }
}

export function suggestionHandoffCopy(): string {
  return githubHandoffCopy
}

export function suggestionIntentsForSection(section: SuggestionSection): SuggestionIntentOption[] {
  if (section === 'materials') {
    return [
      { value: 'broken-material-link', label: 'Report a broken link' },
    ]
  }
  if (section === 'assignments') {
    return [
      { value: 'changed-assignment-deadline', label: 'Report changed deadline' },
    ]
  }
  if (section === 'lectures') {
    return [
      { value: 'cancel-lecture', label: 'Report cancellation' },
      { value: 'changed-lecture-time-location', label: 'Report changed time/location' },
    ]
  }
  if (section === 'exams') {
    return [
      { value: 'changed-exam-date-location', label: 'Report changed exam date/location' },
      { value: 'exam-date-not-announced', label: 'Report exam date not announced' },
    ]
  }
  return []
}

function contributionTypeForIntent(intent: SuggestionIntent): ContributionType {
  if (intent === 'add-material' || intent === 'fix-material' || intent === 'broken-material-link') return intent === 'add-material' ? 'add-material' : 'update-material'
  if (intent === 'add-assignment' || intent === 'fix-assignment' || intent === 'changed-assignment-deadline') return 'add-assignment-deadline'
  if (intent === 'add-lecture' || intent === 'fix-lecture' || intent === 'cancel-lecture' || intent === 'changed-lecture-time-location') return 'add-course-session'
  if (intent === 'add-exam' || intent === 'fix-exam' || intent === 'changed-exam-date-location' || intent === 'exam-date-not-announced') return 'add-exam'
  return 'edit-course-metadata'
}

function contributionInputForSuggestion(section: SuggestionSection, intent: SuggestionIntent, input: Record<string, unknown>, course: LoadedCourse): Record<string, unknown> {
  if (section === 'materials') {
    if (intent === 'add-material') return { title: text(input.title), type: text(input.type) || 'course', url: text(input.url) }
    const existing = course.materials.find((material) => material.id === text(input.materialId))
    return {
      materialId: text(input.materialId),
      title: text(input.title) || existing?.title,
      type: text(input.type) || existing?.type || 'course',
      url: text(input.url) || existing?.url,
    }
  }
  if (section === 'assignments') {
    return {
      title: text(input.title),
      dueAt: text(input.dueAt),
      description: text(input.description),
      submissionUrl: text(input.submissionUrl),
      gradeWeight: number(input.gradeWeight),
      materialIds: stringArray(input.materialIds),
    }
  }
  if (section === 'lectures') {
    return {
      title: text(input.title),
      startsAt: text(input.startsAt),
      endsAt: text(input.endsAt),
      location: text(input.location),
      status: intent === 'cancel-lecture' ? 'cancelled' : text(input.status) || 'scheduled',
    }
  }
  if (section === 'exams') {
    return {
      title: text(input.title),
      startsAt: intent === 'exam-date-not-announced' ? '' : text(input.startsAt),
      gradeWeight: number(input.gradeWeight),
      materialIds: stringArray(input.materialIds),
    }
  }
  return {
    title: intent === 'fix-course-title' ? text(input.title) : course.title,
    professors: intent === 'fix-course-professors' ? splitList(text(input.professorsText)) : course.professors,
    description: intent === 'fix-course-description' ? text(input.description) : course.description,
  }
}

function suggestionSummary(course: LoadedCourse, intent: SuggestionIntent, input: Record<string, unknown>): string {
  const title = text(input.title) || text(input.itemTitle) || 'the selected item'
  const note = text(input.note)
  const base = {
    'add-material': `Add material "${title}" to ${course.title}.`,
    'fix-material': `Fix material "${title}" in ${course.title}.`,
    'broken-material-link': `Report a broken material link for "${title}" in ${course.title}.`,
    'add-assignment': `Add assignment "${title}" to ${course.title}.`,
    'fix-assignment': `Fix assignment details for "${title}" in ${course.title}.`,
    'changed-assignment-deadline': `Report a changed assignment deadline for "${title}" in ${course.title}.`,
    'add-lecture': `Add lecture "${title}" to ${course.title}.`,
    'fix-lecture': `Fix lecture details for "${title}" in ${course.title}.`,
    'cancel-lecture': `Report lecture cancellation for "${title}" in ${course.title}.`,
    'changed-lecture-time-location': `Report a changed lecture time or location for "${title}" in ${course.title}.`,
    'add-exam': `Add exam "${title}" to ${course.title}.`,
    'fix-exam': `Fix exam details for "${title}" in ${course.title}.`,
    'changed-exam-date-location': `Report a changed exam date or location for "${title}" in ${course.title}.`,
    'exam-date-not-announced': `Report that the exam date for "${title}" is not announced in ${course.title}.`,
    'fix-course-title': `Fix the Course title for ${course.title}.`,
    'fix-course-professors': `Fix the professor list for ${course.title}.`,
    'fix-course-description': `Fix the Course description for ${course.title}.`,
  }[intent]
  return note ? `${base}\n\nNote/source: ${note}` : base
}

function issueTitleAction(intent: SuggestionIntent): string {
  return {
    'add-material': 'Add material',
    'fix-material': 'Fix material',
    'broken-material-link': 'Report broken material link',
    'add-assignment': 'Add assignment',
    'fix-assignment': 'Fix assignment',
    'changed-assignment-deadline': 'Report changed assignment deadline',
    'add-lecture': 'Add lecture',
    'fix-lecture': 'Fix lecture',
    'cancel-lecture': 'Report lecture cancellation',
    'changed-lecture-time-location': 'Report changed lecture time or location',
    'add-exam': 'Add exam',
    'fix-exam': 'Fix exam',
    'changed-exam-date-location': 'Report changed exam date or location',
    'exam-date-not-announced': 'Report exam date not announced',
    'fix-course-title': 'Fix Course title',
    'fix-course-professors': 'Fix Course professors',
    'fix-course-description': 'Fix Course description',
  }[intent]
}

function requiresNote(intent: SuggestionIntent): boolean {
  return !intent.startsWith('add-')
}

function githubIssueUrl(target: GithubTarget, title: string, body: string): string {
  void body
  return `https://github.com/${target.owner}/${target.repo}/issues/new?title=${encodeURIComponent(title)}`
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

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim() !== '') : []
}

function splitList(value: string): string[] {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}
