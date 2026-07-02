import { Pencil, Plus, XCircle } from 'lucide-react'
import { IconBadge, ItemTypeIcon } from '@/components/IconBadge'
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
          <IconBadge tone={item.type === 'lecture' ? 'lecture' : item.type}>
            <ItemTypeIcon type={item.type} size={18} />
          </IconBadge>
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

function ActivityActionIcon({ action }: { action: ReturnType<typeof deriveActivity>[number]['action'] }) {
  const icons = {
    added: Plus,
    updated: Pencil,
    cancelled: XCircle,
  }
  const Icon = icons[action]
  return <Icon aria-hidden="true" size={12} />
}

function activityActionTone(action: ReturnType<typeof deriveActivity>[number]['action']): StatusTone {
  return action === 'cancelled' ? 'cancelled' : action === 'updated' ? 'upcoming' : 'completed'
}
