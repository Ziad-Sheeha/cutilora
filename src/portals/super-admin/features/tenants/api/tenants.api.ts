import { appEnv } from "@/config/env"
import { expireSuperAdminSession, getSuperAdminToken } from "@/portals/super-admin/auth/super-admin-auth"
import type { Tenant, TenantAddress, TenantBranding, TenantContact, TenantLegal, TenantListResult, TenantPayment, TenantPayload, TenantPreferences, TenantSubscription } from "../types/tenant.types"

const baseUrl = appEnv.apiBaseUrl.replace(/\/$/, "")
type ObjectValue = Record<string, unknown>
function object(value: unknown): ObjectValue | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as ObjectValue : undefined
}
function text(value: unknown, fallback = ""): string { return typeof value === "string" ? value : fallback }
function nullableText(value: unknown): string | null { return typeof value === "string" && value.length ? value : null }
function numberOrNull(value: unknown): number | null { return typeof value === "number" && Number.isFinite(value) ? value : null }
function asArray(value: unknown): unknown[] { return Array.isArray(value) ? value : [] }

function normalizeTenant(value: unknown): Tenant {
  const row = object(value)
  if (!row) throw new Error("UNEXPECTED_RESPONSE")
  const id = row._id ?? row.id
  if (typeof id !== "string" && typeof id !== "number") throw new Error("UNEXPECTED_RESPONSE")
  const contact = object(row.contact) ?? {}
  const address = object(row.address) ?? {}
  const legal = object(row.legal) ?? {}
  const branding = object(row.branding) ?? {}
  const preferences = object(row.preferences) ?? {}
  const supportedLanguages = asArray(preferences.supportedLanguages).filter((item): item is string => typeof item === "string")
  const tenantContact: TenantContact = {
    email: nullableText(contact.email), phone: nullableText(contact.phone), alternatePhone: nullableText(contact.alternatePhone),
    whatsapp: nullableText(contact.whatsapp), website: nullableText(contact.website),
  }
  const tenantAddress: TenantAddress = {
    countryId: nullableText(address.countryId), governorateId: nullableText(address.governorateId), cityId: nullableText(address.cityId),
    districtId: nullableText(address.districtId), addressLine1: text(address.addressLine1), addressLine2: text(address.addressLine2),
    building: text(address.building), floor: text(address.floor), unit: text(address.unit), postalCode: text(address.postalCode),
    latitude: numberOrNull(address.latitude), longitude: numberOrNull(address.longitude),
  }
  const tenantLegal: TenantLegal = {
    taxNumber: text(legal.taxNumber), vatNumber: text(legal.vatNumber),
    commercialRegistrationNumber: text(legal.commercialRegistrationNumber),
  }
  const tenantBranding: TenantBranding = {
    logoUrl: text(branding.logoUrl), coverImageUrl: text(branding.coverImageUrl), primaryColor: text(branding.primaryColor, "#2563eb"),
  }
  const tenantPreferences: TenantPreferences = {
    timezone: text(preferences.timezone, "Africa/Cairo"), locale: text(preferences.locale, "en"),
    currency: text(preferences.currency, "EGP"), dateFormat: text(preferences.dateFormat, "YYYY-MM-DD"),
    weekStartsOn: typeof preferences.weekStartsOn === "number" ? preferences.weekStartsOn : 6,
    supportedLanguages,
  }
  return {
    id: String(id), name: text(row.name), slug: text(row.slug), displayName: text(row.displayName), legalName: text(row.legalName),
    businessType: text(row.businessType, "single_clinic"), description: text(row.description), industry: text(row.industry),
    status: text(row.status, "pending"), plan: text(row.plan), contact: tenantContact, address: tenantAddress,
    legal: tenantLegal, branding: tenantBranding, preferences: tenantPreferences,
    createdAt: nullableText(row.createdAt ?? row.created_at), updatedAt: nullableText(row.updatedAt ?? row.updated_at),
  }
}
function normalizeSubscription(value: unknown): TenantSubscription {
  const root = object(value) ?? {}
  const data = object(root.data) ?? root
  const plan = object(data.plan)
  return {
    plan: plan ? { code: text(plan.code), name: text(plan.name), amount: Number(plan.amount) || 0, currency: text(plan.currency) } : null,
    billingCycle: nullableText(data.billingCycle), status: nullableText(data.status),
    trialStartsAt: nullableText(data.trialStartsAt), trialEndsAt: nullableText(data.trialEndsAt),
    currentPeriodStartsAt: nullableText(data.currentPeriodStartsAt), currentPeriodEndsAt: nullableText(data.currentPeriodEndsAt),
    nextBillingAt: nullableText(data.nextBillingAt), cancelAtPeriodEnd: data.cancelAtPeriodEnd === true,
    canceledAt: nullableText(data.canceledAt), notes: nullableText(data.notes),
  }
}
function normalizePayment(value: unknown): TenantPayment {
  const row = object(value)
  if (!row) throw new Error("UNEXPECTED_RESPONSE")
  return {
    amount: Number(row.amount) || 0, currency: text(row.currency), status: text(row.status, "unknown"),
    method: text(row.method), provider: text(row.provider), providerReference: text(row.providerReference),
    invoiceNumber: text(row.invoiceNumber), invoiceUrl: nullableText(row.invoiceUrl),
    paidAt: nullableText(row.paidAt), failureReason: nullableText(row.failureReason),
  }
}
function rowsFrom(payload: unknown): unknown[] {
  const root = object(payload)
  if (!root) throw new Error("UNEXPECTED_RESPONSE")
  const data = root.data
  if (Array.isArray(data)) return data
  const nested = object(data)
  if (Array.isArray(nested?.data)) return nested.data
  if (Array.isArray(nested?.items)) return nested.items
  throw new Error("UNEXPECTED_RESPONSE")
}
function listResult(payload: unknown, page: number, perPage: number): TenantListResult {
  const root = object(payload) ?? {}
  const nested = object(root.data)
  const meta = object(root.meta) ?? object(nested?.meta) ?? object(root.pagination) ?? object(nested?.pagination) ?? {}
  const items = rowsFrom(payload).map(normalizeTenant)
  const totalValue = Number(meta.total ?? meta.totalItems ?? meta.totalCount)
  const totalKnown = Number.isFinite(totalValue) && (meta.total !== undefined || meta.totalItems !== undefined || meta.totalCount !== undefined)
  const actualPage = Number(meta.current_page ?? meta.currentPage ?? meta.page ?? page) || page
  const actualPerPage = Number(meta.per_page ?? meta.perPage ?? meta.limit ?? perPage) || perPage
  const total = totalKnown ? totalValue : (actualPage - 1) * actualPerPage + items.length
  const totalPages = Number(meta.last_page ?? meta.totalPages)
  return { items, page: actualPage, perPage: actualPerPage, total, totalKnown,
    hasNext: meta.has_next === true || meta.hasNext === true || meta.next_page_url != null ||
      (Number.isFinite(totalPages) && totalPages > 0 ? actualPage < totalPages : totalKnown ? actualPage * actualPerPage < total : items.length === actualPerPage) }
}
interface ApiError { message?: string; error?: { message?: string }; errors?: Record<string, unknown> }
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getSuperAdminToken()
  if (!token) throw new Error("UNAUTHENTICATED")
  let response: Response
  try {
    response = await fetch(baseUrl + path, { ...init, headers: {
      Accept: "application/json", Authorization: "Bearer " + token,
      ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers,
    } })
  } catch { throw new Error("NETWORK_ERROR") }
  if (response.status === 401) { expireSuperAdminSession(); throw new Error("UNAUTHENTICATED") }
  const payload = await response.json().catch(() => null) as ApiError | null
  if (!response.ok) {
    const validation = payload?.errors ? Object.values(payload.errors).flat().join(" ") : ""
    throw new Error(validation || payload?.error?.message || payload?.message || "HTTP_" + response.status)
  }
  return payload as T
}
function tenantPath(id: string): string { return "/platform/tenants/" + encodeURIComponent(id) }

