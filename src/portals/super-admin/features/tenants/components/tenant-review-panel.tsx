import { ArrowUpRight, Building2, MapPin, Settings2, ShieldCheck, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGeoDetail } from "@/portals/super-admin/features/geo-location/hooks/use-geo-location"
import { geoConfigs, geoRecordName } from "@/portals/super-admin/features/geo-location/types/geo-location.types"
import { useI18n } from "@/i18n/i18n-provider"
import type { TenantFormValues } from "../types/tenant-form.types"
import { resolveAssetUrl } from "@/shared/utils/resolve-asset-url"

type Group = { title: string; icon: typeof Building2; step: number; rows: [string, string][] }

export function TenantReviewPanel({ values, labels, onEdit, ar }: {
  values: TenantFormValues
  labels: { identity: string; contact: string; location: string; legal: string; preferences: string; owner?: string; edit: string; empty: string }
  onEdit: (step: number) => void
  ar: boolean
}) {
  const { locale } = useI18n()
  const country = useGeoDetail(geoConfigs.countries.endpoint, values.address.countryId || undefined)
  const governorate = useGeoDetail(geoConfigs.governorates.endpoint, values.address.governorateId || undefined)
  const city = useGeoDetail(geoConfigs.cities.endpoint, values.address.cityId || undefined)
  const district = useGeoDetail(geoConfigs.districts.endpoint, values.address.districtId || undefined)
  const localizedLabels: Record<string, string> = ar ? {
    "Organization name": "اسم المؤسسة", "Display name": "الاسم الظاهر", "Legal name": "الاسم القانوني",
    "Business type": "نوع النشاط", "Industry": "المجال", "Description": "الوصف",
    "Email": "البريد الإلكتروني", "Phone": "رقم الهاتف", "Alternate phone": "رقم بديل", "WhatsApp": "واتساب", "Website": "الموقع الإلكتروني",
    "Country": "الدولة", "Governorate": "المحافظة", "City": "المدينة", "District": "الحي", "Address": "العنوان", "Additional address": "تفاصيل إضافية", "Building": "المبنى", "Floor": "الدور", "Unit": "الوحدة",
    "Landmark": "علامة مميزة", "Postal code": "الرمز البريدي", "Latitude": "خط العرض", "Longitude": "خط الطول",
    "Tax number": "الرقم الضريبي", "VAT number": "رقم ضريبة القيمة المضافة", "Commercial registration": "السجل التجاري",
    "Brand color": "لون العلامة", "Logo": "الشعار", "Cover image": "صورة الغلاف",
    "Timezone": "المنطقة الزمنية", "Organization language": "لغة المؤسسة", "Currency": "العملة",
    "Date format": "تنسيق التاريخ", "Week starts on": "بداية الأسبوع", "Supported languages": "اللغات المدعومة",
  } : {}
  const groups: Group[] = [
    { title: labels.identity, icon: Building2, step: 0, rows: [
      ["Organization name", values.name], ["Display name", values.displayName], ["Legal name", values.legalName],
      ["Business type", values.businessType], ["Industry", values.industry], ["Description", values.description],
    ] },
    { title: labels.contact, icon: UserRound, step: 1, rows: [
      ["Email", values.contact.email], ["Phone", values.contact.phone ? values.contact.phoneCode + " " + values.contact.phone : ""], ["Alternate phone", values.contact.alternatePhone ? values.contact.phoneCode + " " + values.contact.alternatePhone : ""],
      ["WhatsApp", values.contact.whatsapp ? values.contact.phoneCode + " " + values.contact.whatsapp : ""], ["Website", values.contact.website],
    ] },
    { title: labels.location, icon: MapPin, step: 2, rows: [
      ["Country", country.data ? geoRecordName(country.data, locale) : ""], ["Governorate", governorate.data ? geoRecordName(governorate.data, locale) : ""], ["City", city.data ? geoRecordName(city.data, locale) : ""], ["District", district.data ? geoRecordName(district.data, locale) : ""], ["Address", values.address.addressLine1], ["Additional address", values.address.addressLine2],
      ["Building", values.address.building], ["Floor", values.address.floor], ["Unit", values.address.unit],
      ["Landmark", values.address.landmark], ["Postal code", values.address.postalCode],
      ["Latitude", values.address.latitude], ["Longitude", values.address.longitude],
    ] },
    { title: labels.legal, icon: ShieldCheck, step: 3, rows: [
      ["Tax number", values.legal.taxNumber], ["VAT number", values.legal.vatNumber],
      ["Commercial registration", values.legal.commercialRegistrationNumber],
      ["Brand color", values.branding.primaryColor],
      ["Logo", values.branding.logoUrl ? (values.branding.logoUrl.startsWith("data:") ? "Image selected" : "Existing image") : ""],
      ["Cover image", values.branding.coverImageUrl ? (values.branding.coverImageUrl.startsWith("data:") ? "Image selected" : "Existing image") : ""],
    ] },
    ...(values.owner.name || values.owner.email ? [{ title: labels.owner ?? (ar ? "حساب مدير المؤسسة" : "Owner account"), icon: UserRound, step: 5, rows: [[ar ? "اسم المستخدم" : "Owner name", values.owner.name], [ar ? "بريد تسجيل الدخول" : "Login email", values.owner.email]] as [string, string][] }] : []),
    { title: labels.preferences, icon: Settings2, step: 4, rows: [
      ["Timezone", values.preferences.timezone], ["Organization language", values.preferences.locale],
      ["Currency", values.preferences.currency], ["Date format", values.preferences.dateFormat],
      ["Week starts on", values.preferences.weekStartsOn],
      ["Supported languages", values.preferences.supportedLanguages.join(", ")],
    ] },
  ]
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-4">
        <p className="text-sm font-semibold">{ar ? "مراجعة نهائية قبل الإرسال" : "Final review before submission"}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{ar ? "راجع كل مجموعة. يمكنك الرجوع لأي خطوة وتعديل بياناتها قبل إرسال الطلب." : "Review every section. You can jump back to any step, make changes and return here before sending."}</p>
      </div>
      {groups.map((group) => {
        const Icon = group.icon
        const rows = group.rows.filter(([, value]) => value.trim())
        return (
          <section key={group.step} className="overflow-hidden rounded-2xl border bg-card">
            <header className="flex items-center justify-between gap-3 border-b bg-muted/20 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2"><span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4"/></span><h3 className="text-sm font-semibold">{group.title}</h3></div>
              <Button type="button" size="sm" variant="outline" onClick={() => onEdit(group.step)}>{labels.edit}<ArrowUpRight className="size-3.5"/></Button>
            </header>
            <div className="grid gap-x-6 gap-y-3 p-4 sm:grid-cols-2">
              {rows.length ? rows.map(([label, value]) => <div key={label} className="min-w-0"><p className="text-[11px] font-medium text-muted-foreground">{localizedLabels[label] ?? label}</p><p className="mt-1 break-words text-sm font-medium">{value}</p></div>) : <p className="text-sm text-muted-foreground">{labels.empty}</p>}
              {group.step === 3 && (values.branding.logoUrl || values.branding.coverImageUrl) && <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                {values.branding.logoUrl && <img src={resolveAssetUrl(values.branding.logoUrl)} alt={ar ? "معاينة الشعار" : "Logo preview"} className="size-16 rounded-xl border bg-white object-contain p-1"/>}
                {values.branding.coverImageUrl && <img src={resolveAssetUrl(values.branding.coverImageUrl)} alt={ar ? "معاينة الغلاف" : "Cover preview"} className="h-16 w-32 rounded-xl border object-cover"/>}
              </div>}
            </div>
          </section>
        )
      })}
    </div>
  )
}
