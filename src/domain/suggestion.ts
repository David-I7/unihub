import { prepareGeneratedContribution, type GithubTarget } from './contribution.js'
import { isRecord } from './records.js'
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

interface SuggestionIntentHandler {
  intent: SuggestionIntent
  section: SuggestionSection
  contributionType: ContributionType
  requiresNote: boolean
  showInSectionOptions: boolean
  issueTitleAction: string
  buildInput(input: Record<string, unknown>, course: LoadedCourse): Record<string, unknown>
  buildSummary(input: Record<string, unknown>, course: LoadedCourse): string
}

const suggestionHandlers: Record<SuggestionIntent, SuggestionIntentHandler> = {
  'add-material': {
    intent: 'add-material',
    section: 'materials',
    contributionType: 'add-material',
    requiresNote: false,
    showInSectionOptions: true,
    issueTitleAction: 'Add material',
    buildInput: (input) => ({
      title: text(input.title),
      type: text(input.type) || 'course',
      url: text(input.url),
    }),
    buildSummary: (input, course) => `Add material "${text(input.title) || 'the selected item'}" to ${course.title}.`,
  },
  'fix-material': {
    intent: 'fix-material',
    section: 'materials',
    contributionType: 'update-material',
    requiresNote: true,
    showInSectionOptions: true,
    issueTitleAction: 'Fix material',
    buildInput: (input, course) => {
      const existing = course.materials.find((material) => material.id === text(input.materialId))
      return {
        materialId: text(input.materialId),
        title: text(input.title) || existing?.title,
        type: text(input.type) || existing?.type || 'course',
        url: text(input.url) || existing?.url,
      }
    },
    buildSummary: (input, course) => `Fix material "${text(input.title) || text(input.itemTitle) || 'the selected item'}" in ${course.title}.`,
  },
  'broken-material-link': {
    intent: 'broken-material-link',
    section: 'materials',
    contributionType: 'update-material',
    requiresNote: true,
    showInSectionOptions: true,
    issueTitleAction: 'Report broken material link',
    buildInput: (input, course) => {
      const existing = course.materials.find((material) => material.id === text(input.materialId))
      return {
        materialId: text(input.materialId),
        title: text(input.title) || existing?.title,
        type: text(input.type) || existing?.type || 'course',
        url: text(input.url) || existing?.url,
      }
    },
    buildSummary: (input, course) => `Report a broken material link for "${text(input.title) || text(input.itemTitle) || 'the selected item'}" in ${course.title}.`,
  },
  'add-assignment': {
    intent: 'add-assignment',
    section: 'assignments',
    contributionType: 'add-assignment-deadline',
    requiresNote: false,
    showInSectionOptions: true,
    issueTitleAction: 'Add assignment',
    buildInput: (input) => ({
      title: text(input.title),
      dueAt: text(input.dueAt),
      description: text(input.description),
      gradeWeight: number(input.gradeWeight),
      materialIds: stringArray(input.materialIds),
    }),
    buildSummary: (input, course) => `Add assignment "${text(input.title) || 'the selected item'}" to ${course.title}.`,
  },
  'fix-assignment': {
    intent: 'fix-assignment',
    section: 'assignments',
    contributionType: 'add-assignment-deadline',
    requiresNote: true,
    showInSectionOptions: true,
    issueTitleAction: 'Fix assignment',
    buildInput: (input) => ({
      title: text(input.title),
      dueAt: text(input.dueAt),
      description: text(input.description),
      gradeWeight: number(input.gradeWeight),
      materialIds: stringArray(input.materialIds),
    }),
    buildSummary: (input, course) => `Fix assignment details for "${text(input.title) || text(input.itemTitle) || 'the selected item'}" in ${course.title}.`,
  },
  'changed-assignment-deadline': {
    intent: 'changed-assignment-deadline',
    section: 'assignments',
    contributionType: 'add-assignment-deadline',
    requiresNote: true,
    showInSectionOptions: true,
    issueTitleAction: 'Report changed assignment deadline',
    buildInput: (input) => ({
      title: text(input.title),
      dueAt: text(input.dueAt),
      description: text(input.description),
      gradeWeight: number(input.gradeWeight),
      materialIds: stringArray(input.materialIds),
    }),
    buildSummary: (input, course) => `Report a changed assignment deadline for "${text(input.title) || text(input.itemTitle) || 'the selected item'}" in ${course.title}.`,
  },
  'add-lecture': {
    intent: 'add-lecture',
    section: 'lectures',
    contributionType: 'add-course-session',
    requiresNote: false,
    showInSectionOptions: true,
    issueTitleAction: 'Add lecture',
    buildInput: (input) => ({
      title: text(input.title),
      startsAt: text(input.startsAt),
      endsAt: text(input.endsAt),
      location: text(input.location),
      status: text(input.status) || 'scheduled',
    }),
    buildSummary: (input, course) => `Add lecture "${text(input.title) || 'the selected item'}" to ${course.title}.`,
  },
  'fix-lecture': {
    intent: 'fix-lecture',
    section: 'lectures',
    contributionType: 'add-course-session',
    requiresNote: true,
    showInSectionOptions: true,
    issueTitleAction: 'Fix lecture',
    buildInput: (input) => ({
      title: text(input.title),
      startsAt: text(input.startsAt),
      endsAt: text(input.endsAt),
      location: text(input.location),
      status: text(input.status) || 'scheduled',
    }),
    buildSummary: (input, course) => `Fix lecture details for "${text(input.title) || text(input.itemTitle) || 'the selected item'}" in ${course.title}.`,
  },
  'cancel-lecture': {
    intent: 'cancel-lecture',
    section: 'lectures',
    contributionType: 'add-course-session',
    requiresNote: true,
    showInSectionOptions: true,
    issueTitleAction: 'Report lecture cancellation',
    buildInput: (input) => ({
      title: text(input.title),
      startsAt: text(input.startsAt),
      endsAt: text(input.endsAt),
      location: text(input.location),
      status: 'cancelled',
    }),
    buildSummary: (input, course) => `Report lecture cancellation for "${text(input.title) || text(input.itemTitle) || 'the selected item'}" in ${course.title}.`,
  },
  'changed-lecture-time-location': {
    intent: 'changed-lecture-time-location',
    section: 'lectures',
    contributionType: 'add-course-session',
    requiresNote: true,
    showInSectionOptions: true,
    issueTitleAction: 'Report changed lecture time or location',
    buildInput: (input) => ({
      title: text(input.title),
      startsAt: text(input.startsAt),
      endsAt: text(input.endsAt),
      location: text(input.location),
      status: text(input.status) || 'scheduled',
    }),
    buildSummary: (input, course) => `Report a changed lecture time or location for "${text(input.title) || text(input.itemTitle) || 'the selected item'}" in ${course.title}.`,
  },
  'add-exam': {
    intent: 'add-exam',
    section: 'exams',
    contributionType: 'add-exam',
    requiresNote: false,
    showInSectionOptions: true,
    issueTitleAction: 'Add exam',
    buildInput: (input) => ({
      title: text(input.title),
      startsAt: text(input.startsAt),
      description: text(input.description),
      location: text(input.location),
      gradeWeight: number(input.gradeWeight),
      materialIds: stringArray(input.materialIds),
    }),
    buildSummary: (input, course) => `Add exam "${text(input.title) || 'the selected item'}" to ${course.title}.`,
  },
  'fix-exam': {
    intent: 'fix-exam',
    section: 'exams',
    contributionType: 'add-exam',
    requiresNote: true,
    showInSectionOptions: true,
    issueTitleAction: 'Fix exam',
    buildInput: (input) => ({
      title: text(input.title),
      startsAt: text(input.startsAt),
      description: text(input.description),
      location: text(input.location),
      gradeWeight: number(input.gradeWeight),
      materialIds: stringArray(input.materialIds),
    }),
    buildSummary: (input, course) => `Fix exam details for "${text(input.title) || text(input.itemTitle) || 'the selected item'}" in ${course.title}.`,
  },
  'changed-exam-date-location': {
    intent: 'changed-exam-date-location',
    section: 'exams',
    contributionType: 'add-exam',
    requiresNote: true,
    showInSectionOptions: true,
    issueTitleAction: 'Report changed exam date or location',
    buildInput: (input) => ({
      title: text(input.title),
      startsAt: text(input.startsAt),
      description: text(input.description),
      location: text(input.location),
      gradeWeight: number(input.gradeWeight),
      materialIds: stringArray(input.materialIds),
    }),
    buildSummary: (input, course) => `Report a changed exam date or location for "${text(input.title) || text(input.itemTitle) || 'the selected item'}" in ${course.title}.`,
  },
  'exam-date-not-announced': {
    intent: 'exam-date-not-announced',
    section: 'exams',
    contributionType: 'add-exam',
    requiresNote: true,
    showInSectionOptions: true,
    issueTitleAction: 'Report exam date not announced',
    buildInput: (input) => ({
      title: text(input.title),
      startsAt: '',
      description: text(input.description),
      location: text(input.location),
      gradeWeight: number(input.gradeWeight),
      materialIds: stringArray(input.materialIds),
    }),
    buildSummary: (input, course) => `Report that the exam date for "${text(input.title) || text(input.itemTitle) || 'the selected item'}" is not announced in ${course.title}.`,
  },
  'fix-course-title': {
    intent: 'fix-course-title',
    section: 'course-info',
    contributionType: 'edit-course-metadata',
    requiresNote: true,
    showInSectionOptions: true,
    issueTitleAction: 'Fix Course title',
    buildInput: (input, course) => ({
      title: text(input.title),
      professors: course.professors,
      description: course.description,
    }),
    buildSummary: (_, course) => `Fix the Course title for ${course.title}.`,
  },
  'fix-course-professors': {
    intent: 'fix-course-professors',
    section: 'course-info',
    contributionType: 'edit-course-metadata',
    requiresNote: true,
    showInSectionOptions: true,
    issueTitleAction: 'Fix Course professors',
    buildInput: (input, course) => ({
      title: course.title,
      professors: splitList(text(input.professorsText)),
      description: course.description,
    }),
    buildSummary: (_, course) => `Fix the professor list for ${course.title}.`,
  },
  'fix-course-description': {
    intent: 'fix-course-description',
    section: 'course-info',
    contributionType: 'edit-course-metadata',
    requiresNote: true,
    showInSectionOptions: true,
    issueTitleAction: 'Fix Course description',
    buildInput: (input, course) => ({
      title: course.title,
      professors: course.professors,
      description: text(input.description),
    }),
    buildSummary: (_, course) => `Fix the Course description for ${course.title}.`,
  },
}

