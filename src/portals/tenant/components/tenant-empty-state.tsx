import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

type Props = {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function TenantEmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="rounded-2xl border border-dashed px-5 py-14 text-center">
      <Icon className="mx-auto size-8 text-muted-foreground/40" />
      <p className="mt-3 text-sm font-semibold">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-muted-foreground">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}
