import { Award, BookOpen, CalendarClock, ClipboardCheck, Pencil, Plus, XCircle } from 'lucide-react'
import { deriveActivity } from '@/domain'
import { formatDate } from '@/lib/format'
import { headingClass, mutedTextClass, panelClass } from './styles'
import { statusChipClass, type StatusTone } from './statusStyles'

export function ActivityPanel({ activity }: { activity: ReturnType<typeof deriveActivity> }) {
  return (
    <aside className={`${panelClass} self-start p-4 max-[820px]:mt-4.5`}>
      <h2 className={headingClass}>Activity</h2>
      {activity.map((item) => (
        <article key={item.id} className="flex gap-3 border-t border-[var(--border-color)] py-3">
          <span className={`mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg ${activityTypeClass(item.type)}`}>
            <ActivityTypeIcon type={item.type} />
          </span>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <time className="text-xs text-[var(--color-time)]">{formatDate(item.occurredAt)}</time>
              <span className={statusChipClass(activityActionTone(item.action))}>
                <ActivityActionIcon action={item.action} />
                {item.action}
              </span>
            </div>
            <p className="m-0 font-semibold text-[var(--text-main)]">{item.title}</p>
            <p className={`m-0 text-sm ${mutedTextClass}`}>{item.courseTitle}</p>
          </div>
        </article>
      ))}
    </aside>
  )
}

function ActivityTypeIcon({ type }: { type: ReturnType<typeof deriveActivity>[number]['type'] }) {
  const icons = {
    material: BookOpen,
    assignment: ClipboardCheck,
    lecture: CalendarClock,
    exam: Award,
  }
  const Icon = icons[type]
  return <Icon aria-hidden="true" size={18} />
}

function ActivityActionIcon({ action }: { action: ReturnType<typeof deriveActivity>[number]['action'] }) {
  const icons = {
    added: Plus,
    updated: Pencil,
    cancelled: XCircle,
  }
  const Icon = icons[action]
  return <Icon aria-hidden="true" size={12} />
}

function activityTypeClass(type: ReturnType<typeof deriveActivity>[number]['type']) {
  return {
    material: 'bg-[var(--status-upcoming-bg)] text-[var(--status-upcoming-text)]',
    assignment: 'bg-[var(--status-assignment-bg)] text-[var(--status-assignment-text)]',
    lecture: 'bg-[var(--status-scheduled-bg)] text-[var(--status-scheduled-text)]',
    exam: 'bg-[var(--status-exam-bg)] text-[var(--status-exam-text)]',
  }[type]
}

function activityActionTone(action: ReturnType<typeof deriveActivity>[number]['action']): StatusTone {
  return action === 'cancelled' ? 'cancelled' : action === 'updated' ? 'upcoming' : 'completed'
}
