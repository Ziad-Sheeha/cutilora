import { useCallback, useEffect, useState } from "react"
import { Outlet, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/i18n-provider"
import { getBranches, getClinics, getTenantContext } from "../api/tenant-api"
import { clearTenantSession, getTenantSession, updateTenantContext } from "../auth/tenant-session"
import type { Branch, Clinic, TenantContext } from "../types/tenant.types"
import { TenantHeader } from "./tenant-header"
import { TenantSidebar } from "./tenant-sidebar"

export type TenantOutletContext = {
  context: TenantContext | null
  clinics: Clinic[]
  branches: Branch[]
  refresh: () => Promise<void>
  refreshContext: () => Promise<void>
}

const SIDEBAR_STORAGE_KEY = "cutilora:tenant-sidebar-collapsed"

export function TenantLayout() {
  const [context, setContext] = useState<TenantContext | null>(null)
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true",
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { locale } = useI18n()
  const ar = locale === "ar"

  const refreshContext = useCallback(async () => {
    setContext(await getTenantContext())
  }, [])

  const refresh = useCallback(async () => {
    const [nextContext, nextClinics] = await Promise.all([
      getTenantContext(),
      getClinics(),
    ])
    const clinicId = nextContext.access.clinicId || nextContext.clinic?._id || getTenantSession()?.clinicId
    const nextBranches = clinicId ? await getBranches(clinicId) : []
    setContext(nextContext)
    setClinics(nextClinics)
    setBranches(nextBranches)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed))
  }, [sidebarCollapsed])

  useEffect(() => {
    let active = true

    refresh()
      .then(() => {
        if (active) setError("")
      })
      .catch((requestError) => {
        if (!active) return
        setError(requestError instanceof Error ? requestError.message : "Unable to load workspace")
        if (!getTenantSession()) navigate("/tenant/login", { replace: true })
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [navigate, refresh])

  async function changeClinic(clinicId: string) {
    updateTenantContext({ clinicId: clinicId || null, branchId: null })
    setError("")
    try {
      await refresh()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to switch clinic")
    }
  }

  async function changeBranch(branchId: string) {
    updateTenantContext({ branchId: branchId || null })
    setError("")
    try {
      setContext(await getTenantContext())
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to switch branch")
    }
  }

  return (
    <div
      dir={ar ? "rtl" : "ltr"}
      className={`min-h-svh bg-[#f7f7fb] text-foreground lg:grid ${sidebarCollapsed ? "lg:grid-cols-[80px_minmax(0,1fr)]" : "lg:grid-cols-[268px_minmax(0,1fr)]"}`}
    >
      <div className="sticky top-0 hidden h-svh lg:block">
        <TenantSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
        />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <Button
            variant="ghost"
            className="absolute inset-0 h-full w-full rounded-none bg-black/40 hover:bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-label={ar ? "إغلاق القائمة" : "Close navigation"}
          />
          <div className="relative h-full w-[min(300px,86vw)] shadow-2xl">
            <TenantSidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="min-w-0">
        <TenantHeader
          context={context}
          clinics={clinics}
          branches={branches}
          onClinicChange={changeClinic}
          onBranchChange={changeBranch}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="mx-auto w-full max-w-[1560px] p-4 sm:p-7 xl:p-9">
          {error && (
            <div role="alert" className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearTenantSession()
                  navigate("/tenant/login", { replace: true })
                }}
              >
                {ar ? "تسجيل الدخول" : "Sign in"}
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[55vh] items-center justify-center text-sm text-muted-foreground">
              {ar ? "جارٍ تحميل مساحة المؤسسة…" : "Loading organization workspace…"}
            </div>
          ) : (
            <Outlet context={{ context, clinics, branches, refresh, refreshContext } satisfies TenantOutletContext} />
          )}
        </main>

        <footer className="px-6 pb-6 text-center text-[11px] text-muted-foreground">
          CUTILORA · {ar ? "مساحة إدارة المؤسسة" : "Organization workspace"}
        </footer>
      </div>
    </div>
  )
}
