import { useState, type ReactNode } from "react"
import { Link, useParams } from "react-router"
import { ArrowLeft, ArrowUpRight, Building2, CalendarClock, CheckCircle2, CreditCard, ExternalLink, Globe2, Mail, MapPin, Phone, ShieldCheck, WalletCards } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { TenantStatusBadge } from "../components/tenant-status-badge"
import { TenantProfileField, TenantProfileOverview, TenantProfileSection } from "../components/tenant-profile-overview"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/i18n/i18n-provider"
import { useTenant, useTenantMutations, useTenantPayments, useTenantSubscription } from "../hooks/use-tenants"
import { pushToast, store } from "@/store"
import type { Tenant, TenantPayment, TenantSubscription } from "../types/tenant.types"

function human(value: string | null | undefined) { return value ? value.replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "—" }
function dateTime(value: string | null, locale: string) {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date)
}
function money(amount: number, currency: string, locale: string) {
  try { return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-GB", { style: "currency", currency: currency || "EGP", maximumFractionDigits: 2 }).format(amount) }
  catch { return amount.toLocaleString() + " " + currency }
}

function SubscriptionPanel({ data, loading, error, locale, labels }: { data: TenantSubscription | undefined; loading: boolean; error: unknown; locale: string; labels: Record<string, string> }) {
  if (loading) return <PanelState text={labels.loading}/>
  if (error) return <PanelState text={error instanceof Error ? error.message : labels.failed}/>
  if (!data) return <PanelState text={labels.empty}/>
  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><InfoCard label={labels.plan} value={data.plan?.name || "—"} hint={data.plan ? money(data.plan.amount, data.plan.currency, locale) : "—"} icon={CreditCard}/><InfoCard label={labels.subscriptionStatus} value={human(data.status)} hint={human(data.billingCycle)} icon={ShieldCheck}/><InfoCard label={labels.currentPeriod} value={dateTime(data.currentPeriodStartsAt, locale)} hint={labels.until + " " + dateTime(data.currentPeriodEndsAt, locale)} icon={CalendarClock}/><InfoCard label={labels.nextBilling} value={dateTime(data.nextBillingAt, locale)} hint={data.cancelAtPeriodEnd ? labels.cancelScheduled : labels.renewalExpected} icon={WalletCards}/></div>
    <TenantProfileSection title={labels.subscriptionTimeline} icon={CalendarClock}><div className="grid gap-5 sm:grid-cols-2"><TenantProfileField label={labels.trialStarts} value={dateTime(data.trialStartsAt, locale)}/><TenantProfileField label={labels.trialEnds} value={dateTime(data.trialEndsAt, locale)}/><TenantProfileField label={labels.periodStarts} value={dateTime(data.currentPeriodStartsAt, locale)}/><TenantProfileField label={labels.periodEnds} value={dateTime(data.currentPeriodEndsAt, locale)}/><TenantProfileField label={labels.canceledAt} value={dateTime(data.canceledAt, locale)}/><TenantProfileField label={labels.cancelAtPeriodEnd} value={data.cancelAtPeriodEnd ? labels.yes : labels.no}/></div>{data.notes && <p className="mt-5 rounded-xl bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">{data.notes}</p>}</TenantProfileSection>
  </div>
}
function PaymentsPanel({ data, loading, error, locale, labels }: { data: TenantPayment[] | undefined; loading: boolean; error: unknown; locale: string; labels: Record<string, string> }) {
  const columns: DataTableColumn<TenantPayment>[] = [
    { id: "invoice", header: labels.invoice, cell: (payment) => <span className="font-semibold">{payment.invoiceNumber || "—"}</span> },
    { id: "amount", header: labels.amount, cell: (payment) => <span className="whitespace-nowrap font-semibold tabular-nums">{money(payment.amount, payment.currency, locale)}</span> },
    { id: "method", header: labels.method, cell: (payment) => human(payment.method) },
    { id: "provider", header: labels.provider, cell: (payment) => payment.provider || "—" },
    { id: "status", header: labels.status, cell: (payment) => <div className="space-y-1"><TenantStatusBadge status={payment.status}/>{payment.failureReason && <p className="max-w-[190px] text-xs text-rose-600">{payment.failureReason}</p>}</div> },
    { id: "paid-at", header: labels.paidAt, cell: (payment) => <span className="whitespace-nowrap text-xs text-muted-foreground">{dateTime(payment.paidAt, locale)}</span> },
    { id: "actions", header: labels.action, headerClassName: "text-end", cell: (payment) => payment.invoiceUrl ? <div className="flex justify-end"><a href={payment.invoiceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">{labels.viewInvoice}<ExternalLink className="size-3"/></a></div> : <span className="block text-end text-muted-foreground">—</span> },
  ]
  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      <div className="border-b px-5 py-4"><h2 className="font-semibold">{labels.paymentHistory}</h2><p className="mt-1 text-xs text-muted-foreground">{data?.length ?? 0} {labels.records}</p></div>
      <DataTable
        columns={columns}
        data={data ?? []}
        getRowId={(payment) => payment.providerReference || payment.invoiceNumber || [payment.amount, payment.currency, payment.paidAt].join("-")}
        isLoading={loading}
        loadingLabel={labels.loading}
        emptyState={<PanelState text={error instanceof Error ? error.message : data?.length === 0 ? labels.noPayments : labels.failed}/>}
      />
    </section>
  )
}
function InfoCard({ label, value, hint, icon: Icon }: { label: string; value: string; hint: string; icon: typeof CreditCard }) {
  return <div className="rounded-2xl border bg-card p-4"><div className="flex items-center justify-between"><p className="text-xs font-medium text-muted-foreground">{label}</p><Icon className="size-4 text-primary"/></div><p className="mt-3 text-lg font-semibold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{hint}</p></div>
}
function PanelState({ text }: { text: string }) { return <div className="rounded-2xl border bg-card px-6 py-16 text-center text-sm text-muted-foreground">{text}</div> }

export function TenantDetailsPage() {
  const { tenantId = "" } = useParams<{ tenantId: string }>()
  const { locale } = useI18n()
  const ar = locale === "ar"
  const [tab, setTab] = useState("overview")
  const tenantQuery = useTenant(tenantId)
  const mutations = useTenantMutations()
  const subscriptionQuery = useTenantSubscription(tenantId)
  const paymentsQuery = useTenantPayments(tenantId)
  const labels: Record<string, string> = ar ? {
    back: "العودة إلى المؤسسات", loading: "جارٍ تحميل الملف...", failed: "تعذر تحميل البيانات", overview: "نظرة عامة", subscription: "الاشتراك", payments: "المدفوعات", identity: "الهوية التجارية", identityHint: "البيانات الأساسية للمؤسسة ونوع نشاطها", organization: "اسم المؤسسة", displayName: "الاسم الظاهر", legalName: "الاسم القانوني", slug: "الرابط التعريفي", businessType: "نوع النشاط", industry: "المجال", contact: "بيانات التواصل", email: "البريد الإلكتروني", phone: "الهاتف", alternatePhone: "هاتف بديل", website: "الموقع الإلكتروني", address: "العنوان", countryId: "معرّف الدولة", governorateId: "معرّف المحافظة", cityId: "معرّف المدينة", districtId: "معرّف الحي", addressLine1: "العنوان الأول", addressLine2: "العنوان الثاني", building: "المبنى", floor: "الدور", unit: "الوحدة", postalCode: "الرمز البريدي", account: "الحساب", status: "الحالة", plan: "الخطة", created: "تاريخ الإنشاء", updated: "آخر تحديث", legal: "البيانات القانونية", taxNumber: "الرقم الضريبي", vatNumber: "رقم ضريبة القيمة المضافة", registration: "السجل التجاري", branding: "الهوية البصرية", brandColor: "اللون الأساسي", coverImage: "صورة الغلاف", preferences: "التفضيلات", timezone: "المنطقة الزمنية", locale: "اللغة", currency: "العملة", dateFormat: "تنسيق التاريخ", weekStartsOn: "بداية الأسبوع", languages: "اللغات المدعومة", subscriptionStatus: "حالة الاشتراك", currentPeriod: "بداية الفترة الحالية", nextBilling: "الفوترة القادمة", until: "حتى", cancelScheduled: "تم تحديد الإلغاء بنهاية الفترة", renewalExpected: "التجديد متوقع", trialStarts: "بداية التجربة", trialEnds: "نهاية التجربة", periodStarts: "بداية الفترة", periodEnds: "نهاية الفترة", canceledAt: "تاريخ الإلغاء", cancelAtPeriodEnd: "الإلغاء بنهاية الفترة", yes: "نعم", no: "لا", subscriptionTimeline: "الجدول الزمني للاشتراك", empty: "لا توجد بيانات اشتراك", noPayments: "لا توجد مدفوعات مسجلة لهذه المؤسسة", paymentHistory: "سجل المدفوعات", records: "عملية", invoice: "الفاتورة", amount: "المبلغ", method: "الطريقة", provider: "مزود الدفع", action: "الإجراء", viewInvoice: "عرض الفاتورة", paidAt: "تاريخ الدفع"
  } : {
    back: "Back to tenants", loading: "Loading tenant profile...", failed: "Could not load data", overview: "Overview", subscription: "Subscription", payments: "Payments", identity: "Business identity", identityHint: "Organization identity, legal naming and operating model", organization: "Organization name", displayName: "Display name", legalName: "Legal name", slug: "Slug", businessType: "Business type", industry: "Industry", contact: "Contact details", email: "Email", phone: "Phone", alternatePhone: "Alternate phone", website: "Website", address: "Address", countryId: "Country ID", governorateId: "Governorate ID", cityId: "City ID", districtId: "District ID", addressLine1: "Address line 1", addressLine2: "Address line 2", building: "Building", floor: "Floor", unit: "Unit", postalCode: "Postal code", account: "Account", status: "Status", plan: "Plan", created: "Created", updated: "Last updated", legal: "Legal & compliance", taxNumber: "Tax number", vatNumber: "VAT number", registration: "Commercial registration", branding: "Branding", brandColor: "Primary brand color", coverImage: "Cover image URL", preferences: "Preferences", timezone: "Timezone", locale: "Locale", currency: "Currency", dateFormat: "Date format", weekStartsOn: "Week starts on", languages: "Supported languages", subscriptionStatus: "Subscription status", currentPeriod: "Current period starts", nextBilling: "Next billing", until: "Until", cancelScheduled: "Cancellation scheduled at period end", renewalExpected: "Renewal expected", trialStarts: "Trial starts", trialEnds: "Trial ends", periodStarts: "Period starts", periodEnds: "Period ends", canceledAt: "Canceled at", cancelAtPeriodEnd: "Cancel at period end", yes: "Yes", no: "No", subscriptionTimeline: "Subscription timeline", empty: "No subscription details available", noPayments: "No payment records found for this tenant", paymentHistory: "Payment history", records: "records", invoice: "Invoice", amount: "Amount", method: "Method", provider: "Provider", action: "Action", viewInvoice: "View invoice", paidAt: "Paid at"
  }

  if (tenantQuery.isLoading) return <div dir={ar ? "rtl" : "ltr"}><PanelState text={labels.loading}/></div>
  if (tenantQuery.error || !tenantQuery.data) return <div dir={ar ? "rtl" : "ltr"} className="space-y-5"><Link to="/super-admin/tenants" className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft className="size-4"/>{labels.back}</Link><PanelState text={tenantQuery.error instanceof Error ? tenantQuery.error.message : labels.failed}/></div>
  const tenant = tenantQuery.data
  return <div dir={ar ? "rtl" : "ltr"} className="space-y-6">
    <Link to="/super-admin/tenants" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"><ArrowLeft className="size-4"/>{labels.back}</Link>
    <header className="relative overflow-hidden rounded-[28px] border border-[#282344] bg-[#151329] p-6 text-white shadow-xl sm:p-8">
      <div className="pointer-events-none absolute -end-16 -top-28 size-72 rounded-full bg-violet-500/20 blur-3xl"/>
      <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center"><div className="flex min-w-0 items-center gap-4"><span className="flex size-[68px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/10">{tenant.branding.logoUrl ? <img src={tenant.branding.logoUrl} alt="" className="size-full object-cover"/> : <Building2 className="size-8 text-violet-200"/>}</span><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">TENANT WORKSPACE</p><h1 className="mt-1 truncate text-2xl font-semibold tracking-tight sm:text-3xl">{tenant.displayName || tenant.name}</h1><p className="mt-1 truncate text-sm text-slate-300">{tenant.slug || tenant.id}</p><div className="mt-3 flex flex-wrap items-center gap-2"><TenantStatusBadge status={tenant.status}/><span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-slate-200">{human(tenant.plan || "unassigned")} plan</span></div></div></div><div className="flex flex-wrap gap-2">{tenant.status !== "active" && <Button type="button" className="bg-emerald-600 text-white hover:bg-emerald-500" loading={mutations.updateStatus.isPending} onClick={async () => { try { await mutations.updateStatus.mutateAsync({ id: tenant.id, status: "active" }); store.dispatch(pushToast({ id: crypto.randomUUID(), kind: "success", title: ar ? "تم تفعيل المؤسسة" : "Tenant activated" })); await tenantQuery.refetch() } catch (error) { store.dispatch(pushToast({ id: crypto.randomUUID(), kind: "error", title: ar ? "تعذر تحديث الحالة" : "Could not update status", description: error instanceof Error ? error.message : undefined })) } }}><CheckCircle2 className="size-4"/>{ar ? "تفعيل المؤسسة" : "Activate tenant"}</Button>}<Link to={"/super-admin/tenants/" + encodeURIComponent(tenant.id) + "/edit"} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"><Building2 className="size-4"/>{ar ? "تعديل البيانات" : "Edit profile"}</Link><Button type="button" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white" onClick={() => tenantQuery.refetch()}><ArrowUpRight className="size-4"/>{ar ? "تحديث الملف" : "Refresh profile"}</Button></div></div>
      <div className="relative mt-7 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-3"><HeroMeta label={labels.email} value={tenant.contact.email || "—"}/><HeroMeta label={labels.phone} value={tenant.contact.phone || "—"}/><HeroMeta label={labels.created} value={dateTime(tenant.createdAt, locale)}/></div>
    </header>
    <Tabs value={tab} onValueChange={setTab} className="space-y-5"><TabsList className="h-auto w-full flex-wrap justify-start rounded-2xl p-1.5 sm:w-fit"><TabsTrigger value="overview" className="gap-2"><Building2 className="size-4"/>{labels.overview}</TabsTrigger><TabsTrigger value="subscription" className="gap-2"><CreditCard className="size-4"/>{labels.subscription}</TabsTrigger><TabsTrigger value="payments" className="gap-2"><WalletCards className="size-4"/>{labels.payments}</TabsTrigger></TabsList><TabsContent value="overview"><TenantProfileOverview tenant={tenant} labels={labels} locale={locale}/></TabsContent><TabsContent value="subscription"><SubscriptionPanel data={subscriptionQuery.data} loading={subscriptionQuery.isLoading} error={subscriptionQuery.error} locale={locale} labels={labels}/></TabsContent><TabsContent value="payments"><PaymentsPanel data={paymentsQuery.data} loading={paymentsQuery.isLoading} error={paymentsQuery.error} locale={locale} labels={labels}/></TabsContent></Tabs>
  </div>
}
function HeroMeta({ label, value }: { label: string; value: string }) { return <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 truncate text-sm font-medium text-white">{value}</p></div> }
