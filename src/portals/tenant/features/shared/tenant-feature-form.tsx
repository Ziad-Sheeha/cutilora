import { useState, type FormEvent } from "react"
import { AlertCircle, CheckCircle2, ClipboardCheck, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/i18n/i18n-provider"
import type { TenantFeatureDefinition } from "./tenant-feature.types"
import { getTenantFieldErrors, validateTenantFeatureForm, type TenantFeatureSchemaKey } from "./tenant-feature-schemas"
import { createTenantFeatureRecord, getTenantFeatureCreateEndpoint } from "./tenant-feature-api"

type Props = { feature: TenantFeatureDefinition; onCreated?: () => void }

export function TenantFeatureForm({ feature, onCreated }: Props) {
  const { locale } = useI18n()
  const ar = locale === "ar"
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [validated, setValidated] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const createEndpoint = getTenantFeatureCreateEndpoint(feature)

  if (!feature.fields?.length || !feature.schemaKey) return null

  function fieldLabel(name: string, fallback: string) {
    if (!ar) return fallback
    const labels: Record<string, string> = {
      email: "البريد الإلكتروني",
      displayName: "الاسم التجاري",
      legalName: "الاسم القانوني",
      businessType: "نوع المؤسسة",
      contactEmail: "البريد الإلكتروني الأساسي",
      contactPhone: "رقم الهاتف الأساسي",
      website: "الموقع الإلكتروني",
      countryId: "معرف الدولة",
      cityId: "معرف المدينة",
      addressLine1: "العنوان المسجل",
      role: "الدور",
      scope: "نطاق الصلاحية",
      expiresAt: "تاريخ انتهاء الدعوة",
      name: feature.key === "roles" ? "اسم الدور" : feature.key === "catalog" ? "اسم القالب" : "اسم التكامل",
      description: "الوصف",
      defaultLocale: "اللغة الافتراضية",
      defaultCurrency: "العملة الافتراضية",
      cancellationWindowHours: "مهلة الإلغاء (بالساعات)",
      category: "التصنيف",
      durationMinutes: "المدة المقترحة (بالدقائق)",
      bufferMinutes: "الفاصل الزمني (بالدقائق)",
      billingName: "الاسم القانوني للفوترة",
      billingEmail: "البريد الإلكتروني للفوترة",
      taxNumber: "رقم التسجيل الضريبي",
      provider: "مزود الخدمة",
      locale: "اللغة",
      currency: "العملة",
      timezone: "المنطقة الزمنية للمؤسسة",
    }
    return labels[name] || fallback
  }

  function optionLabel(value: string, fallback: string) {
    if (!ar) return fallback
    const labels: Record<string, string> = {
      single_clinic: "عيادة واحدة",
      clinic_group: "مجموعة عيادات",
      beauty_center: "مركز تجميل",
      tenant_admin: "مسؤول المؤسسة",
      organization_manager: "مدير المؤسسة",
      read_only_analyst: "محلل للقراءة فقط",
      clinic_manager: "مدير عيادة",
      branch_manager: "مدير فرع",
      tenant: "المؤسسة بالكامل",
      clinic: "عيادات محددة",
      branch: "فروع محددة",
      en: "الإنجليزية",
      ar: "العربية",
      EGP: "جنيه مصري (EGP)",
      SAR: "ريال سعودي (SAR)",
      AED: "درهم إماراتي (AED)",
      USD: "دولار أمريكي (USD)",
      whatsapp: "واتساب",
      sms: "رسائل SMS",
      email: "البريد الإلكتروني",
      calendar: "التقويم",
      payment: "مرجع بوابة الدفع",
    }
    return labels[value] || fallback
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = validateTenantFeatureForm(
      feature.schemaKey as TenantFeatureSchemaKey,
      values,
    )
    if (!result.success) {
      setErrors(getTenantFieldErrors(result.error, ar ? "ar" : "en"))
      setValidated(false)
      return
    }
    setErrors({})
    setServerError(null)
    if (!createEndpoint) {
      setValidated(true)
      return
    }
    setSubmitting(true)
    try {
      const payload = Object.fromEntries(
        Object.entries(result.data).filter(([, value]) => value !== ""),
      ) as Record<string, unknown>
      await createTenantFeatureRecord(createEndpoint, payload)
      setValues({})
      setValidated(true)
      onCreated?.()
    } catch (error) {
      setServerError(error instanceof Error ? error.message : (ar ? "تعذر حفظ البيانات" : "Unable to save the record"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="border-violet-100 bg-white">
      <CardContent className="p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-700">
            <ClipboardCheck className="size-5" />
          </span>
          <div>
            <h3 className="font-semibold">{ar ? "نموذج وتجهيز التحقق" : "Form & validation scaffold"}</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {createEndpoint ? (ar ? "سيتم إرسال البيانات إلى واجهة الباك بعد اجتياز التحقق المحلي." : "Validated data will be submitted to the backend endpoint.") : (ar ? "النموذج مخصص للتحقق المحلي فقط؛ لا يوجد Endpoint إنشاء معرّف لهذه الوحدة." : "This form is validation-only because no create endpoint is defined for this module.")}
            </p>
          </div>
        </div>

        <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
          {feature.fields.map((field) => (
            <Field key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
              <Label htmlFor={`tenant-feature-${field.name}`}>
                {fieldLabel(field.name, field.label)}
                {field.required && <span className="ms-1 text-red-600">*</span>}
              </Label>
              {field.type === "select" ? (
                <Select
                  value={values[field.name] || undefined}
                  onValueChange={(value) => {
                    setValues((current) => ({ ...current, [field.name]: value }))
                    setErrors((current) => ({ ...current, [field.name]: "" }))
                    setValidated(false)
                  }}
                >
                  <SelectTrigger
                    id={`tenant-feature-${field.name}`}
                    aria-invalid={Boolean(errors[field.name])}
                    aria-describedby={errors[field.name] ? `tenant-feature-${field.name}-error` : undefined}
                  >
                    <SelectValue placeholder={ar ? "اختر..." : "Select..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {optionLabel(option.value, option.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === "textarea" ? (
                <Textarea
                  id={`tenant-feature-${field.name}`}
                  value={values[field.name] || ""}
                  placeholder={field.placeholder}
                  aria-invalid={Boolean(errors[field.name])}
                  aria-describedby={errors[field.name] ? `tenant-feature-${field.name}-error` : undefined}
                  onChange={(event) => {
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
                    setErrors((current) => ({ ...current, [field.name]: "" }))
                    setValidated(false)
                  }}
                />
              ) : (
                <Input
                  id={`tenant-feature-${field.name}`}
                  type={field.type || "text"}
                  value={values[field.name] || ""}
                  placeholder={field.placeholder}
                  required={field.required}
                  aria-invalid={Boolean(errors[field.name])}
                  aria-describedby={errors[field.name] ? `tenant-feature-${field.name}-error` : undefined}
                  onChange={(event) => {
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
                    setValidated(false)
                  }}
                />
              )}
              {errors[field.name] && <FieldError id={`tenant-feature-${field.name}-error`}>{errors[field.name]}</FieldError>}
            </Field>
          ))}
          {serverError && <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 sm:col-span-2"><AlertCircle className="mt-0.5 size-4 shrink-0" />{serverError}</div>}
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <Button type="submit" disabled={submitting}>{submitting && <LoaderCircle className="me-2 size-4 animate-spin" />}{createEndpoint ? (ar ? "حفظ" : "Save") : (ar ? "التحقق من البيانات" : "Validate form")}</Button>
            {validated && (
              <span role="status" className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="size-4" />
                {createEndpoint ? (ar ? "تم الحفظ بنجاح" : "Saved successfully") : (ar ? "البيانات اجتازت التحقق المحلي — لم يتم الحفظ" : "Local validation passed — nothing was saved")}
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
