import { deriveActivity } from '@/domain'
import { formatDate } from '@/lib/format'
import { headingClass, mutedTextClass, panelClass } from './styles'

export function ActivityPanel({ activity }: { activity: ReturnType<typeof deriveActivity> }) {
  return (
    <aside className={`${panelClass} self-start p-4 max-[820px]:mt-4.5`}>
      <h2 className={headingClass}>Activity</h2>
      {activity.map((item) => (
        <article key={item.id} className="border-t border-[var(--border-color)] py-3">
          <time className="mb-1 block text-xs text-[var(--color-time)]">{formatDate(item.occurredAt)}</time>
          <p className={`m-0 ${mutedTextClass}`}>{item.text}</p>
        </article>
      ))}
    </aside>
  )
}
