import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { tenantsApi } from "../api/tenants.api"
import type { TenantPayload } from "../types/tenant.types"

export const tenantKeys = {
  all: ["platform", "tenants"] as const,
  lists: () => [...tenantKeys.all, "list"] as const,
  list: (params: { page: number; perPage: number; search: string; status: string; plan: string }) => [...tenantKeys.lists(), params] as const,
  detail: (id: string) => [...tenantKeys.all, "detail", id] as const,
}
export function useTenants(params: { page: number; perPage: number; search: string; status: string; plan: string }) {
  return useQuery({ queryKey: tenantKeys.list(params), queryFn: () => tenantsApi.list(params), staleTime: 60_000, placeholderData: keepPreviousData })
}
export function useTenant(id: string) {
  return useQuery({ queryKey: tenantKeys.detail(id), queryFn: () => tenantsApi.get(id), enabled: Boolean(id), staleTime: 60_000 })
}
export function useTenantMutations() {
  const client = useQueryClient()
  const create = useMutation({ mutationFn: tenantsApi.create, onSuccess: () => client.invalidateQueries({ queryKey: tenantKeys.all }) })
  const updateProfile = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TenantPayload> }) => tenantsApi.updateProfile(id, payload),
    onSuccess: (_data, variables) => {
      void client.invalidateQueries({ queryKey: tenantKeys.all })
      void client.invalidateQueries({ queryKey: tenantKeys.detail(variables.id) })
    },
  })
  const replaceSubscription = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => tenantsApi.replaceSubscription(id, payload),
    onSuccess: (_data, variables) => {
      void client.invalidateQueries({ queryKey: tenantKeys.subscription(variables.id) })
      void client.invalidateQueries({ queryKey: tenantKeys.detail(variables.id) })
    },
  })
  const recordPayment = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => tenantsApi.recordPayment(id, payload),
    onSuccess: (_data, variables) => {
      void client.invalidateQueries({ queryKey: tenantKeys.payments(variables.id) })
      void client.invalidateQueries({ queryKey: tenantKeys.subscription(variables.id) })
    },
  })
  const updateStatus = useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => tenantsApi.updateStatus(id, status), onSuccess: (_data, variables) => {
    void client.invalidateQueries({ queryKey: tenantKeys.all })
    void client.invalidateQueries({ queryKey: tenantKeys.detail(variables.id) })
  } })
  return { create, updateStatus, updateProfile, replaceSubscription, recordPayment }
}
