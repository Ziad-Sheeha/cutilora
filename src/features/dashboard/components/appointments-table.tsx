import { ArrowUpRight, MoreHorizontal } from "lucide-react"

const appointments = [
  { patient: "Olivia Rhye", initials: "OR", service: "Laser hair removal", provider: "Dr. Ahmed", time: "09:30 AM", status: "Checked in", tone: "green" },
  { patient: "Phoenix Baker", initials: "PB", service: "Skin consultation", provider: "Dr. Mariam", time: "10:15 AM", status: "Confirmed", tone: "blue" },
  { patient: "Lana Steiner", initials: "LS", service: "Chemical peel", provider: "Dr. Ahmed", time: "11:00 AM", status: "Pending", tone: "amber" },
  { patient: "Demi Wilkinson", initials: "DW", service: "Hydrafacial", provider: "Dr. Nour", time: "11:45 AM", status: "Confirmed", tone: "blue" },
]

const statusClasses = {
  green: "bg-emerald-50 text-emerald-700",
  blue: "bg-sky-50 text-sky-700",
  amber: "bg-amber-50 text-amber-700",
}

export function AppointmentsTable() {
  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div><h2 className="font-semibold">Upcoming appointments</h2><p className="mt-1 text-xs text-muted-foreground">Your next scheduled visits</p></div>
        <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">View all <ArrowUpRight className="size-3.5" /></button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr><th className="px-5 py-3 font-medium">Patient</th><th className="px-4 py-3 font-medium">Service</th><th className="px-4 py-3 font-medium">Provider</th><th className="px-4 py-3 font-medium">Time</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody className="divide-y">
            {appointments.map((appointment) => (
              <tr key={appointment.patient} className="hover:bg-muted/30">
                <td className="px-5 py-3.5"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-800">{appointment.initials}</span><span className="font-medium">{appointment.patient}</span></div></td>
                <td className="px-4 py-3.5 text-muted-foreground">{appointment.service}</td><td className="px-4 py-3.5 text-muted-foreground">{appointment.provider}</td><td className="px-4 py-3.5 tabular-nums">{appointment.time}</td>
                <td className="px-4 py-3.5"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClasses[appointment.tone as keyof typeof statusClasses]}`}>{appointment.status}</span></td>
                <td className="px-4 py-3.5"><button type="button" aria-label={`More actions for ${appointment.patient}`} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"><MoreHorizontal className="size-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
