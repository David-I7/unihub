import { CalendarDays, ChevronDown, ChevronUp, X } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import type { ContextSelection } from '@/app/academicContext'
import type { Hierarchy } from '@/domain'
import { Select } from '@/components/ui/select'
import { iconButtonClass, labelClass } from './styles'
import { cn } from '@/lib/utils'

export function AcademicContextPicker({
  context,
  onContextChange,
  hierarchy,
}: {
  context: ContextSelection
  onContextChange: (context: ContextSelection) => void
  hierarchy: Hierarchy
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [align, setAlign] = useState<'left' | 'right'>('left')
  const rootRef = useRef<HTMLDivElement>(null)
  const academicYear = hierarchy.academicYears.find((item) => item.id === context.academicYearId) ?? hierarchy.academicYears[0]
  const studyYear = academicYear.studyYears.find((item) => item.id === context.studyYearId) ?? academicYear.studyYears[0]
  const semester = studyYear.semesters.find((item) => item.id === context.semesterId) ?? studyYear.semesters[0]

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !rootRef.current) return
    const updateAlignment = () => {
      if (!rootRef.current) return
      const rect = rootRef.current.getBoundingClientRect()
      const dialogWidth = Math.max(rect.width, 320)
      if (rect.left + dialogWidth > window.innerWidth) {
        setAlign('right')
      } else {
        setAlign('left')
      }
    }
    updateAlignment()
    window.addEventListener('resize', updateAlignment)
    return () => {
      window.removeEventListener('resize', updateAlignment)
    }
  }, [isOpen])

  return (
    <div ref={rootRef} className="relative z-10 mb-4.5 inline-block">
      <button
        type="button"
        className="inline-flex items-center gap-2.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-3.5 py-2 text-sm font-semibold text-[var(--text-main)] shadow-sm transition-colors hover:border-[var(--primary)]"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <CalendarDays aria-hidden="true" size={18} />
        <span>
          {academicYear.label} / {studyYear.label} / {semester.label}
        </span>
        {isOpen ? <ChevronUp aria-hidden="true" size={16} /> : <ChevronDown aria-hidden="true" size={16} />}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[140] bg-transparent max-[820px]:bg-slate-900/45 max-[820px]:backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className={cn(
            "absolute top-full z-[150] mt-1.5 max-[820px]:fixed max-[820px]:inset-0 max-[820px]:z-[150] max-[820px]:mt-0 max-[820px]:grid max-[820px]:place-items-center max-[820px]:p-4 max-[820px]:pointer-events-none",
            align === 'right' ? 'right-0 left-auto' : 'left-0 right-auto'
          )}>
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="academic-context-dialog-title"
              className="grid min-w-80 gap-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-lg max-[820px]:w-full max-[820px]:max-w-md max-[820px]:min-w-0 max-[820px]:pointer-events-auto"
            >
              <div className="mb-1 flex items-center justify-between border-b border-[var(--border-color)] pb-2 max-[820px]:flex hidden">
                <h3 id="academic-context-dialog-title" className="m-0 text-sm font-semibold text-[var(--text-main)]">Select Academic Context</h3>
                <button type="button" className={`${iconButtonClass} p-1`} onClick={() => setIsOpen(false)} aria-label="Close academic context picker">
                  <X aria-hidden="true" size={18} />
                </button>
              </div>
            <div className="grid gap-3">
              <label className={labelClass}>
                Academic Year
                <Select
                  value={context.academicYearId}
                  options={hierarchy.academicYears.map((item) => ({ value: item.id, label: item.label }))}
                  onValueChange={(value) => {
                    const nextYear = hierarchy.academicYears.find((item) => item.id === value) || hierarchy.academicYears[0]
                    const nextStudyYear = nextYear.studyYears[0]
                    const nextSemester = nextStudyYear?.semesters[0]
                    onContextChange({
                      academicYearId: nextYear.id,
                      studyYearId: nextStudyYear?.id || '',
                      semesterId: nextSemester?.id || '',
                    })
                  }}
                />
              </label>
              <label className={labelClass}>
                Study Year
                <Select
                  value={context.studyYearId}
                  options={academicYear.studyYears.map((item) => ({ value: item.id, label: item.label }))}
                  onValueChange={(value) => {
                    const nextStudyYear = academicYear.studyYears.find((item) => item.id === value) || academicYear.studyYears[0]
                    const nextSemester = nextStudyYear.semesters[0]
                    onContextChange({
                      ...context,
                      studyYearId: nextStudyYear.id,
                      semesterId: nextSemester?.id || '',
                    })
                  }}
                />
              </label>
              <label className={labelClass}>
                Semester
                <Select
                  value={context.semesterId}
                  options={studyYear.semesters.map((item) => ({ value: item.id, label: item.label }))}
                  onValueChange={(value) => {
                    onContextChange({
                      ...context,
                      semesterId: value,
                    })
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </>
      )}
    </div>
  )
}
