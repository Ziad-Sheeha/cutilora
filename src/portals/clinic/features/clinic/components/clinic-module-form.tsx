import { useEffect, useMemo, useState, type FormEvent } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/i18n/i18n-provider"
import { isArabicText, isEnglishText } from "@/shared/validation/language-validation"
import type { ClinicModuleField, ClinicRecord } from "../api/clinic-module.api"
import { clinicModuleFieldLabel, clinicModuleText } from "./clinic-module.i18n"

type Props = {
  fields: ClinicModuleField[]
  record?: ClinicRecord | null
  title: string
  isSaving: boolean
  onCancel: () => void
  onSubmit: (payload: Record<string, unknown>) => Promise<void>
}

export function ClinicModuleForm({ fields, record, title, isSaving, onCancel, onSubmit }: Props) {
  const { locale } = useI18n()
  const ar = locale === "ar"
  const [values, setValues] = useState<Record<string, string>>({})
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const next: Record<string, string> = {}
    fields.forEach((field) => {
      const value = record?.[field.name]
      next[field.name] = value === null || value === undefined ? "" : String(value)
    })
    if (fields.some((field) => field.name === "recordType")) {
      next.recordType = record?.recordType ?? "employee"
    }
    setValues(next)
    setError("")
    setSubmitted(false)
  }, [fields, record])

  const invalidFields = useMemo(() => {
    const invalid = new Set<string>()
    if (!submitted) return invalid
    fields.forEach((field) => {
      const value = values[field.name]?.trim() ?? ""
      if (field.required && !value) invalid.add(field.name)
      else if (value && field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) invalid.add(field.name)
      else if (value && field.type === "number" && !Number.isFinite(Number(value))) invalid.add(field.name)
      else if (value && (field.type === undefined || field.type === "text" || field.type === "textarea")) {
        const neutral = /email|phone|date|time|price|currency|duration|minutes|number|count|session|gender|language|validity|amount|invoice|id|code|url|timezone|recordType/i
        if (!neutral.test(field.name) && (ar ? !isArabicText(value) : !isEnglishText(value))) invalid.add(field.name)
      }
    })
    return invalid
  }, [ar, fields, submitted, values])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    const requiredMissing = fields.find((field) => field.required && !values[field.name]?.trim())
    if (requiredMissing) {
      setError(clinicModuleText("required", locale))
      return
    }
    const emailInvalid = fields.some((field) => field.type === "email" && values[field.name] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[field.name]))
    const numberInvalid = fields.some((field) => field.type === "number" && values[field.name] && !Number.isFinite(Number(values[field.name])))
    if (emailInvalid) { setError(clinicModuleText("invalidEmail", locale)); return }
    if (numberInvalid) { setError(clinicModuleText("invalidNumber", locale)); return }
    const invalidLanguage = fields.some((field) => {
      const value = values[field.name]?.trim()
      if (!value || !(field.type === undefined || field.type === "text" || field.type === "textarea")) return false
      const neutral = /email|phone|date|time|price|currency|duration|minutes|number|count|session|gender|language|validity|amount|invoice|id|code|url|timezone|recordType/i
      return !neutral.test(field.name) && (ar ? !isArabicText(value) : !isEnglishText(value))
    })
    if (invalidLanguage) { setError(clinicModuleText("invalidLanguage", locale)); return }

    const payload: Record<string, unknown> = {}
    fields.forEach((field) => {
      const value = values[field.name]?.trim()
      if (value === undefined || value === "") return
      payload[field.name] = field.type === "number" ? Number(value) : value
    })
    try {
      await onSubmit(payload)
    } catch (submitError) {
      setError(submitError instanceof Error && submitError.message ? submitError.message : clinicModuleText("saveError", locale))
    }
  }

  return (
    <Card className="border-primary/20">
      <CardContent className="p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{clinicModuleText("scope", locale)}</p>
          </div>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>{clinicModuleText("close", locale)}</Button>
        </div>
        <form onSubmit={(event) => void handleSubmit(event)} noValidate className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => {
            const value = values[field.name] ?? ""
            const invalid = invalidFields.has(field.name)
            return (
              <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                <Label htmlFor={`clinic-module-${field.name}`}>
                  {clinicModuleFieldLabel(field, locale)}
                  {field.required && <span className="ms-1 text-destructive" aria-hidden="true">*</span>}
                </Label>
                {field.name === "recordType" ? (
                  <Select value={value || "employee"} onValueChange={(next) => setValues((current) => ({ ...current, [field.name]: next }))} disabled={isSaving}>
                    <SelectTrigger id={`clinic-module-${field.name}`} aria-invalid={invalid}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">{clinicModuleText("recordTypeEmployee", locale)}</SelectItem>
                      <SelectItem value="provider">{clinicModuleText("recordTypeProvider", locale)}</SelectItem>
                    </SelectContent>
                  </Select>
                ) : field.type === "date" ? (
                  <DatePicker value={value} onChange={(next) => setValues((current) => ({ ...current, [field.name]: next }))} placeholder={ar ? "اختر التاريخ" : "Select date"} locale={ar ? "ar" : "en"} dir={ar ? "rtl" : "ltr"}/>
                ) : field.type === "textarea" ? (
                  <Textarea id={`clinic-module-${field.name}`} value={value} aria-invalid={invalid} disabled={isSaving} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))} />
                ) : (
                  <Input id={`clinic-module-${field.name}`} type={field.type ?? "text"} value={value} aria-invalid={invalid} required={field.required} disabled={isSaving} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))} />
                )}
                {invalid && <p className="mt-1 text-xs text-destructive">{field.required && !value.trim() ? clinicModuleText("required", locale) : field.type === "email" ? clinicModuleText("invalidEmail", locale) : field.type === "number" ? clinicModuleText("invalidNumber", locale) : clinicModuleText("invalidLanguage", locale)}</p>}
              </div>
            )
          })}
          {error && <p role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/5 px-3 py-2 text-sm text-destructive sm:col-span-2"><AlertCircle className="mt-0.5 size-4 shrink-0" />{error}</p>}
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button type="submit" loading={isSaving} disabled={isSaving}>{clinicModuleText("save", locale)}</Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>{clinicModuleText("cancel", locale)}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
