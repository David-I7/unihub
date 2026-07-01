import { cn } from '@/lib/utils'

export type StatusTone = 'cancelled' | 'completed' | 'scheduled' | 'upcoming' | 'exam' | 'assignment'

const statusToneClass: Record<StatusTone, string> = {
  cancelled: 'border-[var(--status-cancelled-border)] bg-[var(--status-cancelled-bg)] text-[var(--status-cancelled-text)]',
  completed: 'border-[var(--status-completed-border)] bg-[var(--status-completed-bg)] text-[var(--status-completed-text)]',
  scheduled: 'border-[var(--status-scheduled-border)] bg-[var(--status-scheduled-bg)] text-[var(--status-scheduled-text)]',
  upcoming: 'border-[var(--status-upcoming-border)] bg-[var(--status-upcoming-bg)] text-[var(--status-upcoming-text)]',
  exam: 'border-[var(--status-exam-border)] bg-[var(--status-exam-bg)] text-[var(--status-exam-text)]',
  assignment: 'border-[var(--status-assignment-border)] bg-[var(--status-assignment-bg)] text-[var(--status-assignment-text)]',
}

export function statusChipClass(tone: StatusTone, className?: string) {
  return cn(
    'inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold',
    statusToneClass[tone],
    className,
  )
}

export function eventStatusTone(status: string): StatusTone {
  if (status.includes('cancelled')) return 'cancelled'
  if (status.includes('completed')) return 'completed'
  if (status.includes('assignment')) return 'assignment'
  if (status.includes('exam')) return 'exam'
  return 'scheduled'
}
