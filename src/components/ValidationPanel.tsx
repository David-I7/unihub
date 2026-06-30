import type { PreparedContribution } from '@/domain'
import { headingClass, panelClass } from './styles'
import { cn } from '@/lib/utils'

export function ValidationPanel({ result }: { result: PreparedContribution }) {
  const hasErrors = result.errors.length > 0
  const hasWarnings = result.warnings.length > 0

  if (!hasErrors && !hasWarnings) return null

  return (
    <section
      className={cn(
        panelClass,
        'mt-4 min-w-0 overflow-hidden p-4 max-[820px]:max-w-[calc(100vw-40px)]',
        hasErrors ? 'border-[var(--validation-err-border)] bg-[var(--validation-err-bg)]' : 'border-[var(--validation-ok-border)] bg-[var(--validation-ok-bg)]',
      )}
    >
      {hasErrors && (
        <>
          <h2 className={headingClass}>Validation Blocked</h2>
          {result.errors.map((error) => (
            <p key={error} className="m-0 text-[var(--text-main)]">{error}</p>
          ))}
        </>
      )}
      {hasWarnings && (
        <>
          <h2 className={`${headingClass} ${hasErrors ? 'mt-3' : ''}`}>Warnings</h2>
          {result.warnings.map((warning) => (
            <p key={warning} className="m-0 text-[var(--text-main)]">{warning}</p>
          ))}
        </>
      )}
    </section>
  )
}
