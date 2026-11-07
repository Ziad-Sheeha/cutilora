import { Building2, Mail, MapPin, Phone, Pencil, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Clinic } from "../../../types/tenant.types"

type Props = {
  clinic: Clinic
  canManage: boolean
  onView: (clinic: Clinic) => void
  onEdit: (clinic: Clinic) => void
  onToggleStatus: (clinic: Clinic) => void
  statusActionLabel: string
  labels: { active: string; suspended: string; view: string; edit: string }
}

export function ClinicCard({ clinic, canManage, onView, onEdit, onToggleStatus, statusActionLabel, labels }: Props) {
  const active = clinic.status === "active"
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-950/[0.05]">
      <div className="h-1 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-indigo-400 opacity-80" />
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-700 ring-1 ring-violet-100">
            <Building2 className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold tracking-tight text-slate-900">{clinic.name}</h3>
            <p className="mt-1 truncate text-xs text-slate-500">{clinic.code || clinic.slug || "—"}</p>
          </div>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-600"}`}><span className={`me-1.5 size-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />{active ? labels.active : labels.suspended}</span>
        </div>
        {clinic.description && <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">{clinic.description}</p>}
        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <p className="flex min-w-0 items-center gap-2"><Mail className="size-3.5 shrink-0 text-slate-400" /><span className="truncate">{clinic.contact?.email || "—"}</span></p>
          <p className="flex min-w-0 items-center gap-2"><Phone className="size-3.5 shrink-0 text-slate-400" /><span className="truncate">{clinic.contact?.phone || "—"}</span></p>
          <p className="flex min-w-0 items-center gap-2"><MapPin className="size-3.5 shrink-0 text-slate-400" /><span className="truncate">{clinic.address?.addressLine1 || "Address not provided"}</span></p>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
          <Button type="button" variant="ghost" size="sm" className="px-2 text-slate-600 hover:text-violet-700" onClick={() => onView(clinic)}>
            <Eye className="me-1.5 size-4" />{labels.view}
          </Button>
          {canManage && <Button type="button" variant="outline" size="sm" className="border-slate-200" onClick={() => onEdit(clinic)}>
            <Pencil className="me-1.5 size-3.5" />{labels.edit}
          </Button>}
          {canManage && <Button type="button" variant="ghost" size="sm" className="px-2 text-slate-500" onClick={() => onToggleStatus(clinic)}>{statusActionLabel}</Button>}
        </div>
      </div>
    </article>
  )
}
