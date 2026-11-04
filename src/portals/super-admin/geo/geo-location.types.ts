export type GeoKind = "countries" | "governorates" | "cities" | "districts"
export type GeoParentField = "country_id" | "governorate_id" | "city_id"
export type GeoId = string

/** API responses currently use a mixed naming convention (nameEn/name_ar). */
export interface GeoRecord {
  id: GeoId
  nameEn: string
  name_ar: string
  code?: string | null
  country_id?: GeoId | null
  governorate_id?: GeoId | null
  city_id?: GeoId | null
  created_at?: string
  updated_at?: string
}

export interface GeoPayload {
  name_en: string
  name_ar: string
  code?: string
  country_id?: GeoId
  governorate_id?: GeoId
  city_id?: GeoId
}

export interface GeoPagination {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface GeoListResult {
  items: GeoRecord[]
  pagination: GeoPagination
}

export interface GeoConfig {
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

export function geoRecordName(record: Pick<GeoRecord, "nameEn" | "name_ar">, locale: string): string {
  return locale === "ar" ? record.name_ar || record.nameEn : record.nameEn || record.name_ar
}
