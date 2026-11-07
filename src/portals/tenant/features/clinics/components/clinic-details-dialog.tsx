import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Building2, ShieldCheck } from "lucide-react"
import type { Clinic } from "../../../types/tenant.types"

type Props = { clinic: Clinic | null; open: boolean; onOpenChange: (open: boolean) => void; locale: "ar" | "en" }

function Detail({ label, value }: { label: string; value?: string | null }) {
  return <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 p-3"><p className="text-[11px] font-medium text-slate-500">{label}</p><p className="mt-1 break-words text-sm font-semibold text-slate-800">{value || "—"}</p></div>
}

export function ClinicDetailsDialog({ clinic, open, onOpenChange, locale }: Props) {
  const ar = locale === "ar"
  if (!clinic) return null
  const address = clinic.address?.addressLine1
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
      <DialogHeader>
        <div className="mb-2 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-violet-50 text-violet-700"><Building2 className="size-5"/></div>
          <div className="min-w-0"><DialogTitle className="truncate">{clinic.name}</DialogTitle><DialogDescription>{clinic.slug || clinic.code || "—"}</DialogDescription></div>
          <span className="ms-auto rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{clinic.status === "active" ? (ar ? "نشطة" : "Active") : (ar ? "موقوفة" : "Suspended")}</span>
        </div>
      </DialogHeader>
      <section className="space-y-3"><h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{ar ? "معلومات العيادة" : "Clinic information"}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Detail label={ar ? "الاسم" : "Clinic name"} value={clinic.name}/>
          <Detail label={ar ? "النوع" : "Clinic type"} value={clinic.clinicType}/>
          <Detail label={ar ? "الكود" : "Clinic code"} value={clinic.code}/>
          <Detail label={ar ? "المنطقة الزمنية" : "Timezone"} value={clinic.timezone}/>
          <div className="sm:col-span-2"><Detail label={ar ? "الوصف" : "Description"} value={clinic.description}/></div>
        </div>
      </section>
      <section className="space-y-3"><h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{ar ? "التواصل والموقع" : "Contact & location"}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Detail label={ar ? "البريد الإلكتروني" : "Email"} value={clinic.contact?.email}/>
          <Detail label={ar ? "الهاتف" : "Phone"} value={clinic.contact?.phone}/>
          <Detail label={ar ? "العنوان" : "Address"} value={address}/>
          <Detail label={ar ? "المدينة" : "City"} value={clinic.address?.cityId}/>
        </div>
      </section>
      <div className="flex items-center gap-2 rounded-xl bg-violet-50/70 p-3 text-xs text-violet-800"><ShieldCheck className="size-4 shrink-0"/>{ar ? "بيانات العيادة معزولة ضمن مساحة مؤسستك." : "Clinic data is isolated within your organization workspace."}</div>
    </DialogContent>
  </Dialog>
}
