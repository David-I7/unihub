import { Award, BookOpen, CalendarClock, Clipboard, ClipboardCheck, ExternalLink, FileText, FlaskConical, GraduationCap, LinkIcon, MapPin, PlayCircle, Send, Users, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { headingClass, mutedTextClass, pageClass, panelClass } from '@/components/styles'
import { statusChipClass } from '@/components/statusStyles'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  coursePathFromRouteParams,
  deriveCourseDetailView,
  findCourse,
  prepareSuggestion,
  suggestionHandoffCopy,
  suggestionIntentsForSection,
  type Catalog,
  type CourseDetailView,
  type LoadedCourse,
  type Material,
} from '@/domain'
import { formatDate, formatTime } from '@/lib/format'
import type { MaterialType, RepositorySnapshot, SuggestionIntent, SuggestionSection } from '@/domain'

type CourseDetailTab = 'materials' | 'assignments' | 'lectures' | 'exams'
type SuggestionTarget = SuggestionSection | null
type SuggestionForm = Record<string, string | string[]>

export function CourseDetailPage({ loadedCourses, catalog }: { loadedCourses: LoadedCourse[]; catalog: Catalog }) {
  const params = useParams()
  const path = coursePathFromRouteParams(params)
  const course = path ? findCourse(loadedCourses, path) : undefined
  const [tab, setTab] = useState<CourseDetailTab>('materials')
  const [nowTime] = useState(() => Date.now())
  const [suggestionTarget, setSuggestionTarget] = useState<SuggestionTarget>(null)

  if (!course) {
    return (
      <div className={pageClass}>
        <PageHeader title="Course not found" subtitle="The requested Course Path is not available." />
      </div>
    )
  }

  const view = deriveCourseDetailView(course, nowTime)
  const repository = { catalog, courses: loadedCourses }

  return (
    <div className={pageClass}>
      <PageHeader title={course.title} subtitle={course.professors.join(', ')} />
      {suggestionTarget && (
        <SuggestionPanel
          section={suggestionTarget}
          course={course}
          repository={repository}
          onClose={() => setSuggestionTarget(null)}
        />
      )}
      <div className="mb-4 flex gap-1.5 border-b border-[var(--border-color)]" role="tablist">
        {(['materials', 'assignments', 'lectures', 'exams'] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={cn(
              'cursor-pointer border-0 border-b-[3px] border-transparent bg-transparent px-3 py-2.5 font-[inherit] text-[var(--text-tab-inactive)] transition-colors hover:text-[var(--text-main)]',
              tab === item && 'border-[var(--primary)] font-bold text-[var(--text-main)]',
            )}
            onClick={() => setTab(item)}
          >
            {item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>
      {tab === 'materials' && <MaterialsTab view={view} onSuggest={() => setSuggestionTarget('materials')} />}
      {tab === 'assignments' && <AssignmentsTab view={view} onSuggest={() => setSuggestionTarget('assignments')} />}
      {tab === 'lectures' && <LecturesTab view={view} onSuggest={() => setSuggestionTarget('lectures')} />}
      {tab === 'exams' && <ExamsTab view={view} onSuggest={() => setSuggestionTarget('exams')} />}
      <GradeBreakdown view={view} />
    </div>
  )
}

function MaterialsTab({ view, onSuggest }: { view: CourseDetailView; onSuggest: () => void }) {
  if (view.materialGroups.length === 0) {
    return (
      <div className="grid gap-3">
        <SectionHeading title="Materials" onSuggest={onSuggest} />
        <EmptyState>No materials in this course yet.</EmptyState>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <SectionHeading title="Materials" onSuggest={onSuggest} />
      {view.materialGroups.map((group) => (
        <section key={group.type} className="grid gap-2">
          <h2 className={`${headingClass} flex items-center gap-2`}>
            <MaterialTypeIcon type={group.type} />
            {group.label}
          </h2>
          {group.materials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </section>
      ))}
    </div>
  )
}

function AssignmentsTab({ view, onSuggest }: { view: CourseDetailView; onSuggest: () => void }) {
  if (view.assignments.length === 0) {
    return (
      <div className="grid gap-3">
        <SectionHeading title="Assignments" onSuggest={onSuggest} />
        <EmptyState>No assignments in this course yet.</EmptyState>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <SectionHeading title="Assignments" onSuggest={onSuggest} />
      {view.assignments.map((assignment) => (
        <article key={assignment.id} className={`${panelClass} grid gap-3 px-4 py-3.5`}>
          <div className="flex items-start gap-3">
            <IconBadge tone="assignment"><ClipboardCheck aria-hidden="true" size={20} /></IconBadge>
            <div className="min-w-0">
              <h2 className={headingClass}>{assignment.title}</h2>
              <div className="flex flex-wrap gap-2">
                <span className={statusChipClass(assignment.status === 'completed' ? 'completed' : 'upcoming')}>{assignment.status}</span>
                <span className={statusChipClass('assignment')}>Due {formatDate(assignment.dueAt)}</span>
                {assignment.gradeWeight !== undefined && <span className={statusChipClass('scheduled')}>{assignment.gradeWeight}% Grade Weight</span>}
              </div>
            </div>
          </div>
          <p className={`m-0 ${mutedTextClass}`}>{assignment.description}</p>
          {assignment.submissionUrl && (
            <a href={assignment.submissionUrl} target="_blank" className="inline-flex w-fit items-center gap-2 rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-semibold !text-white no-underline transition-colors hover:bg-[var(--primary-hover)]">
              <ExternalLink aria-hidden="true" size={16} />
              Open submission
            </a>
          )}
          <LinkedMaterials materials={assignment.materials} />
        </article>
      ))}
    </div>
  )
}

function LecturesTab({ view, onSuggest }: { view: CourseDetailView; onSuggest: () => void }) {
  if (view.courseSessions.length === 0) {
    return (
      <div className="grid gap-3">
        <SectionHeading title="Lectures" onSuggest={onSuggest} />
        <EmptyState>No lectures in this course yet.</EmptyState>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <SectionHeading title="Lectures" onSuggest={onSuggest} />
      {view.courseSessions.map((session) => (
        <article key={session.id} className={`${panelClass} grid gap-3 px-4 py-3.5`}>
          <div className="flex items-start gap-3">
            <IconBadge tone={session.status === 'cancelled' ? 'cancelled' : 'lecture'}><GraduationCap aria-hidden="true" size={20} /></IconBadge>
            <div className="min-w-0">
              <h2 className={headingClass}>{session.title}</h2>
              <div className="flex flex-wrap gap-2">
                <span className={statusChipClass(session.status)}>{session.status}</span>
                <span className={statusChipClass('scheduled')}>
                  <CalendarClock aria-hidden="true" size={13} />
                  {formatDate(session.startsAt)} to {formatTime(session.endsAt)}
                </span>
                <span className={statusChipClass('scheduled')}>
                  <MapPin aria-hidden="true" size={13} />
                  {session.location}
                </span>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function ExamsTab({ view, onSuggest }: { view: CourseDetailView; onSuggest: () => void }) {
  if (view.exams.length === 0) {
    return (
      <div className="grid gap-3">
        <SectionHeading title="Exams" onSuggest={onSuggest} />
        <EmptyState>No exams in this course yet.</EmptyState>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <SectionHeading title="Exams" onSuggest={onSuggest} />
      {view.exams.map((exam) => (
        <article key={exam.id} className={`${panelClass} grid gap-3 px-4 py-3.5`}>
          <div className="flex items-start gap-3">
            <IconBadge tone="exam"><Award aria-hidden="true" size={20} /></IconBadge>
            <div className="min-w-0">
              <h2 className={headingClass}>{exam.title}</h2>
              <div className="flex flex-wrap gap-2">
                <span className={statusChipClass('exam')}>{exam.startsAt ? formatDate(exam.startsAt) : 'Date to be announced'}</span>
                {exam.gradeWeight !== undefined && <span className={statusChipClass('scheduled')}>{exam.gradeWeight}% Grade Weight</span>}
              </div>
            </div>
          </div>
          <LinkedMaterials materials={exam.materials} />
        </article>
      ))}
    </div>
  )
}

function SectionHeading({ title, onSuggest }: { title: string; onSuggest: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className={`${headingClass} m-0`}>{title}</h2>
      <Button type="button" variant="outline" size="sm" onClick={onSuggest}>
        <Send aria-hidden="true" size={14} />
        Suggest update
      </Button>
    </div>
  )
}

function SuggestionPanel({
  section,
  course,
  repository,
  onClose,
}: {
  section: SuggestionSection
  course: LoadedCourse
  repository: RepositorySnapshot
  onClose: () => void
}) {
  const intents = suggestionIntentsForSection(section)
  const [intent, setIntent] = useState<SuggestionIntent>(intents[0].value)
  const [form, setForm] = useState<SuggestionForm>(() => initialSuggestionForm(section, intents[0].value, course))
  const [clipboardStatus, setClipboardStatus] = useState('')
  const result = prepareSuggestion({ repository, course, section, intent, input: suggestionInput(section, intent, form, course) })

  function changeIntent(nextIntent: string) {
    const typedIntent = nextIntent as SuggestionIntent
    setIntent(typedIntent)
    setForm(initialSuggestionForm(section, typedIntent, course))
    setClipboardStatus('')
  }

  function updateField(name: string, value: string | string[]) {
    setForm((current) => ({ ...current, [name]: value }))
    setClipboardStatus('')
  }

  async function copyIssueContent() {
    if (!result.valid) return
    const content = [result.issueTitle, '', result.issueBody].join('\n')
    try {
      await navigator.clipboard.writeText(content)
      setClipboardStatus('Issue content copied.')
    } catch {
      setClipboardStatus('Clipboard unavailable. Select the generated issue text in the review panel and copy it manually.')
    }
  }

  return (
    <div className="fixed inset-0 z-[220] grid place-items-center bg-black/45 p-4 max-[640px]:items-end max-[640px]:p-0">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="suggestion-dialog-title"
        className={`${panelClass} grid max-h-[calc(100vh-48px)] w-full max-w-5xl gap-4 overflow-auto p-4 shadow-2xl max-[640px]:max-h-[92vh] max-[640px]:rounded-b-none max-[640px]:border-x-0 max-[640px]:border-b-0`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="suggestion-dialog-title" className={headingClass}>Suggest update</h2>
            <p className={`m-0 ${mutedTextClass}`}>{sectionIntro(section)}</p>
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label="Close suggestion flow" onClick={onClose}>
            <X aria-hidden="true" size={18} />
          </Button>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_minmax(280px,420px)] gap-5 max-[820px]:grid-cols-1">
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm font-semibold text-[var(--text-main)]">
              What do you want to suggest?
              <Select value={intent} options={intents} onValueChange={changeIntent} />
            </label>
            <SuggestionFields section={section} intent={intent} form={form} course={course} updateField={updateField} />
          </div>

          <div className="grid content-start gap-3">
            <section className="rounded-md border border-[var(--border-color)] bg-[var(--bg-app)] p-3">
              <h3 className="m-0 mb-2 text-sm font-semibold text-[var(--text-main)]">Review</h3>
              {result.valid ? (
                <p className={`m-0 whitespace-pre-wrap ${mutedTextClass}`}>{clipboardStatus.includes('Clipboard unavailable') ? result.issueBody : result.summary}</p>
              ) : (
                <ul className="m-0 grid gap-1 pl-4 text-sm text-[var(--validation-err-border)]">
                  {result.errors.map((error) => <li key={error}>{error}</li>)}
                </ul>
              )}
            </section>
            <section className="rounded-md border border-[var(--border-color)] bg-[var(--bg-app)] p-3">
              <h3 className="m-0 mb-2 text-sm font-semibold text-[var(--text-main)]">GitHub handoff</h3>
              <p className={`m-0 whitespace-pre-wrap text-sm ${mutedTextClass}`}>{suggestionHandoffCopy()}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" disabled={!result.valid} onClick={copyIssueContent}>
                  <Clipboard aria-hidden="true" size={16} />
                  Copy issue content
                </Button>
                <a
                  href={result.valid ? result.issueUrl : undefined}
                  target="_blank"
                  aria-disabled={!result.valid}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-semibold !text-white no-underline transition-colors hover:bg-[var(--primary-hover)]',
                    !result.valid && 'pointer-events-none opacity-50',
                  )}
                >
                  <ExternalLink aria-hidden="true" size={16} />
                  Continue to GitHub
                </a>
              </div>
              {clipboardStatus && <p className="mt-3 mb-0 text-sm text-[var(--text-muted)]">{clipboardStatus}</p>}
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}

function SuggestionFields({
  section,
  intent,
  form,
  course,
  updateField,
}: {
  section: SuggestionSection
  intent: SuggestionIntent
  form: SuggestionForm
  course: LoadedCourse
  updateField: (name: string, value: string | string[]) => void
}) {
  if (section === 'course-info') {
    return (
      <div className="grid gap-3">
        {intent === 'fix-course-title' && <TextField label="Correct Course title" value={textValue(form.title)} onChange={(value) => updateField('title', value)} />}
        {intent === 'fix-course-professors' && <TextField label="Correct professors" value={textValue(form.professorsText)} onChange={(value) => updateField('professorsText', value)} />}
        {intent === 'fix-course-description' && <TextArea label="Correct description" value={textValue(form.description)} onChange={(value) => updateField('description', value)} />}
        <TextArea label="Note or source" value={textValue(form.note)} onChange={(value) => updateField('note', value)} />
      </div>
    )
  }

  if (section === 'materials') {
    const materialOptions = course.materials.map((item) => [item.id, item.title])
    return (
      <div className="grid gap-3">
        {intent === 'add-material' ? (
          <>
            <TextField label="Material title" value={textValue(form.title)} onChange={(value) => updateField('title', value)} />
            <SelectField label="Material type" value={textValue(form.type)} options={materialTypeOptions()} onChange={(value) => updateField('type', value)} />
            <TextField label="External URL" value={textValue(form.url)} onChange={(value) => updateField('url', value)} />
          </>
        ) : (
          <>
            <SelectField label="Material" value={textValue(form.materialId)} options={materialOptions} onChange={(value) => applySelectedMaterial(value, course.materials, updateField)} />
            <TextField label="Correct title" value={textValue(form.title)} onChange={(value) => updateField('title', value)} />
            <SelectField label="Correct Material type" value={textValue(form.type)} options={materialTypeOptions()} onChange={(value) => updateField('type', value)} />
            <TextField label={intent === 'broken-material-link' ? 'Working external URL' : 'Correct external URL'} value={textValue(form.url)} onChange={(value) => updateField('url', value)} />
            <TextArea label="Note or source" value={textValue(form.note)} onChange={(value) => updateField('note', value)} />
          </>
        )}
      </div>
    )
  }

  if (section === 'assignments') {
    const assignmentOptions = course.assignmentDeadlines.map((item) => [item.id, item.title])
    return (
      <div className="grid gap-3">
        {intent === 'add-assignment' ? (
          <>
            <TextField label="Assignment title" value={textValue(form.title)} onChange={(value) => updateField('title', value)} />
            <DateTimeField label="Due date and time" value={textValue(form.dueAt)} onChange={(value) => updateField('dueAt', value)} />
            <TextArea label="Description (optional)" value={textValue(form.description)} onChange={(value) => updateField('description', value)} />
            <TextField label="Submission URL (optional)" value={textValue(form.submissionUrl)} onChange={(value) => updateField('submissionUrl', value)} />
            <TextField label="Grade Weight (optional)" value={textValue(form.gradeWeight)} onChange={(value) => updateField('gradeWeight', value)} />
          </>
        ) : (
          <>
            <SelectField label="Assignment" value={textValue(form.assignmentId)} options={assignmentOptions} onChange={(value) => applySelectedAssignment(value, course.assignmentDeadlines, updateField)} />
            <TextField label="Correct title" value={textValue(form.title)} onChange={(value) => updateField('title', value)} />
            <DateTimeField label={intent === 'changed-assignment-deadline' ? 'Correct/changed due date and time' : 'Correct due date and time'} value={textValue(form.dueAt)} onChange={(value) => updateField('dueAt', value)} />
            {intent !== 'changed-assignment-deadline' && <TextArea label="Correct description (optional)" value={textValue(form.description)} onChange={(value) => updateField('description', value)} />}
            <TextField label="Correct submission URL (optional)" value={textValue(form.submissionUrl)} onChange={(value) => updateField('submissionUrl', value)} />
            <TextField label="Correct grade weight (optional)" value={textValue(form.gradeWeight)} onChange={(value) => updateField('gradeWeight', value)} />
            <TextArea label="Note or source" value={textValue(form.note)} onChange={(value) => updateField('note', value)} />
          </>
        )}
      </div>
    )
  }

  if (section === 'lectures') {
    const lectureOptions = course.courseSessions.map((item) => [item.id, item.title])
    return (
      <div className="grid gap-3">
        {intent === 'add-lecture' ? (
          <>
            <TextField label="Lecture title" value={textValue(form.title)} onChange={(value) => updateField('title', value)} />
            <DateTimeField label="Starts at" value={textValue(form.startsAt)} onChange={(value) => updateField('startsAt', value)} />
            <DateTimeField label="Ends at" value={textValue(form.endsAt)} onChange={(value) => updateField('endsAt', value)} />
            <TextField label="Location (optional)" value={textValue(form.location)} onChange={(value) => updateField('location', value)} />
          </>
        ) : (
          <>
            <SelectField label="Lecture" value={textValue(form.lectureId)} options={lectureOptions} onChange={(value) => applySelectedLecture(value, course.courseSessions, updateField)} />
            <TextField label="Correct title" value={textValue(form.title)} onChange={(value) => updateField('title', value)} />
            <DateTimeField label="Correct starts at" value={textValue(form.startsAt)} onChange={(value) => updateField('startsAt', value)} />
            <DateTimeField label="Correct ends at" value={textValue(form.endsAt)} onChange={(value) => updateField('endsAt', value)} />
            {intent !== 'cancel-lecture' && <TextField label="Correct location (optional)" value={textValue(form.location)} onChange={(value) => updateField('location', value)} />}
            <TextArea label="Note or source" value={textValue(form.note)} onChange={(value) => updateField('note', value)} />
          </>
        )}
      </div>
    )
  }

  const examOptions = course.exams.map((item) => [item.id, item.title])
  return (
    <div className="grid gap-3">
      {intent === 'add-exam' ? (
        <>
          <TextField label="Exam title" value={textValue(form.title)} onChange={(value) => updateField('title', value)} />
          <DateTimeField label="Exam date and time (optional)" value={textValue(form.startsAt)} onChange={(value) => updateField('startsAt', value)} />
          <TextField label="Grade Weight (optional)" value={textValue(form.gradeWeight)} onChange={(value) => updateField('gradeWeight', value)} />
        </>
      ) : (
        <>
          <SelectField label="Exam" value={textValue(form.examId)} options={examOptions} onChange={(value) => applySelectedExam(value, course.exams, updateField)} />
          <TextField label="Correct title" value={textValue(form.title)} onChange={(value) => updateField('title', value)} />
          {intent !== 'exam-date-not-announced' && <DateTimeField label="Correct exam date and time (optional)" value={textValue(form.startsAt)} onChange={(value) => updateField('startsAt', value)} />}
          <TextField label="Correct grade weight (optional)" value={textValue(form.gradeWeight)} onChange={(value) => updateField('gradeWeight', value)} />
          <TextArea label="Note or source" value={textValue(form.note)} onChange={(value) => updateField('note', value)} />
        </>
      )}
    </div>
  )
}

function GradeBreakdown({ view }: { view: CourseDetailView }) {
  return (
    <section className={`${panelClass} mt-4 min-w-0 overflow-hidden p-4`}>
      <h2 className={headingClass}>Grade Breakdown</h2>
      {view.gradeBreakdown.items.map((item) => (
        <p key={item.title} className="m-0">
          {item.title}: {item.weight}%
        </p>
      ))}
      <strong>
        {view.gradeBreakdown.total}% known{view.gradeBreakdown.incomplete ? ' / incomplete' : ''}
      </strong>
    </section>
  )
}

function LinkedMaterials({ materials }: { materials: CourseDetailView['assignments'][number]['materials'] }) {
  if (materials.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`inline-flex items-center gap-1 text-sm font-semibold ${mutedTextClass}`}>
        <LinkIcon aria-hidden="true" size={14} />
        Linked materials
      </span>
      {materials.map((material) => (
        <a key={material.id} href={material.url} target="_blank" className="inline-flex items-center gap-1 rounded-full border border-[var(--border-color)] px-2 py-1 text-xs font-semibold text-[var(--primary)] no-underline hover:border-[var(--primary)]">
          {material.title}
        </a>
      ))}
    </div>
  )
}

function MaterialCard({ material }: { material: CourseDetailView['materialGroups'][number]['materials'][number] }) {
  return (
    <article className={`${panelClass} flex items-center justify-between gap-3 px-4 py-3.5 max-[640px]:items-start`}>
      <div className="flex min-w-0 items-start gap-3">
        <IconBadge tone="material"><MaterialTypeIcon type={material.type} /></IconBadge>
        <div className="min-w-0">
          <h3 className="m-0 text-base leading-tight font-semibold text-[var(--text-main)]">{material.title}</h3>
          <p className={`m-0 mt-1 text-sm ${mutedTextClass}`}>{labelMaterialType(material.type)}</p>
        </div>
      </div>
      <a href={material.url} target="_blank" className="inline-flex shrink-0 items-center gap-2 rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-semibold !text-white no-underline transition-colors hover:bg-[var(--primary-hover)]">
        <ExternalLink aria-hidden="true" size={16} />
        Open material
      </a>
    </article>
  )
}

function MaterialTypeIcon({ type }: { type: MaterialType }) {
  const icons = {
    course: BookOpen,
    seminar: Users,
    lab: FlaskConical,
    video: PlayCircle,
    other: FileText,
    assignment: ClipboardCheck,
    exam: Award,
  }
  const Icon = icons[type]
  return <Icon aria-hidden="true" size={18} />
}

function IconBadge({ tone, children }: { tone: 'material' | 'assignment' | 'lecture' | 'exam' | 'cancelled'; children: ReactNode }) {
  const tones = {
    material: 'bg-[var(--status-upcoming-bg)] text-[var(--status-upcoming-text)]',
    assignment: 'bg-[var(--status-assignment-bg)] text-[var(--status-assignment-text)]',
    lecture: 'bg-[var(--status-scheduled-bg)] text-[var(--status-scheduled-text)]',
    exam: 'bg-[var(--status-exam-bg)] text-[var(--status-exam-text)]',
    cancelled: 'bg-[var(--status-cancelled-bg)] text-[var(--status-cancelled-text)]',
  }
  return <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-lg', tones[tone])}>{children}</span>
}

function EmptyState({ children }: { children: ReactNode }) {
  return <p className={`${panelClass} m-0 border-dashed px-4 py-6 text-center ${mutedTextClass}`}>{children}</p>
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-[var(--text-main)]">
      {label}
      <input className={fieldClass} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function DateTimeField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-[var(--text-main)]">
      {label}
      <input type="datetime-local" className={fieldClass} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-[var(--text-main)]">
      {label}
      <textarea className={`${fieldClass} min-h-20 resize-y`} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[][]; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-[var(--text-main)]">
      {label}
      <Select value={value} options={options.map(([optionValue, optionLabel]) => ({ value: optionValue, label: optionLabel }))} onValueChange={onChange} />
    </label>
  )
}

const fieldClass = 'w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-main)] shadow-sm outline-none transition-colors hover:border-[var(--primary)] focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring-color)]'

function sectionIntro(section: SuggestionSection): string {
  return {
    'course-info': 'Suggest a correction to Course-level information for maintainer review.',
    materials: 'Suggest missing or corrected Materials from this Course page.',
    assignments: 'Suggest missing or corrected Assignment information from this Course page.',
    lectures: 'Suggest missing, changed, or cancelled Lecture information from this Course page.',
    exams: 'Suggest missing or corrected Exam information from this Course page.',
  }[section]
}

function initialSuggestionForm(section: SuggestionSection, intent: SuggestionIntent, course: LoadedCourse): SuggestionForm {
  if (section === 'course-info') {
    return {
      title: course.title,
      professorsText: course.professors.join(', '),
      description: course.description ?? '',
      note: '',
    }
  }
  if (section === 'materials') {
    const material = course.materials[0]
    if (intent === 'add-material') return { title: '', type: 'course', url: '' }
    return {
      materialId: material?.id ?? '',
      itemTitle: material?.title ?? '',
      title: material?.title ?? '',
      type: material?.type ?? 'course',
      url: material?.url ?? '',
      note: '',
    }
  }
  if (section === 'assignments') {
    const assignment = course.assignmentDeadlines[0]
    if (intent === 'add-assignment') return { title: '', dueAt: '', description: '', submissionUrl: '', gradeWeight: '' }
    return {
      assignmentId: assignment?.id ?? '',
      itemTitle: assignment?.title ?? '',
      title: assignment?.title ?? '',
      dueAt: localDateTimeValue(assignment?.dueAt),
      description: assignment?.description ?? '',
      submissionUrl: assignment?.submissionUrl ?? '',
      gradeWeight: assignment?.gradeWeight?.toString() ?? '',
      note: '',
    }
  }
  if (section === 'lectures') {
    const lecture = course.courseSessions[0]
    if (intent === 'add-lecture') return { title: '', startsAt: '', endsAt: '', location: '' }
    return {
      lectureId: lecture?.id ?? '',
      itemTitle: lecture?.title ?? '',
      title: lecture?.title ?? '',
      startsAt: localDateTimeValue(lecture?.startsAt),
      endsAt: localDateTimeValue(lecture?.endsAt),
      location: lecture?.location ?? '',
      note: '',
    }
  }
  const exam = course.exams[0]
  if (intent === 'add-exam') return { title: '', startsAt: '', gradeWeight: '' }
  return {
    examId: exam?.id ?? '',
    itemTitle: exam?.title ?? '',
    title: exam?.title ?? '',
    startsAt: localDateTimeValue(exam?.startsAt),
    gradeWeight: exam?.gradeWeight?.toString() ?? '',
    note: '',
  }
}

function suggestionInput(section: SuggestionSection, intent: SuggestionIntent, form: SuggestionForm, course: LoadedCourse): Record<string, unknown> {
  const input: Record<string, unknown> = { ...form }
  if (section === 'materials' && intent !== 'add-material' && !textValue(form.itemTitle)) {
    input.itemTitle = course.materials.find((material) => material.id === textValue(form.materialId))?.title ?? ''
  }
  if (section === 'assignments' && intent !== 'add-assignment' && !textValue(form.itemTitle)) {
    input.itemTitle = course.assignmentDeadlines.find((item) => item.id === textValue(form.assignmentId))?.title ?? ''
  }
  if (section === 'lectures' && intent !== 'add-lecture' && !textValue(form.itemTitle)) {
    input.itemTitle = course.courseSessions.find((item) => item.id === textValue(form.lectureId))?.title ?? ''
  }
  if (section === 'exams' && intent !== 'add-exam' && !textValue(form.itemTitle)) {
    input.itemTitle = course.exams.find((item) => item.id === textValue(form.examId))?.title ?? ''
  }
  return input
}

function materialTypeOptions(): string[][] {
  return (['course', 'seminar', 'lab', 'assignment', 'exam', 'video', 'other'] as MaterialType[]).map((item) => [item, label(item)])
}

function applySelectedMaterial(materialId: string, materials: Material[], updateField: (name: string, value: string | string[]) => void) {
  const material = materials.find((item) => item.id === materialId)
  updateField('materialId', materialId)
  updateField('itemTitle', material?.title ?? '')
  updateField('title', material?.title ?? '')
  updateField('type', material?.type ?? 'course')
  updateField('url', material?.url ?? '')
}

function applySelectedAssignment(assignmentId: string, assignments: LoadedCourse['assignmentDeadlines'], updateField: (name: string, value: string | string[]) => void) {
  const assignment = assignments.find((item) => item.id === assignmentId)
  updateField('assignmentId', assignmentId)
  updateField('itemTitle', assignment?.title ?? '')
  updateField('title', assignment?.title ?? '')
  updateField('dueAt', localDateTimeValue(assignment?.dueAt))
  updateField('description', assignment?.description ?? '')
  updateField('submissionUrl', assignment?.submissionUrl ?? '')
  updateField('gradeWeight', assignment?.gradeWeight?.toString() ?? '')
}

function applySelectedLecture(lectureId: string, lectures: LoadedCourse['courseSessions'], updateField: (name: string, value: string | string[]) => void) {
  const lecture = lectures.find((item) => item.id === lectureId)
  updateField('lectureId', lectureId)
  updateField('itemTitle', lecture?.title ?? '')
  updateField('title', lecture?.title ?? '')
  updateField('startsAt', localDateTimeValue(lecture?.startsAt))
  updateField('endsAt', localDateTimeValue(lecture?.endsAt))
  updateField('location', lecture?.location ?? '')
}

function applySelectedExam(examId: string, exams: LoadedCourse['exams'], updateField: (name: string, value: string | string[]) => void) {
  const exam = exams.find((item) => item.id === examId)
  updateField('examId', examId)
  updateField('itemTitle', exam?.title ?? '')
  updateField('title', exam?.title ?? '')
  updateField('startsAt', localDateTimeValue(exam?.startsAt))
  updateField('gradeWeight', exam?.gradeWeight?.toString() ?? '')
}

function localDateTimeValue(value: string | undefined): string {
  return value ? value.slice(0, 16) : ''
}

function textValue(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value : ''
}

function labelMaterialType(value: string): string {
  return `${value[0].toUpperCase()}${value.slice(1)} Material`
}

function label(value: string): string {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}
