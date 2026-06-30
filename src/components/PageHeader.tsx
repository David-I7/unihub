export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="mb-4.5">
      <h1 className="m-0 mb-1 text-[32px] leading-tight font-semibold text-[var(--text-main)]">{title}</h1>
      <p className="m-0 text-[var(--text-muted)] max-[820px]:max-w-[calc(100vw-40px)]">{subtitle}</p>
    </header>
  )
}
