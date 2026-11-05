import type { LucideIcon } from "lucide-react"

interface TenantMetricCardProps {
  icon: LucideIcon
  label: string
  value: string
  hint: string
  tone: "violet" | "emerald" | "amber" | "rose"
}

const tones: Record<TenantMetricCardProps["tone"], string> = {
  violet: "bg-violet-500/10 text-violet-600",
  emerald: "bg-emerald-500/10 text-emerald-600",
  amber: "bg-amber-500/10 text-amber-600",
  rose: "bg-rose-500/10 text-rose-600",
}

export function TenantMetricCard({ icon: Icon, label, value, hint, tone }: TenantMetricCardProps) {
  return (
    <article className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={"flex size-9 items-center justify-center rounded-xl " + tones[tone]}>
          <Icon className="size-[18px]" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
    </article>
  )
}
