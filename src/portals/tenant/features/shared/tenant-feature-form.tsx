import { useState, type FormEvent } from "react"
import { CheckCircle2, ClipboardCheck } from "lucide-react"
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

type Props = { feature: TenantFeatureDefinition; onSave?: (payload: Record<string, unknown>) => Promise<void> }

export function TenantFeatureForm({ feature, onSave }: Props) {
  const { locale } = useI18n()
  const ar = locale === "ar"
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [validated, setValidated] = useState(false)\n  const [saving, setSaving] = useState(false)\n  const [saveError, setSaveError] = useState<string | null>(null)

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
    setSaveError(null)
    if (!onSave) {
      setValidated(true)
      return
    }
    const payload = Object.fromEntries(
      Object.entries(values)
        .filter(([, value]) => value !== "")
        .map(([key, value]) => {
          const field = feature.fields?.find((item) => item.name === key)
          return [key, field?.type === "number" ? Number(value) : value]
        }),
    )
    setSaving(true)
    try {
      await onSave(payload)
      setValidated(true)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : (ar ? "تعذر حفظ البيانات" : "Unable to save changes"))
    } finally {
      setSaving(false)
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
            <h3 className="font-semibold">{ar ? (onSave ? "إضافة سجل جديد" : "مسودة وتجهيز التحقق") : (onSave ? "Create new record" : "Draft & validation")}</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {onSave ? (ar ? "أدخل البيانات المطلوبة وسيتم حفظها في المؤسسة الحالية." : "Enter the required details. The record will be saved within the active organization.") : (ar ? "هذه مسودة محلية للمراجعة والتحقق فقط." : "This form is for local validation only.")}
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
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <Button type="submit" disabled={saving}>{saving ? (ar ? "جارٍ الحفظ..." : "Saving...") : onSave ? (ar ? "حفظ" : "Save") : (ar ? "التحقق من المسودة" : "Validate draft")}</Button>
            {saveError && <span role="alert" className="text-xs text-destructive">{saveError}</span>}
            {validated && (
              <span role="status" className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="size-4" />
                {onSave ? (ar ? "تم الحفظ بنجاح" : "Saved successfully") : (ar ? "المسودة اجتازت التحقق المحلي — لم يتم الحفظ" : "Draft passed local validation — nothing was saved")}
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
