import { BookOpen, ExternalLink, X } from 'lucide-react'
import { useState } from 'react'
import { AcademicContextPicker } from '@/components/AcademicContextPicker'
import { PageHeader } from '@/components/PageHeader'
import { compactFilterLabelClass, compactFilterSelectClass, headingClass, mutedTextClass, pageClass, panelClass } from '@/components/styles'
import { ValidationPanel } from '@/components/ValidationPanel'
import type { ContextSelection } from '@/app/academicContext'
import { prepareContribution, selectedContextCourses, type Catalog, type ContributionType, type Hierarchy, type LoadedCourse } from '@/domain'
import { contributionSchemas } from './contributionSchema'
import { samplePayload } from './samplePayload'

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
  const [type, setType] = useState<ContributionType>('add-material')
  const [courseId, setCourseId] = useState(selectedCourses[0]?.id ?? '')
  const [payloadText, setPayloadText] = useState(samplePayload(type))
  const [showSchema, setShowSchema] = useState(false)
  const selectedCourseId = selectedCourses.some((course) => course.id === courseId) ? courseId : selectedCourses[0]?.id ?? ''
  const path = { ...context, courseId: type === 'add-new-course' ? 'new-course' : selectedCourseId }
  const result = prepareContribution({
    draft: { type, mode, path, payloadText },
    repository: { catalog, courses: loadedCourses },
  })

  function changeType(nextType: ContributionType) {
    setType(nextType)
    setPayloadText(samplePayload(nextType))
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
          Contribution type
          <select className={compactFilterSelectClass} value={type} onChange={(event) => changeType(event.target.value as ContributionType)}>
            <option value="add-material">Add Material</option>
            <option value="update-material">Update Material</option>
            <option value="add-assignment-deadline">Add Assignment Deadline</option>
            <option value="add-exam">Add Exam</option>
            <option value="add-course-session">Add Course Session</option>
            <option value="edit-course-metadata">Edit Course metadata</option>
            <option value="add-new-course">Add new Course</option>
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
      <div className="mt-3 grid grid-cols-[1fr_420px] gap-6 max-[820px]:grid-cols-1">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className={`m-0 break-all ${mutedTextClass}`}>Target: {path.academicYearId}/{path.studyYearId}/{path.semesterId}/{path.courseId}</span>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 text-[13px] font-semibold text-[var(--text-main)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--bg-app)]"
              onClick={() => setShowSchema(true)}
              aria-expanded={showSchema}
            >
              <BookOpen aria-hidden="true" size={16} />
              View Schema Guide
            </button>
          </div>

          <div className="relative w-full">
            <textarea
              className="min-h-[250px] w-full resize-y rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] p-3 font-mono text-sm text-[var(--text-main)] max-[820px]:w-[calc(100vw-40px)] max-[820px]:max-w-[calc(100vw-40px)]"
              value={payloadText}
              onChange={(event) => setPayloadText(event.target.value)}
              aria-label="Contribution JSON"
            />
          </div>

          <ValidationPanel result={result} />
        </div>

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
                  <p className="mb-3">Static UniHub can prepare PR content and GitHub edit links; it cannot create a pull request in one click.</p>
                  <a href={result.githubLink} target="_blank" className="mb-3 inline-flex items-center gap-2 font-semibold text-[var(--primary)]">
                    <ExternalLink aria-hidden="true" size={16} />
                    Open GitHub edit/create link
                  </a>
                  <pre className="max-w-full overflow-auto rounded-md bg-[var(--bg-code)] p-3 whitespace-pre-wrap text-[var(--text-main)] [overflow-wrap:anywhere]">{result.prTitle}{'\n\n'}{result.prBody}</pre>
                </>
              )}
            </section>
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--border-color)] p-6 text-center text-[var(--text-muted)]">
              <p>Fix validation errors on the left to generate GitHub contribution content.</p>
            </div>
          )}
        </div>
      </div>

      {showSchema && (
        <>
          <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowSchema(false)} />
          <div
            className="fixed top-1/2 left-1/2 z-[1001] flex max-h-[80vh] w-[90vw] max-w-[680px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="schema-modal-title"
          >
            <div className="mb-4 flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 id="schema-modal-title" className="m-0 text-base font-bold text-[var(--text-main)]">Expected Schema: {type}</h3>
              <button type="button" className="inline-flex items-center justify-center rounded-md bg-transparent px-1.5 py-1 text-[var(--text-muted)] hover:bg-[var(--bg-app)]" onClick={() => setShowSchema(false)} aria-label="Close schema guide">
                <X aria-hidden="true" size={20} />
              </button>
            </div>
            <div>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-b border-[var(--border-color)] px-1.5 py-2 text-left font-semibold text-[var(--text-main)]">Property</th>
                    <th className="border-b border-[var(--border-color)] px-1.5 py-2 text-left font-semibold text-[var(--text-main)]">Type</th>
                    <th className="border-b border-[var(--border-color)] px-1.5 py-2 text-left font-semibold text-[var(--text-main)]">Required</th>
                    <th className="border-b border-[var(--border-color)] px-1.5 py-2 text-left font-semibold text-[var(--text-main)]">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {contributionSchemas[type].map((field) => (
                    <tr key={field.name}>
                      <td className="border-b border-[var(--border-color)] px-1.5 py-2 text-left text-[var(--text-muted)]"><code className="rounded bg-[var(--bg-code)] px-1 py-0.5 font-mono text-[11px] text-[var(--text-main)]">{field.name}</code></td>
                      <td className="border-b border-[var(--border-color)] px-1.5 py-2 text-left text-[var(--text-muted)]"><code className="rounded bg-[var(--bg-code)] px-1 py-0.5 font-mono text-[11px] text-[var(--text-main)]">{field.type}</code></td>
                      <td className="border-b border-[var(--border-color)] px-1.5 py-2 text-left text-[var(--text-muted)]">{field.required ? 'Yes' : 'No'}</td>
                      <td className="border-b border-[var(--border-color)] px-1.5 py-2 text-left text-[var(--text-muted)]">
                        {field.description}
                        <br />
                        <small className="text-[var(--text-muted)]">Example: <code className="rounded bg-[var(--bg-code)] px-1 py-0.5 font-mono text-[11px] text-[var(--text-main)]">{field.example}</code></small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
