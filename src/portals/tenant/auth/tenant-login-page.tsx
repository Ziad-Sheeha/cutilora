import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router"
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BrandLogo } from "@/components/brand/brand-logo"
import { useI18n } from "@/i18n/i18n-provider"
import { apiPost } from "@/lib/api"
import type { TenantLoginResponse, TenantMembership } from "../types/tenant.types"
import { saveTenantSession } from "./tenant-session"
import { getTenantContext } from "../api/tenant-api"
const allowed = (m: TenantMembership) => ["tenant_owner", "tenant_admin"].includes(m.role) && m.scope === "tenant"
export function TenantLoginPage() {
  const { locale } = useI18n(); const ar = locale === "ar"; const navigate = useNavigate()
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [show,setShow]=useState(false)
  const [pending,setPending]=useState<{token:string;user:TenantLoginResponse["data"]["user"];memberships:TenantMembership[]}|null>(null)
  const [selected,setSelected]=useState(""); const [loading,setLoading]=useState(false); const [error,setError]=useState("")
  const copy = ar ? { eyebrow:"بوابة إدارة المؤسسة", title:"مرحباً بعودتك", desc:"مساحة واحدة لإدارة مؤسستك وعياداتك وفروعك.", email:"البريد الإلكتروني", password:"كلمة المرور", signIn:"تسجيل الدخول", choose:"اختر المؤسسة التي تريد إدارتها", continue:"متابعة إلى مساحة العمل", noAccess:"هذه البوابة مخصصة لمالك المؤسسة أو مسؤولها.", back:"العودة إلى الرئيسية", secure:"وصول آمن ومحدد حسب الدور", brand:"إدارة مؤسستك تبدأ من هنا" } : { eyebrow:"ORGANIZATION PORTAL", title:"Welcome back", desc:"One considered workspace for your organization, clinics and branches.", email:"Work email", password:"Password", signIn:"Sign in to your workspace", choose:"Choose the organization you want to manage", continue:"Continue to workspace", noAccess:"This portal is for organization owners and administrators.", back:"Back to home", secure:"Secure, role-aware access", brand:"A clearer way to lead your organization" }
  async function establish(membership: TenantMembership, token = pending?.token, user = pending?.user) {
    if (!token || !user) return
    setLoading(true); setError("")
    try { saveTenantSession({token,user,membership,clinicId:membership.clinic || null,branchId:null}); await getTenantContext(); navigate("/tenant",{replace:true}) }
    catch(e) { setError(e instanceof Error ? e.message : "Unable to load organization context."); }
    finally { setLoading(false) }
  }
  async function submit(event:FormEvent) {
    event.preventDefault(); setLoading(true); setError("")
    try {
      const response = await apiPost<TenantLoginResponse>("/auth/login",{email,password})
      const memberships = response.data.memberships.filter(allowed)
      if (!memberships.length) { setError(copy.noAccess); return }
      setPending({token:response.data.access_token,user:response.data.user,memberships})
      if (memberships.length === 1) await establish(memberships[0],response.data.access_token,response.data.user)
      else setSelected(memberships[0].tenant)
    } catch(e) { const message = e && typeof e === "object" && "message" in e ? String(e.message) : ""; setError(message || (ar ? "تعذر تسجيل الدخول. تحقق من البيانات." : "Unable to sign in. Check your credentials.")) }
    finally { setLoading(false) }
  }
  const Arrow = ar ? ArrowLeft : ArrowRight
  return <main dir={ar?"rtl":"ltr"} className="grid min-h-svh bg-[#f7f6fb] lg:grid-cols-[1.05fr_.95fr]">
    <section className="relative hidden overflow-hidden bg-[#171326] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16"><div className="absolute -end-40 -top-40 size-[520px] rounded-full bg-violet-600/20 blur-[100px]"/><div className="relative"><Link to="/"><BrandLogo imageClassName="h-11"/></Link></div><div className="relative max-w-xl"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-semibold text-violet-200"><Sparkles className="size-3.5"/>{copy.eyebrow}</div><h1 className="max-w-lg text-5xl font-semibold leading-[1.12] tracking-tight xl:text-6xl">{copy.brand}</h1><p className="mt-6 max-w-md text-base leading-8 text-white/55">{copy.desc}</p><div className="mt-12 grid max-w-md grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><Building2 className="mb-5 size-5 text-violet-300"/><p className="text-sm font-semibold">{ar?"إدارة العيادات":"Clinic management"}</p><p className="mt-1 text-xs text-white/40">{ar?"كل مواقعك في مساحة واحدة":"All locations, one workspace"}</p></div><div className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><ShieldCheck className="mb-5 size-5 text-violet-300"/><p className="text-sm font-semibold">{ar?"صلاحيات واضحة":"Clear permissions"}</p><p className="mt-1 text-xs text-white/40">{ar?"وصول مناسب لكل دور":"Access that follows each role"}</p></div></div></div><p className="relative text-xs text-white/35">CUTILORA · {copy.secure}</p></section>
    <section className="flex items-center justify-center px-5 py-12 sm:px-10"><div className="w-full max-w-[440px]"><Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground lg:hidden"><Arrow className="size-4"/>{copy.back}</Link><div className="mb-8"><div className="mb-8 lg:hidden"><BrandLogo imageClassName="h-10"/></div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">{copy.eyebrow}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#201a32]">{pending?copy.choose:copy.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{pending?copy.noAccess:copy.desc}</p></div>
    <Card className="border-white bg-white shadow-[0_24px_80px_rgba(34,24,66,.08)]"><CardContent className="p-6 sm:p-8">{pending ? <div className="space-y-3">{pending.memberships.map(m=><button key={m.tenant} type="button" onClick={()=>setSelected(m.tenant)} className={"flex w-full items-center gap-3 rounded-xl border p-4 text-start transition-all "+(selected===m.tenant?"border-primary bg-primary/5 ring-2 ring-primary/10":"border-border hover:border-primary/40")}><span className="grid size-10 place-items-center rounded-xl bg-violet-100 text-violet-700"><Building2 className="size-5"/></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{m.tenant}</span><span className="mt-1 block text-xs text-muted-foreground">{m.role.replaceAll("_"," ")}</span></span>{selected===m.tenant&&<CheckCircle2 className="size-5 text-primary"/>}</button>)}<Button className="mt-3 w-full" loading={loading} disabled={!selected} onClick={()=>{const membership=pending.memberships.find(m=>m.tenant===selected);if(membership)void establish(membership)}}>{copy.continue}<Arrow className="size-4"/></Button></div> : <form onSubmit={submit} className="space-y-5"><div className="space-y-2"><Label htmlFor="tenant-email">{copy.email}</Label><div className="relative"><Mail className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input id="tenant-email" type="email" required autoComplete="username" className="ps-10" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)}/></div></div><div className="space-y-2"><Label htmlFor="tenant-password">{copy.password}</Label><div className="relative"><LockKeyhole className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input id="tenant-password" type={show?"text":"password"} required autoComplete="current-password" className="ps-10 pe-11" placeholder="••••••••••••" value={password} onChange={e=>setPassword(e.target.value)}/><button type="button" onClick={()=>setShow(v=>!v)} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label={show?(ar?"إخفاء كلمة المرور":"Hide password"):(ar?"إظهار كلمة المرور":"Show password")}>{show?<EyeOff className="size-4"/>:<Eye className="size-4"/>}</button></div></div>{error&&<p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}<Button type="submit" size="lg" className="w-full" loading={loading}>{copy.signIn}<Arrow className="size-4"/></Button><p className="text-center text-xs leading-5 text-muted-foreground">{copy.secure}</p></form>}</CardContent></Card><p className="mt-6 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Cutilora. {ar?"جميع الحقوق محفوظة":"All rights reserved"}.</p></div></section></main>
}
