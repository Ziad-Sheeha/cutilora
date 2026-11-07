import { useEffect, useState, type FormEvent } from "react"
import { Building2, Clock3, Contact, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { useI18n } from "@/i18n/i18n-provider"
import { branchFormSchema, getTenantFieldErrors } from "../features/shared/tenant-feature-schemas"
import type { Branch } from "../types/tenant.types"

type Props = { branch?: Branch | null; onCancel: () => void; onSave: (payload: Record<string, unknown>) => Promise<void> }
type Values = { name: string; code: string; slug: string; address: string; postalCode: string; timezone: string; email: string; phone: string; contactName: string; contactEmail: string; contactPhone: string; openingDate: string }
const empty: Values = { name: "", code: "", slug: "", address: "", postalCode: "", timezone: "Africa/Cairo", email: "", phone: "", contactName: "", contactEmail: "", contactPhone: "", openingDate: "" }

function valuesFrom(branch?: Branch | null): Values {
  if (!branch) return empty
  return {
    name: branch.name || "", code: branch.code || "", slug: branch.slug || "",
    address: branch.address || branch.addressDetails?.addressLine1 || "",
    postalCode: branch.postalCode || branch.addressDetails?.postalCode || "",
    timezone: branch.timezone || "Africa/Cairo", email: branch.contact?.email || "",
    phone: branch.contact?.phone || "", contactName: branch.contactPerson?.name || "",
    contactEmail: branch.contactPerson?.email || "", contactPhone: branch.contactPerson?.phone || "",
    openingDate: branch.openingDate ? branch.openingDate.slice(0, 10) : "",
  }
}
function slugify(value: string) {
  return value.normalize("NFKD").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export function TenantBranchForm({ branch, onCancel, onSave }: Props) {
  const { locale } = useI18n()
  const ar = locale === "ar"
  const [values, setValues] = useState<Values>(() => valuesFrom(branch))
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState("")

  useEffect(() => { setValues(valuesFrom(branch)); setErrors({}); setServerError("") }, [branch])
  const copy = ar ? {
    identity: "بيانات الفرع", identityHint: "اسم واضح وكود داخلي للتمييز بين المواقع.",
    name: "اسم الفرع", code: "كود الفرع", slug: "المعرّف المختصر", location: "الموقع والتشغيل",
    address: "العنوان", postal: "الرمز البريدي", timezone: "المنطقة الزمنية", opening: "تاريخ الافتتاح",
    contact: "بيانات التواصل", email: "البريد الإلكتروني", phone: "هاتف الفرع",
    person: "مسؤول التواصل", personName: "اسم المسؤول", personEmail: "بريد المسؤول", personPhone: "هاتف المسؤول",
    save: branch ? "حفظ التعديلات" : "إنشاء الفرع", cancel: "إلغاء", slugHint: "يتم اقتراحه تلقائيًا من اسم الفرع ويمكن تعديله."
  } : {
    identity: "Branch identity", identityHint: "Use a clear name and an internal code to distinguish locations.",
    name: "Branch name", code: "Branch code", slug: "URL slug", location: "Location & operations",
    address: "Street address", postal: "Postal code", timezone: "Timezone", opening: "Opening date",
    contact: "Branch contact", email: "Business email", phone: "Branch phone",
    person: "Contact person", personName: "Contact name", personEmail: "Contact email", personPhone: "Contact phone",
    save: branch ? "Save changes" : "Create branch", cancel: "Cancel", slugHint: "Suggested from the branch name. You can edit it."
  }

  function update<K extends keyof Values>(field: K, value: Values[K]) {
    setValues(current => ({ ...current, [field]: value }))
    setErrors(current => ({ ...current, [field]: "" }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validation = branchFormSchema.safeParse({ name: values.name, slug: values.slug, address: values.address, timezone: values.timezone, code: values.code, postalCode: values.postalCode, email: values.email, phone: values.phone, contactName: values.contactName, contactEmail: values.contactEmail, contactPhone: values.contactPhone })
    if (!validation.success) { setErrors(getTenantFieldErrors(validation.error, ar ? "ar" : "en")); return }
    setSaving(true); setErrors({}); setServerError("")
    try {
      await onSave({
        name: values.name.trim(),
        ...(values.code.trim() ? { code: values.code.trim().toUpperCase() } : {}),
        ...(values.slug.trim() ? { slug: values.slug.trim() } : {}),
        address: values.address.trim(),
        postalCode: values.postalCode.trim(),
        timezone: values.timezone.trim(),
        contact: {
          ...(values.email.trim() ? { email: values.email.trim() } : {}),
          ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
        },
        contactPerson: {
          name: values.contactName.trim(),
          email: values.contactEmail.trim(),
          phone: values.contactPhone.trim(),
        },
        ...(values.openingDate ? { openingDate: new Date(`${values.openingDate}T00:00:00.000Z`).toISOString() } : { openingDate: null }),
        addressDetails: { addressLine1: values.address.trim(), postalCode: values.postalCode.trim() },
      })
    } catch (cause) {
      setServerError(cause instanceof Error ? cause.message : (ar ? "تعذر حفظ الفرع." : "Unable to save branch."))
    } finally { setSaving(false) }
  }

  return <form noValidate onSubmit={submit} className="space-y-5">
    <Card className="rounded-2xl border-slate-200/80 shadow-sm"><CardContent className="space-y-4 p-5">
      <Section icon={Building2} title={copy.identity} hint={copy.identityHint}/>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.name} required error={errors.name}><Input value={values.name} maxLength={160} onChange={event => { update("name", event.target.value); if (!branch || !values.slug) update("slug", slugify(event.target.value)) }}/></Field>
        <Field label={copy.code} error={errors.code}><Input value={values.code} maxLength={30} onChange={event => update("code", event.target.value.toUpperCase())} placeholder="e.g. CAI-01"/></Field>
        <Field label={copy.slug} error={errors.slug}><Input value={values.slug} maxLength={80} onChange={event => update("slug", event.target.value.toLowerCase())}/><p className="text-[11px] text-slate-500">{copy.slugHint}</p></Field>
      </div>
    </CardContent></Card>
    <Card className="rounded-2xl border-slate-200/80 shadow-sm"><CardContent className="space-y-4 p-5">
      <Section icon={MapPin} title={copy.location}/>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.address} error={errors.address}><Input value={values.address} maxLength={500} onChange={event => update("address", event.target.value)}/></Field>
        <Field label={copy.postal} error={errors.postalCode}><Input value={values.postalCode} maxLength={30} onChange={event => update("postalCode", event.target.value)}/></Field>
        <Field label={copy.timezone} required error={errors.timezone}><Input value={values.timezone} onChange={event => update("timezone", event.target.value)} placeholder="Africa/Cairo"/></Field>
        <Field label={copy.opening}><DatePicker value={values.openingDate} onChange={value => update("openingDate", value)} placeholder={ar ? "اختر التاريخ" : "Select date"} locale={ar ? "ar" : "en"} dir={ar ? "rtl" : "ltr"}/></Field>
      </div>
    </CardContent></Card>
    <Card className="rounded-2xl border-slate-200/80 shadow-sm"><CardContent className="space-y-4 p-5">
      <Section icon={Contact} title={copy.contact}/>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.email} error={errors.email}><Input type="email" value={values.email} onChange={event => update("email", event.target.value)}/></Field>
        <Field label={copy.phone} error={errors.phone}><Input value={values.phone} onChange={event => update("phone", event.target.value)}/></Field>
      </div>
      <div className="border-t border-slate-100 pt-4"><p className="mb-3 text-xs font-semibold text-slate-600">{copy.person}</p><div className="grid gap-4 sm:grid-cols-3">
        <Field label={copy.personName} error={errors.contactName}><Input value={values.contactName} onChange={event => update("contactName", event.target.value)}/></Field>
        <Field label={copy.personEmail} error={errors.contactEmail}><Input type="email" value={values.contactEmail} onChange={event => update("contactEmail", event.target.value)}/></Field>
        <Field label={copy.personPhone} error={errors.contactPhone}><Input value={values.contactPhone} onChange={event => update("contactPhone", event.target.value)}/></Field>
      </div></div>
    </CardContent></Card>
    {serverError && <FieldError className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm">{serverError}</FieldError>}
    <div className="flex justify-end gap-2 border-t border-slate-200 pt-4"><Button type="button" variant="outline" onClick={onCancel} disabled={saving}>{copy.cancel}</Button><Button type="submit" loading={saving} className="min-w-36">{copy.save}</Button></div>
  </form>
}

function Section({ icon: Icon, title, hint }: { icon: typeof Building2; title: string; hint?: string }) {
  return <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700"><Icon className="size-4"/></span><div><h3 className="text-sm font-semibold text-slate-900">{title}</h3>{hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}</div></div>
}
function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}{required && <span className="ms-1 text-rose-500">*</span>}</Label>{children}{error && <FieldError>{error}</FieldError>}</div>
}