export function prepareSuggestion(options: {
  repository: RepositorySnapshot
  course: LoadedCourse
  section: SuggestionSection
  intent: SuggestionIntent
  input: Record<string, unknown>
  githubTarget?: GithubTarget
  now?: () => string
}): PreparedSuggestion {
  const { repository, course, intent, input, githubTarget = defaultGithubTarget, now } = options

  if (Array.isArray(input) || (isRecord(input) && Array.isArray((input as Record<string, unknown>).items))) {
    return {
      valid: false,
      errors: ['Student Suggestions only support single items.'],
      warnings: [],
    }
  }

  const handler = suggestionHandlers[intent]
  if (!handler) {
    return {
      valid: false,
      errors: [`Unsupported Suggestion intent: ${intent}`],
      warnings: [],
    }
  }

  if (handler.requiresNote && !text(input.note)) {
    return {
      valid: false,
      errors: ['Corrections to existing Course information require a note or source.'],
      warnings: [],
    }
  }

  const contribution = prepareGeneratedContribution({
    repository,
    githubTarget,
    now,
    draft: {
      type: handler.contributionType,
      mode: 'issue',
      path: course.path,
      input: handler.buildInput(input, course),
    },
  })
  if (!contribution.valid) return { valid: false, errors: contribution.errors, warnings: contribution.warnings }

  const summary = handler.buildSummary(input, course)
  const issueTitle = `Suggestion: ${handler.issueTitleAction} to ${course.title}`
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
  return Object.values(suggestionHandlers)
    .filter((handler) => handler.section === section && handler.showInSectionOptions)
    .map((handler) => ({
      value: handler.intent,
      label: handlerOptionLabel(handler.intent),
    }))
}

function handlerOptionLabel(intent: SuggestionIntent): string {
  const labels: Record<string, string> = {
    'add-material': 'Add new material',
    'fix-material': 'Update material',
    'broken-material-link': 'Report a broken link',
    'add-assignment': 'Add new assignment',
    'fix-assignment': 'Update assignment',
    'changed-assignment-deadline': 'Report changed deadline',
    'add-lecture': 'Add new lecture',
    'fix-lecture': 'Update lecture',
    'cancel-lecture': 'Report cancellation',
    'changed-lecture-time-location': 'Report changed time/location',
    'add-exam': 'Add new exam',
    'fix-exam': 'Update exam',
    'changed-exam-date-location': 'Report changed exam date/location',
    'exam-date-not-announced': 'Report exam date not announced',
    'fix-course-title': 'Fix Course title',
    'fix-course-professors': 'Fix Course professors',
    'fix-course-description': 'Fix Course description',
  }
  return labels[intent] || intent
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
