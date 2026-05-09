type Props = {
  title: string
  subtitle?: string
  rightSlot?: React.ReactNode
}

export function AdminHeader({ title, subtitle, rightSlot }: Props) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-heading text-h1">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-text-muted">{subtitle}</p> : null}
      </div>
      {rightSlot ? <div className="flex items-center gap-2">{rightSlot}</div> : null}
    </header>
  )
}
