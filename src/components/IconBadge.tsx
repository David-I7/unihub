import type { ReactNode } from 'react'
import { Award, BookOpen, Clipboard, ClipboardCheck, FileText, FlaskConical, GraduationCap, PlayCircle, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MaterialType } from '@/domain/types'

export type IconTone = 'material' | 'assignment' | 'lecture' | 'exam' | 'cancelled'

export function IconBadge({ tone, children }: { tone: IconTone; children: ReactNode }) {
  const tones = {
    material: 'bg-[var(--status-upcoming-bg)] text-[var(--status-upcoming-text)]',
    assignment: 'bg-[var(--status-assignment-bg)] text-[var(--status-assignment-text)]',
    lecture: 'bg-[var(--status-scheduled-bg)] text-[var(--status-scheduled-text)]',
    exam: 'bg-[var(--status-exam-bg)] text-[var(--status-exam-text)]',
    cancelled: 'bg-[var(--status-cancelled-bg)] text-[var(--status-cancelled-text)]',
  }
  return <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-lg', tones[tone])}>{children}</span>
}

const materialTypeIcons: Record<MaterialType, typeof BookOpen> = {
  course: BookOpen,
  seminar: Users,
  lab: FlaskConical,
  video: PlayCircle,
  other: FileText,
  assignment: Clipboard,
  exam: GraduationCap,
}

export function MaterialTypeIcon({ type, size = 18 }: { type: MaterialType; size?: number }) {
  const Icon = materialTypeIcons[type] ?? FileText
  return <Icon aria-hidden="true" size={size} />
}

export function ItemTypeIcon({ type, size = 18 }: { type: 'material' | 'assignment' | 'lecture' | 'exam' | string; size?: number }) {
  switch (type) {
    case 'material':
    case 'course':
      return <BookOpen aria-hidden="true" size={size} />
    case 'assignment':
      return <Clipboard aria-hidden="true" size={size} />
    case 'lecture':
    case 'seminar':
      return <Users aria-hidden="true" size={size} />
    case 'exam':
      return <GraduationCap aria-hidden="true" size={size} />
    case 'lab':
      return <FlaskConical aria-hidden="true" size={size} />
    case 'video':
      return <PlayCircle aria-hidden="true" size={size} />
    default:
      return <FileText aria-hidden="true" size={size} />
  }
}

