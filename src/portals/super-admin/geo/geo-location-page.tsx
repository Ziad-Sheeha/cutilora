import { useEffect, useMemo, useState } from "react"
import { Form, Formik, Field } from "formik"
import * as Yup from "yup"
import { NavLink, useParams } from "react-router"
import { ArrowLeft, ArrowRight, Globe2, LoaderCircle, MapPin, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useI18n } from "@/i18n/i18n-provider"
import { geoConfigs, geoRecordName, type GeoId, type GeoKind, type GeoRecord } from "./geo-location.types"
import { GeoSearchSelect } from "./geo-search-select"
import { useGeoDetail, useGeoList, useGeoMutations } from "./use-geo-location"

interface GeoFormValues {
  name_en: string
  name_ar: string
  code: string
  parentId: GeoId
}

const kinds: GeoKind[] = ["countries", "governorates", "cities", "districts"]
const PAGE_SIZE = 10

function ParentName({ kind, id, locale }: { kind: GeoKind; id?: GeoId; locale: string }) {
  const config = geoConfigs[kind]
  const query = useGeoDetail(config.endpoint, id)
  if (!id) return <span className="text-muted-foreground">—</span>
  if (query.isLoading) return <span className="inline-block h-4 w-24 animate-pulse rounded bg-muted" />
  if (!query.data) return <span className="text-muted-foreground">—</span>
  return <span className="font-medium">{geoRecordName(query.data, locale)}</span>
}

