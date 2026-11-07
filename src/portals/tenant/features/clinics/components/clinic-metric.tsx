import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function ClinicMetric({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: number; tone: "violet" | "emerald" | "slate" }) {
  const styles = { violet: "bg-violet-50 text-violet-700 ring-violet-100", emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100", slate: "bg-slate-100 text-slate-600 ring-slate-200" }
  return <Card className="border-slate-200/80 shadow-sm"><CardContent className="flex items-center gap-3 p-4"><span className={`grid size-10 place-items-center rounded-xl ring-1 ${styles[tone]}`}><Icon className="size-5"/></span><div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-900">{value}</p></div></CardContent></Card>
}
