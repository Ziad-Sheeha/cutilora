import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { geoLocationApi } from "../api/geo-location.api"
import type { GeoId, GeoPayload } from "../types/geo-location.types"

const STALE_TIME = 5 * 60 * 1000
export const geoKeys = {
  all: ["platform", "geo"] as const,
  lists: (endpoint: string) => [...geoKeys.all, endpoint, "list"] as const,
  list: (endpoint: string, search: string, page: number, perPage: number) => [...geoKeys.lists(endpoint), { search, page, perPage }] as const,
  detail: (endpoint: string, id: GeoId) => [...geoKeys.all, endpoint, "detail", id] as const,
}

export function useGeoList(endpoint: string, search = "", page = 1, perPage = 10, parentField?: string, parentId?: string) {
  return useQuery({
    queryKey: [...geoKeys.list(endpoint, search, page, perPage), parentField, parentId],
    queryFn: () => geoLocationApi.list(endpoint, { search, page, perPage, parentField, parentId }),
    enabled: Boolean(endpoint) && (!parentField || Boolean(parentId)),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  })
}

export function useGeoDetail(endpoint: string, id: GeoId | undefined) {
  return useQuery({
    queryKey: id ? geoKeys.detail(endpoint, id) : [...geoKeys.all, endpoint, "detail", "idle"],
    queryFn: () => geoLocationApi.get(endpoint, id!),
    enabled: Boolean(endpoint && id),
    staleTime: STALE_TIME,
  })
}

export function useGeoMutations(endpoint: string) {
  const queryClient = useQueryClient()
  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: geoKeys.all })
  }
  const create = useMutation({ mutationFn: (payload: GeoPayload) => geoLocationApi.create(endpoint, payload), onSuccess: invalidate })
  const update = useMutation({ mutationFn: ({ id, payload }: { id: GeoId; payload: GeoPayload }) => geoLocationApi.update(endpoint, id, payload), onSuccess: invalidate })
  const remove = useMutation({ mutationFn: (id: GeoId) => geoLocationApi.remove(endpoint, id), onSuccess: invalidate })
  return { create, update, remove }
}
