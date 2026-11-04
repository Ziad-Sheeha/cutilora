import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import { Form, Formik, Field } from "formik"
import { NavLink, useParams } from "react-router"
import {
  Globe2,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { useI18n } from "@/i18n/i18n-provider"
import { pushToast, store } from "@/store"

import {
  geoConfigs,
  geoRecordName,
  type GeoId,
  type GeoKind,
  type GeoPayload,
  type GeoRecord,
  type GeoRelation,
} from "./geo-location.types"
import { geoLocationSchema } from "./geo-location.schema"
import { GeoSearchSelect } from "./geo-search-select"
import { useGeoDetail, useGeoList, useGeoMutations } from "./use-geo-location"

interface FormValues {
  name_en: string
  name_ar: string
  code: string
  parentId: GeoId
}

const kinds: GeoKind[] = ["countries", "governorates", "cities", "districts"]
const PAGE_SIZE = 10

function ParentName({
  kind,
  id,
  locale,
  relation,
}: {
  kind: GeoKind
  id?: GeoId | null
  locale: string
  relation?: GeoRelation | null
}) {
  const query = useGeoDetail(geoConfigs[kind].endpoint, relation ? undefined : id || undefined)

  if (relation) {
    return (
      <span className="min-w-0">
        <span className="block font-medium">{locale === "ar" ? relation.name_ar : relation.nameEn}</span>
        {relation.country && (
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {locale === "ar" ? relation.country.name_ar : relation.country.nameEn}
          </span>
        )}
      </span>
    )
  }
  if (!id) return <span className="text-muted-foreground">—</span>
  if (query.isLoading) {
    return <span className="inline-block h-4 w-24 animate-pulse rounded bg-muted" />
  }

  return (
    <span className="font-medium">
      {query.data ? geoRecordName(query.data, locale) : "—"}
    </span>
  )
}

export function GeoLocationPage() {
  const { kind: rawKind = "countries" } = useParams<{ kind: GeoKind }>()
  const kind = kinds.includes(rawKind as GeoKind)
    ? (rawKind as GeoKind)
    : "countries"
  const config = geoConfigs[kind]
  const { t, locale } = useI18n()
  const isArabic = locale === "ar"

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [selected, setSelected] = useState<GeoRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<GeoRecord | null>(null)

  const list = useGeoList(config.endpoint, debouncedSearch, page, PAGE_SIZE)
  const mutations = useGeoMutations(config.endpoint)
  const detail = useGeoDetail(config.endpoint, selected?.id)

  const records = list.data?.items ?? []
  const pagination = list.data?.pagination
  const title = t.geo[config.titleKey]
  const singular = t.geo[config.singularKey]

  const schema = geoLocationSchema(kind, {
    nameRequired: t.geo.nameRequired,
    nameEnInvalid: t.geo.nameEnInvalid,
    nameArInvalid: t.geo.nameArInvalid,
    codeRequired: t.geo.codeRequired,
    codeInvalid: t.geo.codeInvalid,
    parentRequired: t.geo.parentRequired,
  })

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    if (selected && detail.data) setFormOpen(true)
  }, [selected, detail.data])

  useEffect(() => {
    if (pagination && page > pagination.totalPages) {
      setPage(Math.max(1, pagination.totalPages))
    }
  }, [page, pagination])

  useEffect(() => {
    setSearch("")
    setDebouncedSearch("")
    setPage(1)
    setSelected(null)
    setFormOpen(false)
    setDeleteTarget(null)
  }, [kind])

  const initialValues: FormValues = {
    name_en: detail.data?.nameEn ?? "",
    name_ar: detail.data?.name_ar ?? "",
    code: detail.data?.code ?? "",
    parentId:
      (config.parentField && detail.data?.[config.parentField]) || "",
  }

  const busy =
    mutations.create.isPending ||
    mutations.update.isPending ||
    mutations.remove.isPending

  const apiError = list.error || detail.error
  const errorText = apiError instanceof Error ? apiError.message : ""

  const translateError = (message: string) => {
    if (message === "NETWORK_ERROR") return t.geo.networkError
    if (message.startsWith("HTTP_")) return t.geo.httpError
    if (message === "UNEXPECTED_RESPONSE") return t.geo.unexpectedResponse
    if (message === "UNAUTHENTICATED") return t.geo.sessionExpired
    if (/INVALID_COUNTRY_CODE|country code must be two uppercase letters/i.test(message)) return t.geo.codeInvalid
    return message
  }

  const columns = useMemo<DataTableColumn<GeoRecord>[]>(() => {
    const result: DataTableColumn<GeoRecord>[] = [
      {
        id: "name",
        header: t.geo.name,
        cell: (record) => (
          <div className="min-w-0">
            <p className="font-medium">{geoRecordName(record, locale)}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {locale === "ar" ? record.nameEn : record.name_ar}
            </p>
          </div>
        ),
      },
    ]

    result.push({
      id: "code",
      header: t.geo.code,
      cell: (record) => record.code ? (
        <span className="inline-flex rounded-lg border border-primary/10 bg-primary/[0.045] px-2.5 py-1 font-mono text-xs font-semibold tracking-wide text-primary">
          {record.code}
        </span>
      ) : <span className="text-muted-foreground">—</span>,
    })

    if (config.parent) {
      const parentKind = config.parent
      const parentField = config.parentField

      result.push({
        id: "parent",
        header: t.geo.parent,
        cell: (record) => (
          <ParentName
            kind={parentKind}
            id={parentField ? record[parentField] : undefined}
            relation={record.city ?? record.governorate ?? record.country}
            locale={locale}
          />
        ),
      })
    }

    result.push({
      id: "actions",
      header: t.common.actions,
      headerClassName: "text-end",
      cell: (record) => (
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => startEdit(record)}
            aria-label={t.common.edit}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-error hover:text-error"
            onClick={() => setDeleteTarget(record)}
            aria-label={t.common.delete}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    })

    return result
  }, [config.parent, config.parentField, kind, locale, t])

  function startEdit(record: GeoRecord) {
    setSelected(record)
  }

  function startCreate() {
    setSelected(null)
    setFormOpen(true)
  }

  async function submit(values: FormValues) {
    const payload: GeoPayload = {
      name_en: values.name_en.trim(),
      name_ar: values.name_ar.trim(),
    }

    if (kind === "countries") {
      payload.code = values.code.trim().toUpperCase()
    }

    if (config.parentField) {
      payload[config.parentField] = values.parentId
    }

    try {
      if (selected) {
        await mutations.update.mutateAsync({ id: selected.id, payload })
      } else {
        await mutations.create.mutateAsync(payload)
      }

      store.dispatch(pushToast({ id: crypto.randomUUID(), kind: "success", title: selected ? t.geo.updated : t.geo.created }))
      setFormOpen(false)
      setSelected(null)
    } catch (error) {
      store.dispatch(pushToast({ id: crypto.randomUUID(), kind: "error", title: t.geo.apiError, description: error instanceof Error ? translateError(error.message) : t.geo.apiError }))
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return

    try {
      await mutations.remove.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
      store.dispatch(pushToast({ id: crypto.randomUUID(), kind: "success", title: t.geo.deleted }))
    } catch (error) {
      store.dispatch(pushToast({ id: crypto.randomUUID(), kind: "error", title: t.geo.apiError, description: error instanceof Error ? translateError(error.message) : t.geo.apiError }))
    }
  }

  const emptyState = (
    <div className="p-12 text-center">
      <MapPin className="mx-auto size-8 text-muted-foreground/50" />
      <p className="mt-3 font-medium">
        {debouncedSearch ? t.common.noResults : t.common.noRecords}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{t.geo.emptyHint}</p>
    </div>
  )

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Globe2 className="size-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {t.geo.platformData}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {t.geo.module}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {t.geo.description}
            </p>
          </div>
        </div>

        <Button type="button" onClick={startCreate}>
          <Plus className="size-4" />
          {t.geo.add} {singular}
        </Button>
      </header>

      <nav
        aria-label={t.geo.module}
        className="flex flex-wrap gap-2 rounded-2xl border bg-card p-2"
      >
        {kinds.map((item) => (
          <NavLink
            key={item}
            to={`/super-admin/geo-location/${item}`}
            className={({ isActive }) =>
              `rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`
            }
          >
            {t.geo[geoConfigs[item].titleKey]}
          </NavLink>
        ))}
      </nav>

      {errorText && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-error/25 bg-error/5 px-4 py-3 text-sm text-error"
        >
          <span>{translateError(errorText)}</span>

        </div>
      )}

      <section className="overflow-hidden rounded-2xl border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {pagination?.totalKnown ? pagination.total : records.length}{" "}
              {t.geo.records}
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1 sm:w-72">
              <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.geo.searchPlaceholder}
                className="ps-9"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => void list.refetch()}
              disabled={list.isFetching}
              aria-label={t.common.refresh}
            >
              <RefreshCw
                className={`size-4 ${list.isFetching ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={records}
          getRowId={(record) => record.id}
          isLoading={list.isLoading}
          loadingLabel={t.common.loading}
          emptyState={emptyState}
          createdAtLabel={t.geo.createdAt}
          updatedAtLabel={t.geo.updatedAt}
          exportPdfLabel={t.geo.exportPdf}
          exportExcelLabel={t.geo.exportExcel}
          exportPendingLabel={t.geo.exportPending}
          locale={locale}
        />

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || list.isFetching}
            >
              {t.geo.previous}
            </Button>
            <span className="text-sm text-muted-foreground">
              {t.geo.page} {pagination.page} {t.geo.of}{" "}
              {pagination.totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((current) =>
                  Math.min(pagination.totalPages, current + 1),
                )
              }
              disabled={page >= pagination.totalPages || list.isFetching}
            >
              {t.geo.next}
            </Button>
          </div>
        )}
      </section>

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!busy) {
            setFormOpen(open)
            if (!open) setSelected(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selected
                ? `${t.geo.editTitle} ${singular}`
                : `${t.geo.createTitle} ${singular}`}
            </DialogTitle>
            <DialogDescription>{t.geo.description}</DialogDescription>
          </DialogHeader>

          {selected && detail.isLoading ? (
            <div className="p-8 text-center">
              <LoaderCircle className="mx-auto size-5 animate-spin" />
            </div>
          ) : (
            <Formik
              key={`${kind}-${selected?.id ?? "new"}-${formOpen}`}
              initialValues={initialValues}
              validationSchema={schema}
              onSubmit={submit}
              enableReinitialize
            >
              {({ errors, touched, isSubmitting, values, setFieldValue }) => (
                <Form className="space-y-4">
                  <div>
                    <label
                      htmlFor="geo-name-en"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      {t.geo.nameEn}
                    </label>
                    <Field
                      as={Input}
                      id="geo-name-en"
                      name="name_en"
                      dir="ltr"
                      aria-invalid={Boolean(touched.name_en && errors.name_en)}
                    />
                    {touched.name_en && errors.name_en && (
                      <p className="mt-1 text-xs text-error">
                        {errors.name_en}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="geo-name-ar"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      {t.geo.nameAr}
                    </label>
                    <Field
                      as={Input}
                      id="geo-name-ar"
                      name="name_ar"
                      dir="rtl"
                      aria-invalid={Boolean(touched.name_ar && errors.name_ar)}
                    />
                    {touched.name_ar && errors.name_ar && (
                      <p className="mt-1 text-xs text-error">
                        {errors.name_ar}
                      </p>
                    )}
                  </div>

                  {kind === "countries" && (
                    <div>
                      <label
                        htmlFor="geo-code"
                        className="mb-1.5 block text-sm font-medium"
                      >
                        {t.geo.code}
                      </label>
                      <Field
                        as={Input}
                        id="geo-code"
                        name="code"
                        dir="ltr"
                        maxLength={2}
                        autoComplete="off"
                        inputMode="text"
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          const normalized = event.target.value.replace(/[^a-z]/gi, "").slice(0, 2).toUpperCase()
                          void setFieldValue("code", normalized)
                        }}
                        className="font-mono uppercase tracking-widest"
                        aria-invalid={Boolean(touched.code && errors.code)}
                      />
                      {touched.code && errors.code && (
                        <p className="mt-1 text-xs text-error">
                          {errors.code}
                        </p>
                      )}
                    </div>
                  )}

                  {config.parent && (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        {t.geo[geoConfigs[config.parent].titleKey]}
                      </label>
                      <GeoSearchSelect
                        kind={config.parent}
                        value={values.parentId}
                        onChange={(value) => {
                          void setFieldValue("parentId", value)
                        }}
                        placeholder={t.geo.selectParent}
                        invalid={Boolean(touched.parentId && errors.parentId)}
                      />
                      {touched.parentId && errors.parentId && (
                        <p className="mt-1 text-xs text-error">
                          {errors.parentId}
                        </p>
                      )}
                    </div>
                  )}

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setFormOpen(false)
                        setSelected(null)
                      }}
                      disabled={busy}
                    >
                      {t.common.cancel}
                    </Button>
                    <Button
                      type="submit"
                      disabled={busy || isSubmitting}
                    >
                      {busy || isSubmitting ? (
                        <>
                          <LoaderCircle className="size-4 animate-spin" />
                          {t.common.saving}
                        </>
                      ) : selected ? (
                        t.common.save
                      ) : (
                        t.common.create
                      )}
                    </Button>
                  </DialogFooter>
                </Form>
              )}
            </Formik>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !busy) setDeleteTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.geo.deleteTitle}</DialogTitle>
            <DialogDescription>{t.geo.deleteDescription}</DialogDescription>
          </DialogHeader>
          <p className="font-medium">
            {deleteTarget ? geoRecordName(deleteTarget, locale) : ""}
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={busy}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void confirmDelete()}
              disabled={busy}
            >
              {busy ? t.common.saving : t.common.confirmDelete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
