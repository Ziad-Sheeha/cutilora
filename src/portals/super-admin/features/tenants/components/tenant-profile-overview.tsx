import { Building2, CalendarDays, Globe2, Mail, MapPin, Phone, ShieldCheck, SlidersHorizontal, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import type { Tenant } from "../types/tenant.types"
import { resolveAssetUrl } from "@/shared/utils/resolve-asset-url"
import { TenantClinicsSection } from "./tenant-clinics-section"

type Labels = Record<string, string>

export function TenantProfileField({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: LucideIcon }) {
  return <div className="group min-w-0 rounded-xl border border-border/70 bg-background/70 px-4 py-3.5 transition-colors hover:border-primary/25 hover:bg-muted/30">
    <p className="text-[11px] font-medium tracking-wide text-muted-foreground">{label}</p>
    <div className="mt-2 flex min-w-0 items-start gap-2.5 text-sm font-semibold leading-6 text-foreground">
      {Icon && <Icon className="mt-1 size-4 shrink-0 text-primary/80"/>}
      <span className="min-w-0 break-words">{value || "—"}</span>
    </div>
  </div>
}

export function TenantProfileSection({ title, subtitle, icon: Icon, children }: { title: string; subtitle?: string; icon: LucideIcon; children: ReactNode }) {
  return <section className="min-w-0 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_2px_12px_-8px_rgba(15,23,42,.18)]">
    <div className="flex items-center gap-3 border-b border-border/70 px-5 py-4 sm:px-6">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-[18px]"/></span>
      <div className="min-w-0"><h2 className="text-sm font-semibold tracking-tight">{title}</h2>{subtitle && <p className="mt-1 text-xs leading-5 text-muted-foreground">{subtitle}</p>}</div>
    </div>
    <div className="grid min-w-0 gap-3 p-4 sm:grid-cols-2 sm:p-5">{children}</div>
  </section>
}

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { dateStyle: "medium" }).format(date)
}

