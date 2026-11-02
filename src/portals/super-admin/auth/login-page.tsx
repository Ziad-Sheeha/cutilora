import { Link } from "react-router"
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { LoginForm } from "@/portals/shared/auth/login-form"

export function SuperAdminLoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#0B1020] px-5 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft className="size-4" /> Back to Cutilora</Link>
        <div className="mb-7 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-violet-300"><ShieldCheck className="size-7" /></div>
          <p className="mt-5 text-xs font-semibold tracking-[0.2em] text-violet-300">CUTILORA INTERNAL</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Platform administration</h1>
          <p className="mt-2 text-sm text-slate-400">Restricted access for authorized platform administrators.</p>
        </div>
        <Card className="border-slate-700 bg-[#141A33] text-slate-100"><CardContent className="p-6 sm:p-8"><div className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-300"><LockKeyhole className="size-4 text-violet-300" /> Administrator sign in</div><LoginForm portalName="Super Admin" /></CardContent></Card>
        <p className="mt-6 text-center text-xs text-slate-500">This portal is separate from clinic workspaces.</p>
      </div>
    </main>
  )
}
