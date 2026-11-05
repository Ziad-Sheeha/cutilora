import { useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/i18n/i18n-provider"
import { branchFormSchema, getTenantFieldErrors } from "../features/shared/tenant-feature-schemas"
import type { Branch } from "../types/tenant.types"

type Props = { branch?: Branch | null; onCancel: () => void; onSave: (payload: Record<string, unknown>) => Promise<void> }

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export function TenantBranchForm({ branch, onCancel, onSave }: Props) {
  const { locale } = useI18n()
  const ar = locale === "ar"
  const [name, setName] = useState(branch?.name ?? "")
  const [slug, setSlug] = useState(branch?.slug ?? "")
  const [address, setAddress] = useState(branch?.address ?? "")
  const [timezone, setTimezone] = useState(branch?.timezone ?? "Africa/Cairo")
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState("")

  useEffect(() => {
    setName(branch?.name ?? "")
    setSlug(branch?.slug ?? "")
    setAddress(branch?.address ?? "")
    setTimezone(branch?.timezone ?? "Africa/Cairo")
    setErrors({})
    setServerError("")
  }, [branch])

  const copy = ar
    ? { title: branch ? "تعديل الفرع" : "إضافة فرع", name: "اسم الفرع", slug: "المعرّف المختصر بالإنجليزية", address: "العنوان", timezone: "المنطقة الزمنية", save: branch ? "حفظ التعديلات" : "إنشاء الفرع", cancel: "إلغاء" }
    : { title: branch ? "Edit branch" : "Add branch", name: "Branch name", slug: "URL slug (English)", address: "Address", timezone: "Timezone", save: branch ? "Save changes" : "Create branch", cancel: "Cancel" }

  function update<K extends "name" | "slug" | "address" | "timezone">(field: K, value: string) {
    if (field === "name") setName(value)
    if (field === "slug") setSlug(value)
    if (field === "address") setAddress(value)
    if (field === "timezone") setTimezone(value)
    setErrors((current) => ({ ...current, [field]: "" }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validation = branchFormSchema.safeParse({ name, slug, address, timezone })
    if (!validation.success) {
      setErrors(getTenantFieldErrors(validation.error, ar ? "ar" : "en"))
      return
    }

    setSaving(true)
    setErrors({})
    setServerError("")
    try {
      await onSave({
        name: name.trim(),
        slug: slug.trim(),
        address: address.trim(),
        timezone: timezone.trim(),
      })
    } catch (error) {
      setServerError(error instanceof Error ? error.message : (ar ? "تعذر حفظ الفرع" : "Unable to save branch"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-violet-200 bg-white">
      <CardContent className="p-6">
        <h3 className="mb-5 font-semibold">{copy.title}</h3>
        <form noValidate onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="branch-name">{copy.name} <span className="text-destructive">*</span></Label>
            <Input
              id="branch-name"
              required
              minLength={2}
              value={name}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "branch-name-error" : undefined}
              onChange={(event) => {
                update("name", event.target.value)
                setSlug(slugify(event.target.value))
              }}
            />
            {errors.name && <FieldError id="branch-name-error">{errors.name}</FieldError>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch-slug">{copy.slug} <span className="text-destructive">*</span></Label>
            <Input
              id="branch-slug"
              required
              minLength={2}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              value={slug}
              aria-invalid={Boolean(errors.slug)}
              aria-describedby={errors.slug ? "branch-slug-error" : undefined}
              onChange={(event) => update("slug", event.target.value.toLowerCase())}
            />
            {errors.slug && <FieldError id="branch-slug-error">{errors.slug}</FieldError>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch-address">{copy.address}</Label>
            <Input id="branch-address" value={address} onChange={(event) => update("address", event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch-timezone">{copy.timezone} <span className="text-destructive">*</span></Label>
            <Input
              id="branch-timezone"
              value={timezone}
              required
              aria-invalid={Boolean(errors.timezone)}
              aria-describedby={errors.timezone ? "branch-timezone-error" : undefined}
              onChange={(event) => update("timezone", event.target.value)}
            />
            {errors.timezone && <FieldError id="branch-timezone-error">{errors.timezone}</FieldError>}
          </div>

          {serverError && <FieldError className="md:col-span-2">{serverError}</FieldError>}
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <Button type="submit" loading={saving}>{copy.save}</Button>
            <Button type="button" variant="outline" onClick={onCancel}>{copy.cancel}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
