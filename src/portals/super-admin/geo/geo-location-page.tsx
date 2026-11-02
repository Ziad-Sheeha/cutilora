import { useEffect, useMemo, useState } from "react"
import { Formik, Form, Field } from "formik"
import { NavLink, useNavigate, useParams } from "react-router"
import { Globe2, LoaderCircle, MapPin, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useI18n } from "@/i18n/i18n-provider"
import { geoConfigs, type GeoKind, type GeoRecord } from "./geo-location.types"
import { geoLocationSchema } from "./geo-location.schema"
import { useGeoDetail, useGeoList, useGeoMutations } from "./use-geo-location"

type FormValues = { name: string; code: string; parentId: string }
const kinds: GeoKind[] = ["countries", "governorates", "cities", "districts"]
const numericId = (id: string) => /^\d+$/.test(id) ? Number(id) : id

export function GeoLocationPage() {
 const { kind: rawKind = "countries" } = useParams<{ kind: GeoKind }>()
 const kind = kinds.includes(rawKind as GeoKind) ? rawKind as GeoKind : "countries"
 const config = geoConfigs[kind]
 const { t, locale } = useI18n()
 const navigate = useNavigate()
 const list = useGeoList(config.endpoint)
 const parents = useGeoList(config.parent ? geoConfigs[config.parent].endpoint : "")
 const mutations = useGeoMutations(config.endpoint)
 const [search, setSearch] = useState("")
 const [formOpen, setFormOpen] = useState(false)
 const [selected, setSelected] = useState<GeoRecord | null>(null)
 const [deleteTarget, setDeleteTarget] = useState<GeoRecord | null>(null)
 const [notice, setNotice] = useState("")
 const [actionError, setActionError] = useState("")
 const detail = useGeoDetail(config.endpoint, selected?.id)
 const isArabic = locale === "ar"
 const title = t.geo[config.titleKey]
 const singular = t.geo[config.singularKey]
 const records = list.data ?? []
 const parentRecords = parents.data ?? []
 const parentNames = useMemo(() => new Map(parentRecords.map((record) => [String(record.id), record.name])), [parentRecords])
 const visibleRecords = useMemo(() => records.filter((record) => [record.name, record.code, config.parentField ? parentNames.get(String(record[config.parentField])) : ""].some((value) => String(value ?? "").toLocaleLowerCase(locale).includes(search.toLocaleLowerCase(locale)))), [records, search, config.parentField, parentNames, locale])
 const schema = geoLocationSchema(kind, { nameRequired: t.geo.name + " مطلوب", codeRequired: t.geo.code + " مطلوب", parentRequired: t.geo.parentRequired })

 useEffect(() => { if (selected && detail.data) setFormOpen(true) }, [selected, detail.data])
 useEffect(() => { setSearch(""); setNotice(""); setActionError(""); setSelected(null); setFormOpen(false); setDeleteTarget(null) }, [kind])

 const initialValues: FormValues = {
  name: detail.data?.name ?? "",
  code: detail.data?.code ?? "",
  parentId: config.parentField && detail.data?.[config.parentField] !== undefined ? String(detail.data[config.parentField]) : "",
 }
 const busy = mutations.create.isPending || mutations.update.isPending || mutations.remove.isPending
 const apiError = list.error || parents.error || detail.error
 const errorText = actionError || (apiError instanceof Error ? apiError.message : "")
 const translateError = (message: string) => message === "NETWORK_ERROR" ? (isArabic ? "تعذر الاتصال بالخادم. تحقق من الاتصال بالإنترنت." : "Could not connect to the server. Check your connection.") : message.startsWith("HTTP_") ? (isArabic ? "تعذر تنفيذ الطلب. راجع البيانات وحاول مرة أخرى." : "The request failed. Check the details and try again.") : message === "UNEXPECTED_RESPONSE" ? (isArabic ? "استجابة الخادم غير متوقعة." : "The server returned an unexpected response.") : message

 async function submit(values: FormValues) {
  setActionError("")
  const payload = { name: values.name.trim(), ...(kind === "countries" ? { code: values.code.trim() } : {}), ...(config.parentField ? { [config.parentField]: numericId(values.parentId) } : {}) }
  try {
   if (selected) await mutations.update.mutateAsync({ id: selected.id, payload })
   else await mutations.create.mutateAsync(payload)
   setNotice(selected ? t.geo.updated : t.geo.created)
   setFormOpen(false); setSelected(null)
  } catch (error) { setActionError(error instanceof Error ? translateError(error.message) : t.geo.apiError) }
 }
 async function confirmDelete() {
  if (!deleteTarget) return
  setActionError("")
  try { await mutations.remove.mutateAsync(deleteTarget.id); setDeleteTarget(null); setNotice(t.geo.deleted) }
  catch (error) { setActionError(error instanceof Error ? translateError(error.message) : t.geo.apiError) }
 }
 function startEdit(record: GeoRecord) { setActionError(""); setSelected(record) }
 function startCreate() { setActionError(""); setSelected(null); setFormOpen(true) }

 return <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
  <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
   <div className="flex items-start gap-3"><span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Globe2 className="size-6" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{t.geo.platformData}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">{t.geo.module}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t.geo.description}</p></div></div>
   <Button onClick={startCreate}><Plus className="size-4" />{t.geo.add} {singular}</Button>
  </header>
  <nav aria-label={t.geo.module} className="flex flex-wrap gap-2 rounded-2xl border bg-card p-2">{kinds.map((item) => <NavLink key={item} to={`/super-admin/geo-location/${item}`} className={({ isActive }) => `rounded-xl px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{t.geo[geoConfigs[item].titleKey]}</NavLink>)}</nav>
  {notice && <div role="status" className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700">{notice}</div>}
  {errorText && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-error/25 bg-error/5 px-4 py-3 text-sm text-error"><span>{translateError(errorText)}</span><button type="button" onClick={() => setActionError("")} aria-label={t.common.dismiss}>×</button></div>}
  <section className="overflow-hidden rounded-2xl border bg-card">
   <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{visibleRecords.length}</p></div><div className="flex gap-2"><div className="relative min-w-0 flex-1 sm:w-72"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.common.search} className="ps-9" /></div><Button variant="outline" size="icon" onClick={() => { void list.refetch(); if (config.parent) void parents.refetch() }} disabled={list.isFetching} aria-label={t.common.refresh}><RefreshCw className={`size-4 ${list.isFetching ? "animate-spin" : ""}`} /></Button></div></div>
   {list.isLoading ? <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />{t.common.loading}</div> : visibleRecords.length === 0 ? <div className="p-12 text-center"><MapPin className="mx-auto size-8 text-muted-foreground/50" /><p className="mt-3 font-medium">{search ? t.common.noResults : t.common.noRecords}</p><p className="mt-1 text-sm text-muted-foreground">{t.geo.emptyHint}</p></div> :
   <Table><TableHeader><TableRow><TableHead>{t.geo.name}</TableHead>{kind === "countries" && <TableHead>{t.geo.code}</TableHead>}{config.parent && <TableHead>{t.geo.parent}</TableHead>}<TableHead className="text-end">{t.common.actions}</TableHead></TableRow></TableHeader><TableBody>{visibleRecords.map((record) => <TableRow key={String(record.id)}><TableCell><span className="font-medium">{record.name}</span><span className="mt-0.5 block text-xs text-muted-foreground">{t.geo.id}: {record.id}</span></TableCell>{kind === "countries" && <TableCell><span className="rounded-md bg-muted px-2 py-1 font-mono text-xs">{record.code || "—"}</span></TableCell>}{config.parent && <TableCell>{parentNames.get(String(record[config.parentField!])) ?? "—"}</TableCell>}<TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => startEdit(record)} aria-label={t.common.edit}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" className="text-error hover:text-error" onClick={() => setDeleteTarget(record)} aria-label={t.common.delete}><Trash2 className="size-4" /></Button></div></TableCell></TableRow>)}</TableBody></Table>}
  </section>
  <Dialog open={formOpen} onOpenChange={(open) => { if (!busy) { setFormOpen(open); if (!open) setSelected(null) } }}>
   <DialogContent><DialogHeader><DialogTitle>{selected ? t.geo.editTitle + " " + singular : t.geo.createTitle + " " + singular}</DialogTitle><DialogDescription>{t.geo.description}</DialogDescription></DialogHeader>
    {selected && detail.isLoading ? <div className="p-8 text-center"><LoaderCircle className="mx-auto size-5 animate-spin" /></div> : <Formik key={`${kind}-${selected?.id ?? "new"}-${formOpen}`} initialValues={initialValues} validationSchema={schema} onSubmit={submit} enableReinitialize>
     {({ errors, touched, isSubmitting, values, setFieldValue }) => <Form className="space-y-4">
      <div><label htmlFor="geo-name" className="mb-1.5 block text-sm font-medium">{t.geo.name}</label><Field as={Input} id="geo-name" name="name" aria-invalid={Boolean(touched.name && errors.name)} />{touched.name && errors.name && <p className="mt-1 text-xs text-error">{errors.name}</p>}</div>
      {kind === "countries" && <div><label htmlFor="geo-code" className="mb-1.5 block text-sm font-medium">{t.geo.code}</label><Field as={Input} id="geo-code" name="code" aria-invalid={Boolean(touched.code && errors.code)} />{touched.code && errors.code && <p className="mt-1 text-xs text-error">{errors.code}</p>}</div>}
      {config.parent && <div><label htmlFor="geo-parent" className="mb-1.5 block text-sm font-medium">{t.geo[geoConfigs[config.parent].titleKey]}</label><Select id="geo-parent" value={values.parentId} onChange={(event) => void setFieldValue("parentId", event.target.value)} aria-invalid={Boolean(touched.parentId && errors.parentId)}><option value="">{t.geo.selectParent}</option>{parentRecords.map((parent) => <option key={String(parent.id)} value={String(parent.id)}>{parent.name}</option>)}</Select>{touched.parentId && errors.parentId && <p className="mt-1 text-xs text-error">{errors.parentId}</p>}</div>}
      <DialogFooter><Button type="button" variant="outline" onClick={() => { setFormOpen(false); setSelected(null) }} disabled={busy}>{t.common.cancel}</Button><Button type="submit" disabled={busy || isSubmitting || Boolean(config.parent && parentRecords.length === 0)}>{busy || isSubmitting ? <><LoaderCircle className="size-4 animate-spin" />{t.common.saving}</> : selected ? t.common.save : t.common.create}</Button></DialogFooter>
     </Form>}
    </Formik>}
   </DialogContent>
  </Dialog>
  <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open && !busy) setDeleteTarget(null) }}><DialogContent><DialogHeader><DialogTitle>{t.geo.deleteTitle}</DialogTitle><DialogDescription>{t.geo.deleteDescription}</DialogDescription></DialogHeader><p className="font-medium">{deleteTarget?.name}</p><DialogFooter><Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={busy}>{t.common.cancel}</Button><Button variant="destructive" onClick={() => void confirmDelete()} disabled={busy}>{busy ? t.common.saving : t.common.confirmDelete}</Button></DialogFooter></DialogContent></Dialog>
 </div>
}
