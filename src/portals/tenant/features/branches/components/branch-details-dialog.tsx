import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Building2, Clock3, Mail, MapPin, Phone } from "lucide-react"
import type { Branch } from "../../../types/tenant.types"

type Props = { branch: Branch | null; clinicName?: string; open: boolean; onOpenChange: (open: boolean) => void; locale: "ar" | "en" }
function Detail({ label, value }: { label: string; value?: string | null }) {
  return <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"><p className="text-[11px] text-slate-500">{label}</p><p className="mt-1 break-words text-sm font-semibold text-slate-800">{value || "—"}</p></div>
}
export function BranchDetailsDialog({ branch, clinicName, open, onOpenChange, locale }: Props) {
  const ar = locale === "ar"
  if (!branch) return null
  const statuses: Record<string, string> = { draft: ar ? "مسودة" : "Draft", active: ar ? "نشط" : "Active", temporarily_closed: ar ? "مغلق مؤقتًا" : "Temporarily closed", suspended: ar ? "موقوف" : "Suspended", closed: ar ? "مغلق نهائيًا" : "Permanently closed" }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
    <DialogHeader><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-violet-50 text-violet-700"><MapPin className="size-5"/></span><div className="min-w-0"><DialogTitle className="truncate">{branch.name}</DialogTitle><DialogDescription>{branch.code || branch.slug}</DialogDescription></div><Badge className="ms-auto" variant="outline">{statuses[branch.status || "active"]}</Badge></div></DialogHeader>
    <section className="space-y-3"><h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{ar ? "معلومات الفرع" : "Branch information"}</h3><div className="grid gap-3 sm:grid-cols-2">
      <Detail label={ar ? "العيادة" : "Clinic"} value={clinicName}/><Detail label={ar ? "الاسم" : "Branch name"} value={branch.name}/><Detail label={ar ? "الكود" : "Branch code"} value={branch.code}/><Detail label={ar ? "المعرّف" : "Slug"} value={branch.slug}/><Detail label={ar ? "المنطقة الزمنية" : "Timezone"} value={branch.timezone}/><Detail label={ar ? "تاريخ الافتتاح" : "Opening date"} value={branch.openingDate ? new Date(branch.openingDate).toLocaleDateString(ar ? "ar-EG" : "en-GB") : null}/>
    </div></section>
    <section className="space-y-3"><h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{ar ? "التواصل والعنوان" : "Contact & address"}</h3><div className="grid gap-3 sm:grid-cols-2">
      <Detail label={ar ? "البريد الإلكتروني" : "Email"} value={branch.contact?.email || branch.contactPerson?.email}/><Detail label={ar ? "الهاتف" : "Phone"} value={branch.contact?.phone || branch.contactPerson?.phone}/><div className="sm:col-span-2"><Detail label={ar ? "العنوان" : "Address"} value={branch.address || branch.addressDetails?.addressLine1}/></div><Detail label={ar ? "الرمز البريدي" : "Postal code"} value={branch.postalCode || branch.addressDetails?.postalCode}/>
    </div></section>
    {branch.closureReason && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"><p className="text-xs font-semibold">{ar ? "سبب الإغلاق" : "Closure reason"}</p><p className="mt-1">{branch.closureReason}</p></div>}
  </DialogContent></Dialog>
}
