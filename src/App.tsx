import { ArrowUpRight, CalendarDays, ShieldCheck, Users } from "lucide-react"

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
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-6 py-8 sm:px-10">
        <header className="flex items-center justify-between border-b pb-6">
          <a className="text-xl font-semibold tracking-tight" href="/">
            cutilora<span className="text-primary">.</span>
          </a>
          <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            Frontend foundation
          </span>
        </header>

        <section className="flex flex-1 flex-col justify-center py-16">
          <p className="mb-4 text-sm font-medium text-primary">Clinic management, thoughtfully connected</p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            The foundation for better clinic operations.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
            Cutilora brings clinic workflows into one structured workspace. We are setting up the
            application foundation before building individual modules.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {foundations.map(({ title, description, icon: Icon }) => (
              <article key={title} className="rounded-xl border bg-card p-5">
                <Icon className="mb-8 size-5 text-primary" aria-hidden="true" />
                <h2 className="font-medium">{title}</h2>
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