export function TenantProfileOverview({ tenant, labels, locale }: { tenant: Tenant; labels: Labels; locale: string }) {
  const created = formatDate(tenant.createdAt, locale)
  const updated = formatDate(tenant.updatedAt, locale)
  const human = (value?: string | null) => value ? value.replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "—"
  const address = [tenant.address.addressLine1, tenant.address.addressLine2, tenant.address.building, tenant.address.floor, tenant.address.unit, tenant.address.landmark, tenant.address.postalCode].filter(Boolean).join(" · ")
  const contactCount = [tenant.contact.email, tenant.contact.phone, tenant.contact.alternatePhone, tenant.contact.whatsapp, tenant.contact.website].filter(Boolean).length
  const legalCount = [tenant.legal.taxNumber, tenant.legal.vatNumber, tenant.legal.commercialRegistrationNumber].filter(Boolean).length

  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Building2 className="size-5"/></span><div className="min-w-0"><p className="text-xs text-muted-foreground">{labels.businessType}</p><p className="mt-1 truncate text-sm font-semibold">{human(tenant.businessType)}</p></div></div>
      <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm"><span className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600"><Phone className="size-5"/></span><div className="min-w-0"><p className="text-xs text-muted-foreground">{labels.contact}</p><p className="mt-1 text-sm font-semibold">{contactCount} {locale === "ar" ? "وسيلة تواصل" : "contact methods"}</p></div></div>
      <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm"><span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600"><ShieldCheck className="size-5"/></span><div className="min-w-0"><p className="text-xs text-muted-foreground">{labels.legal}</p><p className="mt-1 text-sm font-semibold">{legalCount} {locale === "ar" ? "بيانات مسجلة" : "records on file"}</p></div></div>
      <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm"><span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600"><CalendarDays className="size-5"/></span><div className="min-w-0"><p className="text-xs text-muted-foreground">{labels.created}</p><p className="mt-1 truncate text-sm font-semibold">{created}</p></div></div>
    </div>

    <div className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.75fr)]">
      <div className="grid min-w-0 content-start gap-5">
        <TenantProfileSection title={labels.identity} subtitle={labels.identityHint} icon={Building2}>
          <TenantProfileField label={labels.organization} value={tenant.name}/>
          <TenantProfileField label={labels.displayName} value={tenant.displayName}/>
          <TenantProfileField label={labels.legalName} value={tenant.legalName}/>
          <TenantProfileField label={labels.slug} value={tenant.slug}/>
          <TenantProfileField label={labels.businessType} value={human(tenant.businessType)}/>
          <TenantProfileField label={labels.industry} value={human(tenant.industry)}/>
          {tenant.description && <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-sm leading-7 text-muted-foreground sm:col-span-2">{tenant.description}</div>}
        </TenantProfileSection>

        <TenantProfileSection title={labels.contact} subtitle={locale === "ar" ? "قنوات التواصل الرسمية للمؤسسة" : "Official organization communication channels"} icon={Phone}>
          <TenantProfileField label={labels.email} value={tenant.contact.email} icon={Mail}/>
          <TenantProfileField label={labels.phone} value={tenant.contact.phone ? [tenant.contact.phoneCode, tenant.contact.phone].filter(Boolean).join(" ") : null} icon={Phone}/>
          <TenantProfileField label={labels.alternatePhone} value={tenant.contact.alternatePhone ? [tenant.contact.phoneCode, tenant.contact.alternatePhone].filter(Boolean).join(" ") : null} icon={Phone}/>
          <TenantProfileField label="WhatsApp" value={tenant.contact.whatsapp} icon={Phone}/>
          <TenantProfileField label={labels.website} value={tenant.contact.website} icon={Globe2}/>
        </TenantProfileSection>

        <TenantProfileSection title={labels.address} subtitle={locale === "ar" ? "العنوان المسجل للمؤسسة" : "Registered organization address"} icon={MapPin}>
          <div className="flex min-h-20 items-start gap-3 rounded-xl border border-border/70 bg-background/70 p-4 text-sm leading-7 sm:col-span-2"><MapPin className="mt-1 size-4 shrink-0 text-primary"/><span>{address || "—"}</span></div>
        </TenantProfileSection>
      </div>

      <aside className="grid min-w-0 content-start gap-5 sm:grid-cols-2 2xl:grid-cols-1">
        <TenantProfileSection title={labels.account} subtitle={locale === "ar" ? "حالة الحساب وتواريخ النشاط" : "Account status and activity dates"} icon={ShieldCheck}>
          <TenantProfileField label={labels.status} value={human(tenant.status)}/>
          <TenantProfileField label={labels.plan} value={human(tenant.plan)}/>
          <TenantProfileField label={labels.created} value={created}/>
          <TenantProfileField label={labels.updated} value={updated}/>
        </TenantProfileSection>

        <TenantProfileSection title={labels.legal} subtitle={locale === "ar" ? "بيانات الامتثال والتسجيل" : "Registration and compliance details"} icon={ShieldCheck}>
          <TenantProfileField label={labels.taxNumber} value={tenant.legal.taxNumber}/>
          <TenantProfileField label={labels.vatNumber} value={tenant.legal.vatNumber}/>
          <TenantProfileField label={labels.registration} value={tenant.legal.commercialRegistrationNumber}/>
        </TenantProfileSection>

        <TenantProfileSection title={labels.branding} subtitle={locale === "ar" ? "الأصول المرئية وإعدادات العلامة" : "Visual assets and brand settings"} icon={Building2}>
          <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border/70 bg-background/70 p-3.5 sm:col-span-2">
            <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">{tenant.branding.logoUrl ? <img src={resolveAssetUrl(tenant.branding.logoUrl)} alt="" className="size-full object-cover" onError={(event) => { event.currentTarget.style.visibility = "hidden" }}/> : <Building2 className="size-6 text-muted-foreground"/>}</span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{tenant.displayName || tenant.name}</p><p className="mt-1 text-xs text-muted-foreground">{labels.brandColor}</p></div>
            <span className="size-9 shrink-0 rounded-lg border shadow-sm" style={{backgroundColor:tenant.branding.primaryColor || "transparent"}}/>
          </div>
          {tenant.branding.coverImageUrl && <div className="overflow-hidden rounded-xl border border-border/70 sm:col-span-2"><img src={resolveAssetUrl(tenant.branding.coverImageUrl)} alt="" className="h-32 w-full object-cover sm:h-40" onError={(event) => { event.currentTarget.style.visibility = "hidden" }}/></div>}
        </TenantProfileSection>

        <TenantClinicsSection clinics={tenant.clinics ?? []} locale={locale}/>
        <TenantProfileSection title={labels.preferences} subtitle={locale === "ar" ? "إعدادات اللغة والتوقيت والتنسيق" : "Locale, time zone and formatting"} icon={SlidersHorizontal}>
          <TenantProfileField label={labels.timezone} value={tenant.preferences.timezone}/>
          <TenantProfileField label={labels.locale} value={tenant.preferences.locale}/>
          <TenantProfileField label={labels.currency} value={tenant.preferences.currency}/>
          <TenantProfileField label={labels.dateFormat} value={tenant.preferences.dateFormat}/>
          <TenantProfileField label={labels.weekStartsOn} value={String(tenant.preferences.weekStartsOn)}/>
          <TenantProfileField label={labels.languages} value={tenant.preferences.supportedLanguages.join(", ")}/>
        </TenantProfileSection>
      </aside>
    </div>
  </div>
}
