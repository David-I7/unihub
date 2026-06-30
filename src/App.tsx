import { useState, useEffect } from 'react'
import { HashRouter, Link, NavLink, Route, Routes, useParams } from 'react-router-dom'
import './App.css'
import {
  type ContributionType,
  type CourseDetailView,
  type PreparedContribution,
  buildHierarchy,
  coursePathFromRouteParams,
  courseRoutePath,
  deriveCourseDetailView,
  deriveActivity,
  deriveCalendarEvents,
  findCourse,
  loadRepositoryData,
  loadCoursesForContext,
  selectedContextCourses,
  parseCourseRoute,
  prepareContribution,
  type LoadedCourse,
} from './domain'

const { catalog } = loadRepositoryData()
const hierarchy = buildHierarchy(catalog, [])
const defaultContext = {
  academicYearId: hierarchy.academicYears[0].id,
  studyYearId: hierarchy.academicYears[0].studyYears[0].id,
  semesterId: hierarchy.academicYears[0].studyYears[0].semesters[0].id,
}

type ContextSelection = typeof defaultContext

function useTheme() {
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>(() => {
    const saved = localStorage.getItem('unihub-theme')
    return (saved as 'system' | 'light' | 'dark') || 'system'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
    localStorage.setItem('unihub-theme', theme)
  }, [theme])

  return [theme, setTheme] as const
}

function App() {
  const [context, setContext] = usePersistentContext()
  const [loadedCourses, setLoadedCourses] = useState<LoadedCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const { academicYearId, studyYearId, semesterId } = context

  useEffect(() => {
    let active = true
    Promise.resolve().then(() => {
      if (active) {
        setIsLoading(true)
        setLoadError(null)
      }
    })

    loadCoursesForContext({ academicYearId, studyYearId, semesterId })
      .then((data) => {
        if (active) {
          setLoadedCourses(data)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (active) {
          setLoadError('Failed to load course data.')
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [academicYearId, studyYearId, semesterId])

  return (
    <HashRouter>
      <div className="app-shell">
        <Navigation />
        <main className="workspace">
          {isLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading course data...</p>
            </div>
          ) : loadError ? (
            <div className="error-container">
              <p>{loadError}</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Home context={context} onContextChange={setContext} loadedCourses={loadedCourses} />} />
              <Route path="/calendar" element={<Calendar context={context} onContextChange={setContext} loadedCourses={loadedCourses} />} />
              <Route path="/contribute" element={<Contribute context={context} onContextChange={setContext} loadedCourses={loadedCourses} />} />
              <Route path="/courses/:academicYearId/:studyYearId/:semesterId/:courseId" element={<CourseDetail loadedCourses={loadedCourses} />} />
            </Routes>
          )}
        </main>
      </div>
    </HashRouter>
  )
}

function Navigation() {
  const items = [
    { to: '/', label: 'Home', icon: 'H' },
    { to: '/calendar', label: 'Calendar', icon: 'C' },
    { to: '/contribute', label: 'Contribute', icon: '+' },
  ]
  const [theme, setTheme] = useTheme()
  const cycleTheme = () => {
    setTheme((prev) => (prev === 'system' ? 'light' : prev === 'light' ? 'dark' : 'system'))
  }
  const themeIcon = theme === 'system' ? '🌓' : theme === 'light' ? '☀️' : '🌙'
  const themeLabel = theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark'

  return (
    <>
      <aside className="app-rail" aria-label="Primary">
        <div className="brand">UH</div>
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className="rail-link" title={item.label}>
            <span aria-hidden="true">{item.icon}</span>
            <small>{item.label}</small>
          </NavLink>
        ))}
        <div style={{ flexGrow: 1 }} />
        <button
          type="button"
          className="rail-link theme-toggle"
          title={`Theme: ${themeLabel}`}
          onClick={cycleTheme}
          style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
        >
          <span aria-hidden="true">{themeIcon}</span>
          <small>{themeLabel}</small>
        </button>
      </aside>
      <nav className="bottom-nav" aria-label="Primary">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className="bottom-link">
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        <button
          type="button"
          className="bottom-link theme-toggle"
          onClick={cycleTheme}
          style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
        >
          <span aria-hidden="true">{themeIcon}</span>
          Theme
        </button>
      </nav>
    </>
  )
}

