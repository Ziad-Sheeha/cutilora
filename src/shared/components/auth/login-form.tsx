import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router"
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/i18n/i18n-provider"
import { loginClinic } from "@/portals/clinic/auth/clinic-auth"

type LoginFormProps = { portalName: string }

export function LoginForm({ portalName }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { t, locale } = useI18n()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      await loginClinic(email.trim(), password)
      navigate("/clinic", { replace: true })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : (locale === "ar" ? "تعذر تسجيل الدخول" : "Unable to sign in"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="w-full space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor={portalName + "-email"}>{t.auth.workEmail}</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id={portalName + "-email"} type="email" autoComplete="username" required placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} className="ps-10" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={portalName + "-password"}>{t.auth.password}</Label>
          <span className="text-xs text-muted-foreground">{t.auth.forgotPassword}</span>
        </div>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id={portalName + "-password"} type={showPassword ? "text" : "password"} autoComplete="current-password" required placeholder={t.auth.enterPassword} value={password} onChange={(event) => setPassword(event.target.value)} className="ps-10 pe-11" />
          <Button type="button" variant="ghost" size="icon" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword} className="absolute end-1 top-1/2 size-8 -translate-y-1/2">
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
        </div>
      </div>
      {error && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>}
      <Button type="submit" size="lg" className="w-full" loading={submitting} disabled={submitting}>
        {t.common.signIn} · {t.auth.clinicPortal}
      </Button>
    </form>
  )
}
