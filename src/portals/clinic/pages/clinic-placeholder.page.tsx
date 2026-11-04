import { ArrowRight, Construction } from "lucide-react"
import { Link, useLocation } from "react-router"
import { adminNavigation } from "@/portals/clinic/config/navigation"
import { useI18n } from "@/i18n/i18n-provider"
export function AdminPlaceholderPage(){
 const {pathname}=useLocation();const {t}=useI18n();const current=adminNavigation.find(item=>item.href===pathname)
 const label=current?t.clinic.labels[current.label as keyof typeof t.clinic.labels]:t.common.dashboardTitle
 const group=current?t.clinic.groups[current.group]:t.common.clinicWorkspace
 const description=current?t.clinic.descriptions[current.label as keyof typeof t.clinic.descriptions]:t.common.modulePreparing
 return <section className="flex min-h-[55vh] flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-6 py-12 text-center"><span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Construction className="size-6"/></span><p className="mt-5 text-xs font-semibold uppercase tracking-wider text-primary">{group}</p><h1 className="mt-2 text-2xl font-semibold">{label}</h1><p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{description}</p><div className="mt-6 rounded-xl border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">{t.common.navigationReady}</div><Link to="/clinic" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">{t.common.backOverview}<ArrowRight className="size-4"/></Link></section>
}
