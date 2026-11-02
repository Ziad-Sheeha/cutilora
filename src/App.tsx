import { useEffect, useState } from "react"
import { ArrowUpRight, CalendarDays, Moon, ShieldCheck, Sun, Users } from "lucide-react"

const foundations = [
  {
    title: "Clinic operations",
    description: "A clear workspace for day-to-day clinic operations.",
    icon: CalendarDays,
  },
  {
    title: "People & access",
    description: "A foundation for staff, roles, and permissions.",
    icon: Users,
  },
  {
    title: "Platform security",
    description: "Tenant-aware access will be enforced by the API.",
    icon: ShieldCheck,
  },
]

export function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-6 py-8 sm:px-10">
        <header className="flex items-center justify-between border-b pb-6">
          <a className="text-xl font-bold tracking-tight" href="/" aria-label="Cutilora home">
            <span className="text-foreground">Cutilora</span><span className="text-primary">.</span>
          </a>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
              Frontend foundation
            </span>
            <button
              type="button"
              onClick={() => setTheme((current) => current === "light" ? "dark" : "light")}
              className="inline-flex size-10 items-center justify-center rounded-xl border bg-card text-foreground transition-colors hover:bg-muted"
              aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
              title={theme === "light" ? "Dark theme" : "Light theme"}
            >
              {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </button>
          </div>
        </header>

        <section className="flex flex-1 flex-col justify-center py-16">
          <p className="mb-4 text-sm font-semibold text-primary">The operating system for aesthetic clinics.</p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            The foundation for better clinic operations.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
            Cutilora brings clinic workflows into one structured workspace. We are setting up the
            application foundation before building individual modules.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {foundations.map(({ title, description, icon: Icon }) => (
              <article key={title} className="rounded-card border bg-card p-5 shadow-sm">
                <Icon className="mb-8 size-5 text-primary" aria-hidden="true" />
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>

          <p className="mt-10 inline-flex items-center gap-2 text-sm text-muted-foreground">
            Foundation setup in progress <ArrowUpRight className="size-4" aria-hidden="true" />
          </p>
        </section>

        <footer className="border-t pt-5 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Cutilora
        </footer>
      </div>
    </main>
  )
}
