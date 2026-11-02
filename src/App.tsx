import { useEffect, useState } from "react"
import { ArrowUpRight, CalendarDays, Moon, ShieldCheck, Sun, Users } from "lucide-react"
import { Link } from "react-router"
import { BrandLogo } from "@/components/brand/brand-logo"

const foundations = [
  { title: "Clinic operations", description: "A clear workspace for day-to-day clinic operations.", icon: CalendarDays },
  { title: "People & access", description: "A foundation for staff, roles, and permissions.", icon: Users },
  { title: "Platform security", description: "Tenant-aware access will be enforced by the API.", icon: ShieldCheck },
]

export function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-6 py-8 sm:px-10">
        <header className="flex items-center justify-between border-b pb-6">
          <Link to="/" aria-label="Cutilora home"><BrandLogo className="h-12" imageClassName="h-12" /></Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">Clinic management platform</span>
            <button type="button" onClick={() => setTheme((current) => current === "light" ? "dark" : "light")} className="inline-flex size-10 items-center justify-center rounded-xl border bg-card text-foreground transition-colors hover:bg-muted" aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"} title={theme === "light" ? "Dark theme" : "Light theme"}>
              {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </button>
            <Link to="/clinic/login" className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#5B2FDB]">Clinic Login <ArrowUpRight className="ml-2 size-4" aria-hidden="true" /></Link>
          </div>
        </header>
        <section className="flex flex-1 flex-col justify-center py-16">
          <p className="mb-4 text-sm font-semibold text-primary">The operating system for aesthetic clinics.</p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">The foundation for better clinic operations.</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">Cutilora brings clinic workflows into one structured workspace. Manage your clinic operations with clarity, precision, and confidence.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {foundations.map(({ title, description, icon: Icon }) => <article key={title} className="rounded-card border bg-card p-5 shadow-sm"><Icon className="mb-8 size-5 text-primary" aria-hidden="true" /><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></article>)}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link to="/clinic/login" className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-[#5B2FDB]">Clinic Portal <ArrowUpRight className="ml-2 size-4" /></Link>
            <Link to="/super-admin/login" className="inline-flex h-11 items-center rounded-xl border bg-card px-5 text-sm font-semibold text-foreground hover:bg-muted">Super Admin <ArrowUpRight className="ml-2 size-4" /></Link>
            <p className="text-sm text-muted-foreground">Separate workspaces for clinic teams and Cutilora administrators.</p>
          </div>
        </section>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-xs text-muted-foreground"><span>© {new Date().getFullYear()} Cutilora</span><span>Trust · Precision · Simplicity · Growth</span></footer>
      </div>
    </main>
  )
}
