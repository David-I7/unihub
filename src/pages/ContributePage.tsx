import { Clipboard, ExternalLink, Plus } from 'lucide-react'
import { useState } from 'react'
import { AcademicContextPicker } from '@/components/AcademicContextPicker'
import { PageHeader } from '@/components/PageHeader'
import { Select } from '@/components/ui/select'
import { compactFilterLabelClass, headingClass, mutedTextClass, pageClass, panelClass } from '@/components/styles'
import { ValidationPanel } from '@/components/ValidationPanel'
import type { ContextSelection } from '@/app/academicContext'
import { prepareGeneratedContribution, selectedContextCourses, type Catalog, type ContributionType, type Hierarchy, type LoadedCourse, type MaterialType } from '@/domain'

type FormState = Record<string, string | string[]>

const materialTypes: MaterialType[] = ['course', 'seminar', 'lab', 'assignment', 'exam', 'video', 'other']
const difficultyOptions = ['unknown', 'easy', 'medium', 'hard'].map((item) => [item, label(item)])

export function ContributePage({
  context,
  onContextChange,
  loadedCourses,
  catalog,
  hierarchy,
}: {
  context: ContextSelection
  onContextChange: (context: ContextSelection) => void
  loadedCourses: LoadedCourse[]
  catalog: Catalog
  hierarchy: Hierarchy
}) {
  const selectedCourses = selectedContextCourses(loadedCourses, context)
  const [mode, setMode] = useState<'issue' | 'pull-request'>('issue')
  const [type, setType] = useState<ContributionType>('add-new-course')
  const [courseId, setCourseId] = useState(selectedCourses[0]?.id ?? '')
  const [form, setForm] = useState<FormState>(initialForm('add-new-course'))
  const [clipboardStatus, setClipboardStatus] = useState('')
  const [viewMode, setViewMode] = useState<'diff' | 'full' | 'issue'>('diff')
  const targetsCatalog = isCatalogContributionType(type)
  const selectedCourseId = selectedCourses.some((course) => course.id === courseId) ? courseId : selectedCourses[0]?.id ?? ''
  const selectedCourse = selectedCourses.find((course) => course.id === selectedCourseId)
  const result = prepareGeneratedContribution({
    draft: {
      type,
      mode,
      context,
      path: type === 'add-new-course' || targetsCatalog ? undefined : { ...context, courseId: selectedCourseId },
      input: formToInput(type, form),
    },
    repository: { catalog, courses: loadedCourses },
  })
  const fallbackPath = { ...context, courseId: type === 'add-new-course' ? 'generated-course-id' : selectedCourseId }
  const targetPath = result.path?.academicYearId ? result.path : fallbackPath
  const targetText = targetsCatalog ? 'public/data/catalog.json' : `${targetPath.academicYearId}/${targetPath.studyYearId}/${targetPath.semesterId}/${targetPath.courseId}`

  function changeType(nextType: ContributionType) {
    setType(nextType)
    setForm(initialForm(nextType, selectedCourse))
    setClipboardStatus('')
    setViewMode('diff')
  }

  function updateField(name: string, value: string | string[]) {
    setForm((current) => ({ ...current, [name]: value }))
    setClipboardStatus('')
  }

  async function copyPullRequestContent() {
    if (!result.valid) return
    const content = [`Target path: ${targetText}`, '', result.prTitle, '', result.prBody].join('\n')
    try {
      await navigator.clipboard.writeText(content)
      setClipboardStatus('Pull request content copied.')
    } catch {
      setClipboardStatus('Clipboard unavailable. Select the generated pull request text below and copy it manually.')
    }
  }

  async function copyIssueContent() {
    if (!result.valid) return
    const content = [`Contribution: ${type}`, '', result.issueBody].join('\n')
    try {
      await navigator.clipboard.writeText(content)
      setClipboardStatus('Issue content copied.')
    } catch {
      setClipboardStatus('Clipboard unavailable. Select the generated issue body below and copy it manually.')
      setViewMode('issue')
    }
  }

  return (
    <div className={pageClass}>
      <PageHeader title="Maintainer contributions" subtitle="Repository-level course data changes, advanced corrections, and GitHub issue or pull request preparation for maintainer review." />
      <section className={`${panelClass} mb-4 p-4`}>
        <p className={`m-0 ${mutedTextClass}`}>
          Use this page for repository-level course data changes, advanced corrections, and preparing GitHub issues or pull requests for maintainer review. If you are a student fixing a specific course item, start from that Course page and use Suggest update.
        </p>
      </section>
      <AcademicContextPicker context={context} onContextChange={onContextChange} hierarchy={hierarchy} />

      <div className="mb-4.5 flex flex-wrap items-center gap-4 max-[820px]:grid max-[820px]:max-w-[calc(100vw-40px)] max-[820px]:grid-cols-1 max-[820px]:gap-2">
        <label className={compactFilterLabelClass}>
          Mode
          <Select
            selectSize="compact"
            className="min-w-48"
            value={mode}
            options={[
              { value: 'issue', label: 'GitHub issue' },
              { value: 'pull-request', label: 'Pull request assist' },
            ]}
            onValueChange={(value) => setMode(value as typeof mode)}
          />
        </label>
        <label className={compactFilterLabelClass}>
          Contribution task
          <Select
            selectSize="compact"
            className="min-w-64"
            value={type}
            options={[
              { value: 'add-new-course', label: 'Add new Course' },
              { value: 'add-academic-year', label: 'Add Academic Year' },
              { value: 'add-study-year', label: 'Add Study Year' },
              { value: 'add-semester', label: 'Add Semester' },
              { value: 'add-material', label: 'Add Material' },
              { value: 'update-material', label: 'Update Material' },
              { value: 'add-assignment-deadline', label: 'Add Assignment Deadline' },
              { value: 'add-exam', label: 'Add Exam' },
              { value: 'add-course-session', label: 'Add Course Session' },
              { value: 'edit-course-metadata', label: 'Edit Course metadata' },
            ]}
            onValueChange={(value) => changeType(value as ContributionType)}
          />
        </label>
        {type !== 'add-new-course' && !targetsCatalog && (
          <label className={compactFilterLabelClass}>
            Course
            <Select selectSize="compact" className="min-w-64" value={selectedCourseId} options={selectedCourses.map((course) => ({ value: course.id, label: course.title }))} onValueChange={setCourseId} />
          </label>
        )}
      </div>

      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_420px] gap-6 max-[820px]:grid-cols-1">
        <section className={`${panelClass} mt-0 min-w-0 p-4`}>
          <div className="mb-3">
            <h2 className={headingClass}>{taskLabel(type)}</h2>
            <p className={`m-0 break-all ${mutedTextClass}`}>Target: {targetText}</p>
          </div>
          <TaskForm type={type} form={form} course={selectedCourse} updateField={updateField} />
          <ValidationPanel result={result} />
        </section>

        <div className="min-w-0">
          {result.valid ? (
            <section className={`${panelClass} mt-0 min-w-0 overflow-hidden p-4 max-[820px]:max-w-[calc(100vw-40px)]`}>
              {mode === 'issue' ? (
                <>
                  <h2 className={headingClass}>Generated Issue</h2>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <button type="button" className="inline-flex items-center gap-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 text-[13px] font-semibold text-[var(--text-main)] hover:border-[var(--primary)] cursor-pointer" onClick={copyIssueContent}>
                      <Clipboard aria-hidden="true" size={16} />
                      Copy issue content
                    </button>
                    <a href={result.issueUrl} target="_blank" className="inline-flex items-center gap-2 font-semibold text-[var(--primary)]">
                      <ExternalLink aria-hidden="true" size={16} />
                      Open GitHub issue
                    </a>
                  </div>
                  {clipboardStatus && <p className="mb-3 text-sm text-[var(--text-muted)]">{clipboardStatus}</p>}
                  <div className="mb-3 flex border-b border-[var(--border-color)]">
                    <button
                      type="button"
                      className={`mr-4 pb-1.5 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer ${
                        viewMode === 'diff'
                          ? 'border-[var(--primary)] text-[var(--primary)]'
                          : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                      onClick={() => setViewMode('diff')}
                    >
                      Diff
                    </button>
                    <button
                      type="button"
                      className={`pb-1.5 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer ${
                        viewMode === 'full'
                          ? 'border-[var(--primary)] text-[var(--primary)]'
                          : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                      onClick={() => setViewMode('full')}
                    >
                      Full JSON
                    </button>
                    <button
                      type="button"
                      className={`ml-4 pb-1.5 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer ${
                        viewMode === 'issue'
                          ? 'border-[var(--primary)] text-[var(--primary)]'
                          : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                      onClick={() => setViewMode('issue')}
                    >
                      Issue Body
                    </button>
                  </div>
                  <pre className="max-w-full overflow-auto rounded-md bg-[var(--bg-code)] p-3 whitespace-pre-wrap text-[var(--text-main)] [overflow-wrap:anywhere]">
                    {viewMode === 'issue' ? result.issueBody : viewMode === 'diff' ? JSON.stringify(result.parsed, null, 2) : result.changedJson}
                  </pre>
                </>
              ) : (
                <>
                  <h2 className={headingClass}>Pull Request Assist</h2>
                  <p className="mb-2 break-all text-sm text-[var(--text-muted)]">Target file: {targetsCatalog ? 'public/data/catalog.json' : `public/data/courses/${targetPath.academicYearId}/${targetPath.studyYearId}/${targetPath.semesterId}/${targetPath.courseId}.json`}</p>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <button type="button" className="inline-flex items-center gap-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 text-[13px] font-semibold text-[var(--text-main)] hover:border-[var(--primary)] cursor-pointer" onClick={copyPullRequestContent}>
                      <Clipboard aria-hidden="true" size={16} />
                      Copy PR content
                    </button>
                    <a href={result.githubLink} target="_blank" className="inline-flex items-center gap-2 font-semibold text-[var(--primary)]">
                      <ExternalLink aria-hidden="true" size={16} />
                      Open GitHub edit/create link
                    </a>
                  </div>
                  {clipboardStatus && <p className="mb-3 text-sm text-[var(--text-muted)]">{clipboardStatus}</p>}
                  <div className="mb-3 flex border-b border-[var(--border-color)]">
                    <button
                      type="button"
                      className={`mr-4 pb-1.5 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer ${
                        viewMode === 'diff'
                          ? 'border-[var(--primary)] text-[var(--primary)]'
                          : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                      onClick={() => setViewMode('diff')}
                    >
                      Diff
                    </button>
                    <button
                      type="button"
                      className={`pb-1.5 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer ${
                        viewMode === 'full'
                          ? 'border-[var(--primary)] text-[var(--primary)]'
                          : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                      onClick={() => setViewMode('full')}
                    >
                      Full JSON
                    </button>
                  </div>
                  <pre className="max-w-full overflow-auto rounded-md bg-[var(--bg-code)] p-3 whitespace-pre-wrap text-[var(--text-main)] [overflow-wrap:anywhere]">
                    {viewMode === 'diff' ? JSON.stringify(result.parsed, null, 2) : result.changedJson}
                  </pre>
                </>
              )}
            </section>
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--border-color)] p-6 text-center text-[var(--text-muted)]">
              <p>Fix validation errors in the form to generate GitHub contribution content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TaskForm({ type, form, course, updateField }: { type: ContributionType; form: FormState; course?: LoadedCourse; updateField: (name: string, value: string | string[]) => void }) {
  if (type === 'add-academic-year') {
    return (
      <div className="grid gap-3">
        <TextField label="Label" value={textValue(form.label)} onChange={(value) => updateField('label', value)} />
        <TextField label="Generated Academic Year ID" value={textValue(form.academicYearId)} onChange={(value) => updateField('academicYearId', value)} />
        <TextField label="Order (optional)" value={textValue(form.order)} onChange={(value) => updateField('order', value)} />
      </div>
    )
  }

  if (type === 'add-study-year') {
    return (
      <div className="grid gap-3">
        <TextField label="Academic Year ID" value={textValue(form.academicYearId)} onChange={(value) => updateField('academicYearId', value)} />
        <TextField label="Label" value={textValue(form.label)} onChange={(value) => updateField('label', value)} />
        <TextField label="Generated Study Year ID" value={textValue(form.studyYearId)} onChange={(value) => updateField('studyYearId', value)} />
        <TextField label="Order (optional)" value={textValue(form.order)} onChange={(value) => updateField('order', value)} />
      </div>
    )
  }

  if (type === 'add-semester') {
    return (
      <div className="grid gap-3">
        <TextField label="Academic Year ID" value={textValue(form.academicYearId)} onChange={(value) => updateField('academicYearId', value)} />
        <TextField label="Study Year ID" value={textValue(form.studyYearId)} onChange={(value) => updateField('studyYearId', value)} />
        <TextField label="Label" value={textValue(form.label)} onChange={(value) => updateField('label', value)} />
        <TextField label="Generated Semester ID" value={textValue(form.semesterId)} onChange={(value) => updateField('semesterId', value)} />
        <TextField label="Initial Course ID (optional)" value={textValue(form.courseId)} onChange={(value) => updateField('courseId', value)} />
        <TextField label="Initial Course title (optional)" value={textValue(form.courseTitle)} onChange={(value) => updateField('courseTitle', value)} />
        <TextField label="Order (optional)" value={textValue(form.order)} onChange={(value) => updateField('order', value)} />
      </div>
    )
  }

  if (type === 'add-new-course') {
    return (
      <div className="grid gap-3">
        <TextField label="Course title" value={textValue(form.title)} onChange={(value) => updateField('title', value)} />
        <TextField label="Professors (optional)" value={textValue(form.professorsText)} onChange={(value) => updateField('professorsText', value)} />
        <TextArea label="Description (optional)" value={textValue(form.description)} onChange={(value) => updateField('description', value)} />
        <SelectField label="Material Difficulty" value={textValue(form.materialDifficulty)} options={difficultyOptions} onChange={(value) => updateField('materialDifficulty', value)} />
        <SelectField label="Passing Difficulty" value={textValue(form.passingDifficulty)} options={difficultyOptions} onChange={(value) => updateField('passingDifficulty', value)} />
      </div>
    )
  }

  if (type === 'add-material') {
    return (
      <div className="grid gap-3">
        <TextField label="Material title" value={textValue(form.title)} onChange={(value) => updateField('title', value)} />
        <SelectField label="Material type" value={textValue(form.type)} options={materialTypes.map((item) => [item, label(item)])} onChange={(value) => updateField('type', value)} />
        <TextField label="External URL" value={textValue(form.url)} onChange={(value) => updateField('url', value)} />
        <AddAnotherButton label="Add another material" />
      </div>
    )
  }

  if (type === 'update-material') {
    const material = course?.materials.find((item) => item.id === textValue(form.materialId))
    return (
      <div className="grid gap-3">
        <SelectField label="Material" value={textValue(form.materialId)} options={(course?.materials ?? []).map((item) => [item.id, `${item.title} (${label(item.type)})`])} onChange={(value) => updateField('materialId', value)} />
        <TextField label="Title (optional)" value={textValue(form.title) || material?.title || ''} onChange={(value) => updateField('title', value)} />
        <SelectField label="Material type (optional)" value={textValue(form.type) || material?.type || 'course'} options={materialTypes.map((item) => [item, label(item)])} onChange={(value) => updateField('type', value)} />
        <TextField label="External URL (optional)" value={textValue(form.url) || material?.url || ''} onChange={(value) => updateField('url', value)} />
      </div>
    )
  }

  if (type === 'add-assignment-deadline') {
    return (
      <div className="grid gap-3">
        <TextField label="Assignment title" value={textValue(form.title)} onChange={(value) => updateField('title', value)} />
        <DateTimeField label="Due date and time" value={textValue(form.dueAt)} onChange={(value) => updateField('dueAt', value)} />
        <TextArea label="Description and submission instructions (optional)" value={textValue(form.description)} onChange={(value) => updateField('description', value)} />
        <TextField label="Grade Weight (optional)" value={textValue(form.gradeWeight)} onChange={(value) => updateField('gradeWeight', value)} />
        <CompatibleMaterialField label="Assignment Materials (optional)" emptyText="Add the needed assignment Material first." materials={course?.materials ?? []} materialType="assignment" value={arrayValue(form.materialIds)} onChange={(value) => updateField('materialIds', value)} />
        <TextField label="New assignment Material title (optional)" value={textValue(form.inlineMaterialTitle)} onChange={(value) => updateField('inlineMaterialTitle', value)} />
        <TextField label="New assignment Material URL (optional)" value={textValue(form.inlineMaterialUrl)} onChange={(value) => updateField('inlineMaterialUrl', value)} />
        <AddAnotherButton label="Add another assignment" />
      </div>
    )
  }

  if (type === 'add-exam') {
    return (
      <div className="grid gap-3">
        <TextField label="Exam title" value={textValue(form.title)} onChange={(value) => updateField('title', value)} />
        <DateTimeField label="Exam date and time (optional)" value={textValue(form.startsAt)} onChange={(value) => updateField('startsAt', value)} />
        <TextArea label="Description (optional)" value={textValue(form.description)} onChange={(value) => updateField('description', value)} />
        <TextField label="Location (optional)" value={textValue(form.location)} onChange={(value) => updateField('location', value)} />
        <TextField label="Grade Weight" value={textValue(form.gradeWeight)} onChange={(value) => updateField('gradeWeight', value)} />
        <CompatibleMaterialField label="Exam Materials (optional)" emptyText="Add the needed exam Material first." materials={course?.materials ?? []} materialType="exam" value={arrayValue(form.materialIds)} onChange={(value) => updateField('materialIds', value)} />
        <TextField label="New exam Material title (optional)" value={textValue(form.inlineMaterialTitle)} onChange={(value) => updateField('inlineMaterialTitle', value)} />
        <TextField label="New exam Material URL (optional)" value={textValue(form.inlineMaterialUrl)} onChange={(value) => updateField('inlineMaterialUrl', value)} />
        <AddAnotherButton label="Add another exam" />
      </div>
    )
  }

  if (type === 'add-course-session') {
    return (
      <div className="grid gap-3">
        <TextField label="Session title" value={textValue(form.title)} onChange={(value) => updateField('title', value)} />
        <DateTimeField label="Starts at" value={textValue(form.startsAt)} onChange={(value) => updateField('startsAt', value)} />
        <DateTimeField label="Ends at" value={textValue(form.endsAt)} onChange={(value) => updateField('endsAt', value)} />
        <TextField label="Location (optional)" value={textValue(form.location)} onChange={(value) => updateField('location', value)} />
        <SelectField label="Status (optional)" value={textValue(form.status)} options={[['scheduled', 'Scheduled'], ['cancelled', 'Cancelled']]} onChange={(value) => updateField('status', value)} />
        <AddAnotherButton label="Add another lecture" />
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <TextField label="Course title (optional)" value={textValue(form.title)} onChange={(value) => updateField('title', value)} />
      <TextField label="Professors (optional)" value={textValue(form.professorsText)} onChange={(value) => updateField('professorsText', value)} />
      <TextArea label="Description (optional)" value={textValue(form.description)} onChange={(value) => updateField('description', value)} />
      <SelectField label="Material Difficulty" value={textValue(form.materialDifficulty)} options={difficultyOptions} onChange={(value) => updateField('materialDifficulty', value)} />
      <SelectField label="Passing Difficulty" value={textValue(form.passingDifficulty)} options={difficultyOptions} onChange={(value) => updateField('passingDifficulty', value)} />
    </div>
  )
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-[var(--text-main)]">
      {label}
      <input className={fieldClass} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function DateTimeField(props: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-[var(--text-main)]">
      {props.label}
      <input type="datetime-local" className={fieldClass} value={props.value} onChange={(event) => props.onChange(event.target.value)} />
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

function MultiSelectField({ label, value, options, onChange }: { label: string; value: string[]; options: string[][]; onChange: (value: string[]) => void }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-[var(--text-main)]">
      {label}
      <select className={fieldClass} multiple value={value} onChange={(event) => onChange([...event.target.selectedOptions].map((option) => option.value))}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  )
}

function CompatibleMaterialField({ label, emptyText, materials, materialType, value, onChange }: { label: string; emptyText: string; materials: LoadedCourse['materials']; materialType: 'assignment' | 'exam'; value: string[]; onChange: (value: string[]) => void }) {
  const options = materials.filter((material) => material.type === materialType).map((material) => [material.id, material.title])
  if (options.length === 0) return <p className={`m-0 rounded-md border border-dashed border-[var(--border-color)] p-3 text-sm ${mutedTextClass}`}>{emptyText}</p>
  return <MultiSelectField label={label} value={value} options={options} onChange={onChange} />
}

function AddAnotherButton({ label }: { label: string }) {
  return (
    <button type="button" className="inline-flex w-fit items-center gap-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 text-[13px] font-semibold text-[var(--text-main)] hover:border-[var(--primary)]">
      <Plus aria-hidden="true" size={14} />
      {label}
    </button>
  )
}

const fieldClass = 'w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-main)] shadow-sm outline-none transition-colors hover:border-[var(--primary)] focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring-color)]'

function initialForm(type: ContributionType, course?: LoadedCourse): FormState {
  if (type === 'add-academic-year') return { academicYearId: '', label: '', order: '' }
  if (type === 'add-study-year') return { academicYearId: '', studyYearId: '', label: '', order: '' }
  if (type === 'add-semester') return { academicYearId: '', studyYearId: '', semesterId: '', label: '', courseId: '', courseTitle: '', order: '' }
  if (type === 'add-material') return { title: '', type: 'course', url: '' }
  if (type === 'update-material') return { materialId: course?.materials[0]?.id ?? '', title: '', type: course?.materials[0]?.type ?? 'course', url: '' }
  if (type === 'add-assignment-deadline') return { title: '', dueAt: '', description: '', gradeWeight: '', materialIds: [], inlineMaterialTitle: '', inlineMaterialUrl: '' }
  if (type === 'add-exam') return { title: '', startsAt: '', description: '', location: '', gradeWeight: '', materialIds: [], inlineMaterialTitle: '', inlineMaterialUrl: '' }
  if (type === 'add-course-session') return { title: '', startsAt: '', endsAt: '', location: '', status: 'scheduled' }
  if (type === 'edit-course-metadata') return { title: course?.title ?? '', professorsText: course?.professors.join(', ') ?? '', description: course?.description ?? '', materialDifficulty: course?.materialDifficulty ?? 'unknown', passingDifficulty: course?.passingDifficulty ?? 'unknown' }
  return { title: '', professorsText: '', description: '', materialDifficulty: 'unknown', passingDifficulty: 'unknown' }
}

function formToInput(type: ContributionType, form: FormState): Record<string, unknown> {
  const input: Record<string, unknown> = { ...form }
  if ('professorsText' in input) input.professors = splitList(textValue(form.professorsText))
  if ('gradeWeight' in input && textValue(form.gradeWeight)) input.gradeWeight = Number(textValue(form.gradeWeight))
  if ('order' in input && textValue(form.order)) input.order = Number(textValue(form.order))
  if ((type === 'add-assignment-deadline' || type === 'add-exam') && textValue(form.inlineMaterialTitle) && textValue(form.inlineMaterialUrl)) {
    input.newMaterials = [{ title: textValue(form.inlineMaterialTitle), url: textValue(form.inlineMaterialUrl) }]
  }
  return input
}

function textValue(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value : ''
}

function arrayValue(value: string | string[] | undefined): string[] {
  return Array.isArray(value) ? value : []
}

function splitList(value: string): string[] {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

function taskLabel(type: ContributionType): string {
  return {
    'add-new-course': 'Add New Course',
    'add-academic-year': 'Add Academic Year',
    'add-study-year': 'Add Study Year',
    'add-semester': 'Add Semester',
    'add-material': 'Add Material',
    'update-material': 'Update Material',
    'add-assignment-deadline': 'Add Assignment Deadline',
    'add-exam': 'Add Exam',
    'add-course-session': 'Add Course Session',
    'edit-course-metadata': 'Edit Course Metadata',
  }[type]
}

function label(value: string): string {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function isCatalogContributionType(type: ContributionType): boolean {
  return type === 'add-academic-year' || type === 'add-study-year' || type === 'add-semester'
}
