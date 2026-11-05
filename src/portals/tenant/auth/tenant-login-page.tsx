import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { ArrowLeft, ArrowRight, Building2, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react"
import { BrandLogo } from "@/components/brand/brand-logo"
import { Card, CardContent } from "@/components/ui/card"
import { apiPost } from "@/lib/api"
import { useI18n } from "@/i18n/i18n-provider"
import { getTenantContext, getTenantContextFor } from "../api/tenant-api"
import type { TenantLoginResponse, TenantMembership, TenantUser } from "../types/tenant.types"
import { saveTenantSession } from "./tenant-session"
import { TenantLoginForm } from "../components/tenant-login-form"
import { TenantMembershipPicker } from "../components/tenant-membership-picker"

type PendingLogin = {
  token: string
  user: TenantUser
  memberships: TenantMembership[]
}

const tenantRoles = ["tenant_owner", "tenant_admin"]

export function TenantLoginPage() {
  const { locale } = useI18n()
  const ar = locale === "ar"
  const navigate = useNavigate()
  const [pending, setPending] = useState<PendingLogin | null>(null)
  const [selectedTenantId, setSelectedTenantId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const copy = ar
    ? {
        eyebrow: "بوابة إدارة المؤسسة",
        title: "مرحباً بعودتك",
        description: "مساحة واحدة لإدارة مؤسستك وعياداتك وفروعك.",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        signIn: "تسجيل الدخول",
        enterPassword: "أدخل كلمة المرور",
        showPassword: "إظهار كلمة المرور",
        hidePassword: "إخفاء كلمة المرور",
        choose: "اختر المؤسسة التي تريد إدارتها",
        chooseDescription: "حسابك لديه صلاحية إدارة أكثر من مؤسسة. اختر مساحة العمل التي تريد فتحها.",
        continue: "متابعة إلى مساحة العمل",
        noAccess: "هذه البوابة مخصصة لمالك المؤسسة أو مسؤولها.",
        back: "العودة إلى الرئيسية",
        secure: "وصول آمن ومحدد حسب الدور",
        brand: "إدارة مؤسستك تبدأ من هنا",
        clinics: "إدارة العيادات",
        access: "صلاحيات واضحة",
        allLocations: "كل مواقعك في مساحة واحدة",
        roles: "وصول مناسب لكل دور",
      }
    : {
        eyebrow: "ORGANIZATION PORTAL",
        title: "Welcome back",
        description: "One considered workspace for your organization, clinics and branches.",
        email: "Work email",
        password: "Password",
        signIn: "Sign in to your workspace",
        enterPassword: "Enter your password",
        showPassword: "Show password",
        hidePassword: "Hide password",
        choose: "Choose the organization you want to manage",
        chooseDescription: "Your account can manage more than one organization. Choose the workspace you want to open.",
        continue: "Continue to workspace",
        noAccess: "This portal is for organization owners and administrators.",
        back: "Back to home",
        secure: "Secure, role-aware access",
        brand: "A clearer way to lead your organization",
        clinics: "Clinic management",
        access: "Clear permissions",
        allLocations: "All locations, one workspace",
        roles: "Access that follows each role",
      }

  async function establishSession(
    membership: TenantMembership,
    login: PendingLogin,
  ) {
    setLoading(true)
    setError("")
    try {
      saveTenantSession({
        token: login.token,
        user: login.user,
        membership,
        clinicId: membership.clinic || null,
        branchId: null,
      })
      await getTenantContext()
      navigate("/tenant", { replace: true })
    } catch (requestError) {
      setError(getErrorMessage(requestError, ar))
    } finally {
      setLoading(false)
    }
  }

  async function submitCredentials(email: string, password: string) {
    setLoading(true)
    setError("")
    try {
      const response = await apiPost<TenantLoginResponse>("/auth/login", {
        email,
        password,
      })
      const memberships = response.data.memberships.filter(
        (membership) =>
          tenantRoles.includes(membership.role) && membership.scope === "tenant",
      )

      if (!memberships.length) {
        setError(copy.noAccess)
        return
      }

      const resolvedMemberships = memberships.length > 1
        ? await Promise.all(memberships.map(async (membership) => {
            try {
              const tenantContext = await getTenantContextFor(
                response.data.access_token,
                membership.tenant,
              )
              const tenantName = tenantContext.tenant?.displayName || tenantContext.tenant?.name
              return tenantName ? { ...membership, tenantName } : membership
            } catch {
              return membership
            }
          }))
        : memberships

      const login = {
        token: response.data.access_token,
        user: response.data.user,
        memberships: resolvedMemberships,
      }
      setPending(login)

      if (memberships.length === 1) {
        setSelectedTenantId(resolvedMemberships[0].tenant)
        await establishSession(resolvedMemberships[0], login)
      } else {
        setSelectedTenantId(resolvedMemberships[0].tenant)
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError, ar))
    } finally {
      setLoading(false)
    }
  }

  function continueToWorkspace() {
    const membership = pending?.memberships.find(
      (item) => item.tenant === selectedTenantId,
    )
    if (pending && membership) {
      void establishSession(membership, pending)
    }
  }

  const BackArrow = ar ? ArrowLeft : ArrowRight

  return (
    <main
      dir={ar ? "rtl" : "ltr"}
      className="grid min-h-svh bg-[#f7f6fb] lg:grid-cols-[1.05fr_.95fr]"
    >
      <section className="relative hidden overflow-hidden bg-[#171326] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -end-40 -top-40 size-[520px] rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="relative">
          <Link to="/" aria-label={copy.back}>
            <BrandLogo imageClassName="h-11" />
          </Link>
        </div>

        <div className="relative max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-semibold text-violet-200">
            <Sparkles className="size-3.5" />
            {copy.eyebrow}
          </div>
          <h1 className="max-w-lg text-5xl font-semibold leading-[1.12] tracking-tight xl:text-6xl">
            {copy.brand}
          </h1>
          <p className="mt-6 max-w-md text-base leading-8 text-white/55">
            {copy.description}
          </p>

          <div className="mt-12 grid max-w-md grid-cols-2 gap-3">
            <FeatureTile icon={Building2} title={copy.clinics} description={copy.allLocations} />
            <FeatureTile icon={ShieldCheck} title={copy.access} description={copy.roles} />
          </div>
        </div>

        <p className="relative text-xs text-white/35">CUTILORA · {copy.secure}</p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[440px]">
          <Link
            to="/"
            className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground lg:hidden"
          >
            <BackArrow className="size-4" />
            {copy.back}
          </Link>

          <div className="mb-8">
            <div className="mb-8 lg:hidden">
              <BrandLogo imageClassName="h-10" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">
              {copy.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#201a32]">
              {pending ? copy.choose : copy.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {pending ? copy.chooseDescription : copy.description}
            </p>
          </div>

          <Card className="border-white bg-white shadow-[0_24px_80px_rgba(34,24,66,.08)]">
            <CardContent className="p-6 sm:p-8">
              {pending ? (
                <TenantMembershipPicker
                  memberships={pending.memberships}
                  selectedTenantId={selectedTenantId}
                  loading={loading}
                  error={error}
                  continueLabel={copy.continue}
                  onSelect={setSelectedTenantId}
                  onContinue={continueToWorkspace}
                />
              ) : (
                <TenantLoginForm
                  labels={copy}
                  loading={loading}
                  error={error}
                  onSubmit={submitCredentials}
                />
              )}
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Cutilora. {ar ? "جميع الحقوق محفوظة" : "All rights reserved"}.
          </p>
        </div>
      </section>
    </main>
  )
}

function FeatureTile({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
      <Icon className="mb-5 size-5 text-violet-300" />
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-white/40">{description}</p>
    </div>
  )
}

function getErrorMessage(error: unknown, ar: boolean) {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message)
  }
  return ar
    ? "تعذر تسجيل الدخول. تحقق من البيانات وحاول مرة أخرى."
    : "Unable to sign in. Check your details and try again."
}
