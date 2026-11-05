import type { ReactNode } from "react"

type Props = {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}

export function TenantPageHeading({ eyebrow, title, description, action }: Props) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}
