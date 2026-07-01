import { useState } from 'react'
import { AcademicContextPicker } from '@/components/AcademicContextPicker'
import { PageHeader } from '@/components/PageHeader'
import { Select } from '@/components/ui/select'
import { compactFilterLabelClass, headingClass, mutedTextClass, pageClass, panelClass } from '@/components/styles'
import { deriveCalendarEvents, selectedContextCourses, type Hierarchy, type LoadedCourse } from '@/domain'
import { formatDate } from '@/lib/format'
import type { ContextSelection } from '@/app/academicContext'
import { eventStatusTone, statusChipClass } from '@/components/statusStyles'

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
          <Select
            selectSize="compact"
            className="min-w-72 max-[820px]:w-full max-[820px]:max-w-full"
            value={courseId}
            options={[{ value: 'all', label: 'All courses' }, ...selectedCourses.map((course) => ({ value: course.id, label: course.title }))]}
            onValueChange={setCourseId}
          />
        </label>
        <label className={compactFilterLabelClass}>
          Type
          <Select
            selectSize="compact"
            value={eventType}
            options={[
              { value: 'all', label: 'All types' },
              { value: 'assignment', label: 'Assignments' },
              { value: 'lecture', label: 'Lectures' },
              { value: 'exam', label: 'Exams' },
            ]}
            onValueChange={(value) => setEventType(value as typeof eventType)}
          />
        </label>
        <label className={compactFilterLabelClass}>
          Range
          <Select
            selectSize="compact"
            value={timeRange}
            options={[
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'all', label: 'All events' },
            ]}
            onValueChange={(value) => setTimeRange(value as typeof timeRange)}
          />
        </label>
      </div>
      <div className="grid gap-3">
        {events.map((event) => (
          <article key={event.id} className={`${panelClass} grid grid-cols-[150px_1fr] items-start gap-4 px-4 py-3.5 max-[820px]:grid-cols-1 max-[820px]:gap-1`}>
            <time className="mb-1 block text-xs text-[var(--color-time)]">{formatDate(event.startsAt)}</time>
            <div>
              <h2 className={headingClass}>{event.title}</h2>
              <p className={`m-0 mb-2 ${mutedTextClass}`}>{event.courseTitle}</p>
              <span className={statusChipClass(eventStatusTone(event.status))}>{event.status}</span>
            </div>
          </article>
        ))}
        {events.length === 0 && <p className={mutedTextClass}>No events match the selected filters.</p>}
      </div>
    </div>
  )
}
