const statusStyles: Record<string, string> = {
  active: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  suspended: "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  inactive: "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  pending: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
}

function humanize(value: string) {
  return value.replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function TenantStatusBadge({ status }: { status: string }) {
  return (
    <span className={"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold " + (statusStyles[status] ?? "border-border bg-muted/60 text-muted-foreground")}>
      <span className="size-1.5 rounded-full bg-current" />
      {humanize(status)}
    </span>
  )
}
