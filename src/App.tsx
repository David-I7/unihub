import { useState } from 'react'
import { HashRouter, Link, NavLink, Route, Routes, useParams } from 'react-router-dom'
import './App.css'
import {
  type ContributionType,
  type CourseDetailView,
  type PreparedContribution,
  buildHierarchy,
  contributionPayloadFromText,
  coursePathFromRouteParams,
  courseRoutePath,
  deriveCourseDetailView,
  deriveActivity,
  deriveCalendarEvents,
  findCourse,
  loadRepositoryData,
  selectedContextCourses,
} from './domain'

const { catalog, courses } = loadRepositoryData()
const hierarchy = buildHierarchy(catalog, courses)
const defaultContext = {
  academicYearId: hierarchy.academicYears[0].id,
  studyYearId: hierarchy.academicYears[0].studyYears[0].id,
  semesterId: hierarchy.academicYears[0].studyYears[0].semesters[0].id,
}

type ContextSelection = typeof defaultContext

function App() {
  const [context, setContext] = usePersistentContext()

  return (
    <HashRouter>
      <div className="app-shell">
        <Navigation />
        <main className="workspace">
          <Routes>
            <Route path="/" element={<Home context={context} onContextChange={setContext} />} />
            <Route path="/calendar" element={<Calendar context={context} onContextChange={setContext} />} />
            <Route path="/contribute" element={<Contribute context={context} onContextChange={setContext} />} />
            <Route path="/courses/:academicYearId/:studyYearId/:semesterId/:courseId" element={<CourseDetail />} />
          </Routes>
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
      </aside>
      <nav className="bottom-nav" aria-label="Primary">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className="bottom-link">
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}

function Home({ context, onContextChange }: { context: ContextSelection; onContextChange: (context: ContextSelection) => void }) {
  const selectedCourses = selectedContextCourses(courses, context)
  const activity = deriveActivity(courses, context)

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

function Calendar({ context, onContextChange }: { context: ContextSelection; onContextChange: (context: ContextSelection) => void }) {
  const [courseId, setCourseId] = useState('all')
  const [eventType, setEventType] = useState<'all' | 'assignment' | 'exam' | 'lecture'>('all')
  const [timeRange, setTimeRange] = useState<'upcoming' | 'all'>('upcoming')
  const selectedCourses = selectedContextCourses(courses, context)
  const events = deriveCalendarEvents({
    courses,
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

function CourseDetail() {
  const params = useParams()
  const path = coursePathFromRouteParams(params)
  const course = path ? findCourse(courses, path) : undefined
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

function Contribute({ context, onContextChange }: { context: ContextSelection; onContextChange: (context: ContextSelection) => void }) {
  const selectedCourses = selectedContextCourses(courses, context)
  const [mode, setMode] = useState<'issue' | 'pull-request'>('issue')
  const [type, setType] = useState<ContributionType>('add-material')
  const [courseId, setCourseId] = useState(selectedCourses[0]?.id ?? '')
  const [payloadText, setPayloadText] = useState(samplePayload(type))
  const path = { ...context, courseId: type === 'add-new-course' ? 'new-course' : courseId }
  const result = contributionPayloadFromText({ type, mode, path, payloadText })

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
      <p className="path-line">Target Course Path: {path.academicYearId}/{path.studyYearId}/{path.semesterId}/{path.courseId}</p>
      <textarea value={payloadText} onChange={(event) => setPayloadText(event.target.value)} aria-label="Contribution JSON" />
      <ValidationPanel result={result} />
      {result.valid && (
        <section className="generated-output">
          {mode === 'issue' ? (
            <>
              <h2>Generated Issue</h2>
              <a href={result.issueUrl} target="_blank">Open prefilled GitHub issue</a>
              <pre>{result.issueBody}</pre>
            </>
          ) : (
            <>
              <h2>Pull Request Assist</h2>
              <p>Static UniHub can prepare PR content and GitHub edit links; it cannot create a pull request in one click.</p>
              <a href={result.githubLink} target="_blank">Open GitHub edit/create link</a>
              <pre>{result.prTitle}{'\n\n'}{result.prBody}</pre>
            </>
          )}
        </section>
      )}
    </div>
  )
}

function ContextSelectors({ context, onContextChange }: { context: ContextSelection; onContextChange: (context: ContextSelection) => void }) {
  const academicYear = hierarchy.academicYears.find((item) => item.id === context.academicYearId) ?? hierarchy.academicYears[0]
  const studyYear = academicYear.studyYears.find((item) => item.id === context.studyYearId) ?? academicYear.studyYears[0]

  return (
    <div className="context-selectors">
      <label>
        Academic Year
        <select value={context.academicYearId} onChange={(event) => onContextChange({ ...defaultContext, academicYearId: event.target.value })}>
          {hierarchy.academicYears.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Study Year
        <select value={context.studyYearId} onChange={(event) => onContextChange({ ...context, studyYearId: event.target.value, semesterId: studyYear.semesters[0].id })}>
          {academicYear.studyYears.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Semester
        <select value={context.semesterId} onChange={(event) => onContextChange({ ...context, semesterId: event.target.value })}>
          {studyYear.semesters.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
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
  return (
    <section className={result.valid ? 'validation ok' : 'validation blocked'}>
      <h2>{result.valid ? 'Validation passed' : 'Validation blocked'}</h2>
      {result.errors.map((error) => (
        <p key={error}>{error}</p>
      ))}
      {result.warnings.map((warning) => (
        <p key={warning}>{warning}</p>
      ))}
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
    const saved = localStorage.getItem('unihub-context')
    return saved ? { ...defaultContext, ...JSON.parse(saved) } : defaultContext
  })

  function updateContext(nextContext: ContextSelection) {
    setContext(nextContext)
    localStorage.setItem('unihub-context', JSON.stringify(nextContext))
  }

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
