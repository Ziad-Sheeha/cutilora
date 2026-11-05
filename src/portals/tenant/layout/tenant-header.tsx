import { Bell, Building2, Menu, MapPinned } from "lucide-react"
import { useLocation } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { LanguageSwitch } from "@/i18n/language-switch"
import { useI18n } from "@/i18n/i18n-provider"
import type { Branch, Clinic, TenantContext } from "../types/tenant.types"

type Props = {
  context: TenantContext | null
  clinics: Clinic[]
  branches: Branch[]
  onClinicChange: (clinicId: string) => void
  onBranchChange: (branchId: string) => void
  onMenuClick: () => void
}

const clinicFilterRoutes = [
  "/tenant",
  "/tenant/branches",
  "/tenant/users",
  "/tenant/invitations",
  "/tenant/finance",
  "/tenant/insights",
  "/tenant/governance",
]

const branchFilterRoutes = [
  "/tenant/branches",
  "/tenant/finance",
  "/tenant/insights",
  "/tenant/governance",
]

export function TenantHeader({
  context,
  clinics,
  branches,
  onClinicChange,
  onBranchChange,
  onMenuClick,
}: Props) {
  const { locale } = useI18n()
  const { pathname } = useLocation()
  const ar = locale === "ar"
  const tenantName =
    context?.tenant?.displayName ||
    context?.tenant?.name ||
    (ar ? "مساحة المؤسسة" : "Organization workspace")
  const showClinicFilter = clinicFilterRoutes.includes(pathname)
  const showBranchFilter =
    branchFilterRoutes.includes(pathname) &&
    Boolean(context?.access.clinicId || context?.clinic?._id) &&
    branches.length > 0

  return (
    <TooltipProvider>
      <header
        dir={ar ? "rtl" : "ltr"}
        className="sticky top-0 z-30 flex min-h-[76px] flex-wrap items-center justify-between gap-3 border-b bg-background/90 px-4 py-3 backdrop-blur-xl sm:px-7"
      >
        <div className="flex min-w-0 items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onMenuClick}
                className="shrink-0 lg:hidden"
                aria-label={ar ? "فتح القائمة" : "Open navigation"}
              >
                <Menu className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{ar ? "فتح القائمة" : "Open navigation"}</TooltipContent>
          </Tooltip>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[.15em] text-primary">
              {ar ? "مساحة المؤسسة" : "ORGANIZATION WORKSPACE"}
            </p>
            <h1 className="mt-1 truncate text-lg font-semibold tracking-tight">{tenantName}</h1>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          {showClinicFilter && (
            <div className="w-36 sm:w-48">
              <Select
                value={context?.access.clinicId || context?.clinic?._id || "__all__"}
                onValueChange={(value) => onClinicChange(value === "__all__" ? "" : value)}
              >
                <SelectTrigger aria-label={ar ? "العيادة النشطة" : "Active clinic"}>
                  <SelectValue placeholder={ar ? "كل العيادات" : "All clinics"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">{ar ? "كل العيادات" : "All clinics"}</SelectItem>
                  {clinics.map((clinic) => (
                    <SelectItem key={clinic._id} value={clinic._id}>{clinic.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {showBranchFilter && (
            <div className="flex w-36 items-center gap-2 sm:w-44">
              <MapPinned className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
              <Select
                value={context?.access.branchId || context?.branch?._id || "__all__"}
                onValueChange={(value) => onBranchChange(value === "__all__" ? "" : value)}
              >
                <SelectTrigger aria-label={ar ? "الفرع النشط" : "Active branch"}>
                  <SelectValue placeholder={ar ? "كل الفروع" : "All branches"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">{ar ? "كل الفروع" : "All branches"}</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch._id} value={branch._id}>{branch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <LanguageSwitch />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="relative text-muted-foreground"
                aria-label={ar ? "الإشعارات" : "Notifications"}
              >
                <Bell className="size-4" />
                <span className="absolute end-2 top-2 size-1.5 rounded-full bg-primary" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{ar ? "الإشعارات" : "Notifications"}</TooltipContent>
          </Tooltip>
          <div className="hidden size-10 place-items-center rounded-xl bg-violet-100 text-violet-800 sm:grid">
            <Building2 className="size-4" />
          </div>
        </div>
      </header>
    </TooltipProvider>
  )
}
