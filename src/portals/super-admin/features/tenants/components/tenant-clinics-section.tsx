import { Building2 } from "lucide-react"
import { resolveAssetUrl } from "@/shared/utils/resolve-asset-url"
import { AppImage } from "@/shared/components/media/app-image"
import type { TenantClinic } from "../types/tenant.types"

function human(value: string) {
  return value.replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function TenantClinicsSection({ clinics, locale }: { clinics: TenantClinic[]; locale: string }) {
  const ar = locale === "ar"
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_2px_12px_-8px_rgba(15,23,42,.18)]">
      <div className="flex items-center gap-3 border-b border-border/70 px-5 py-4 sm:px-6">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Building2 className="size-[18px]"/></span>
        <div><h2 className="text-sm font-semibold tracking-tight">{ar ? "العيادات التابعة" : "Clinics"}</h2><p className="mt-1 text-xs text-muted-foreground">{ar ? "الفروع والعيادات المسجلة تحت هذه المؤسسة" : "Clinics registered under this tenant"}</p></div>
      </div>
      <div className="grid min-w-0 gap-3 p-4 sm:p-5">
        {clinics.length ? clinics.map((clinic) => (
          <article key={clinic.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-border/70 bg-background/70 p-3">
            <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
              {clinic.branding.logoUrl ? <AppImage src={resolveAssetUrl(clinic.branding.logoUrl)} alt={clinic.name} className="size-full" imageClassName="size-full object-cover" fallback={<Building2 className="size-6"/>}/> : <Building2 className="size-6 text-muted-foreground"/>}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{clinic.name || "—"}</p>
              <p className="mt-1 text-xs text-muted-foreground">{human(clinic.clinicType)} · {human(clinic.status)}</p>
              {clinic.branding.coverImageUrl && <AppImage src={resolveAssetUrl(clinic.branding.coverImageUrl)} alt={ar ? "صورة غلاف العيادة" : "Clinic cover"} className="mt-2 h-16 w-full rounded-lg" imageClassName="size-full rounded-lg object-cover"/>}
            </div>
            <span className="size-8 shrink-0 rounded-lg border" style={{ backgroundColor: clinic.branding.primaryColor || "transparent" }}/>
          </article>
        )) : <p className="text-sm text-muted-foreground">{ar ? "لا توجد عيادات مسجلة." : "No clinics registered."}</p>}
      </div>
    </section>
  )
}
