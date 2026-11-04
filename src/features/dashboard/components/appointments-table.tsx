import { memo } from "react"
import { ArrowUpRight, MoreHorizontal } from "lucide-react"
import { useI18n } from "@/i18n/i18n-provider"
type AppointmentTone = "green" | "blue" | "amber"

const appointments: {
  patient: string
  initials: string
  service: string
  provider: string
  time: string
  status: "checkedIn" | "confirmed" | "pending"
  tone: AppointmentTone
}[] = [
  {
    patient: "Olivia Rhye",
    initials: "OR",
    service: "Laser hair removal",
    provider: "Dr. Ahmed",
    time: "09:30 AM",
    status: "checkedIn",
    tone: "green",
  },
  {
    patient: "Phoenix Baker",
    initials: "PB",
    service: "Skin consultation",
    provider: "Dr. Mariam",
    time: "10:15 AM",
    status: "confirmed",
    tone: "blue",
  },
  {
    patient: "Lana Steiner",
    initials: "LS",
    service: "Chemical peel",
    provider: "Dr. Ahmed",
    time: "11:00 AM",
    status: "pending",
    tone: "amber",
  },
  {
    patient: "Demi Wilkinson",
    initials: "DW",
    service: "Hydrafacial",
    provider: "Dr. Nour",
    time: "11:45 AM",
    status: "confirmed",
    tone: "blue",
  },
]
const statusClasses: Record<"green" | "blue" | "amber", string>={green:"bg-emerald-50 text-emerald-700",blue:"bg-sky-50 text-sky-700",amber:"bg-amber-50 text-amber-700"}
export const AppointmentsTable=memo(function AppointmentsTable(){
 const {t}=useI18n();const d=t.dashboard
 return <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm"><div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-semibold">{d.upcomingAppointments}</h2><p className="mt-1 text-xs text-muted-foreground">{d.nextVisits}</p></div><button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">{d.viewAll}<ArrowUpRight className="size-3.5"/></button></div><div className="overflow-x-auto"><table className="w-full min-w-[920px] text-start text-sm"><thead className="bg-muted/35 text-[11px] uppercase tracking-[0.08em] text-muted-foreground"><tr><th className="px-5 py-3 text-start font-medium">{d.patient}</th><th className="px-4 py-3 text-start font-medium">{d.service}</th><th className="px-4 py-3 text-start font-medium">{d.provider}</th><th className="px-4 py-3 text-start font-medium">{d.time}</th><th className="px-4 py-3 text-start font-medium">{d.status}</th><th className="px-4 py-3 text-start font-medium">{d.createdAt}</th><th className="px-4 py-3 text-start font-medium">{d.updatedAt}</th><th className="px-4 py-3"/></tr></thead><tbody className="divide-y">{appointments.map(appointment=><tr key={appointment.patient} className="border-t border-border/60 transition-colors hover:bg-primary/[0.025]"><td className="px-5 py-3.5"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-800">{appointment.initials}</span><span className="font-medium">{appointment.patient}</span></div></td><td className="px-4 py-3.5 text-muted-foreground">{appointment.service}</td><td className="px-4 py-3.5 text-muted-foreground">{appointment.provider}</td><td className="px-4 py-3.5 tabular-nums">{appointment.time}</td><td className="px-4 py-3.5"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClasses[appointment.tone]}`}>{t.appointments[appointment.status]}</span></td><td className="px-4 py-3.5 text-xs tabular-nums text-muted-foreground">—</td><td className="px-4 py-3.5 text-xs tabular-nums text-muted-foreground">—</td><td className="px-4 py-3.5"><button type="button" aria-label={t.common.moreActions} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"><MoreHorizontal className="size-4"/></button></td></tr>)}</tbody></table></div></section>
})
