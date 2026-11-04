export type GeoKind = "countries" | "governorates" | "cities" | "districts"
export type GeoParentField = "country_id" | "governorate_id" | "city_id"
export type GeoRecord = {
  id: string | number
  name?: string
  name_en: string
  name_ar: string
  code?: string
  country_id?: string | number
  governorate_id?: string | number
  city_id?: string | number
}
export type GeoPayload = {
  name_en: string
  name_ar: string
  code?: string
  country_id?: string | number
  governorate_id?: string | number
  city_id?: string | number
}
export type GeoConfig = {
  kind: GeoKind
  titleKey: "countries" | "governorates" | "cities" | "districts"
  singularKey: "country" | "governorate" | "city" | "district"
  endpoint: string
  parent?: GeoKind
  parentField?: GeoParentField
}
export const geoConfigs: Record<GeoKind, GeoConfig> = {
  countries: { kind: "countries", titleKey: "countries", singularKey: "country", endpoint: "/platform/geo/countries" },
  governorates: { kind: "governorates", titleKey: "governorates", singularKey: "governorate", endpoint: "/platform/geo/governorates", parent: "countries", parentField: "country_id" },
  cities: { kind: "cities", titleKey: "cities", singularKey: "city", endpoint: "/platform/geo/cities", parent: "governorates", parentField: "governorate_id" },
  districts: { kind: "districts", titleKey: "districts", singularKey: "district", endpoint: "/platform/geo/districts", parent: "cities", parentField: "city_id" },
}
export function geoRecordName(record: GeoRecord, locale: string) {
  return locale === "ar" ? record.name_ar || record.name_en : record.name_en || record.name_ar
}
