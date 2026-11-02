import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router"
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type LoginFormProps = { portalName: string }

export function LoginForm({ portalName }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Development-only preview access. This does not authenticate the user.
    navigate(portalName === "Super Admin" ? "/super-admin" : "/clinic")
  }

  return (
    <form className="w-full space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor={portalName + "-email"}>Work email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id={portalName + "-email"} type="email" autoComplete="username" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} className="pl-10" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3"><Label htmlFor={portalName + "-password"}>Password</Label><span className="text-xs text-muted-foreground">Forgot password? Contact your administrator.</span></div>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id={portalName + "-password"} type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} className="pl-10 pr-11" />
          <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
        </div>
      </div>
      <Button type="submit" size="lg" className="w-full">Sign in to {portalName}</Button>
      <p className="text-center text-xs leading-5 text-muted-foreground">Development preview access only. Authentication is not connected.</p>
    </form>
  )
}
