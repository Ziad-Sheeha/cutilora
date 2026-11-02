import { Link } from "react-router"
import { ArrowLeft, CalendarDays, ShieldCheck, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { LoginForm } from "@/portals/shared/auth/login-form"
import { BrandLogo } from "@/components/brand/brand-logo"
import darkLogo from "@/assets/1-logo-horizontal/cutilora-logo-horizontal-reversed-for-dark-bg.png"

export function ClinicLoginPage() {
  return (
    <main className="grid min-h-svh bg-background lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#17112D] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-32 -top-32 size-96 rounded-full bg-[#6C3EF2]/30 blur-3xl" />
        <Link to="/" className="relative" aria-label="Cutilora home"><img src={darkLogo} alt="Cutilora" className="h-12 w-auto" /></Link>
        <div className="relative max-w-lg">
          <p className="text-sm font-semibold text-[#C5B5FF]">CLINIC PORTAL</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight">Your clinic, thoughtfully connected.</h1>
          <p className="mt-5 text-base leading-7 text-white/65">A focused workspace for your team, appointments, and day-to-day clinic operations.</p>
          <div className="mt-10 space-y-5 text-sm text-white/80">
            <p className="flex items-center gap-3"><CalendarDays className="size-5 text-[#B8A4FF]" /> Coordinate clinic operations</p>
            <p className="flex items-center gap-3"><Users className="size-5 text-[#B8A4FF]" /> Work with your clinic team</p>
            <p className="flex items-center gap-3"><ShieldCheck className="size-5 text-[#B8A4FF]" /> Access controlled by your organization</p>
          </div>
        </div>
        <p className="relative text-xs text-white/45">The operating system for aesthetic clinics.</p>
      </section>
      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground lg:hidden"><ArrowLeft className="size-4" /> Back to home</Link>
          <div className="mb-8"><BrandLogo className="mb-7" imageClassName="h-12" /><p className="text-sm font-semibold text-primary">CLINIC PORTAL</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">Welcome back</h2><p className="mt-2 text-sm text-muted-foreground">Sign in with the account provided by your clinic.</p></div>
          <Card><CardContent className="p-6 sm:p-8"><LoginForm portalName="Clinic Portal" /></CardContent></Card>
          <p className="mt-6 text-center text-xs text-muted-foreground">Need access? Contact your clinic administrator.</p>
        </div>
      </section>
    </main>
  )
}
