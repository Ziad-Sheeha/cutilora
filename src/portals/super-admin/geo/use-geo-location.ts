import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { geoLocationApi } from "./geo-location.api"
import type { GeoPayload } from "./geo-location.types"
export const geoKeys = { all: ["platform", "geo"] as const, list: (endpoint: string) => [...geoKeys.all, endpoint] as const, detail: (endpoint: string, id: string | number) => [...geoKeys.list(endpoint), id] as const }
export function useGeoList(endpoint: string, page = 1, perPage = 100) {
 return useQuery({ queryKey: [...geoKeys.list(endpoint), page, perPage], queryFn: () => geoLocationApi.list(endpoint, page, perPage), enabled: Boolean(endpoint) })
}
export function useGeoDetail(endpoint: string, id: string | number | undefined) {
 return useQuery({ queryKey: id === undefined ? [...geoKeys.list(endpoint), "none"] : geoKeys.detail(endpoint, id), queryFn: () => geoLocationApi.get(endpoint, id!), enabled: id !== undefined })
}
export function useGeoMutations(endpoint: string) {
 const client = useQueryClient()
 const refresh = () => client.invalidateQueries({ queryKey: geoKeys.all })
 const create = useMutation({ mutationFn: (payload: GeoPayload) => geoLocationApi.create(endpoint, payload), onSuccess: refresh })
 const update = useMutation({ mutationFn: ({ id, payload }: { id: string | number; payload: GeoPayload }) => geoLocationApi.update(endpoint, id, payload), onSuccess: refresh })
 const remove = useMutation({ mutationFn: (id: string | number) => geoLocationApi.remove(endpoint, id), onSuccess: refresh })
 return { create, update, remove }
}
