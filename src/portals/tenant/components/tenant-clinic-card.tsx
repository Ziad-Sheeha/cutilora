import { Building2, Mail, MapPin, Pencil, Phone, Power } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Clinic } from "../types/tenant.types"
import { TenantStatusPill } from "../components/tenant-status-pill"

type Props = { clinic: Clinic; onEdit: (clinic: Clinic) => void; onToggleStatus: (clinic: Clinic) => void; editLabel: string; statusActionLabel: string; canManage?: boolean }

export function TenantClinicCard({ clinic, onEdit, onToggleStatus, editLabel, statusActionLabel, canManage = true }: Props) {
  return (
    <article className="rounded-2xl border border-border/70 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700">
          <Building2 className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-semibold">{clinic.name}</h4>
          <p className="mt-1 truncate text-xs text-muted-foreground">{clinic.slug || clinic.code || "—"}</p>
        </div>
        <TenantStatusPill status={clinic.status} />
      </div>

      <div className="mt-5 space-y-2 border-t pt-4 text-xs text-muted-foreground">
        <p className="flex items-center gap-2"><Mail className="size-3.5" />{clinic.contact?.email || "—"}</p>
        <p className="flex items-center gap-2"><Phone className="size-3.5" />{clinic.contact?.phone || "—"}</p>
        <p className="flex items-center gap-2"><MapPin className="size-3.5" />{clinic.address?.addressLine1 || "—"}</p>
      </div>

      {canManage && <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(clinic)}>
          <Pencil className="size-3.5" />
          {editLabel}
        </Button>
        <Button variant="outline" size="sm" onClick={() => onToggleStatus(clinic)}>
          <Power className="size-3.5" />
          {statusActionLabel}
        </Button>
      </div>}
    </article>
  )
}
