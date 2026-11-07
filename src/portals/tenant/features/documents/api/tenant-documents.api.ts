import { tenantApi } from "../../../api/tenant-api"

export type TenantDocumentCategory = "registration" | "tax" | "license" | "insurance" | "contract" | "other"
export type TenantDocument = {
  _id?: string
  id?: string
  name: string
  category: TenantDocumentCategory
  mimeType?: string
  sizeBytes?: number
  expiresAt?: string | null
  version?: number
  status?: "active" | "archived"
  createdAt?: string
  uploadedBy?: string
  replacesDocumentId?: string | null
  archivedAt?: string | null
}
export type CreateTenantDocumentInput = {
  name: string
  category: TenantDocumentCategory
  fileBase64: string
  expiresAt: string | null
}
export type ReplaceTenantDocumentInput = {
  name?: string
  fileBase64: string
  expiresAt: string | null
}

type ApiEnvelope<T> = { success: boolean; data: T }

export async function listTenantDocuments(): Promise<TenantDocument[]> {
  const { data } = await tenantApi.get<ApiEnvelope<TenantDocument[]>>("/tenant/documents")
  return data.data
}
export async function createTenantDocument(input: CreateTenantDocumentInput): Promise<TenantDocument> {
  const { data } = await tenantApi.post<ApiEnvelope<TenantDocument>>("/tenant/documents", input)
  return data.data
}
export async function replaceTenantDocument(id: string, input: ReplaceTenantDocumentInput): Promise<TenantDocument> {
  const { data } = await tenantApi.put<ApiEnvelope<TenantDocument>>(`/tenant/documents/${encodeURIComponent(id)}/replace`, input)
  return data.data
}
export async function getTenantDocumentVersions(id: string): Promise<TenantDocument[]> {
  const { data } = await tenantApi.get<ApiEnvelope<TenantDocument[]>>(`/tenant/documents/${encodeURIComponent(id)}/versions`)
  return data.data
}
export async function downloadTenantDocument(id: string): Promise<Blob> {
  const { data } = await tenantApi.get<Blob>(`/tenant/documents/${encodeURIComponent(id)}/download`, { responseType: "blob" })
  return data
}
export async function archiveTenantDocument(id: string): Promise<void> {
  await tenantApi.delete(`/tenant/documents/${encodeURIComponent(id)}`)
}
