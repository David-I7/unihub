import { useState } from 'react'
import { AcademicContextPicker } from '@/components/AcademicContextPicker'
import { PageHeader } from '@/components/PageHeader'
import { compactFilterLabelClass, compactFilterSelectClass, headingClass, mutedTextClass, pageClass, panelClass } from '@/components/styles'
import { deriveCalendarEvents, selectedContextCourses, type Hierarchy, type LoadedCourse } from '@/domain'
import { formatDate } from '@/lib/format'
import type { ContextSelection } from '@/app/academicContext'

export function CalendarPage({
  context,
  onContextChange,
  loadedCourses,
  hierarchy,
}: {
  context: ContextSelection
  onContextChange: (context: ContextSelection) => void
  loadedCourses: LoadedCourse[]
  hierarchy: Hierarchy
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
    <div className={pageClass}>
      <PageHeader title="Calendar" subtitle="Agenda derived from deadlines, lectures, and exams" />
      <AcademicContextPicker context={context} onContextChange={onContextChange} hierarchy={hierarchy} />
      <div className="mb-4.5 flex flex-wrap items-center gap-4 max-[820px]:grid max-[820px]:max-w-[calc(100vw-40px)] max-[820px]:grid-cols-1 max-[820px]:gap-2">
        <label className={compactFilterLabelClass}>
          Course
          <select className={compactFilterSelectClass} value={courseId} onChange={(event) => setCourseId(event.target.value)}>
            <option value="all">All courses</option>
            {selectedCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </label>
        <label className={compactFilterLabelClass}>
          Type
          <select className={compactFilterSelectClass} value={eventType} onChange={(event) => setEventType(event.target.value as typeof eventType)}>
            <option value="all">All types</option>
            <option value="assignment">Assignments</option>
            <option value="lecture">Lectures</option>
            <option value="exam">Exams</option>
          </select>
        </label>
        <label className={compactFilterLabelClass}>
          Range
          <select className={compactFilterSelectClass} value={timeRange} onChange={(event) => setTimeRange(event.target.value as typeof timeRange)}>
            <option value="upcoming">Upcoming</option>
            <option value="all">All events</option>
          </select>
        </label>
      </div>
      <div className="grid gap-3">
        {events.map((event) => (
          <article key={event.id} className={`${panelClass} grid grid-cols-[150px_1fr] items-start gap-4 px-4 py-3.5 max-[820px]:grid-cols-1 max-[820px]:gap-1`}>
            <time className="mb-1 block text-xs text-[var(--color-time)]">{formatDate(event.startsAt)}</time>
            <div>
              <h2 className={headingClass}>{event.title}</h2>
              <p className={`m-0 ${mutedTextClass}`}>
                {event.courseTitle} / {event.status}
              </p>
            </div>
          </article>
        ))}
        {events.length === 0 && <p className={mutedTextClass}>No events match the selected filters.</p>}
      </div>
    </div>
  )
}
