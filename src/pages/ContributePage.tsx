import { Clipboard, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { AcademicContextPicker } from '@/components/AcademicContextPicker'
import { PageHeader } from '@/components/PageHeader'
import { compactFilterLabelClass, compactFilterSelectClass, headingClass, mutedTextClass, pageClass, panelClass } from '@/components/styles'
import { ValidationPanel } from '@/components/ValidationPanel'
import type { ContextSelection } from '@/app/academicContext'
import { prepareGeneratedContribution, selectedContextCourses, type Catalog, type ContributionType, type Hierarchy, type LoadedCourse, type MaterialType } from '@/domain'

type FormState = Record<string, string | string[]>

const materialTypes: MaterialType[] = ['course', 'seminar', 'lab', 'assignment', 'exam', 'video', 'other']

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
  const selectedCourseId = selectedCourses.some((course) => course.id === courseId) ? courseId : selectedCourses[0]?.id ?? ''
  const selectedCourse = selectedCourses.find((course) => course.id === selectedCourseId)
  const result = prepareGeneratedContribution({
    draft: {
      type,
      mode,
      context,
      path: type === 'add-new-course' ? undefined : { ...context, courseId: selectedCourseId },
      input: formToInput(type, form),
    },
    repository: { catalog, courses: loadedCourses },
  })
  const fallbackPath = { ...context, courseId: type === 'add-new-course' ? 'generated-course-id' : selectedCourseId }
  const targetPath = result.path?.academicYearId ? result.path : fallbackPath

  function changeType(nextType: ContributionType) {
    setType(nextType)
    setForm(initialForm(nextType, selectedCourse))
    setClipboardStatus('')
  }

  function updateField(name: string, value: string | string[]) {
    setForm((current) => ({ ...current, [name]: value }))
    setClipboardStatus('')
  }

  async function copyPullRequestContent() {
    if (!result.valid) return
    const content = [`Target path: ${targetPath.academicYearId}/${targetPath.studyYearId}/${targetPath.semesterId}/${targetPath.courseId}`, '', result.prTitle, '', result.prBody].join('\n')
    try {
      await navigator.clipboard.writeText(content)
      setClipboardStatus('Pull request content copied.')
    } catch {
      setClipboardStatus('Clipboard unavailable. Select the generated pull request text below and copy it manually.')
    }
  }

  return (
    <div className={pageClass}>
      <PageHeader title="Contribute" subtitle="Create one maintainer-reviewed Contribution at a time" />
      <AcademicContextPicker context={context} onContextChange={onContextChange} hierarchy={hierarchy} />

      <div className="mb-4.5 flex flex-wrap items-center gap-4 max-[820px]:grid max-[820px]:max-w-[calc(100vw-40px)] max-[820px]:grid-cols-1 max-[820px]:gap-2">
        <label className={compactFilterLabelClass}>
          Mode
          <select className={compactFilterSelectClass} value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}>
            <option value="issue">GitHub issue</option>
            <option value="pull-request">Pull request assist</option>
          </select>
        </label>
        <label className={compactFilterLabelClass}>
          Contribution task
          <select className={compactFilterSelectClass} value={type} onChange={(event) => changeType(event.target.value as ContributionType)}>
            <option value="add-new-course">Add new Course</option>
            <option value="add-material">Add Material</option>
            <option value="update-material">Update Material</option>
            <option value="add-assignment-deadline">Add Assignment Deadline</option>
            <option value="add-exam">Add Exam</option>
            <option value="add-course-session">Add Course Session</option>
            <option value="edit-course-metadata">Edit Course metadata</option>
          </select>
        </label>
        {type !== 'add-new-course' && (
          <label className={compactFilterLabelClass}>
            Course
            <select className={compactFilterSelectClass} value={selectedCourseId} onChange={(event) => setCourseId(event.target.value)}>
              {selectedCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_420px] gap-6 max-[820px]:grid-cols-1">
        <section className={`${panelClass} mt-0 min-w-0 p-4`}>
          <div className="mb-3">
            <h2 className={headingClass}>{taskLabel(type)}</h2>
            <p className={`m-0 break-all ${mutedTextClass}`}>Target: {targetPath.academicYearId}/{targetPath.studyYearId}/{targetPath.semesterId}/{targetPath.courseId}</p>
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
                  <a href={result.issueUrl} target="_blank" className="mb-3 inline-flex items-center gap-2 font-semibold text-[var(--primary)]">
                    <ExternalLink aria-hidden="true" size={16} />
                    Open prefilled GitHub issue
                  </a>
                  <pre className="max-w-full overflow-auto rounded-md bg-[var(--bg-code)] p-3 whitespace-pre-wrap text-[var(--text-main)] [overflow-wrap:anywhere]">{result.issueBody}</pre>
                </>
              ) : (
                <>
                  <h2 className={headingClass}>Pull Request Assist</h2>
                  <p className="mb-2 break-all text-sm text-[var(--text-muted)]">Target file: public/data/courses/{targetPath.academicYearId}/{targetPath.studyYearId}/{targetPath.semesterId}/{targetPath.courseId}.json</p>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <button type="button" className="inline-flex items-center gap-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 text-[13px] font-semibold text-[var(--text-main)] hover:border-[var(--primary)]" onClick={copyPullRequestContent}>
                      <Clipboard aria-hidden="true" size={16} />
                      Copy PR content
                    </button>
                    <a href={result.githubLink} target="_blank" className="inline-flex items-center gap-2 font-semibold text-[var(--primary)]">
                      <ExternalLink aria-hidden="true" size={16} />
                      Open GitHub edit/create link
                    </a>
                  </div>
                  {clipboardStatus && <p className="mb-3 text-sm text-[var(--text-muted)]">{clipboardStatus}</p>}
                  <pre className="max-w-full overflow-auto rounded-md bg-[var(--bg-code)] p-3 whitespace-pre-wrap text-[var(--text-main)] [overflow-wrap:anywhere]">{result.prTitle}{'\n\n'}{result.prBody}</pre>
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
  if (type === 'add-new-course') {
    return (
      <div className="grid gap-3">
        <TextField label="Course title" value={textValue(form.title)} onChange={(value) => updateField('title', value)} />
        <TextField label="Professors" value={textValue(form.professorsText)} onChange={(value) => updateField('professorsText', value)} />
        <TextArea label="Description" value={textValue(form.description)} onChange={(value) => updateField('description', value)} />
      </div>
    )
  }

  if (type === 'add-material') {
    return (
      <div className="grid gap-3">
        <TextField label="Material title" value={textValue(form.title)} onChange={(value) => updateField('title', value)} />
        <SelectField label="Material type" value={textValue(form.type)} options={materialTypes.map((item) => [item, label(item)])} onChange={(value) => updateField('type', value)} />
        <TextField label="External URL" value={textValue(form.url)} onChange={(value) => updateField('url', value)} />
      </div>
    )
  }

  if (type === 'update-material') {
    const material = course?.materials.find((item) => item.id === textValue(form.materialId))
    return (
      <div className="grid gap-3">
        <SelectField label="Material" value={textValue(form.materialId)} options={(course?.materials ?? []).map((item) => [item.id, `${item.title} (${label(item.type)})`])} onChange={(value) => updateField('materialId', value)} />
        <TextField label="Title" value={textValue(form.title) || material?.title || ''} onChange={(value) => updateField('title', value)} />
        <SelectField label="Material type" value={textValue(form.type) || material?.type || 'course'} options={materialTypes.map((item) => [item, label(item)])} onChange={(value) => updateField('type', value)} />
        <TextField label="External URL" value={textValue(form.url) || material?.url || ''} onChange={(value) => updateField('url', value)} />
      </div>
    )
  }

  if (type === 'add-assignment-deadline') {
    return (
      <div className="grid gap-3">
        <TextField label="Assignment title" value={textValue(form.title)} onChange={(value) => updateField('title', value)} />
        <DateTimeField label="Due date and time" value={textValue(form.dueAt)} onChange={(value) => updateField('dueAt', value)} />
        <TextArea label="Description" value={textValue(form.description)} onChange={(value) => updateField('description', value)} />
        <TextField label="Submission URL" value={textValue(form.submissionUrl)} onChange={(value) => updateField('submissionUrl', value)} />
        <TextField label="Grade Weight" value={textValue(form.gradeWeight)} onChange={(value) => updateField('gradeWeight', value)} />
        <MultiSelectField label="Assignment Materials" value={arrayValue(form.materialIds)} options={(course?.materials ?? []).filter((item) => item.type === 'assignment').map((item) => [item.id, item.title])} onChange={(value) => updateField('materialIds', value)} />
        <TextField label="New assignment Material title" value={textValue(form.inlineMaterialTitle)} onChange={(value) => updateField('inlineMaterialTitle', value)} />
        <TextField label="New assignment Material URL" value={textValue(form.inlineMaterialUrl)} onChange={(value) => updateField('inlineMaterialUrl', value)} />
      </div>
    )
  }

  if (type === 'add-exam') {
    return (
      <div className="grid gap-3">
        <TextField label="Exam title" value={textValue(form.title)} onChange={(value) => updateField('title', value)} />
        <DateTimeField label="Exam date and time" value={textValue(form.startsAt)} onChange={(value) => updateField('startsAt', value)} />
        <TextField label="Grade Weight" value={textValue(form.gradeWeight)} onChange={(value) => updateField('gradeWeight', value)} />
        <MultiSelectField label="Exam Materials" value={arrayValue(form.materialIds)} options={(course?.materials ?? []).filter((item) => item.type === 'exam').map((item) => [item.id, item.title])} onChange={(value) => updateField('materialIds', value)} />
        <TextField label="New exam Material title" value={textValue(form.inlineMaterialTitle)} onChange={(value) => updateField('inlineMaterialTitle', value)} />
        <TextField label="New exam Material URL" value={textValue(form.inlineMaterialUrl)} onChange={(value) => updateField('inlineMaterialUrl', value)} />
      </div>
    )
  }

  if (type === 'add-course-session') {
    return (
      <div className="grid gap-3">
        <TextField label="Session title" value={textValue(form.title)} onChange={(value) => updateField('title', value)} />
        <DateTimeField label="Starts at" value={textValue(form.startsAt)} onChange={(value) => updateField('startsAt', value)} />
        <DateTimeField label="Ends at" value={textValue(form.endsAt)} onChange={(value) => updateField('endsAt', value)} />
        <TextField label="Location" value={textValue(form.location)} onChange={(value) => updateField('location', value)} />
        <SelectField label="Status" value={textValue(form.status)} options={[['scheduled', 'Scheduled'], ['cancelled', 'Cancelled']]} onChange={(value) => updateField('status', value)} />
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <TextField label="Course title" value={textValue(form.title)} onChange={(value) => updateField('title', value)} />
      <TextField label="Professors" value={textValue(form.professorsText)} onChange={(value) => updateField('professorsText', value)} />
      <TextArea label="Description" value={textValue(form.description)} onChange={(value) => updateField('description', value)} />
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
      <select className={fieldClass} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
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

const fieldClass = 'w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-main)]'

function initialForm(type: ContributionType, course?: LoadedCourse): FormState {
  if (type === 'add-material') return { title: '', type: 'course', url: '' }
  if (type === 'update-material') return { materialId: course?.materials[0]?.id ?? '', title: '', type: course?.materials[0]?.type ?? 'course', url: '' }
  if (type === 'add-assignment-deadline') return { title: '', dueAt: '', description: '', submissionUrl: '', gradeWeight: '', materialIds: [], inlineMaterialTitle: '', inlineMaterialUrl: '' }
  if (type === 'add-exam') return { title: '', startsAt: '', gradeWeight: '', materialIds: [], inlineMaterialTitle: '', inlineMaterialUrl: '' }
  if (type === 'add-course-session') return { title: '', startsAt: '', endsAt: '', location: '', status: 'scheduled' }
  if (type === 'edit-course-metadata') return { title: course?.title ?? '', professorsText: course?.professors.join(', ') ?? '', description: course?.description ?? '' }
  return { title: '', professorsText: '', description: '' }
}

function formToInput(type: ContributionType, form: FormState): Record<string, unknown> {
  const input: Record<string, unknown> = { ...form }
  if ('professorsText' in input) input.professors = splitList(textValue(form.professorsText))
  if ('gradeWeight' in input && textValue(form.gradeWeight)) input.gradeWeight = Number(textValue(form.gradeWeight))
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
