import { useState, type FormEvent } from "react"
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Labels = {
  email: string
  password: string
  signIn: string
  enterPassword: string
  showPassword: string
  hidePassword: string
  secure: string
}
type Props = {
  labels: Labels
  loading: boolean
  error: string
  onSubmit: (email: string, password: string) => void
}

export function TenantLoginForm({ labels, loading, error, onSubmit }: Props) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(email, password)
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="tenant-email">{labels.email}</Label>
        <div className="relative">
          <Mail className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="tenant-email"
            type="email"
            required
            autoComplete="username"
            className="ps-10"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tenant-password">{labels.password}</Label>
        <div className="relative">
          <LockKeyhole className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="tenant-password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="ps-10 pe-11"
            placeholder={labels.enterPassword}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute end-1 top-1/2 size-9 -translate-y-1/2 text-muted-foreground"
            aria-label={showPassword ? labels.hidePassword : labels.showPassword}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" loading={loading}>
        {labels.signIn}
      </Button>
      <p className="text-center text-xs leading-5 text-muted-foreground">{labels.secure}</p>
    </form>
  )
}
