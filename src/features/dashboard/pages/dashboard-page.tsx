import { ArrowDownRight, ArrowUpRight, CalendarCheck, CircleDollarSign, Clock3, Users } from "lucide-react"
import { AppointmentsTable } from "@/features/dashboard/components/appointments-table"
import { StatCard } from "@/components/shared/stat-card"

export function DashboardPage() {
  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-medium text-primary">Monday, November 2, 2026</p><h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Good morning, Admin</h2><p className="mt-2 text-sm text-muted-foreground">Here’s what’s happening at your clinic today.</p></div>
        <button type="button" className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#5B2FDB]">+ New appointment</button>
      </div>

      <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900">
        <span className="font-semibold">Preview data:</span> This dashboard currently uses sample content. Authentication, permissions, and live clinic data will be connected to the Laravel API in a later integration step.
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Appointments today" value="28" change="+12.5%" helper="vs. last week" icon={CalendarCheck} />
        <StatCard label="Total patients" value="1,284" change="+8.2%" helper="vs. last month" icon={Users} />
        <StatCard label="Revenue this month" value="EGP 186.4k" change="+6.4%" helper="vs. last month" icon={CircleDollarSign} />
        <StatCard label="Pending confirmations" value="06" change="2 urgent" helper="need attention" icon={Clock3} />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.8fr)]">
        <AppointmentsTable />
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between"><div><h2 className="font-semibold">Clinic performance</h2><p className="mt-1 text-xs text-muted-foreground">Monthly snapshot</p></div><span className="rounded-lg bg-emerald-50 p-2 text-emerald-700"><ArrowUpRight className="size-4" /></span></div>
          <div className="mt-8"><p className="text-xs text-muted-foreground">Monthly revenue</p><p className="mt-2 text-3xl font-semibold">EGP 186,400</p><p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><ArrowUpRight className="size-3.5" /> 6.4% <span className="font-normal text-muted-foreground">from last month</span></p></div>
          <div className="mt-8 space-y-4">
            {[{ label: "Laser treatments", value: 72, amount: "EGP 84k" }, { label: "Skin care", value: 54, amount: "EGP 62k" }, { label: "Consultations", value: 35, amount: "EGP 40k" }].map((item) => <div key={item.label}><div className="mb-2 flex justify-between text-xs"><span className="font-medium">{item.label}</span><span className="text-muted-foreground">{item.amount}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: item.value + "%" }} /></div></div>)}
          </div>
          <div className="mt-6 flex items-center gap-2 border-t pt-4 text-xs text-muted-foreground"><ArrowDownRight className="size-4 text-emerald-600" /> Sample figures for layout preview only</div>
        </section>
      </div>
    </div>
  )
}
