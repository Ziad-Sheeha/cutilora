import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router"
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { loginSuperAdmin } from "@/portals/super-admin/auth/super-admin-auth"

export function SuperAdminLoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      await loginSuperAdmin(email.trim(), password)
      navigate("/super-admin", { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="w-full space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label htmlFor="super-admin-email" className="text-sm font-medium text-slate-200">Work email</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <Input id="super-admin-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@cutilora.com" className="border-slate-700 bg-[#0B1020] ps-10 text-white placeholder:text-slate-500" />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="super-admin-password" className="text-sm font-medium text-slate-200">Password</label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <Input id="super-admin-password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="border-slate-700 bg-[#0B1020] ps-10 pe-11 text-white placeholder:text-slate-500" />
          <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
        </div>
      </div>
      {error && <div role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2.5 text-sm text-red-200">{error}</div>}
      <Button type="submit" size="lg" disabled={submitting} className="w-full bg-[#8B6AF8] text-white hover:bg-[#7651E8]">
        {submitting ? <><LoaderCircle className="size-4 animate-spin" /> Signing in…</> : "Sign in to platform"}
      </Button>
      <p className="text-center text-xs leading-5 text-slate-500">Secure access for authorized Cutilora platform administrators.</p>
    </form>
  )
}