export const tenantsApi = {
  list: async (params: { page: number; perPage: number; search?: string; status?: string; plan?: string }): Promise<TenantListResult> => {
    const allItems = rowsFrom(await request("/platform/tenants")).map(normalizeTenant)
    const search = (params.search ?? "").trim().toLocaleLowerCase()
    const filtered = allItems.filter((tenant) => {
      const matchesSearch = !search || [tenant.name, tenant.displayName, tenant.legalName, tenant.slug, tenant.contact.email]
        .some((value) => (value ?? "").toLocaleLowerCase().includes(search))
      return matchesSearch && (!params.status || tenant.status === params.status) && (!params.plan || tenant.plan === params.plan)
    })
    const start = (params.page - 1) * params.perPage
    const items = filtered.slice(start, start + params.perPage)
    return { items, page: params.page, perPage: params.perPage, total: filtered.length, totalKnown: true, hasNext: start + params.perPage < filtered.length }
  },
  get: async (id: string): Promise<Tenant> => {
    const payload = await request<unknown>(tenantPath(id))
    const root = object(payload)
    return normalizeTenant(root?.data ?? payload)
  },
  create: async (payload: TenantPayload): Promise<Tenant> => {
    const result = await request<unknown>("/platform/tenants", { method: "POST", body: JSON.stringify(payload) })
    const root = object(result)
    return normalizeTenant(root?.data ?? result)
  },
  updateStatus: async (id: string, status: string): Promise<void> => {
    await request(tenantPath(id) + "/status", { method: "PATCH", body: JSON.stringify({ status }) })
  },
  subscription: async (id: string): Promise<TenantSubscription> => normalizeSubscription(await request(tenantPath(id) + "/subscription")),
  payments: async (id: string): Promise<TenantPayment[]> => asArray(rowsFrom(await request(tenantPath(id) + "/subscription/payments"))).map(normalizePayment),
}
