export type TenantFeatureField = {
  name: string
  label: string
  type?: "text" | "email" | "tel" | "number" | "date" | "url" | "textarea" | "select"
  required?: boolean
  placeholder?: string
  options?: { label: string; value: string }[]
}

export type TenantFeatureEndpoint = {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
  path: string
  purpose: string
}

export type TenantFeatureDefinition = {
  key: string
  group: string
  title: { en: string; ar: string }
  description: { en: string; ar: string }
  eyebrow: { en: string; ar: string }
  icon: string
  capabilities: { en: string; ar: string }[]
  endpoints: TenantFeatureEndpoint[]
  fields?: TenantFeatureField[]
  schemaKey?: string
  note?: { en: string; ar: string }
}
