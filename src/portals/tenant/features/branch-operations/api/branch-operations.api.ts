import { tenantApi } from "../../../api/tenant-api"

export type BusinessShift = { opensAt: string; closesAt: string }
export type BusinessHoursDay = { weekday: number; isClosed: boolean; shifts: BusinessShift[] }
export type BranchHoliday = {
  _id?: string
  id?: string
  name: string
  date: string
  isClosed: boolean
  overrideOpensAt?: string | null
  overrideClosesAt?: string | null
  createdAt?: string
  updatedAt?: string
}
function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) return (payload as { data: T }).data
  return payload as T
}
function rows<T>(payload: unknown): T[] {
  const data = unwrap<unknown>(payload)
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === "object") {
    const row = data as Record<string, unknown>
    if (Array.isArray(row.items)) return row.items as T[]
    if (Array.isArray(row.days)) return row.days as T[]
    if (Array.isArray(row.data)) return row.data as T[]
  }
  return []
}
export async function getBranchBusinessHours(branchId: string) {
  const response = await tenantApi.get("/tenant/branches/" + encodeURIComponent(branchId) + "/business-hours")
  const data = unwrap<unknown>(response.data)
  const list = rows<BusinessHoursDay>(data)
  return list
}
export async function replaceBranchBusinessHours(branchId: string, days: BusinessHoursDay[]) {
  const response = await tenantApi.put("/tenant/branches/" + encodeURIComponent(branchId) + "/business-hours", { days })
  return unwrap<unknown>(response.data)
}
export async function getBranchHolidays(branchId: string) {
  const response = await tenantApi.get("/tenant/branches/" + encodeURIComponent(branchId) + "/holidays")
  return rows<BranchHoliday>(response.data)
}
export async function createBranchHoliday(branchId: string, payload: Omit<BranchHoliday, "_id" | "id" | "createdAt" | "updatedAt">) {
  const response = await tenantApi.post("/tenant/branches/" + encodeURIComponent(branchId) + "/holidays", payload)
  return unwrap<BranchHoliday>(response.data)
}

export type BranchSettings = { timezone?: string; status?: string; managerId?: string; [key: string]: unknown }
export type BranchActivity = { id?: string; _id?: string; action?: string; actor?: string; module?: string; createdAt?: string; description?: string; [key: string]: unknown }
export type TenantDirectoryUser = { id?: string; _id?: string; name?: string; email?: string; status?: string }
export async function getBranchSettings(branchId: string) {
  const response = await tenantApi.get("/tenant/branches/" + encodeURIComponent(branchId) + "/settings")
  return unwrap<BranchSettings>(response.data)
}
export async function updateBranchSettings(branchId: string, payload: Partial<BranchSettings>) {
  const response = await tenantApi.patch("/tenant/branches/" + encodeURIComponent(branchId) + "/settings", payload)
  return unwrap<BranchSettings>(response.data)
}
export async function getBranchActivity(branchId: string) {
  const response = await tenantApi.get("/tenant/branches/" + encodeURIComponent(branchId) + "/activity")
  return rows<BranchActivity>(response.data)
}
export async function getTenantDirectoryUsers() {
  const response = await tenantApi.get("/tenant/users", { params: { per_page: 100 } })
  return rows<TenantDirectoryUser>(response.data)
}
export async function assignBranchManager(branchId: string, managerId: string) {
  const response = await tenantApi.patch("/tenant/branches/" + encodeURIComponent(branchId) + "/manager", { managerId })
  return unwrap<unknown>(response.data)
}
