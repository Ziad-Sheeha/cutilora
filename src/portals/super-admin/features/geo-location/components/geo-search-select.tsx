import { useEffect, useState } from "react"
import { Check, ChevronsUpDown, LoaderCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useI18n } from "@/i18n/i18n-provider"
import { geoRecordName, type GeoId, type GeoKind, type GeoRecord } from "../types/geo-location.types"
import { geoConfigs } from "./geo-location.types"
import { useGeoDetail, useGeoList } from "../hooks/use-geo-location"

interface GeoSearchSelectProps {
  kind: GeoKind
  value: GeoId
  onChange: (value: GeoId) => void
  placeholder: string
  disabled?: boolean
  invalid?: boolean
}

export function GeoSearchSelect({ kind, value, onChange, placeholder, disabled, invalid }: GeoSearchSelectProps) {
  const { locale, t } = useI18n()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [loadedOptions, setLoadedOptions] = useState<GeoRecord[]>([])
  const config = geoConfigs[kind]
  const query = useGeoList(config.endpoint, debouncedSearch, page, 10)
  const selectedQuery = useGeoDetail(config.endpoint, value || undefined)
  const options = loadedOptions.length ? loadedOptions : query.data?.items ?? []
  const selected = selectedQuery.data
  const selectedLabel = selected ? geoRecordName(selected, locale) : ""

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    setLoadedOptions([])
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    if (!query.data || query.isPlaceholderData) return
    setLoadedOptions((current) => {
      const merged = page === 1 ? query.data.items : [...current, ...query.data.items]
      return Array.from(new Map(merged.map((item) => [item.id, item])).values())
    })
  }, [query.data, query.isPlaceholderData, page])

  useEffect(() => {
    if (!open) {
      setSearch("")
      setDebouncedSearch("")
      setPage(1)
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" role="combobox" aria-expanded={open} aria-invalid={invalid} disabled={disabled} className="h-11 w-full justify-between font-normal">
          <span className={selectedLabel ? "truncate text-foreground" : "truncate text-muted-foreground"}>{selectedLabel || placeholder}</span>
          <ChevronsUpDown className="ms-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-2">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.common.searchPlaceholder} className="ps-9" />
        </div>
        <div className="mt-2 max-h-60 overflow-y-auto">
          {query.isLoading ? (
            <div className="flex items-center justify-center gap-2 p-5 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />{t.common.loading}</div>
          ) : options.length === 0 ? (
            <p className="p-5 text-center text-sm text-muted-foreground">{t.common.noResults}</p>
          ) : options.map((option) => (
            <button key={option.id} type="button" onClick={() => { onChange(option.id); setOpen(false) }} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-start text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none">
              <span className="min-w-0"><span className="block truncate font-medium">{geoRecordName(option, locale)}</span><span className="block truncate text-xs text-muted-foreground">{locale === "ar" ? option.nameEn : option.name_ar}</span></span>
              {option.id === value && <Check className="ms-2 size-4 shrink-0 text-primary" />}
            </button>
          ))}
        </div>
        {query.data && query.data.pagination.totalPages > page && (
          <Button type="button" variant="ghost" size="sm" className="mt-1 w-full" disabled={query.isFetching} onClick={() => setPage((current) => current + 1)}>
            {query.isFetching ? <LoaderCircle className="size-4 animate-spin" /> : (locale === "ar" ? "عرض المزيد" : "Load more")}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}
