import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api"

export type ClinicModuleKey = "appointments" | "patients" | "clinical-records" | "services" | "packages" | "billing" | "team" | "reports" | "notifications" | "branches" | "settings"
export type ClinicRecord = Record<string, unknown> & { id?: string; _id?: string; recordType?: "employee" | "provider" }
export type ClinicModuleField = { name: string; label: string; type?: "text" | "email" | "tel" | "number" | "date" | "datetime-local" | "textarea"; required?: boolean }
type ModuleConfig = { path: string; create?: boolean; update?: boolean; remove?: boolean; fields: ClinicModuleField[] }

const configs: Partial<Record<ClinicModuleKey, ModuleConfig>> = {
  appointments: { path: "/appointments", create: true, update: true, fields: [
    { name: "patientId", label: "Patient ID", required: true },
    { name: "providerId", label: "Provider ID", required: true },
    { name: "serviceId", label: "Service ID", required: true },
    { name: "branchId", label: "Branch ID", required: true },
    { name: "scheduledAt", label: "Appointment date & time", type: "datetime-local", required: true },
    { name: "notes", label: "Notes", type: "textarea" },
  ] },
  patients: { path: "/patients", create: true, update: true, fields: [
    { name: "firstName", label: "First name", required: true },
    { name: "lastName", label: "Last name", required: true },
    { name: "email", label: "Email", type: "email" },
    { name: "phone", label: "Phone", type: "tel" },
    { name: "dateOfBirth", label: "Date of birth", type: "date" },
    { name: "gender", label: "Gender" },
  ] },
  services: { path: "/services", create: true, update: true, remove: true, fields: [
    { name: "name", label: "Service name", required: true },
    { name: "categoryId", label: "Category ID", required: true },
    { name: "durationMinutes", label: "Duration (minutes)", type: "number", required: true },
    { name: "price", label: "Price", type: "number", required: true },
    { name: "currency", label: "Currency", required: true },
    { name: "description", label: "Description", type: "textarea" },
  ] },
  packages: { path: "/packages", create: true, update: true, fields: [
    { name: "name", label: "Package name", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "price", label: "Price", type: "number", required: true },
    { name: "currency", label: "Currency", required: true },
    { name: "validityDays", label: "Validity (days)", type: "number", required: true },
  ] },
  billing: { path: "/sales", create: true, fields: [
    { name: "patientId", label: "Patient ID", required: true },
    { name: "branchId", label: "Branch ID", required: true },
    { name: "currency", label: "Currency", required: true },
    { name: "notes", label: "Notes", type: "textarea" },
  ] },
  branches: { path: "/branches", create: true, update: true, remove: true, fields: [
    { name: "name", label: "Branch name", required: true },
    { name: "code", label: "Branch code" },
    { name: "slug", label: "URL slug", required: true },
    { name: "address", label: "Address", type: "textarea" },
    { name: "timezone", label: "IANA timezone", required: true },
  ] },
}

function rootObject(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined
}
function unwrapRows(payload: unknown): ClinicRecord[] {
  const root = rootObject(payload)
  const data = root?.data
  const nested = rootObject(data)
  const rows = Array.isArray(data) ? data
    : Array.isArray(nested?.data) ? nested.data
    : Array.isArray(nested?.items) ? nested.items
    : Array.isArray(nested?.records) ? nested.records
    : Array.isArray(root?.items) ? root.items
    : data && typeof data === "object" ? [data] : []
  return rows.filter((item): item is ClinicRecord => Boolean(item && typeof item === "object" && !Array.isArray(item)))
}

export function getClinicModuleConfig(key: string) {
  return configs[key as ClinicModuleKey]
}

export async function fetchClinicModuleRecords(key: ClinicModuleKey): Promise<ClinicRecord[]> {
  if (key === "team") {
    const [employees, providers] = await Promise.all([
      apiGet<unknown>("/employees"),
      apiGet<unknown>("/providers"),
    ])
    return [
      ...unwrapRows(employees).map((item) => ({ ...item, recordType: "employee" as const })),
      ...unwrapRows(providers).map((item) => ({ ...item, recordType: "provider" as const })),
    ]
  }
  const config = configs[key]
  if (!config) throw new Error("This module does not have a collection API contract.")
  return unwrapRows(await apiGet<unknown>(config.path))
}

export async function createClinicModuleRecord(key: ClinicModuleKey, payload: Record<string, unknown>) {
  if (key === "team") {
    const recordType = payload.recordType === "provider" ? "provider" : "employee"
    const body = { ...payload }
    delete body.recordType
    return apiPost<unknown>(recordType === "provider" ? "/providers" : "/employees", body)
  }
  const config = configs[key]
  if (!config?.create) throw new Error("Create is not available for this module.")
  return apiPost<unknown>(config.path, payload)
}

export async function updateClinicModuleRecord(key: ClinicModuleKey, id: string, payload: Record<string, unknown>, recordType?: string) {
  if (key === "team") {
    const path = recordType === "provider" ? "/providers/" : "/employees/"
    return apiPatch<unknown>(path + encodeURIComponent(id), payload)
  }
  const config = configs[key]
  if (!config?.update) throw new Error("Update is not available for this module.")
  return apiPatch<unknown>(config.path + "/" + encodeURIComponent(id), payload)
}

export async function deleteClinicModuleRecord(key: ClinicModuleKey, id: string) {
  const config = configs[key]
  if (!config?.remove) throw new Error("Delete is not available for this module.")
  return apiDelete<unknown>(config.path + "/" + encodeURIComponent(id))
}

export function getClinicModuleFields(key: ClinicModuleKey) {
  if (key === "team") return [
    { name: "recordType", label: "Record type", type: "text" as const, required: true },
    { name: "firstName", label: "First name", required: true },
    { name: "lastName", label: "Last name", required: true },
    { name: "email", label: "Work email", type: "email" as const },
    { name: "phone", label: "Phone", type: "tel" as const },
    { name: "jobTitle", label: "Job title" },
  ]
  return configs[key]?.fields ?? []
}
