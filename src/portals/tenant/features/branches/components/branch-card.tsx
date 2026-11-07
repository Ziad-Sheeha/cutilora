import { Building2, Clock3, MapPin, Pencil, Phone, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Branch } from "../../../types/tenant.types"

type Props = {
  branch: Branch
  clinicName?: string
  canEdit: boolean
  canLifecycle: boolean
  onView: (branch: Branch) => void
  onEdit: (branch: Branch) => void
  onLifecycle: (branch: Branch, action: "activate" | "temporary-close" | "suspend" | "close") => void
  labels: { view: string; edit: string; activate: string; temporaryClose: string; suspend: string; close: string; statuses: Record<string, string>; clinicFallback: string; addressFallback: string }
}

const statusStyles: Record<string, string> = {
  draft: "border-slate-200 bg-slate-100 text-slate-600",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  temporarily_closed: "border-amber-200 bg-amber-50 text-amber-700",
  suspended: "border-orange-200 bg-orange-50 text-orange-700",
  closed: "border-rose-200 bg-rose-50 text-rose-700",
}

export function BranchCard({ branch, clinicName, canEdit, canLifecycle, onView, onEdit, onLifecycle, labels }: Props) {
  const status = branch.status || "active"
  const statusLabel: Record<string, string> = {
    draft: "Draft", active: "Active", temporarily_closed: "Temporarily closed", suspended: "Suspended", closed: "Permanently closed",
  }
  return <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-950/[.05]">
    <div className={`h-1 ${status === "active" ? "bg-gradient-to-r from-emerald-400 to-teal-400" : status === "closed" ? "bg-slate-300" : "bg-gradient-to-r from-amber-400 to-orange-400"}`}/>
    <div className="p-5">
      <div className="flex items-start gap-3">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-700 ring-1 ring-violet-100"><MapPin className="size-5"/></div>
        <div className="min-w-0 flex-1"><h3 className="truncate text-base font-semibold text-slate-900">{branch.name}</h3><p className="mt-1 truncate text-xs text-slate-500">{branch.code || branch.slug}</p></div>
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyles[status] || statusStyles.active}`}>{labels.statuses[status] || statusLabel[status] || status}</span>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600"><Building2 className="size-3.5 shrink-0 text-slate-400"/><span className="truncate">{clinicName || labels.clinicFallback}</span></div>
      <div className="mt-4 space-y-3 text-xs text-slate-500">
        <p className="flex items-center gap-2"><MapPin className="size-3.5 shrink-0 text-slate-400"/><span className="truncate">{branch.address || branch.addressDetails?.addressLine1 || labels.addressFallback}</span></p>
        <p className="flex items-center gap-2"><Phone className="size-3.5 shrink-0 text-slate-400"/><span className="truncate">{branch.contact?.phone || branch.contactPerson?.phone || "—"}</span></p>
        <p className="flex items-center gap-2"><Clock3 className="size-3.5 shrink-0 text-slate-400"/><span className="truncate">{branch.timezone || "Africa/Cairo"}</span></p>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <Button type="button" variant="ghost" size="sm" className="px-2 text-slate-600" onClick={() => onView(branch)}><Eye className="me-1.5 size-4"/>{labels.view}</Button>
        <div className="flex flex-wrap gap-1.5">
          {canEdit && status !== "closed" && <Button type="button" size="sm" variant="outline" onClick={() => onEdit(branch)}><Pencil className="me-1.5 size-3.5"/>{labels.edit}</Button>}
          {canLifecycle && status !== "closed" && (status === "active"
            ? <>
                <Button type="button" size="sm" variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50" onClick={() => onLifecycle(branch, "temporary-close")}>{labels.temporaryClose}</Button>
                <Button type="button" size="sm" variant="ghost" className="text-slate-500" onClick={() => onLifecycle(branch, "suspend")}>{labels.suspend}</Button>
              </>
            : <Button type="button" size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => onLifecycle(branch, "activate")}>{labels.activate}</Button>)}
          {canLifecycle && status !== "closed" && <Button type="button" size="sm" variant="ghost" className="text-slate-500" onClick={() => onLifecycle(branch, "close")}>{labels.close}</Button>}
        </div>
      </div>
    </div>
  </article>
}
