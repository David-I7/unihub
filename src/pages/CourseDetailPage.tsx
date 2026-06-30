import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { headingClass, mutedTextClass, pageClass, panelClass } from '@/components/styles'
import { cn } from '@/lib/utils'
import {
  coursePathFromRouteParams,
  deriveCourseDetailView,
  findCourse,
  type CourseDetailView,
  type LoadedCourse,
} from '@/domain'
import { formatDate, formatTime } from '@/lib/format'

type CourseDetailTab = 'materials' | 'assignments' | 'lectures' | 'exams'

export function CourseDetailPage({ loadedCourses }: { loadedCourses: LoadedCourse[] }) {
  const params = useParams()
  const path = coursePathFromRouteParams(params)
  const course = path ? findCourse(loadedCourses, path) : undefined
  const [tab, setTab] = useState<CourseDetailTab>('materials')
  const [nowTime] = useState(() => Date.now())

  if (!course) {
    return (
      <div className={pageClass}>
        <PageHeader title="Course not found" subtitle="The requested Course Path is not available." />
      </div>
    )
  }

  const view = deriveCourseDetailView(course, nowTime)

  return (
    <div className={pageClass}>
      <PageHeader title={course.title} subtitle={course.professors.join(', ')} />
      <div className="mb-4 flex gap-1.5 border-b border-[var(--border-color)]" role="tablist">
        {(['materials', 'assignments', 'lectures', 'exams'] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={cn(
              'border-0 border-b-[3px] border-transparent bg-transparent px-3 py-2.5 font-[inherit] text-[var(--text-tab-inactive)]',
              tab === item && 'border-[var(--primary)] font-bold text-[var(--text-main)]',
            )}
            onClick={() => setTab(item)}
          >
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
    <div className="grid gap-3">
      {view.materialGroups.map((group) => (
        <section key={group.type} className="grid gap-2">
          <h2 className={headingClass}>{group.label}</h2>
          {group.materials.map((material) => (
            <a key={material.id} href={material.url} target="_blank" className={`${panelClass} px-4 py-3.5 text-[var(--primary)]`}>
              {material.title}
            </a>
          ))}
          {group.materials.length === 0 && <p className={mutedTextClass}>No materials.</p>}
        </section>
      ))}
    </div>
  )
}

function AssignmentsTab({ view }: { view: CourseDetailView }) {
  return (
    <div className="grid gap-3">
      {view.assignments.map((assignment) => (
        <article key={assignment.id} className={`${panelClass} grid gap-1.5 px-4 py-3.5`}>
          <h2 className={headingClass}>{assignment.title}</h2>
          <p className={`m-0 ${mutedTextClass}`}>{assignment.description}</p>
          <p className={`m-0 ${mutedTextClass}`}>
            Due {formatDate(assignment.dueAt)} / {assignment.status}
          </p>
          <p className={`m-0 ${mutedTextClass}`}>{assignment.submissionUrl}</p>
          {assignment.gradeWeight !== undefined && <p className={`m-0 ${mutedTextClass}`}>{assignment.gradeWeight}% Grade Weight</p>}
          <LinkedMaterials materials={assignment.materials} />
        </article>
      ))}
    </div>
  )
}

function LecturesTab({ view }: { view: CourseDetailView }) {
  return (
    <div className="grid gap-3">
      {view.courseSessions.map((session) => (
        <article key={session.id} className={`${panelClass} grid gap-1.5 px-4 py-3.5`}>
          <h2 className={headingClass}>{session.title}</h2>
          <p className={`m-0 ${mutedTextClass}`}>
            {formatDate(session.startsAt)} to {formatTime(session.endsAt)}
          </p>
          <p className={`m-0 ${mutedTextClass}`}>
            {session.location} / {session.status}
          </p>
        </article>
      ))}
    </div>
  )
}

function ExamsTab({ view }: { view: CourseDetailView }) {
  return (
    <div className="grid gap-3">
      {view.exams.map((exam) => (
        <article key={exam.id} className={`${panelClass} grid gap-1.5 px-4 py-3.5`}>
          <h2 className={headingClass}>{exam.title}</h2>
          <p className={`m-0 ${mutedTextClass}`}>{exam.startsAt ? formatDate(exam.startsAt) : 'Date to be announced'}</p>
          {exam.gradeWeight !== undefined && <p className={`m-0 ${mutedTextClass}`}>{exam.gradeWeight}% Grade Weight</p>}
          <LinkedMaterials materials={exam.materials} />
        </article>
      ))}
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
    <p className={`m-0 ${mutedTextClass}`}>
      Materials:{' '}
      {materials.map((material) => (
        <a key={material.id} href={material.url} target="_blank" className="text-[var(--primary)]">
          {material.title}
        </a>
      ))}
    </p>
  )
}
