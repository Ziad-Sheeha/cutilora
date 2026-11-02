import type { LucideIcon } from "lucide-react"

type StatCardProps = {
  label: string
  value: string
  change: string
  helper: string
  icon: LucideIcon
}

export function StatCard({ label, value, change, helper, icon: Icon }: StatCardProps) {
  return (
    <article className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        <span className="font-semibold text-emerald-600">{change}</span> {helper}
      </p>
    </article>
  )
}
