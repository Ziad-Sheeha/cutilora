import { useCallback, useEffect, useMemo, useState } from "react"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import { NavLink, useNavigate, useParams } from "react-router"
import { Globe2, LoaderCircle, MapPin, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react"
import { appEnv } from "@/config/env"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type GeoKind = "countries" | "governorates" | "cities" | "districts"
type GeoRecord = { id: string | number; name: string; code?: string; country_id?: string | number; governorate_id?: string | number; city_id?: string | number; [key: string]: unknown }
type GeoConfig = { title: string; singular: string; endpoint: string; parent?: GeoKind; parentField?: "country_id" | "governorate_id" | "city_id"; parentLabel?: string; hasCode?: boolean }

const API = appEnv.apiBaseUrl.replace(/\/$/, "")
const configs: Record<GeoKind, GeoConfig> = {
  countries: { title: "Countries", singular: "Country", endpoint: "/platform/geo/countries", hasCode: true },
  governorates: { title: "Governorates", singular: "Governorate", endpoint: "/platform/geo/governorates", parent: "countries", parentField: "country_id", parentLabel: "Country" },
  cities: { title: "Cities", singular: "City", endpoint: "/platform/geo/cities", parent: "governorates", parentField: "governorate_id", parentLabel: "Governorate" },
  districts: { title: "Districts", singular: "District", endpoint: "/platform/geo/districts", parent: "cities", parentField: "city_id", parentLabel: "City" },
}
const hierarchy: { kind: GeoKind; label: string }[] = [
  { kind: "countries", label: "Countries" }, { kind: "governorates", label: "Governorates" },
  { kind: "cities", label: "Cities" }, { kind: "districts", label: "Districts" },
]

function apiId(value: string): string | number { return /^\\d+$/.test(value) ? Number(value) : value }\nfunction authHeaders(json = false): HeadersInit {
  const token = window.sessionStorage.getItem("cutilora.super-admin.access-token")
  return { Accept: "application/json", ...(json ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: "Bearer " + token } : {}) }
}
function errorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const value = payload as { message?: unknown; error?: unknown; errors?: unknown }
    if (typeof value.message === "string") return value.message
    if (typeof value.error === "string") return value.error
    if (value.errors && typeof value.errors === "object") {
      const first = Object.values(value.errors as Record<string, unknown>)[0]
      if (Array.isArray(first) && typeof first[0] === "string") return first[0]
      if (typeof first === "string") return first
    }
  }
  return fallback
}
async function request(path: string, init?: RequestInit): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(API + path, { ...init, headers: { ...authHeaders(Boolean(init?.body)), ...(init?.headers ?? {}) } })
  } catch {
    throw new Error("Could not connect to the platform API. Check your connection and try again.")
  }
  const payload: unknown = await response.json().catch(() => null)
  if (!response.ok) throw new Error(errorMessage(payload, `Request failed (HTTP ${response.status}).`))
  return payload
}
function unwrapList(payload: unknown): GeoRecord[] {
  if (Array.isArray(payload)) return payload as GeoRecord[]
  if (!payload || typeof payload !== "object") return []
  const root = payload as Record<string, unknown>
  if (Array.isArray(root.data)) return root.data as GeoRecord[]
  if (root.data && typeof root.data === "object") {
    const nested = root.data as Record<string, unknown>
    if (Array.isArray(nested.data)) return nested.data as GeoRecord[]
    if (Array.isArray(nested.items)) return nested.items as GeoRecord[]
  }
  if (Array.isArray(root.items)) return root.items as GeoRecord[]
  return []
}
function unwrapRecord(payload: unknown): GeoRecord {
  if (payload && typeof payload === "object") {
    const root = payload as Record<string, unknown>
    const candidate = root.data && typeof root.data === "object" && !Array.isArray(root.data) ? root.data : root
    if (candidate && typeof candidate === "object" && "id" in candidate) return candidate as GeoRecord
  }
  throw new Error("The API returned an unexpected record response.")
}
const schemaFor = (config: GeoConfig) => Yup.object({
  name: Yup.string().trim().required("Name is required.").max(150, "Name must be 150 characters or fewer."),
  ...(config.hasCode ? { code: Yup.string().trim().required("Code is required.").max(10, "Code must be 10 characters or fewer.") } : {}),
  ...(config.parentField ? { parentId: Yup.string().required(`Select a ${config.parentLabel?.toLowerCase()}.`) } : {}),
})

