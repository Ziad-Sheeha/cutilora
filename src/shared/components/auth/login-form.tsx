import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router"
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/i18n/i18n-provider"
type LoginFormProps={portalName:string}
export function LoginForm({portalName}:LoginFormProps){
 const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [showPassword,setShowPassword]=useState(false);const navigate=useNavigate();const {t}=useI18n()
 function handleSubmit(event:FormEvent<HTMLFormElement>){event.preventDefault();navigate(portalName==="Super Admin"?"/super-admin":"/clinic")}
 return <form className="w-full space-y-5" onSubmit={handleSubmit}><div className="space-y-2"><Label htmlFor={portalName+"-email"}>{t.auth.workEmail}</Label><div className="relative"><Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true"/><Input id={portalName+"-email"} type="email" autoComplete="username" placeholder="you@company.com" value={email} onChange={event=>setEmail(event.target.value)} className="ps-10"/></div></div><div className="space-y-2"><div className="flex items-center justify-between gap-3"><Label htmlFor={portalName+"-password"}>{t.auth.password}</Label><span className="text-xs text-muted-foreground">{t.auth.forgotPassword}</span></div><div className="relative"><LockKeyhole className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true"/><Input id={portalName+"-password"} type={showPassword?"text":"password"} autoComplete="current-password" placeholder={t.auth.enterPassword} value={password} onChange={event=>setPassword(event.target.value)} className="ps-10 pe-11"/><button type="button" onClick={()=>setShowPassword(visible=>!visible)} aria-label={showPassword?t.auth.hidePassword:t.auth.showPassword} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword?<EyeOff className="size-4"/>:<Eye className="size-4"/>}</button></div></div><Button type="submit" size="lg" className="w-full">{t.common.signIn} · {portalName==="Clinic Portal"?t.auth.clinicPortal:t.admin.superAdmin}</Button><p className="text-center text-xs leading-5 text-muted-foreground">{t.auth.previewOnly}</p></form>
}
