import { Bell, Building2, Menu } from "lucide-react"
import { LanguageSwitch } from "@/i18n/language-switch"
import { useI18n } from "@/i18n/i18n-provider"
import { Select } from "@/components/ui/select"
import type { Clinic, TenantContext } from "../types/tenant.types"

type Props = {
  context: TenantContext | null
  clinics: Clinic[]
  onClinicChange: (clinicId: string) => void
  onMenuClick: () => void
}

export function TenantHeader({ context, clinics, onClinicChange, onMenuClick }: Props) {
  const { locale } = useI18n()
  const ar = locale === "ar"
  const tenantName =
    context?.tenant?.displayName ||
    context?.tenant?.name ||
    (ar ? "مساحة المؤسسة" : "Organization workspace")

  return (
    <header
      dir={ar ? "rtl" : "ltr"}
      className="sticky top-0 z-30 flex h-[76px] items-center justify-between gap-4 border-b bg-background/90 px-4 backdrop-blur-xl sm:px-7"
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="grid size-10 shrink-0 place-items-center rounded-xl border lg:hidden"
          aria-label={ar ? "فتح القائمة" : "Open navigation"}
        >
          <Menu className="size-4" />
        </button>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[.15em] text-primary">
            {ar ? "مساحة المؤسسة" : "ORGANIZATION WORKSPACE"}
          </p>
          <h1 className="mt-1 truncate text-lg font-semibold tracking-tight">{tenantName}</h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="w-32 sm:w-48">
          <Select
            aria-label={ar ? "العيادة النشطة" : "Active clinic"}
            value={context?.clinic?._id || ""}
            onChange={(event) => {
              const clinicId = event.target.value || ""
              onClinicChange(clinicId)
            }}
          >
            <option value="">{ar ? "كل العيادات" : "All clinics"}</option>
            {clinics.map((clinic) => (
              <option key={clinic._id} value={clinic._id}>{clinic.name}</option>
            ))}
          </Select>
        </div>
        <LanguageSwitch />
        <button
          type="button"
          className="relative grid size-10 place-items-center rounded-xl border text-muted-foreground"
          aria-label={ar ? "الإشعارات" : "Notifications"}
        >
          <Bell className="size-4" />
          <span className="absolute end-2 top-2 size-1.5 rounded-full bg-primary" />
        </button>
        <div className="hidden size-10 place-items-center rounded-xl bg-violet-100 text-violet-800 sm:grid">
          <Building2 className="size-4" />
        </div>
      </div>
    </header>
  )
}
