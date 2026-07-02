import { BookOpen, Clipboard, ExternalLink, FileText, FlaskConical, GraduationCap, PlayCircle, Plus, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { AcademicContextPicker } from '@/components/AcademicContextPicker'
import { PageHeader } from '@/components/PageHeader'
import { MultiSelect, Select } from '@/components/ui/select'
import { compactFilterLabelClass, headingClass, mutedTextClass, pageClass, panelClass } from '@/components/styles'
import { ValidationPanel } from '@/components/ValidationPanel'
import type { ContextSelection } from '@/app/academicContext'
import { prepareGeneratedContribution, selectedContextCourses, type Catalog, type ContributionType, type Hierarchy, type LoadedCourse, type MaterialType } from '@/domain'

type BatchItem = Record<string, string | string[] | boolean>
type FormState = Record<string, unknown> & {
  items?: BatchItem[]
  createAcademicYear?: boolean
  createStudyYear?: boolean
  createInlineMaterial?: boolean
}

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
      mode: 'issue',
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

  function updateField(name: string, value: unknown) {
    setForm((current) => {
      const next = { ...current, [name]: value }
      if (name === 'label') {
        const slug = slugify(String(value))
        if (type === 'add-semester') next.semesterId = slug
      }
      if (name === 'academicYearLabel') {
        next.academicYearId = slugify(String(value))
      }
      if (name === 'studyYearLabel') {
        next.studyYearId = slugify(String(value))
      }
      return next
    })
    setClipboardStatus('')
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
      <PageHeader title="Maintainer contributions" subtitle="Repository-level course data changes, catalog entries, and GitHub issue generation for maintainer review." />
      <section className={`${panelClass} mb-4 p-4`}>
        <p className={`m-0 ${mutedTextClass}`}>
          Use this page for repository-level course data changes, advanced corrections, and preparing GitHub issues for maintainer review. If you are a student suggesting a change, use the Suggest update action on a Course page.
        </p>
      </section>
      <AcademicContextPicker context={context} onContextChange={onContextChange} hierarchy={hierarchy} />

      <div className="mb-4.5 flex flex-wrap items-center gap-4 max-[820px]:grid max-[820px]:max-w-[calc(100vw-40px)] max-[820px]:grid-cols-1 max-[820px]:gap-2">
        <label className={compactFilterLabelClass}>
          Contribution task
          <Select
            selectSize="compact"
            className="min-w-64"
            value={type}
            options={[
              { value: 'add-new-course', label: 'Add new Course' },
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
              <h2 className={headingClass}>Generated Issue</h2>
              <div className="mb-3 flex flex-wrap gap-2">
                <button type="button" className="inline-flex items-center gap-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 text-[13px] font-semibold text-[var(--text-main)] hover:border-[var(--primary)] cursor-pointer" onClick={copyIssueContent}>
                  <Clipboard aria-hidden="true" size={16} />
                  Copy issue content
                </button>
                <a href={result.issueUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-[var(--primary)]">
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
            </section>
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--border-color)] p-6 text-center text-[var(--text-muted)]">
              <p>Fix validation errors in the form to generate GitHub issue content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TaskForm({
  type,
  form,
  course,
  updateField,
}: {
  type: ContributionType
  form: FormState
  course?: LoadedCourse
  updateField: (name: string, value: unknown) => void
}) {
  if (type === 'add-semester') {
    const createAY = Boolean(form.createAcademicYear)
    const createSY = Boolean(form.createStudyYear)
    const ayLabel = textValue(form.academicYearLabel)
    const ayId = textValue(form.academicYearId) || slugify(ayLabel)
    const syLabel = textValue(form.studyYearLabel)
    const syId = textValue(form.studyYearId) || slugify(syLabel)
    const semLabel = textValue(form.label)
    const semId = textValue(form.semesterId) || slugify(semLabel)

    return (
      <div className="grid gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-[var(--text-main)] cursor-pointer">
            <input type="checkbox" checked={createAY} onChange={(e) => updateField('createAcademicYear', e.target.checked)} />
            Create New Academic Year inline
          </label>
          {createAY ? (
            <div className="mt-2 grid gap-1">
              <TextField label="New Academic Year Label" value={ayLabel} onChange={(value) => updateField('academicYearLabel', value)} />
              <p className="m-0 text-xs text-[var(--text-muted)] font-mono">Generated ID: {ayId || '...'}</p>
            </div>
          ) : (
            <div className="mt-2 grid gap-1">
              <TextField label="Academic Year ID" value={textValue(form.academicYearId)} onChange={(value) => updateField('academicYearId', value)} />
            </div>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-[var(--text-main)] cursor-pointer">
            <input type="checkbox" checked={createSY} onChange={(e) => updateField('createStudyYear', e.target.checked)} />
            Create New Study Year inline
          </label>
          {createSY ? (
            <div className="mt-2 grid gap-1">
              <TextField label="New Study Year Label" value={syLabel} onChange={(value) => updateField('studyYearLabel', value)} />
              <p className="m-0 text-xs text-[var(--text-muted)] font-mono">Generated ID: {syId || '...'}</p>
            </div>
          ) : (
            <div className="mt-2 grid gap-1">
              <TextField label="Study Year ID" value={textValue(form.studyYearId)} onChange={(value) => updateField('studyYearId', value)} />
            </div>
          )}
        </div>

        <div className="grid gap-1">
          <TextField label="Semester Label" value={semLabel} onChange={(value) => updateField('label', value)} />
          <p className="m-0 text-xs text-[var(--text-muted)] font-mono">Generated ID: {semId || '...'}</p>
        </div>

        <TextField label="Order (optional)" value={textValue(form.order)} onChange={(value) => updateField('order', value)} />
      </div>
    )
  }

  if (type === 'add-new-course') {
    return (
      <div className="grid gap-3">
        <TextField label="Course Title (required)" placeholder="e.g. Machine Learning" value={textValue(form.title)} onChange={(value) => updateField('title', value)} />
        <TextField label="Professors (required, comma-separated)" placeholder="e.g. Dr. Alan Turing, Prof. Ada Lovelace" value={textValue(form.professorsText)} onChange={(value) => updateField('professorsText', value)} />
        <TextArea label="Description (optional)" value={textValue(form.description)} onChange={(value) => updateField('description', value)} />
        <SelectField label="Material Difficulty" value={textValue(form.materialDifficulty)} options={difficultyOptions} onChange={(value) => updateField('materialDifficulty', value)} />
        <SelectField label="Passing Difficulty" value={textValue(form.passingDifficulty)} options={difficultyOptions} onChange={(value) => updateField('passingDifficulty', value)} />
      </div>
    )
  }

  if (type === 'add-material') {
    const items = (form.items as BatchItem[]) || [{ title: '', type: 'course', url: '' }]
    return (
      <div className="grid gap-4">
        {items.map((item, index) => (
          <div key={index} className="grid gap-3 rounded-md border border-[var(--border-color)] p-3 bg-[var(--bg-card)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Material #{index + 1}</span>
              {items.length > 1 && (
                <button type="button" className="text-red-500 hover:text-red-700 cursor-pointer" onClick={() => updateField('items', items.filter((_, i) => i !== index))}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <TextField label="Material title" value={textValue(item.title)} onChange={(value) => updateBatchItem(items, index, 'title', value, updateField)} />
            <SelectField label="Material type" value={textValue(item.type)} options={materialTypes.map((t) => ({ value: t, label: label(t), icon: materialTypeIcon(t) }))} onChange={(value) => updateBatchItem(items, index, 'type', value, updateField)} />
            <TextField label="External URL" value={textValue(item.url)} onChange={(value) => updateBatchItem(items, index, 'url', value, updateField)} />
          </div>
        ))}
        <button type="button" className="inline-flex w-fit items-center gap-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 text-[13px] font-semibold text-[var(--text-main)] hover:border-[var(--primary)] cursor-pointer" onClick={() => updateField('items', [...items, { title: '', type: 'course', url: '' }])}>
          <Plus aria-hidden="true" size={14} />
          Add another material
        </button>
      </div>
    )
  }

  if (type === 'update-material') {
    const materialOptions = (course?.materials ?? []).map((item) => ({
      value: item.id,
      label: item.title,
      icon: materialTypeIcon(item.type),
    }))
    const selectedMatId = textValue(form.materialId) || course?.materials[0]?.id || ''
    const material = course?.materials.find((item) => item.id === selectedMatId)

    return (
      <div className="grid gap-3">
        <div className="grid gap-1 text-sm font-semibold text-[var(--text-main)]">
          <span>Material</span>
          <Select value={selectedMatId} options={materialOptions} onValueChange={(value) => updateField('materialId', value)} />
        </div>
        <TextField label="Title (optional)" value={textValue(form.title) || material?.title || ''} onChange={(value) => updateField('title', value)} />
        <SelectField label="Material type (optional)" value={textValue(form.type) || material?.type || 'course'} options={materialTypes.map((t) => ({ value: t, label: label(t), icon: materialTypeIcon(t) }))} onChange={(value) => updateField('type', value)} />
        <TextField label="External URL (optional)" value={textValue(form.url) || material?.url || ''} onChange={(value) => updateField('url', value)} />
      </div>
    )
  }

  if (type === 'add-assignment-deadline') {
    const items = (form.items as BatchItem[]) || [{ title: '', dueAt: '', description: '', gradeWeight: '', materialIds: [], createInlineMaterial: false, inlineMaterialTitle: '', inlineMaterialUrl: '' }]
    return (
      <div className="grid gap-4">
        {items.map((item, index) => (
          <div key={index} className="grid gap-3 rounded-md border border-[var(--border-color)] p-3 bg-[var(--bg-card)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Assignment Deadline #{index + 1}</span>
              {items.length > 1 && (
                <button type="button" className="text-red-500 hover:text-red-700 cursor-pointer" onClick={() => updateField('items', items.filter((_, i) => i !== index))}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <TextField label="Assignment title" value={textValue(item.title)} onChange={(value) => updateBatchItem(items, index, 'title', value, updateField)} />
            <DateTimeField label="Due date and time" value={textValue(item.dueAt)} onChange={(value) => updateBatchItem(items, index, 'dueAt', value, updateField)} />
            <TextArea label="Description and submission instructions (optional)" value={textValue(item.description)} onChange={(value) => updateBatchItem(items, index, 'description', value, updateField)} />
            <TextField label="Grade Weight (optional)" value={textValue(item.gradeWeight)} onChange={(value) => updateBatchItem(items, index, 'gradeWeight', value, updateField)} />
            <CompatibleMaterialField label="Assignment Materials (optional)" emptyText="No assignment materials available in this course." materials={course?.materials ?? []} materialType="assignment" value={arrayValue(item.materialIds)} onChange={(value) => updateBatchItem(items, index, 'materialIds', value, updateField)} />
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--text-main)] cursor-pointer">
              <input type="checkbox" checked={Boolean(item.createInlineMaterial)} onChange={(e) => updateBatchItem(items, index, 'createInlineMaterial', e.target.checked, updateField)} />
              Create new Material inline
            </label>
            {item.createInlineMaterial && (
              <>
                <TextField label="New assignment Material title" value={textValue(item.inlineMaterialTitle)} onChange={(value) => updateBatchItem(items, index, 'inlineMaterialTitle', value, updateField)} />
                <TextField label="New assignment Material URL" value={textValue(item.inlineMaterialUrl)} onChange={(value) => updateBatchItem(items, index, 'inlineMaterialUrl', value, updateField)} />
              </>
            )}
          </div>
        ))}
        <button type="button" className="inline-flex w-fit items-center gap-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 text-[13px] font-semibold text-[var(--text-main)] hover:border-[var(--primary)] cursor-pointer" onClick={() => updateField('items', [...items, { title: '', dueAt: '', description: '', gradeWeight: '', materialIds: [], createInlineMaterial: false, inlineMaterialTitle: '', inlineMaterialUrl: '' }])}>
          <Plus aria-hidden="true" size={14} />
          Add another assignment
        </button>
      </div>
    )
  }

  if (type === 'add-exam') {
    const items = (form.items as BatchItem[]) || [{ title: '', startsAt: '', description: '', location: '', gradeWeight: '', materialIds: [], createInlineMaterial: false, inlineMaterialTitle: '', inlineMaterialUrl: '' }]
    return (
      <div className="grid gap-4">
        {items.map((item, index) => (
          <div key={index} className="grid gap-3 rounded-md border border-[var(--border-color)] p-3 bg-[var(--bg-card)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Exam #{index + 1}</span>
              {items.length > 1 && (
                <button type="button" className="text-red-500 hover:text-red-700 cursor-pointer" onClick={() => updateField('items', items.filter((_, i) => i !== index))}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <TextField label="Exam title" value={textValue(item.title)} onChange={(value) => updateBatchItem(items, index, 'title', value, updateField)} />
            <DateTimeField label="Exam date and time (optional)" value={textValue(item.startsAt)} onChange={(value) => updateBatchItem(items, index, 'startsAt', value, updateField)} />
            <TextArea label="Description (optional)" value={textValue(item.description)} onChange={(value) => updateBatchItem(items, index, 'description', value, updateField)} />
            <TextField label="Location (optional)" value={textValue(item.location)} onChange={(value) => updateBatchItem(items, index, 'location', value, updateField)} />
            <TextField label="Grade Weight" value={textValue(item.gradeWeight)} onChange={(value) => updateBatchItem(items, index, 'gradeWeight', value, updateField)} />
            <CompatibleMaterialField label="Exam Materials (optional)" emptyText="No exam materials available in this course." materials={course?.materials ?? []} materialType="exam" value={arrayValue(item.materialIds)} onChange={(value) => updateBatchItem(items, index, 'materialIds', value, updateField)} />
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--text-main)] cursor-pointer">
              <input type="checkbox" checked={Boolean(item.createInlineMaterial)} onChange={(e) => updateBatchItem(items, index, 'createInlineMaterial', e.target.checked, updateField)} />
              Create new Material inline
            </label>
            {item.createInlineMaterial && (
              <>
                <TextField label="New exam Material title" value={textValue(item.inlineMaterialTitle)} onChange={(value) => updateBatchItem(items, index, 'inlineMaterialTitle', value, updateField)} />
                <TextField label="New exam Material URL" value={textValue(item.inlineMaterialUrl)} onChange={(value) => updateBatchItem(items, index, 'inlineMaterialUrl', value, updateField)} />
              </>
            )}
          </div>
        ))}
        <button type="button" className="inline-flex w-fit items-center gap-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 text-[13px] font-semibold text-[var(--text-main)] hover:border-[var(--primary)] cursor-pointer" onClick={() => updateField('items', [...items, { title: '', startsAt: '', description: '', location: '', gradeWeight: '', materialIds: [], createInlineMaterial: false, inlineMaterialTitle: '', inlineMaterialUrl: '' }])}>
          <Plus aria-hidden="true" size={14} />
          Add another exam
        </button>
      </div>
    )
  }

  if (type === 'add-course-session') {
    const items = (form.items as BatchItem[]) || [{ title: '', startsAt: '', endsAt: '', location: '', status: 'scheduled' }]
    return (
      <div className="grid gap-4">
        {items.map((item, index) => (
          <div key={index} className="grid gap-3 rounded-md border border-[var(--border-color)] p-3 bg-[var(--bg-card)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Course Session #{index + 1}</span>
              {items.length > 1 && (
                <button type="button" className="text-red-500 hover:text-red-700 cursor-pointer" onClick={() => updateField('items', items.filter((_, i) => i !== index))}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <TextField label="Session title" value={textValue(item.title)} onChange={(value) => updateBatchItem(items, index, 'title', value, updateField)} />
            <DateTimeField label="Starts at" value={textValue(item.startsAt)} onChange={(value) => updateBatchItem(items, index, 'startsAt', value, updateField)} />
            <DateTimeField label="Ends at" value={textValue(item.endsAt)} onChange={(value) => updateBatchItem(items, index, 'endsAt', value, updateField)} />
            <TextField label="Location (optional)" value={textValue(item.location)} onChange={(value) => updateBatchItem(items, index, 'location', value, updateField)} />
            <SelectField label="Status (optional)" value={textValue(item.status)} options={[['scheduled', 'Scheduled'], ['cancelled', 'Cancelled']]} onChange={(value) => updateBatchItem(items, index, 'status', value, updateField)} />
          </div>
        ))}
        <button type="button" className="inline-flex w-fit items-center gap-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 text-[13px] font-semibold text-[var(--text-main)] hover:border-[var(--primary)] cursor-pointer" onClick={() => updateField('items', [...items, { title: '', startsAt: '', endsAt: '', location: '', status: 'scheduled' }])}>
          <Plus aria-hidden="true" size={14} />
          Add another lecture
        </button>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <TextField label="Course Title (optional)" value={textValue(form.title)} onChange={(value) => updateField('title', value)} />
      <TextField label="Professors (optional)" value={textValue(form.professorsText)} onChange={(value) => updateField('professorsText', value)} />
      <TextArea label="Description (optional)" value={textValue(form.description)} onChange={(value) => updateField('description', value)} />
      <SelectField label="Material Difficulty" value={textValue(form.materialDifficulty)} options={difficultyOptions} onChange={(value) => updateField('materialDifficulty', value)} />
      <SelectField label="Passing Difficulty" value={textValue(form.passingDifficulty)} options={difficultyOptions} onChange={(value) => updateField('passingDifficulty', value)} />
    </div>
  )
}

function updateBatchItem(items: BatchItem[], index: number, field: string, value: unknown, updateField: (name: string, value: unknown) => void) {
  const nextItems = items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
  updateField('items', nextItems)
}

function TextField({ label, placeholder, value, onChange }: { label: string; placeholder?: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-[var(--text-main)]">
      {label}
      <input className={fieldClass} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
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

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: (string[] | { value: string; label: string; icon?: React.ReactNode })[]
  onChange: (value: string) => void
}) {
  const formattedOptions = options.map((opt) => {
    if (Array.isArray(opt)) return { value: opt[0], label: opt[1] }
    return opt
  })
  return (
    <label className="grid gap-1 text-sm font-semibold text-[var(--text-main)]">
      {label}
      <Select value={value} options={formattedOptions} onValueChange={onChange} />
    </label>
  )
}

function CompatibleMaterialField({
  label,
  emptyText,
  materials,
  materialType,
  value,
  onChange,
}: {
  label: string
  emptyText: string
  materials: LoadedCourse['materials']
  materialType: 'assignment' | 'exam'
  value: string[]
  onChange: (value: string[]) => void
}) {
  const options = materials
    .filter((material) => material.type === materialType)
    .map((material) => ({
      value: material.id,
      label: material.title,
      icon: materialTypeIcon(material.type),
    }))

  if (options.length === 0) {
    return (
      <div className="grid gap-1 text-sm font-semibold text-[var(--text-main)]">
        <span>{label}</span>
        <p className={`m-0 rounded-md border border-dashed border-[var(--border-color)] p-3 text-sm font-normal ${mutedTextClass}`}>{emptyText}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-1 text-sm font-semibold text-[var(--text-main)]">
      <span>{label}</span>
      <MultiSelect value={value} options={options} placeholder={`Select ${materialType} materials...`} onValueChange={onChange} />
    </div>
  )
}

function materialTypeIcon(type: MaterialType) {
  const size = 15
  switch (type) {
    case 'course':
      return <BookOpen size={size} />
    case 'seminar':
      return <Users size={size} />
    case 'lab':
      return <FlaskConical size={size} />
    case 'assignment':
      return <Clipboard size={size} />
    case 'exam':
      return <GraduationCap size={size} />
    case 'video':
      return <PlayCircle size={size} />
    default:
      return <FileText size={size} />
  }
}

const fieldClass = 'w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-main)] shadow-sm outline-none transition-colors hover:border-[var(--primary)] focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring-color)]'

function initialForm(type: ContributionType, course?: LoadedCourse): FormState {
  if (type === 'add-semester') return { createAcademicYear: false, academicYearId: '', academicYearLabel: '', createStudyYear: false, studyYearId: '', studyYearLabel: '', semesterId: '', label: '', order: '' }
  if (type === 'add-material') return { items: [{ title: '', type: 'course', url: '' }] }
  if (type === 'update-material') return { materialId: course?.materials[0]?.id ?? '', title: '', type: course?.materials[0]?.type ?? 'course', url: '' }
  if (type === 'add-assignment-deadline') return { items: [{ title: '', dueAt: '', description: '', gradeWeight: '', materialIds: [], createInlineMaterial: false, inlineMaterialTitle: '', inlineMaterialUrl: '' }] }
  if (type === 'add-exam') return { items: [{ title: '', startsAt: '', description: '', location: '', gradeWeight: '', materialIds: [], createInlineMaterial: false, inlineMaterialTitle: '', inlineMaterialUrl: '' }] }
  if (type === 'add-course-session') return { items: [{ title: '', startsAt: '', endsAt: '', location: '', status: 'scheduled' }] }
  if (type === 'edit-course-metadata') return { title: course?.title ?? '', professorsText: course?.professors.join(', ') ?? '', description: course?.description ?? '', materialDifficulty: course?.materialDifficulty ?? 'unknown', passingDifficulty: course?.passingDifficulty ?? 'unknown' }
  return { title: '', professorsText: '', description: '', materialDifficulty: 'unknown', passingDifficulty: 'unknown' }
}

function formToInput(_type: ContributionType, form: FormState): Record<string, unknown> {
  const input: Record<string, unknown> = { ...form }
  if ('professorsText' in input) input.professors = splitList(textValue(input.professorsText))
  if ('gradeWeight' in input && textValue(input.gradeWeight)) input.gradeWeight = Number(textValue(input.gradeWeight))
  if ('order' in input && textValue(input.order)) input.order = Number(textValue(input.order))
  if (Array.isArray(form.items)) {
    input.items = form.items.map((item) => {
      const formattedItem: Record<string, unknown> = { ...item }
      if ('gradeWeight' in formattedItem && textValue(formattedItem.gradeWeight)) formattedItem.gradeWeight = Number(textValue(formattedItem.gradeWeight))
      if (item.createInlineMaterial && textValue(item.inlineMaterialTitle) && textValue(item.inlineMaterialUrl)) {
        formattedItem.newMaterials = [{ title: textValue(item.inlineMaterialTitle), url: textValue(item.inlineMaterialUrl) }]
      }
      return formattedItem
    })
  }
  return input
}

function textValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function arrayValue(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : []
}

function splitList(value: string): string[] {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

function slugify(value: string): string {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
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
