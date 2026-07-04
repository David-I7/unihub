import type { ReactNode } from 'react'
import { Select, MultiSelect } from '@/components/ui/select'
import { mutedTextClass } from '@/components/styles'
import type { Material } from '@/domain'
import { MaterialTypeIcon } from '@/components/IconBadge'

export const fieldClass = 'w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-main)] shadow-sm outline-none transition-colors hover:border-[var(--primary)] focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring-color)]'

const formLabelClass = 'grid gap-1 text-sm font-semibold text-[var(--text-main)]'

export function TextField({ label, placeholder, value, onChange }: { label: string; placeholder?: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className={formLabelClass}>
      {label}
      <input className={fieldClass} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

export function DateTimeField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className={formLabelClass}>
      {label}
      <input type="datetime-local" className={fieldClass} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

export function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className={formLabelClass}>
      {label}
      <textarea className={`${fieldClass} min-h-20 resize-y`} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

export function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: (string[] | { value: string; label: string; icon?: ReactNode })[]
  onChange: (value: string) => void
}) {
  const formattedOptions = options.map((opt) => {
    if (Array.isArray(opt)) return { value: opt[0], label: opt[1] }
    return opt
  })
  return (
    <label className={formLabelClass}>
      {label}
      <Select value={value} options={formattedOptions} onValueChange={onChange} />
    </label>
  )
}

export function MultiSelectField({ label, value, options, onChange }: { label: string; value: string[]; options: string[][]; onChange: (value: string[]) => void }) {
  return (
    <label className={formLabelClass}>
      {label}
      <select className={fieldClass} multiple value={value} onChange={(event) => onChange([...event.target.selectedOptions].map((option) => option.value))}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </label>
  )
}

export function CompatibleMaterialField({
  label,
  emptyText,
  materials,
  materialType,
  value,
  onChange,
}: {
  label: string
  emptyText: string
  materials: Material[]
  materialType: 'assignment' | 'exam'
  value: string[]
  onChange: (value: string[]) => void
}) {
  const options = materials
    .filter((material) => material.type === materialType)
    .map((material) => ({
      value: material.id,
      label: material.title,
      icon: <MaterialTypeIcon type={material.type} size={15} />,
    }))

  if (options.length === 0) {
    return (
      <div className="grid gap-1 text-sm font-semibold text-[var(--text-main)]">
        <span>{label}</span>
        <p className={`m-0 rounded-md border border-dashed border-[var(--border-color)] p-3 text-sm font-normal ${mutedTextClass}`}>{emptyText}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-1 text-sm font-semibold text-[var(--text-main)]">
      <span>{label}</span>
      <MultiSelect value={value} options={options} placeholder={`Select ${materialType} materials...`} onValueChange={onChange} />
    </div>
  )
}
