export type GeoKind = "countries" | "governorates" | "cities" | "districts"
export type GeoRecord = { id: string | number; name: string; code?: string; country_id?: string | number; governorate_id?: string | number; city_id?: string | number }
export type GeoPayload = { name: string; code?: string; country_id?: string | number; governorate_id?: string | number; city_id?: string | number }
export type GeoConfig = { kind: GeoKind; titleKey: "countries" | "governorates" | "cities" | "districts"; singularKey: "country" | "governorate" | "city" | "district"; endpoint: string; parent?: GeoKind; parentField?: "country_id" | "governorate_id" | "city_id" }
export const geoConfigs: Record<GeoKind, GeoConfig> = {
 countries: { kind: "countries", titleKey: "countries", singularKey: "country", endpoint: "/platform/geo/countries" },
 governorates: { kind: "governorates", titleKey: "governorates", singularKey: "governorate", endpoint: "/platform/geo/governorates", parent: "countries", parentField: "country_id" },
 cities: { kind: "cities", titleKey: "cities", singularKey: "city", endpoint: "/platform/geo/cities", parent: "governorates", parentField: "governorate_id" },
 districts: { kind: "districts", titleKey: "districts", singularKey: "district", endpoint: "/platform/geo/districts", parent: "cities", parentField: "city_id" },
}
