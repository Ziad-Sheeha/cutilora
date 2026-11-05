type Props = { status?: string }

export function TenantStatusPill({ status }: Props) {
  const active = status === "active"
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
      {status || "—"}
    </span>
  )
}
