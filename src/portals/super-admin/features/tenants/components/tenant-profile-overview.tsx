import { Building2, Globe2, Mail, MapPin, Phone, ShieldCheck, SlidersHorizontal, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import type { Tenant } from "../types/tenant.types"

type Labels = Record<string, string>
function Field({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: LucideIcon }) {
  return <div className="min-w-0 rounded-xl bg-muted/35 p-3.5">
    <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
    <div className="mt-1.5 flex min-w-0 items-start gap-2 text-sm font-semibold">
      {Icon && <Icon className="mt-0.5 size-4 shrink-0 text-primary"/>}
      <span className="min-w-0 break-words">{value || "—"}</span>
    </div>
  </div>
}
function Section({ title, subtitle, icon: Icon, children }: { title: string; subtitle?: string; icon: LucideIcon; children: ReactNode }) {
  return <section className="min-w-0 overflow-hidden rounded-2xl border bg-card shadow-sm">
    <div className="flex items-center gap-3 border-b px-4 py-4 sm:px-5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-[18px]"/></span>
      <div className="min-w-0"><h2 className="font-semibold tracking-tight">{title}</h2>{subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}</div>
    </div>
    <div className="grid min-w-0 gap-3 p-4 sm:grid-cols-2 sm:p-5">{children}</div>
  </section>
}
export function TenantProfileOverview({ tenant, labels, locale }: { tenant: Tenant; labels: Labels; locale: string }) {
  const created = tenant.createdAt ? new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { dateStyle: "medium" }).format(new Date(tenant.createdAt)) : "—"
  const updated = tenant.updatedAt ? new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { dateStyle: "medium" }).format(new Date(tenant.updatedAt)) : "—"
  const human = (value?: string | null) => value ? value.replace(/[_-]/g, " ").replace(/\\b\\w/g, (letter) => letter.toUpperCase()) : "—"
  const address = [tenant.address.addressLine1, tenant.address.addressLine2, tenant.address.building, tenant.address.floor, tenant.address.unit, tenant.address.landmark, tenant.address.postalCode].filter(Boolean).join(" · ")
  return <div className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
    <div className="grid min-w-0 content-start gap-4">
      <Section title={labels.identity} subtitle={labels.identityHint} icon={Building2}>
        <Field label={labels.organization} value={tenant.name}/>
        <Field label={labels.displayName} value={tenant.displayName}/>
        <Field label={labels.legalName} value={tenant.legalName}/>
        <Field label={labels.slug} value={tenant.slug}/>
        <Field label={labels.businessType} value={human(tenant.businessType)}/>
        <Field label={labels.industry} value={human(tenant.industry)}/>
        {tenant.description && <div className="rounded-xl border border-dashed p-4 text-sm leading-6 text-muted-foreground sm:col-span-2">{tenant.description}</div>}
      </Section>
      <Section title={labels.contact} icon={Phone}>
        <Field label={labels.email} value={tenant.contact.email} icon={Mail}/>
        <Field label={labels.phone} value={tenant.contact.phone ? tenant.contact.phoneCode + " " + tenant.contact.phone : null} icon={Phone}/>
        <Field label={labels.alternatePhone} value={tenant.contact.alternatePhone ? tenant.contact.phoneCode + " " + tenant.contact.alternatePhone : null} icon={Phone}/>
        <Field label="WhatsApp" value={tenant.contact.whatsapp} icon={Phone}/>
        <Field label={labels.website} value={tenant.contact.website} icon={Globe2}/>
      </Section>
      <Section title={labels.address} icon={MapPin}>
        <div className="rounded-xl bg-muted/35 p-4 text-sm leading-6 sm:col-span-2">{address || "—"}</div>
      </Section>
    </div>
    <aside className="grid min-w-0 content-start gap-4 sm:grid-cols-2 2xl:grid-cols-1">
      <Section title={labels.account} icon={ShieldCheck}>
        <Field label={labels.status} value={human(tenant.status)}/>
        <Field label={labels.plan} value={human(tenant.plan)}/>
        <Field label={labels.created} value={created}/>
        <Field label={labels.updated} value={updated}/>
      </Section>
      <Section title={labels.legal} icon={ShieldCheck}>
        <Field label={labels.taxNumber} value={tenant.legal.taxNumber}/>
        <Field label={labels.vatNumber} value={tenant.legal.vatNumber}/>
        <Field label={labels.registration} value={tenant.legal.commercialRegistrationNumber}/>
      </Section>
      <Section title={labels.branding} icon={Building2}>
        <div className="flex min-w-0 items-center gap-3 sm:col-span-2">
          <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">{tenant.branding.logoUrl ? <img src={tenant.branding.logoUrl} alt="" className="size-full object-cover"/> : <Building2 className="size-6 text-muted-foreground"/>}</span>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{tenant.displayName || tenant.name}</p><p className="text-xs text-muted-foreground">{labels.brandColor}</p></div>
          <span className="size-9 shrink-0 rounded-lg border shadow-sm" style={{backgroundColor:tenant.branding.primaryColor}}/>
        </div>
        {tenant.branding.coverImageUrl && <div className="overflow-hidden rounded-xl border sm:col-span-2"><img src={tenant.branding.coverImageUrl} alt="" className="h-32 w-full object-cover sm:h-40"/></div>}
      </Section>
      <Section title={labels.preferences} icon={SlidersHorizontal}>
        <Field label={labels.timezone} value={tenant.preferences.timezone}/>
        <Field label={labels.locale} value={tenant.preferences.locale}/>
        <Field label={labels.currency} value={tenant.preferences.currency}/>
        <Field label={labels.dateFormat} value={tenant.preferences.dateFormat}/>
        <Field label={labels.weekStartsOn} value={String(tenant.preferences.weekStartsOn)}/>
        <Field label={labels.languages} value={tenant.preferences.supportedLanguages.join(", ")}/>
      </Section>
    </aside>
  </div>
}