export function GeoLocationPage() {
  const { kind = "countries" } = useParams<{ kind: GeoKind }>()
  const navigate = useNavigate()
  const config = configs[kind as GeoKind]
  const [records, setRecords] = useState<GeoRecord[]>([])
  const [parents, setParents] = useState<GeoRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [query, setQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<GeoRecord | null>(null)
  const [deleting, setDeleting] = useState<GeoRecord | null>(null)

  const load = useCallback(async () => {
    if (!config) return
    setLoading(true); setError("")
    try {
      const [listPayload, parentPayload] = await Promise.all([
        request(config.endpoint),
        config.parent ? request(configs[config.parent].endpoint) : Promise.resolve(null),
      ])
      setRecords(unwrapList(listPayload))
      setParents(parentPayload === null ? [] : unwrapList(parentPayload))
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load records.") }
    finally { setLoading(false) }
  }, [config])

  useEffect(() => { void load() }, [load])
  useEffect(() => { setNotice(""); setQuery(""); setDialogOpen(false); setEditing(null) }, [kind])

  const parentNames = useMemo(() => new Map(parents.map((item) => [String(item.id), item.name])), [parents])
  const filtered = useMemo(() => records.filter((record) => {
    const parentId = config?.parentField ? record[config.parentField] : undefined
    return [record.name, record.code, parentId === undefined ? "" : parentNames.get(String(parentId))]
      .some((value) => String(value ?? "").toLowerCase().includes(query.toLowerCase()))
  }), [records, query, config, parentNames])

  if (!config) return <div className="rounded-xl border p-8 text-center"><h1 className="font-semibold">Unknown geo location resource</h1><Button className="mt-4" onClick={() => navigate("/super-admin/geo-location/countries")}>Go to Countries</Button></div>

  function openCreate() { setEditing(null); setDialogOpen(true); setError(""); setNotice("") }
  async function openEdit(record: GeoRecord) {
    setError(""); setNotice("")
    try {
      const payload = await request(config.endpoint + "/" + encodeURIComponent(String(record.id)))
      setEditing(unwrapRecord(payload)); setDialogOpen(true)
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load this record.") }
  }
  async function save(values: { name: string; code?: string; parentId?: string }) {
    setSaving(true); setError("")
    const body: Record<string, string | number> = { name: values.name.trim() }
    if (config.hasCode) body.code = (values.code ?? "").trim()
    if (config.parentField && values.parentId) body[config.parentField] = apiId(values.parentId)
    try {
      if (editing) await request(config.endpoint + "/" + encodeURIComponent(String(editing.id)), { method: "PUT", body: JSON.stringify(body) })
      else await request(config.endpoint, { method: "POST", body: JSON.stringify(body) })
      setDialogOpen(false); setEditing(null); setNotice(`${config.singular} ${editing ? "updated" : "created"} successfully.`)
      await load()
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save this record.") }
    finally { setSaving(false) }
  }
  async function removeRecord() {
    if (!deleting) return
    setSaving(true); setError("")
    try {
      await request(config.endpoint + "/" + encodeURIComponent(String(deleting.id)), { method: "DELETE" })
      setDeleting(null); setNotice(`${config.singular} deleted successfully.`); await load()
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to delete this record.") }
    finally { setSaving(false) }
  }

  const initialValues = {
    name: editing?.name ?? "",
    code: editing?.code ?? "",
    parentId: config.parentField && editing?.[config.parentField] !== undefined ? String(editing[config.parentField]) : "",
  }
  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3"><span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Globe2 className="size-6" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Platform configuration</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">Geo Location</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Manage the geographic hierarchy used across Cutilora: countries, governorates, cities and districts.</p></div></div>
        <Button onClick={openCreate}><Plus className="size-4" /> Add {config.singular}</Button>
      </header>
      <nav aria-label="Geo location resources" className="flex flex-wrap gap-2 rounded-2xl border bg-card p-2">
        {hierarchy.map((item, index) => <NavLink key={item.kind} to={`/super-admin/geo-location/${item.kind}`} className={({ isActive }) => `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>{item.label}<span className={`text-xs ${index === 0 ? "opacity-70" : "opacity-60"}`}>{index + 1}/4</span></NavLink>)}
      </nav>
      {notice && <div role="status" className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700">{notice}</div>}
      {error && <div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-error/25 bg-error/5 px-4 py-3 text-sm text-error"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error">×</button></div>}
      <section className="overflow-hidden rounded-2xl border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-semibold">{config.title}</h2><p className="mt-1 text-xs text-muted-foreground">{filtered.length} {filtered.length === 1 ? "record" : "records"}</p></div>
          <div className="flex gap-2"><div className="relative min-w-0 flex-1 sm:w-72"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}...`} className="ps-9" /></div><Button variant="outline" size="icon" onClick={() => void load()} disabled={loading} aria-label="Refresh records"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /></Button></div>
        </div>
        {loading ? <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" /> Loading {config.title.toLowerCase()}...</div> :
          filtered.length === 0 ? <div className="p-12 text-center"><MapPin className="mx-auto size-8 text-muted-foreground/50" /><p className="mt-3 font-medium">{query ? "No matching records" : `No ${config.title.toLowerCase()} yet`}</p><p className="mt-1 text-sm text-muted-foreground">{query ? "Try a different search term." : `Create the first ${config.singular.toLowerCase()} to get started.`}</p></div> :
          <Table><TableHeader><TableRow><TableHead>{config.singular} name</TableHead>{config.hasCode && <TableHead>Code</TableHead>}{config.parent && <TableHead>{config.parentLabel}</TableHead>}<TableHead className="w-28 text-end">Actions</TableHead></TableRow></TableHeader><TableBody>{filtered.map((record) => <TableRow key={String(record.id)}><TableCell><span className="font-medium">{record.name}</span><span className="mt-0.5 block text-xs text-muted-foreground">ID: {record.id}</span></TableCell>{config.hasCode && <TableCell><span className="rounded-md bg-muted px-2 py-1 font-mono text-xs">{record.code || "—"}</span></TableCell>}{config.parent && <TableCell>{parentNames.get(String(record[config.parentField!])) ?? <span className="text-muted-foreground">Unknown parent ({String(record[config.parentField!] ?? "—")})</span>}</TableCell>}<TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => void openEdit(record)} aria-label={`Edit ${record.name}`}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" className="text-error hover:text-error" onClick={() => { setDeleting(record); setError("") }} aria-label={`Delete ${record.name}`}><Trash2 className="size-4" /></Button></div></TableCell></TableRow>)}</TableBody></Table>}
      </section>
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!saving) setDialogOpen(open) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? `Edit ${config.singular}` : `Add ${config.singular}`}</DialogTitle><DialogDescription>{editing ? "Update this record in the platform geo directory." : "Create a new record in the platform geo directory."}</DialogDescription></DialogHeader>
          <Formik key={`${kind}-${editing?.id ?? "new"}-${dialogOpen}`} initialValues={initialValues} validationSchema={schemaFor(config)} onSubmit={save}>
            {({ errors, touched, isSubmitting, setFieldValue, values }) => <Form className="space-y-4">
              <div><label className="mb-1.5 block text-sm font-medium" htmlFor="geo-name">Name</label><Field as={Input} id="geo-name" name="name" placeholder={`${config.singular} name`} aria-invalid={Boolean(touched.name && errors.name)} />{touched.name && errors.name && <p className="mt-1 text-xs text-error">{errors.name}</p>}</div>
              {config.hasCode && <div><label className="mb-1.5 block text-sm font-medium" htmlFor="geo-code">Code</label><Field as={Input} id="geo-code" name="code" placeholder="e.g. SA" aria-invalid={Boolean(touched.code && errors.code)} />{touched.code && errors.code && <p className="mt-1 text-xs text-error">{errors.code}</p>}</div>}
              {config.parent && <div><label className="mb-1.5 block text-sm font-medium" htmlFor="geo-parent">{config.parentLabel}</label><Select id="geo-parent" value={values.parentId} onChange={(event) => void setFieldValue("parentId", event.target.value)} aria-invalid={Boolean(touched.parentId && errors.parentId)}><option value="">Select {config.parentLabel?.toLowerCase()}</option>{parents.map((parent) => <option key={String(parent.id)} value={String(parent.id)}>{parent.name}</option>)}</Select>{touched.parentId && errors.parentId && <p className="mt-1 text-xs text-error">{errors.parentId}</p>}{parents.length === 0 && <p className="mt-1 text-xs text-amber-600">No parent records available. Create a {config.parentLabel?.toLowerCase()} first.</p>}</div>}
              <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving || isSubmitting || Boolean(config.parent && parents.length === 0)}>{saving || isSubmitting ? <><LoaderCircle className="size-4 animate-spin" /> Saving...</> : editing ? "Save changes" : `Create ${config.singular}`}</Button></DialogFooter>
            </Form>}
          </Formik>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open && !saving) setDeleting(null) }}>
        <DialogContent><DialogHeader><DialogTitle>Delete {config.singular.toLowerCase()}?</DialogTitle><DialogDescription>This will send a delete request for “{deleting?.name}”. The API may reject deletion if child records depend on it.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setDeleting(null)} disabled={saving}>Cancel</Button><Button variant="destructive" onClick={() => void removeRecord()} disabled={saving}>{saving ? "Deleting..." : "Delete"}</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  )
}
