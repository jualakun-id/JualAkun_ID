type Props = {
  title: string
  subtitle?: string
  rightSlot?: React.ReactNode
}

export function AdminHeader({ title, subtitle, rightSlot }: Props) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-ink tracking-tight">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-[15px] text-ink-muted font-medium">{subtitle}</p>
        ) : null}
      </div>
      {rightSlot ? <div className="flex flex-wrap items-center gap-2">{rightSlot}</div> : null}
    </header>
  )
}
