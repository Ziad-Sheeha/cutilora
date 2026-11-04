import { Activity, AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react"

export interface TimelineEvent {
  id: string
  date: string
  level: string
  category: string
  message: string
  module: string
}

function dateLabel(value: string, locale: string) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(date)
}

function levelStyle(level: string) {
  if (["error", "fatal", "critical"].includes(level)) return { icon: ShieldAlert, color: "text-error", background: "bg-error/10" }
  if (["warn", "warning"].includes(level)) return { icon: AlertTriangle, color: "text-warning", background: "bg-warning/10" }
  if (["success"].includes(level)) return { icon: CheckCircle2, color: "text-success", background: "bg-success/10" }
  return { icon: Info, color: "text-primary", background: "bg-primary/10" }
}

export function MonitoringTimeline({ events, locale, emptyLabel }: {
  events: TimelineEvent[]; locale: string; emptyLabel: string
}) {
  if (!events.length) {
    return <div className="flex min-h-40 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
      <Activity className="size-7 opacity-40" />{emptyLabel}
    </div>
  }
  return <ol className="relative space-y-0">
    {events.map((event, index) => {
      const style = levelStyle(event.level)
      const Icon = style.icon
      return <li key={event.id} className="relative flex gap-3 pb-6 last:pb-0">
        {index !== events.length - 1 && <span aria-hidden="true" className="absolute start-[17px] top-9 h-[calc(100%-1.5rem)] w-px bg-border" />}
        <span className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-xl ${style.background} ${style.color}`}>
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p className="text-sm font-semibold leading-5">{event.message}</p>
            <time className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{dateLabel(event.date, locale)}</time>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-md bg-muted px-2 py-0.5 font-medium">{event.level}</span>
            <span>{event.category}</span><span aria-hidden="true">·</span><span>{event.module}</span>
          </div>
        </div>
      </li>
    })}
  </ol>
}