function Home({
  context,
  onContextChange,
  loadedCourses,
}: {
  context: ContextSelection
  onContextChange: (context: ContextSelection) => void
  loadedCourses: LoadedCourse[]
}) {
  const selectedCourses = selectedContextCourses(loadedCourses, context)
  const activity = deriveActivity(loadedCourses, context)

  return (
    <div className="page home-layout">
      <section className="main-column">
        <PageHeader title="Home" subtitle="Selected course context" />
        <ContextSelectors context={context} onContextChange={onContextChange} />
        <div className="course-grid" aria-label="Courses">
          {selectedCourses.map((course) => (
            <Link key={course.id} className="course-card" to={courseRoutePath(course.path)}>
              <h2>{course.title}</h2>
              <p>{course.professors.join(', ')}</p>
            </Link>
          ))}
        </div>
      </section>
      <ActivityPanel activity={activity} />
    </div>
  )
}

function Calendar({
  context,
  onContextChange,
  loadedCourses,
}: {
  context: ContextSelection
  onContextChange: (context: ContextSelection) => void
  loadedCourses: LoadedCourse[]
}) {
  const [courseId, setCourseId] = useState('all')
  const [eventType, setEventType] = useState<'all' | 'assignment' | 'exam' | 'lecture'>('all')
  const [timeRange, setTimeRange] = useState<'upcoming' | 'all'>('upcoming')
  const selectedCourses = selectedContextCourses(loadedCourses, context)
  const events = deriveCalendarEvents({
    courses: loadedCourses,
    context,
    courseId: courseId === 'all' ? undefined : courseId,
    eventType,
    timeRange,
    now: new Date(),
  })

  return (
    <div className="page">
      <PageHeader title="Calendar" subtitle="Agenda derived from deadlines, lectures, and exams" />
      <ContextSelectors context={context} onContextChange={onContextChange} />
      <div className="filters">
        <label>
          Course
          <select value={courseId} onChange={(event) => setCourseId(event.target.value)}>
            <option value="all">All courses</option>
            {selectedCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Type
          <select value={eventType} onChange={(event) => setEventType(event.target.value as typeof eventType)}>
            <option value="all">All types</option>
            <option value="assignment">Assignments</option>
            <option value="lecture">Lectures</option>
            <option value="exam">Exams</option>
          </select>
        </label>
        <label>
          Range
          <select value={timeRange} onChange={(event) => setTimeRange(event.target.value as typeof timeRange)}>
            <option value="upcoming">Upcoming</option>
            <option value="all">All events</option>
          </select>
        </label>
      </div>
      <div className="agenda">
        {events.map((event) => (
          <article key={event.id} className="agenda-item">
            <time>{formatDate(event.startsAt)}</time>
            <div>
              <h2>{event.title}</h2>
              <p>
                {event.courseTitle} · {event.status}
              </p>
            </div>
          </article>
        ))}
        {events.length === 0 && <p className="empty">No events match the selected filters.</p>}
      </div>
    </div>
  )
}

function CourseDetail({ loadedCourses }: { loadedCourses: LoadedCourse[] }) {
  const params = useParams()
  const path = coursePathFromRouteParams(params)
  const course = path ? findCourse(loadedCourses, path) : undefined
  const [tab, setTab] = useState<'materials' | 'assignments' | 'lectures' | 'exams'>('materials')
  const [nowTime] = useState(() => Date.now())

  if (!course) {
    return (
      <div className="page">
        <PageHeader title="Course not found" subtitle="The requested Course Path is not available." />
      </div>
    )
  }

  const view = deriveCourseDetailView(course, nowTime)

  return (
    <div className="page">
      <PageHeader title={course.title} subtitle={course.professors.join(', ')} />
      <div className="tabs" role="tablist">
        {(['materials', 'assignments', 'lectures', 'exams'] as const).map((item) => (
          <button key={item} type="button" className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>
            {item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>
      {tab === 'materials' && <MaterialsTab view={view} />}
      {tab === 'assignments' && <AssignmentsTab view={view} />}
      {tab === 'lectures' && <LecturesTab view={view} />}
      {tab === 'exams' && <ExamsTab view={view} />}
      <GradeBreakdown view={view} />
    </div>
  )
}

function MaterialsTab({ view }: { view: CourseDetailView }) {
  return (
    <div className="detail-list">
      {view.materialGroups.map((group) => (
        <section key={group.type}>
          <h2>{group.label}</h2>
          {group.materials.map((material) => (
            <a key={material.id} href={material.url} target="_blank" className="list-row">
              {material.title}
            </a>
          ))}
          {group.materials.length === 0 && <p className="empty">No materials.</p>}
        </section>
      ))}
    </div>
  )
}

function AssignmentsTab({ view }: { view: CourseDetailView }) {
  return (
    <div className="detail-list">
      {view.assignments.map((assignment) => (
        <article key={assignment.id} className="list-row stacked">
          <h2>{assignment.title}</h2>
          <p>{assignment.description}</p>
          <p>
            Due {formatDate(assignment.dueAt)} · {assignment.status}
          </p>
          <p>{assignment.submissionUrl}</p>
          {assignment.gradeWeight !== undefined && <p>{assignment.gradeWeight}% Grade Weight</p>}
          <LinkedMaterials materials={assignment.materials} />
        </article>
      ))}
    </div>
  )
}

function LecturesTab({ view }: { view: CourseDetailView }) {
  return (
    <div className="detail-list">
      {view.courseSessions.map((session) => (
        <article key={session.id} className="list-row stacked">
          <h2>{session.title}</h2>
          <p>
            {formatDate(session.startsAt)} to {formatTime(session.endsAt)}
          </p>
          <p>
            {session.location} · {session.status}
          </p>
        </article>
      ))}
    </div>
  )
}

function ExamsTab({ view }: { view: CourseDetailView }) {
  return (
    <div className="detail-list">
      {view.exams.map((exam) => (
        <article key={exam.id} className="list-row stacked">
          <h2>{exam.title}</h2>
          <p>{exam.startsAt ? formatDate(exam.startsAt) : 'Date to be announced'}</p>
          {exam.gradeWeight !== undefined && <p>{exam.gradeWeight}% Grade Weight</p>}
          <LinkedMaterials materials={exam.materials} />
        </article>
      ))}
    </div>
  )
}

function GradeBreakdown({ view }: { view: CourseDetailView }) {
  return (
    <section className="grade-breakdown">
      <h2>Grade Breakdown</h2>
      {view.gradeBreakdown.items.map((item) => (
        <p key={item.title}>
          {item.title}: {item.weight}%
        </p>
      ))}
      <strong>{view.gradeBreakdown.total}% known{view.gradeBreakdown.incomplete ? ' · incomplete' : ''}</strong>
    </section>
  )
}

function LinkedMaterials({ materials }: { materials: CourseDetailView['assignments'][number]['materials'] }) {
  if (materials.length === 0) return null
  return (
    <p>
      Materials:{' '}
      {materials.map((material) => (
        <a key={material.id} href={material.url} target="_blank">
          {material.title}
        </a>
      ))}
    </p>
  )
}

type SchemaField = {
  name: string
  type: string
  required: boolean
  description: string
  example: string
}

const contributionSchemas: Record<ContributionType, SchemaField[]> = {
  'add-material': [
    { name: 'id', type: 'string', required: true, description: 'Unique lowercase identifier (e.g. "lecture-1-slides").', example: '"lecture-1-slides"' },
    { name: 'type', type: 'string', required: true, description: 'Type of resource: "course", "seminar", "lab", "assignment", "exam", "other".', example: '"course"' },
    { name: 'title', type: 'string', required: true, description: 'Display name of the resource.', example: '"Lecture 1 Slides"' },
    { name: 'url', type: 'string', required: true, description: 'Full URL to the resource files.', example: '"https://example.edu/slides1.pdf"' },
    { name: 'addedAt', type: 'string', required: false, description: 'Optional ISO 8601 date-time string.', example: '"2026-06-30T11:23:45.000Z"' }
  ],
  'add-assignment-deadline': [
    { name: 'id', type: 'string', required: true, description: 'Unique lowercase identifier (e.g. "assignment-1").', example: '"assignment-1"' },
    { name: 'title', type: 'string', required: true, description: 'Display title of the assignment.', example: '"Homework 1"' },
    { name: 'description', type: 'string', required: false, description: 'Optional detailed description/instructions.', example: '"Complete exercises 1-5."' },
    { name: 'dueAt', type: 'string', required: true, description: 'Due date and time in ISO 8601 format.', example: '"2026-11-01T21:59:00.000Z"' },
    { name: 'submissionUrl', type: 'string', required: false, description: 'Optional URL to submit/upload the work.', example: '"https://teams.microsoft.com/..."' },
    { name: 'gradeWeight', type: 'number', required: false, description: 'Optional percentage grade weight (0-100).', example: '10' },
    { name: 'materialIds', type: 'string[]', required: false, description: 'Optional array of material IDs linked to this assignment.', example: '["assignment-1-details"]' },
    { name: 'addedAt', type: 'string', required: false, description: 'Optional ISO date-time string.', example: '"2026-06-30T11:23:45.000Z"' }
  ],
  'add-exam': [
    { name: 'id', type: 'string', required: true, description: 'Unique lowercase identifier (e.g. "midterm").', example: '"midterm"' },
    { name: 'title', type: 'string', required: true, description: 'Exam name.', example: '"Midterm Exam"' },
    { name: 'startsAt', type: 'string', required: false, description: 'Optional exam date and time in ISO 8601 format.', example: '"2026-12-15T09:00:00.000Z"' },
    { name: 'gradeWeight', type: 'number', required: false, description: 'Optional percentage grade weight (0-100).', example: '30' },
    { name: 'materialIds', type: 'string[]', required: false, description: 'Optional array of material IDs linked to this exam.', example: '["midterm-sample-solutions"]' },
    { name: 'addedAt', type: 'string', required: false, description: 'Optional ISO date-time string.', example: '"2026-06-30T11:23:45.000Z"' }
  ],
  'add-course-session': [
    { name: 'id', type: 'string', required: true, description: 'Unique lowercase identifier (e.g. "lecture-1").', example: '"lecture-1"' },
    { name: 'title', type: 'string', required: true, description: 'Lecture/seminar title.', example: '"Introduction to Algorithms"' },
    { name: 'startsAt', type: 'string', required: true, description: 'Session start date and time in ISO 8601.', example: '"2026-10-05T08:00:00.000Z"' },
    { name: 'endsAt', type: 'string', required: true, description: 'Session end date and time in ISO 8601.', example: '"2026-10-05T10:00:00.000Z"' },
    { name: 'location', type: 'string', required: false, description: 'Optional room, building, or link.', example: '"Room 301"' },
    { name: 'status', type: 'string', required: true, description: 'Status of session: "scheduled" or "cancelled".', example: '"scheduled"' },
    { name: 'addedAt', type: 'string', required: false, description: 'Optional ISO date-time string.', example: '"2026-06-30T11:23:45.000Z"' }
  ],
  'edit-course-metadata': [
    { name: 'title', type: 'string', required: false, description: 'Optional new course title.', example: '"Algorithms & Data Structures"' },
    { name: 'professors', type: 'string[]', required: false, description: 'Optional updated list of professor names.', example: '["Dr. Jane Doe", "Prof. Smith"]' },
    { name: 'description', type: 'string', required: false, description: 'Optional updated course description.', example: '"An intro to complexity and structures."' }
  ],
  'add-new-course': [
    { name: 'id', type: 'string', required: true, description: 'Unique lowercase course identifier (e.g. "discrete-math").', example: '"discrete-math"' },
    { name: 'title', type: 'string', required: true, description: 'Full title of the new course.', example: '"Discrete Mathematics"' },
    { name: 'professors', type: 'string[]', required: true, description: 'List of professor names.', example: '["Prof. John Doe"]' },
    { name: 'description', type: 'string', required: false, description: 'Optional course description.', example: '"Introduction to logic, sets, and graphs."' },
    { name: 'materials', type: 'array', required: true, description: 'Must be empty array [].', example: '[]' },
    { name: 'assignmentDeadlines', type: 'array', required: true, description: 'Must be empty array [].', example: '[]' },
    { name: 'courseSessions', type: 'array', required: true, description: 'Must be empty array [].', example: '[]' },
    { name: 'exams', type: 'array', required: true, description: 'Must be empty array [].', example: '[]' }
  ]
}

function Contribute({
  context,
  onContextChange,
  loadedCourses,
}: {
  context: ContextSelection
  onContextChange: (context: ContextSelection) => void
  loadedCourses: LoadedCourse[]
}) {
  const selectedCourses = selectedContextCourses(loadedCourses, context)
  const [mode, setMode] = useState<'issue' | 'pull-request'>('issue')
  const [type, setType] = useState<ContributionType>('add-material')
  const [courseId, setCourseId] = useState(selectedCourses[0]?.id ?? '')
  const [payloadText, setPayloadText] = useState(samplePayload(type))
  const [showSchema, setShowSchema] = useState(false)
  const path = { ...context, courseId: type === 'add-new-course' ? 'new-course' : courseId }
  const result = prepareContribution({
    draft: { type, mode, path, payloadText },
    repository: { catalog, courses: loadedCourses },
  })

  // Ensure courseId is updated if the selectedCourses list changes and the current courseId is no longer available
  useEffect(() => {
    if (type !== 'add-new-course' && selectedCourses.length > 0) {
      if (!selectedCourses.some(c => c.id === courseId)) {
        Promise.resolve().then(() => {
          setCourseId(selectedCourses[0].id)
        })
      }
    }
  }, [selectedCourses, courseId, type])

  function changeType(nextType: ContributionType) {
    setType(nextType)
    setPayloadText(samplePayload(nextType))
  }

  return (
    <div className="page contribute">
      <PageHeader title="Contribute" subtitle="Create one maintainer-reviewed Contribution at a time" />
      <ContextSelectors context={context} onContextChange={onContextChange} />
      <div className="filters">
        <label>
          Mode
          <select value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}>
            <option value="issue">GitHub issue</option>
            <option value="pull-request">Pull request assist</option>
          </select>
        </label>
        <label>
          Contribution type
          <select value={type} onChange={(event) => changeType(event.target.value as ContributionType)}>
            <option value="add-material">Add Material</option>
            <option value="add-assignment-deadline">Add Assignment Deadline</option>
            <option value="add-exam">Add Exam</option>
            <option value="add-course-session">Add Course Session</option>
            <option value="edit-course-metadata">Edit Course metadata</option>
            <option value="add-new-course">Add new Course</option>
          </select>
        </label>
        {type !== 'add-new-course' && (
          <label>
            Course
            <select value={courseId} onChange={(event) => setCourseId(event.target.value)}>
              {selectedCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="contribute-workspace">
        <div className="contribute-form-column">
          <div className="textarea-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <span className="path-line" style={{ margin: 0 }}>Target: {path.academicYearId}/{path.studyYearId}/{path.semesterId}/{path.courseId}</span>
            <button
              type="button"
              className="schema-toggle-btn"
              onClick={() => setShowSchema(!showSchema)}
              aria-expanded={showSchema}
              style={{
                padding: '4px 10px',
                fontSize: '13px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📖 View Schema Guide
            </button>
          </div>

          <div className="textarea-container">
            <textarea value={payloadText} onChange={(event) => setPayloadText(event.target.value)} aria-label="Contribution JSON" />
          </div>

          <ValidationPanel result={result} />
        </div>

        <div className="contribute-output-column">
          {result.valid ? (
            <section className="generated-output" style={{ marginTop: 0 }}>
              {mode === 'issue' ? (
                <>
                  <h2>Generated Issue</h2>
                  <a href={result.issueUrl} target="_blank" className="action-btn" style={{ display: 'inline-block', marginBottom: '12px', color: 'var(--primary)', fontWeight: '600' }}>Open prefilled GitHub issue</a>
                  <pre>{result.issueBody}</pre>
                </>
              ) : (
                <>
                  <h2>Pull Request Assist</h2>
                  <p style={{ marginBottom: '12px' }}>Static UniHub can prepare PR content and GitHub edit links; it cannot create a pull request in one click.</p>
                  <a href={result.githubLink} target="_blank" className="action-btn" style={{ display: 'inline-block', marginBottom: '12px', color: 'var(--primary)', fontWeight: '600' }}>Open GitHub edit/create link</a>
                  <pre>{result.prTitle}{'\n\n'}{result.prBody}</pre>
                </>
              )}
            </section>
          ) : (
            <div className="generated-output-placeholder" style={{ padding: '24px', border: '1px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>Fix validation errors on the left to generate GitHub contribution content.</p>
            </div>
          )}
        </div>
      </div>

      {showSchema && (
        <>
          <div className="schema-modal-backdrop" onClick={() => setShowSchema(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }} />
          <div className="schema-modal" style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            zIndex: 1001,
            width: '90vw',
            maxWidth: '680px',
            maxHeight: '80vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div className="schema-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>Expected Schema: {type}</h3>
              <button type="button" className="close-btn" onClick={() => setShowSchema(false)} style={{ border: 0, background: 'transparent', padding: '0 6px', fontSize: '24px', color: 'var(--text-muted)', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            <div className="schema-modal-body">
              <table className="schema-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {contributionSchemas[type].map((field) => (
                    <tr key={field.name}>
                      <td><code>{field.name}</code></td>
                      <td><code>{field.type}</code></td>
                      <td>{field.required ? '✅ Yes' : 'No'}</td>
                      <td>
                        {field.description}
                        <br />
                        <small style={{ color: 'var(--text-muted)' }}>Example: <code>{field.example}</code></small>
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

function ContextSelectors({ context, onContextChange }: { context: ContextSelection; onContextChange: (context: ContextSelection) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const academicYear = hierarchy.academicYears.find((item) => item.id === context.academicYearId) ?? hierarchy.academicYears[0]
  const studyYear = academicYear.studyYears.find((item) => item.id === context.studyYearId) ?? academicYear.studyYears[0]
  const semester = studyYear.semesters.find((item) => item.id === context.semesterId) ?? studyYear.semesters[0]

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <div className="context-picker-container">
      <button
        type="button"
        className="context-picker-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="picker-icon">📅</span>
        <span className="picker-label">
          {academicYear.label} · {studyYear.label} · {semester.label}
        </span>
        <span className="picker-arrow">{isOpen ? ' ▲' : ' ▼'}</span>
      </button>

      {isOpen && (
        <>
          <div className="context-picker-backdrop" onClick={() => setIsOpen(false)} />
          <div className="context-picker-dropdown">
            <div className="context-picker-header">
              <h3>Select Academic Context</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close academic context picker"
              >
                ×
              </button>
            </div>
            <div className="context-selectors-fields">
              <label>
                Academic Year
                <select
                  value={context.academicYearId}
                  onChange={(event) => {
                    const nextYear = hierarchy.academicYears.find((item) => item.id === event.target.value) || hierarchy.academicYears[0]
                    const nextStudyYear = nextYear.studyYears[0]
                    const nextSemester = nextStudyYear?.semesters[0]
                    onContextChange({
                      academicYearId: nextYear.id,
                      studyYearId: nextStudyYear?.id || '',
                      semesterId: nextSemester?.id || '',
                    })
                  }}
                >
                  {hierarchy.academicYears.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Study Year
                <select
                  value={context.studyYearId}
                  onChange={(event) => {
                    const nextStudyYear = academicYear.studyYears.find((item) => item.id === event.target.value) || academicYear.studyYears[0]
                    const nextSemester = nextStudyYear.semesters[0]
                    onContextChange({
                      ...context,
                      studyYearId: nextStudyYear.id,
                      semesterId: nextSemester?.id || '',
                    })
                  }}
                >
                  {academicYear.studyYears.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Semester
                <select
                  value={context.semesterId}
                  onChange={(event) => {
                    onContextChange({
                      ...context,
                      semesterId: event.target.value,
                    })
                  }}
                >
                  {studyYear.semesters.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ActivityPanel({ activity }: { activity: ReturnType<typeof deriveActivity> }) {
  return (
    <aside className="activity-panel">
      <h2>Activity</h2>
      {activity.map((item) => (
        <article key={item.id}>
          <time>{formatDate(item.addedAt)}</time>
          <p>{item.text}</p>
        </article>
      ))}
    </aside>
  )
}

function ValidationPanel({ result }: { result: PreparedContribution }) {
  const hasErrors = result.errors.length > 0
  const hasWarnings = result.warnings.length > 0

  if (!hasErrors && !hasWarnings) {
    return null
  }

  return (
    <section className={hasErrors ? 'validation blocked' : 'validation ok'}>
      {hasErrors && (
        <>
          <h2>Validation Blocked</h2>
          {result.errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </>
      )}
      {hasWarnings && (
        <>
          <h2 style={{ marginTop: hasErrors ? '12px' : 0 }}>Warnings</h2>
          {result.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </>
      )}
    </section>
  )
}

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  )
}

function usePersistentContext() {
  const [context, setContext] = useState<ContextSelection>(() => {
    const routePath = parseCourseRoute(window.location.hash)
    if (routePath) {
      return {
        academicYearId: routePath.academicYearId,
        studyYearId: routePath.studyYearId,
        semesterId: routePath.semesterId,
      }
    }
    const saved = localStorage.getItem('unihub-context')
    return saved ? { ...defaultContext, ...JSON.parse(saved) } : defaultContext
  })

  function updateContext(nextContext: ContextSelection) {
    setContext(nextContext)
    localStorage.setItem('unihub-context', JSON.stringify(nextContext))
  }

  useEffect(() => {
    const handleHashChange = () => {
      const routePath = parseCourseRoute(window.location.hash)
      if (routePath) {
        updateContext({
          academicYearId: routePath.academicYearId,
          studyYearId: routePath.studyYearId,
          semesterId: routePath.semesterId,
        })
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return [context, updateContext] as const
}

function samplePayload(type: ContributionType) {
  const samples: Record<ContributionType, unknown> = {
    'add-material': { id: 'new-material', type: 'course', title: 'New Material', url: 'https://example.edu/material', addedAt: new Date().toISOString() },
    'add-assignment-deadline': { id: 'new-assignment', title: 'New Assignment', dueAt: '2026-11-01T21:59:00.000Z', materialIds: [], gradeWeight: 10 },
    'add-exam': { id: 'new-exam', title: 'New Exam', materialIds: [], gradeWeight: 20 },
    'add-course-session': { id: 'new-session', title: 'New Lecture', startsAt: '2026-11-03T08:00:00.000Z', endsAt: '2026-11-03T10:00:00.000Z', status: 'scheduled' },
    'edit-course-metadata': { title: 'Updated Course Title', professors: ['Dr. Updated Professor'] },
    'add-new-course': { id: 'new-course', title: 'New Course', professors: ['Dr. New Professor'], materials: [], assignmentDeadlines: [], courseSessions: [], exams: [] },
  }
  return JSON.stringify(samples[type], null, 2)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en', { timeStyle: 'short' }).format(new Date(value))
}

export default App