export function GeoLocationPage() {
  const { kind: rawKind = "countries" } = useParams<{ kind: GeoKind }>()
  const kind = kinds.includes(rawKind as GeoKind) ? rawKind as GeoKind : "countries"
  const config = geoConfigs[kind]
  const { t, locale } = useI18n()
  const isArabic = locale === "ar"
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [selected, setSelected] = useState<GeoRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<GeoRecord | null>(null)
  const [actionError, setActionError] = useState("")
  const [notice, setNotice] = useState("")
  const list = useGeoList(config.endpoint, debouncedSearch, page, PAGE_SIZE)
  const detail = useGeoDetail(config.endpoint, selected?.id)
  const mutations = useGeoMutations(config.endpoint)
  const records = list.data?.items ?? []
  const pagination = list.data?.pagination
  const busy = mutations.create.isPending || mutations.update.isPending || mutations.remove.isPending
  const title = t.geo[config.titleKey]
  const singular = t.geo[config.singularKey]
  const parentKind = config.parent
  const parentField = config.parentField

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setSearch("")
    setDebouncedSearch("")
    setPage(1)
    setNotice("")
    setActionError("")
    setSelected(null)
    setFormOpen(false)
    setDeleteTarget(null)
  }, [kind])

  const validationSchema = useMemo(() => Yup.object({
    name_en: Yup.string().trim().required(isArabic ? "الاسم بالإنجليزية مطلوب" : "English name is required").max(150),
    name_ar: Yup.string().trim().required(isArabic ? "الاسم بالعربية مطلوب" : "Arabic name is required").max(150),
    code: kind === "countries" ? Yup.string().trim().required(isArabic ? "كود الدولة مطلوب" : "Country code is required").matches(/^[A-Za-z]{2,3}$/, isArabic ? "استخدم كودًا من حرفين أو ثلاثة مثل EG" : "Use a 2–3 letter code, e.g. EG").uppercase() : Yup.string(),
    parentId: parentKind ? Yup.string().required(isArabic ? "اختيار العنصر الرئيسي مطلوب" : "Parent selection is required") : Yup.string(),
  }), [kind, isArabic, parentKind])

  const initialValues: GeoFormValues = {
    name_en: detail.data?.nameEn ?? selected?.nameEn ?? "",
    name_ar: detail.data?.name_ar ?? selected?.name_ar ?? "",
    code: detail.data?.code ?? selected?.code ?? "",
    parentId: parentField && detail.data?.[parentField] ? String(detail.data[parentField]) : "",
  }

  function openCreate() {
    setActionError("")
    setSelected(null)
    setFormOpen(true)
  }

  function openEdit(record: GeoRecord) {
    setActionError("")
    setSelected(record)
    setFormOpen(true)
  }

  async function submit(values: GeoFormValues) {
    setActionError("")
    const payload = {
      name_en: values.name_en.trim(),
      name_ar: values.name_ar.trim(),
      ...(kind === "countries" ? { code: values.code.trim().toUpperCase() } : {}),
      ...(parentField ? { [parentField]: values.parentId } : {}),
    }
    try {
      if (selected) await mutations.update.mutateAsync({ id: selected.id, payload })
      else await mutations.create.mutateAsync(payload)
      setNotice(selected ? (isArabic ? "تم تحديث السجل بنجاح" : "Record updated successfully") : (isArabic ? "تم إنشاء السجل بنجاح" : "Record created successfully"))
      setFormOpen(false)
      setSelected(null)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t.geo.apiError)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setActionError("")
    try {
      await mutations.remove.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
      setNotice(isArabic ? "تم حذف السجل بنجاح" : "Record deleted successfully")
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t.geo.apiError)
    }
  }

  const rangeStart = pagination && pagination.total > 0 ? (pagination.page - 1) * pagination.perPage + 1 : 0
  const rangeEnd = pagination ? Math.min(pagination.page * pagination.perPage, pagination.total) : records.length

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Globe2 className="size-6" /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{t.geo.platformData}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{t.geo.module}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t.geo.description}</p>
          </div>
        </div>
        <Button onClick={openCreate}><Plus className="size-4" />{t.geo.add} {singular}</Button>
      </header>

      <nav aria-label={t.geo.module} className="flex flex-wrap gap-2 rounded-2xl border bg-card p-2">
        {kinds.map((item) => <NavLink key={item} to={`/super-admin/geo-location/${item}`} className={({ isActive }) => `rounded-xl px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"}`}>{t.geo[geoConfigs[item].titleKey]}</NavLink>)}
      </nav>

      {(notice || actionError || list.error) && (
        <div role={actionError || list.error ? "alert" : "status"} className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${actionError || list.error ? "border-error/25 bg-error/5 text-error" : "border-emerald-500/25 bg-emerald-500/5 text-emerald-700"}`}>
          <span>{actionError || (list.error instanceof Error ? list.error.message : "") || notice}</span>
          <button type="button" onClick={() => { setNotice(""); setActionError("") }} aria-label={t.common.dismiss}>×</button>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b bg-gradient-to-r from-muted/40 to-transparent p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2"><h2 className="text-base font-semibold">{title}</h2><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{pagination?.total ?? "—"}</span></div>
            <p className="mt-1 text-xs text-muted-foreground">{isArabic ? "إدارة البيانات الجغرافية والارتباطات التابعة" : "Manage geographic records and their parent relationships"}</p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <div className="relative min-w-0 flex-1 sm:w-80">
              <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={isArabic ? "ابحث بالاسم العربي أو الإنجليزي أو الكود..." : "Search Arabic name, English name or code..."} className="h-10 rounded-xl ps-9" />
            </div>
            <Button type="button" variant="outline" size="icon" className="size-10 shrink-0 rounded-xl" onClick={() => void list.refetch()} disabled={list.isFetching} aria-label={t.common.refresh}><RefreshCw className={`size-4 ${list.isFetching ? "animate-spin" : ""}`} /></Button>
          </div>
        </div>

        {list.isLoading ? (
          <div className="flex items-center justify-center gap-2 p-16 text-sm text-muted-foreground"><LoaderCircle className="size-5 animate-spin" />{t.common.loading}</div>
        ) : records.length === 0 ? (
          <div className="p-16 text-center"><MapPin className="mx-auto size-9 text-muted-foreground/40" /><p className="mt-3 font-semibold">{search ? t.common.noResults : t.common.noRecords}</p><p className="mt-1 text-sm text-muted-foreground">{t.geo.emptyHint}</p></div>
        ) : (
          <Table className="min-w-[760px]">
            <TableHeader><TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="h-12">{isArabic ? "الاسم بالعربية" : "Arabic name"}</TableHead>
              <TableHead>{isArabic ? "الاسم بالإنجليزية" : "English name"}</TableHead>
              {kind === "countries" && <TableHead>{isArabic ? "كود الدولة" : "Country code"}</TableHead>}
              {parentKind && <TableHead>{isArabic ? "يتبع" : "Parent"}</TableHead>}
              <TableHead className="w-28 text-end">{t.common.actions}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id} className="group">
                  <TableCell><span className="font-semibold">{record.name_ar}</span></TableCell>
                  <TableCell><span className="font-medium text-foreground/85" dir="ltr">{record.nameEn}</span></TableCell>
                  {kind === "countries" && <TableCell><span className="inline-flex rounded-lg border bg-muted/50 px-2.5 py-1 font-mono text-xs font-semibold tracking-wider">{record.code || "—"}</span></TableCell>}
                  {parentKind && <TableCell><ParentName kind={parentKind} id={parentField ? record[parentField] ?? undefined : undefined} locale={locale} /></TableCell>}
                  <TableCell><div className="flex justify-end gap-1 opacity-80 transition-opacity group-hover:opacity-100">
                    <Button type="button" variant="ghost" size="icon" className="size-9 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(record)} aria-label={t.common.edit}><Pencil className="size-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" className="size-9 rounded-lg text-error hover:bg-error/10 hover:text-error" onClick={() => setDeleteTarget(record)} aria-label={t.common.delete}><Trash2 className="size-4" /></Button>
                  </div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <footer className="flex flex-col gap-3 border-t bg-muted/20 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">{isArabic ? `عرض ${rangeStart}–${rangeEnd} من ${pagination?.total ?? records.length}` : `Showing ${rangeStart}–${rangeEnd} of ${pagination?.total ?? records.length}`}</p>
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" className="h-9 rounded-lg" disabled={page <= 1 || list.isFetching} onClick={() => setPage((current) => Math.max(1, current - 1))}><ArrowLeft className="size-4" />{isArabic ? "السابق" : "Previous"}</Button>
            <span className="min-w-16 text-center text-xs font-medium tabular-nums">{page} / {pagination?.totalPages ?? 1}</span>
            <Button type="button" variant="outline" size="sm" className="h-9 rounded-lg" disabled={!pagination || page >= pagination.totalPages || list.isFetching} onClick={() => setPage((current) => current + 1)}>{isArabic ? "التالي" : "Next"}<ArrowRight className="size-4" /></Button>
          </div>
        </footer>
      </section>

      <Dialog open={formOpen} onOpenChange={(open) => { if (!busy) { setFormOpen(open); if (!open) setSelected(null) } }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>{selected ? (isArabic ? "تعديل" : "Edit") : (isArabic ? "إضافة" : "Add")} {singular}</DialogTitle><DialogDescription>{isArabic ? "أدخل الاسم بالعربية والإنجليزية واربط السجل بمستواه الجغرافي الصحيح." : "Enter both localized names and select the correct parent geographic record."}</DialogDescription></DialogHeader>
          {selected && detail.isLoading ? <div className="flex justify-center p-10"><LoaderCircle className="size-5 animate-spin" /></div> : (
            <Formik key={`${kind}-${selected?.id ?? "new"}-${formOpen}`} initialValues={initialValues} enableReinitialize validationSchema={validationSchema} onSubmit={submit}>
              {({ errors, touched, isSubmitting, values, setFieldValue }) => (
                <Form className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><label htmlFor="geo-name-ar" className="mb-1.5 block text-sm font-medium">{isArabic ? "الاسم بالعربية" : "Arabic name"}</label><Field as={Input} id="geo-name-ar" name="name_ar" dir="rtl" placeholder="مثال: القاهرة" aria-invalid={Boolean(touched.name_ar && errors.name_ar)} />{touched.name_ar && errors.name_ar && <p className="mt-1 text-xs text-error">{errors.name_ar}</p>}</div>
                    <div><label htmlFor="geo-name-en" className="mb-1.5 block text-sm font-medium">{isArabic ? "الاسم بالإنجليزية" : "English name"}</label><Field as={Input} id="geo-name-en" name="name_en" dir="ltr" placeholder="e.g. Cairo" aria-invalid={Boolean(touched.name_en && errors.name_en)} />{touched.name_en && errors.name_en && <p className="mt-1 text-xs text-error">{errors.name_en}</p>}</div>
                  </div>
                  {kind === "countries" && <div><label htmlFor="geo-code" className="mb-1.5 block text-sm font-medium">{isArabic ? "كود الدولة (ISO)" : "Country code (ISO)"}</label><Field as={Input} id="geo-code" name="code" dir="ltr" maxLength={3} placeholder="EG" className="font-mono uppercase tracking-widest" aria-invalid={Boolean(touched.code && errors.code)} />{touched.code && errors.code && <p className="mt-1 text-xs text-error">{errors.code}</p>}</div>}
                  {parentKind && <div><label className="mb-1.5 block text-sm font-medium">{isArabic ? "يتبع" : "Parent"} · {t.geo[geoConfigs[parentKind].titleKey]}</label><GeoSearchSelect kind={parentKind} value={values.parentId} onChange={(value) => void setFieldValue("parentId", value)} placeholder={isArabic ? `ابحث واختر ${t.geo[geoConfigs[parentKind].singularKey]}` : `Search and select ${t.geo[geoConfigs[parentKind].singularKey]}`} invalid={Boolean(touched.parentId && errors.parentId)} />{touched.parentId && errors.parentId && <p className="mt-1 text-xs text-error">{errors.parentId}</p>}</div>}
                  <DialogFooter className="pt-2"><Button type="button" variant="outline" onClick={() => { setFormOpen(false); setSelected(null) }} disabled={busy}>{t.common.cancel}</Button><Button type="submit" disabled={busy || isSubmitting}>{busy || isSubmitting ? <><LoaderCircle className="size-4 animate-spin" />{t.common.saving}</> : selected ? t.common.save : t.common.create}</Button></DialogFooter>
                </Form>
              )}
            </Formik>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open && !busy) setDeleteTarget(null) }}>
        <DialogContent><DialogHeader><DialogTitle>{t.geo.deleteTitle}</DialogTitle><DialogDescription>{t.geo.deleteDescription}</DialogDescription></DialogHeader>
          <div className="rounded-xl border bg-muted/30 p-3"><p className="font-semibold">{deleteTarget?.name_ar}</p><p className="text-sm text-muted-foreground" dir="ltr">{deleteTarget?.nameEn}</p></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setDeleteTarget(null)} disabled={busy}>{t.common.cancel}</Button><Button type="button" variant="destructive" onClick={() => void confirmDelete()} disabled={busy}>{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}{t.common.confirmDelete}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
