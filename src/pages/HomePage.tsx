import { Link } from 'react-router-dom'
import { AcademicContextPicker } from '@/components/AcademicContextPicker'
import { ActivityPanel } from '@/components/ActivityPanel'
import { PageHeader } from '@/components/PageHeader'
import { courseAccent, courseInitials } from '@/components/courseVisuals'
import { headingClass, mutedTextClass, pageClass, panelClass } from '@/components/styles'
import { courseRoutePath, deriveActivity, selectedContextCourses, type Hierarchy, type LoadedCourse } from '@/domain'
import type { ContextSelection } from '@/app/academicContext'

export function HomePage({
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
  const selectedCourses = selectedContextCourses(loadedCourses, context)
  const activity = deriveActivity(loadedCourses, context)

  return (
    <div className={`${pageClass} grid grid-cols-[minmax(0,1fr)_340px] gap-6 max-[820px]:block`}>
      <section className="min-w-0">
        <PageHeader title="Home" subtitle="Selected course context" />
        <AcademicContextPicker context={context} onContextChange={onContextChange} hierarchy={hierarchy} />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5" aria-label="Courses">
          {selectedCourses.map((course) => {
            const accent = courseAccent(course.path)
            return (
              <Link key={course.id} className={`${panelClass} block min-h-28 p-4 text-inherit no-underline hover:border-[var(--primary)]`} to={courseRoutePath(course.path)}>
                <div className="flex items-start gap-3">
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border text-sm font-bold"
                    style={{
                      backgroundColor: accent.bg,
                      borderColor: accent.ring,
                      color: accent.fg,
                    }}
                    aria-hidden="true"
                  >
                    {courseInitials(course.title)}
                  </span>
                  <span className="min-w-0">
                    <h2 className={headingClass}>{course.title}</h2>
                    <p className={`m-0 ${mutedTextClass}`}>{course.professors.join(', ')}</p>
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
      <ActivityPanel activity={activity} />
    </div>
  )
}
