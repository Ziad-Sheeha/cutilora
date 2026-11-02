import { ArrowRight, Construction } from "lucide-react"
import { Link, useLocation } from "react-router"
import { adminNavigation } from "@/config/admin-navigation"

export function AdminPlaceholderPage() {
  const { pathname } = useLocation()
  const current = adminNavigation.find((item) => item.href === pathname)
  return (
    <section className="flex min-h-[55vh] flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Construction className="size-6" /></span>
      <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-primary">{current?.group ?? "Clinic workspace"}</p>
      <h2 className="mt-2 text-2xl font-semibold">{current?.label ?? "Module"} </h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{current?.description ?? "This clinic workspace module is being prepared."}</p>
      <div className="mt-6 rounded-xl border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">Navigation and page shell are ready. Business workflows, API integration and permissions are not implemented yet.</div>
      <Link to="/clinic" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Back to overview <ArrowRight className="size-4" /></Link>
    </section>
  )
}
