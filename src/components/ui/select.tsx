import * as React from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SelectOption = {
  value: string
  label: string
}

export function Select({
  value,
  options,
  onValueChange,
  selectSize = 'default',
  className,
  disabled,
  ariaLabel,
}: {
  value: string
  options: SelectOption[]
  onValueChange: (value: string) => void
  selectSize?: 'default' | 'compact'
  className?: string
  disabled?: boolean
  ariaLabel?: string
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const selected = options.find((option) => option.value === value) ?? options[0]

  React.useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={rootRef} className={cn('relative inline-block min-w-0', selectSize === 'default' ? 'w-full' : '', className)}>
      <button
        type="button"
        className={cn(
          'flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] font-[inherit] text-[var(--text-main)] shadow-sm outline-none transition-colors hover:border-[var(--primary)] focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring-color)] disabled:cursor-not-allowed disabled:opacity-50',
          selectSize === 'default' ? 'h-10 px-3 py-2 text-sm' : 'h-8 px-2.5 py-1.5 text-[13px]',
        )}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="min-w-0 truncate">{selected?.label ?? 'Select'}</span>
        <ChevronDown aria-hidden="true" size={16} className={cn('shrink-0 text-[var(--text-muted)] transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen && (
        <div
          role="listbox"
          className="absolute z-[180] mt-1 max-h-72 w-full min-w-48 overflow-auto rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] p-1 shadow-xl"
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between gap-2 rounded-sm border-0 bg-transparent px-2.5 py-2 text-left text-sm text-[var(--text-main)] transition-colors hover:bg-[var(--bg-option-hover)]',
                  isSelected && 'bg-[var(--bg-option-selected)] font-semibold text-[var(--primary)]',
                )}
                onClick={() => {
                  onValueChange(option.value)
                  setIsOpen(false)
                }}
              >
                <span className="min-w-0 truncate">{option.label}</span>
                {isSelected && <Check aria-hidden="true" size={15} className="shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
