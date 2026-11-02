import { Activity, ArrowUpRight, Building2, ShieldCheck, Users, type LucideIcon } from "lucide-react"

const modules: Record<string, { title: string; description: string; icon: LucideIcon; capabilities: string[] }> = {
  tenants: { title: "Tenants", description: "Manage paying customer organizations and their platform lifecycle.", icon: Building2, capabilities: ["Tenant directory and profile", "Subscription and account status", "Tenant-level ownership and contacts"] },
  clinics: { title: "Clinics", description: "Manage clinic brands and legal operating entities owned by tenants.", icon: Building2, capabilities: ["Clinic directory and details", "Tenant ownership relationship", "Clinic status and configuration"] },
  branches: { title: "Branches", description: "Review physical locations across clinic organizations.", icon: Building2, capabilities: ["Branch directory and location", "Clinic and tenant relationships", "Operational status"] },
  users: { title: "Platform users", description: "Manage global user identities independently from clinic-specific employee or patient profiles.", icon: Users, capabilities: ["Global user directory", "Account status and verification", "Login and session overview"] },
  access: { title: "Roles & permissions", description: "Configure platform access without confusing platform roles with clinic-scoped permissions.", icon: ShieldCheck, capabilities: ["Platform role directory", "Permission catalog", "Role assignments and access review"] },
  audit: { title: "Audit & security", description: "Trace privileged platform actions and review security events.", icon: Activity, capabilities: ["Audit event timeline", "Actor and resource filters", "Security review and investigation"] },
  settings: { title: "Platform settings", description: "Manage global platform configuration and operational defaults.", icon: ShieldCheck, capabilities: ["Platform configuration", "Global defaults", "Security and maintenance controls"] },
}

export function SuperAdminOverviewPage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-[#17142D] p-7 text-white sm:p-9">
        <div className="absolute -right-16 -top-24 size-72 rounded-full bg-violet-500/20 blur-3xl" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Cutilora control center</p>
        <h1 className="relative mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">Platform overview</h1>
        <p className="relative mt-3 max-w-2xl text-sm leading-6 text-slate-300">A central workspace for operating the Cutilora platform, customer organizations, clinic brands, access and security.</p>
        <div className="relative mt-7 flex items-center gap-2 text-sm text-violet-200"><ShieldCheck className="size-4" /> Platform-level administration</div>
      </section>
      <section>
        <div className="mb-4"><h2 className="text-lg font-semibold">Platform domains</h2><p className="mt-1 text-sm text-muted-foreground">Navigate the main areas of platform operations.</p></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(modules).map(([key, item]) => {
            const Icon = item.icon
            return <a key={key} href={`/super-admin/${key}`} className="group rounded-2xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"><div className="flex items-start justify-between"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span><ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div><h3 className="mt-5 font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p></a>
          })}
        </div>
      </section>
      <p className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-xs leading-5 text-muted-foreground">Operational metrics and management actions will be connected when their platform API contracts are available. This overview intentionally does not display fabricated counts or sample customer data.</p>
    </div>
  )
}

export function SuperAdminModulePage({ moduleKey }: { moduleKey: string }) {
  const item = modules[moduleKey] ?? modules.settings
  const Icon = item.icon
  return (
    <div className="space-y-6">
      <header className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="size-6" /></span>
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Platform management</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">{item.title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{item.description}</p></div>
      </header>
      <section className="rounded-2xl border bg-card p-6">
        <div className="flex items-center justify-between gap-4"><div><h2 className="font-semibold">Module workspace</h2><p className="mt-1 text-sm text-muted-foreground">The page structure is ready; live records are not connected yet.</p></div><span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">API pending</span></div>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {item.capabilities.map((capability) => <div key={capability} className="flex items-center gap-3 rounded-xl bg-muted/50 p-4 text-sm"><span className="size-1.5 rounded-full bg-primary" />{capability}</div>)}
        </div>
        <div className="mt-6 rounded-xl border border-dashed p-8 text-center"><p className="font-medium">No platform data connected</p><p className="mt-2 text-sm text-muted-foreground">This module will show live records after the corresponding API endpoints and response contracts are confirmed.</p></div>
      </section>
    </div>
  )
}
