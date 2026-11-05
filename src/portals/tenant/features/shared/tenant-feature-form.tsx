import { useState, type FormEvent } from "react"
import { CheckCircle2, ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/i18n/i18n-provider"
import type { TenantFeatureDefinition } from "./tenant-feature.types"
import { validateTenantFeatureForm, type TenantFeatureSchemaKey } from "./tenant-feature-schemas"

type Props = { feature: TenantFeatureDefinition }

export function TenantFeatureForm({ feature }: Props) {
  const { locale } = useI18n()
  const ar = locale === "ar"
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [validated, setValidated] = useState(false)

  if (!feature.fields?.length || !feature.schemaKey) return null

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = validateTenantFeatureForm(
      feature.schemaKey as TenantFeatureSchemaKey,
      values,
    )
    if (!result.success) {
      const nextErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const field = String(issue.path[0] || "")
        if (field && !nextErrors[field]) nextErrors[field] = issue.message
      }
      setErrors(nextErrors)
      setValidated(false)
      return
    }
    setErrors({})
    setValidated(true)
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
              {ar ? "النموذج جاهز للتحقق محلياً. لن يتم إرسال أو حفظ أي بيانات قبل تنفيذ Endpoint الباك." : "The form validates locally. Nothing is submitted or persisted until the backend endpoint is implemented."}
            </p>
          </div>
        </div>

        <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
          {feature.fields.map((field) => (
            <Field key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
              <Label htmlFor={`tenant-feature-${field.name}`}>
                {ar ? field.label : field.label}
                {field.required && <span className="ms-1 text-red-600">*</span>}
              </Label>
              {field.type === "select" ? (
                <Select
                  id={`tenant-feature-${field.name}`}
                  value={values[field.name] || ""}
                  aria-invalid={Boolean(errors[field.name])}
                  onChange={(event) => {
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
                    setValidated(false)
                  }}
                >
                  <option value="">{ar ? "اختر..." : "Select..."}</option>
                  {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </Select>
              ) : field.type === "textarea" ? (
                <Textarea
                  id={`tenant-feature-${field.name}`}
                  value={values[field.name] || ""}
                  placeholder={field.placeholder}
                  aria-invalid={Boolean(errors[field.name])}
                  onChange={(event) => {
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
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
                  onChange={(event) => {
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
                    setValidated(false)
                  }}
                />
              )}
              {errors[field.name] && <p className="text-xs text-red-600">{errors[field.name]}</p>}
            </Field>
          ))}
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <Button type="submit">{ar ? "التحقق من البيانات" : "Validate form"}</Button>
            {validated && (
              <span role="status" className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="size-4" />
                {ar ? "البيانات اجتازت التحقق المحلي — لم يتم الحفظ" : "Local validation passed — nothing was saved"}
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
