import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/i18n/i18n-provider"

type Props = { onCancel: () => void; onSave: (payload: Record<string, unknown>) => Promise<void> }
function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export function TenantBranchForm({ onCancel, onSave }: Props) {
  const { locale } = useI18n()
  const ar = locale === "ar"
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [address, setAddress] = useState("")
  const [timezone, setTimezone] = useState("Africa/Cairo")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const copy = ar
    ? { title: "إضافة فرع", name: "اسم الفرع", slug: "المعرّف المختصر بالإنجليزية", address: "العنوان", timezone: "المنطقة الزمنية", save: "إنشاء الفرع", cancel: "إلغاء" }
    : { title: "Add branch", name: "Branch name", slug: "URL slug (English)", address: "Address", timezone: "Timezone", save: "Create branch", cancel: "Cancel" }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError("")
    try {
      await onSave({
        name: name.trim(),
        slug: slug.trim(),
        address: address.trim(),
        timezone: timezone.trim(),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create branch")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-violet-200 bg-white">
      <CardContent className="p-6">
        <h3 className="mb-5 font-semibold">{copy.title}</h3>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="branch-name">{copy.name}</Label>
            <Input
              id="branch-name"
              required
              minLength={2}
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setSlug(slugify(event.target.value))
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch-slug">{copy.slug}</Label>
            <Input
              id="branch-slug"
              required
              minLength={2}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              value={slug}
              onChange={(event) => setSlug(event.target.value.toLowerCase())}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch-address">{copy.address}</Label>
            <Input id="branch-address" value={address} onChange={(event) => setAddress(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch-timezone">{copy.timezone}</Label>
            <Input id="branch-timezone" value={timezone} onChange={(event) => setTimezone(event.target.value)} />
          </div>

          {error && <p role="alert" className="text-sm text-red-600 md:col-span-2">{error}</p>}
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <Button type="submit" loading={saving}>{copy.save}</Button>
            <Button type="button" variant="outline" onClick={onCancel}>{copy.cancel}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
