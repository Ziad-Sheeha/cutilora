import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Archive, BadgeCheck, Eye, FilePlus2, FileText, RefreshCw, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/i18n/i18n-provider"
import { tenantApi } from "../../api/tenant-api"
import { TenantPageHeading } from "../../components/tenant-page-heading"
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog"

type DocumentRecord = {
  id?: string; _id?: string; name?: string; fileName?: string; originalName?: string
  category?: string; type?: string; status?: string; verificationStatus?: string
  expiryDate?: string; expiresAt?: string; uploadedAt?: string; size?: number
}
const root = "/tenant/documents"
function unwrap<T>(response: unknown): T {
  const value = response as { data?: { data?: T } }
  return (value?.data?.data ?? value?.data ?? response) as T
}
function idOf(row: DocumentRecord) { return String(row.id ?? row._id ?? row.fileName ?? row.name ?? JSON.stringify(row)) }
function expiryState(value?: string, ar = false) {
  if (!value) return ar ? "غير محدد" : "Not set"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const days = Math.ceil((date.getTime() - Date.now()) / 86_400_000)
  if (days < 0) return ar ? "منتهي" : "Expired"
  if (days <= 30) return ar ? "ينتهي قريباً" : "Expiring soon"
  return ar ? "ساري" : "Valid"
}
function bytes(value?: number) {
  if (!value) return "—"
  return value < 1024 * 1024 ? `${(value / 1024).toFixed(0)} KB` : `${(value / 1024 / 1024).toFixed(1)} MB`
}
export function TenantDocumentsPage() {
  const { locale } = useI18n()
  const ar = locale === "ar"
  const qc = useQueryClient()
  const [category, setCategory] = useState("legal")
  const [expiryDate, setExpiryDate] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [replaceId, setReplaceId] = useState<string | null>(null)
  const [archiveId, setArchiveId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const query = useQuery({
    queryKey: ["tenant-documents"],
    queryFn: async () => {
      const response = await tenantApi.get(root)
      const data = unwrap<unknown>(response)
      if (Array.isArray(data)) return data as DocumentRecord[]
      const obj = data as { items?: DocumentRecord[]; documents?: DocumentRecord[]; records?: DocumentRecord[] }
      return obj?.items ?? obj?.documents ?? obj?.records ?? []
    },
  })
  const upload = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error(ar ? "اختر ملفاً أولاً" : "Choose a file first")
      const allowedExtensions = /\.(pdf|png|jpe?g|webp|docx?|xlsx?)$/i
      if (!allowedExtensions.test(file.name)) throw new Error(ar ? "نوع الملف غير مدعوم. استخدم PDF أو صورة أو مستند Office." : "Unsupported file type. Use PDF, an image, or an Office document.")
      if (file.size > 20 * 1024 * 1024) throw new Error(ar ? "الحد الأقصى لحجم الملف 20 ميجابايت." : "The maximum file size is 20 MB.")
      const body = new FormData()
      body.append("file", file)
      body.append("category", category)
      if (expiryDate) body.append("expiryDate", expiryDate)
      const response = replaceId
        ? await tenantApi.put(`${root}/${encodeURIComponent(replaceId)}/file`, body, { headers: { "Content-Type": "multipart/form-data" } })
        : await tenantApi.post(root, body, { headers: { "Content-Type": "multipart/form-data" } })
      return unwrap(response)
    },
    onSuccess: async () => {
      setFile(null); setExpiryDate(""); setReplaceId(null); setError("")
      await qc.invalidateQueries({ queryKey: ["tenant-documents"] })
    },
    onError: (e) => setError(e instanceof Error ? e.message : (ar ? "تعذر رفع المستند" : "Document upload failed")),
  })
  const archive = useMutation({
    mutationFn: (id: string) => tenantApi.delete(`${root}/${encodeURIComponent(id)}`),
    onSuccess: async () => { setArchiveId(null); await qc.invalidateQueries({ queryKey: ["tenant-documents"] }) },
    onError: (e) => setError(e instanceof Error ? e.message : "Archive failed"),
  })
  const verify = useMutation({
    mutationFn: (id: string) => tenantApi.patch(`${root}/${encodeURIComponent(id)}/verification`, { verificationStatus: "verified" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tenant-documents"] }),
    onError: (e) => setError(e instanceof Error ? e.message : "Verification update failed"),
  })
  async function openDocument(row: DocumentRecord) {
    const popup = window.open("about:blank", "_blank")
    if (popup) popup.opener = null
    try {
      const response = await tenantApi.get(root + "/" + encodeURIComponent(idOf(row)) + "/download")
      const result = unwrap<{ url?: string; downloadUrl?: string }>(response)
      const url = result.url ?? result.downloadUrl
      if (!url) throw new Error(ar ? "رابط المستند غير متاح" : "Authorized document URL is unavailable")
      if (popup) popup.location.assign(url)
      else window.location.assign(url)
    } catch (e) {
      popup?.close()
      setError(e instanceof Error ? e.message : "Unable to open document")
    }
  }
  const rows = query.data ?? []
  const columns = useMemo<DataTableColumn<DocumentRecord>[]>(() => [
    { id: "document", header: ar ? "المستند" : "Document", cell: row => <div className="flex min-w-0 items-center gap-2"><FileText className="size-4 shrink-0 text-primary"/><span className="max-w-[220px] truncate font-medium">{row.name ?? row.originalName ?? row.fileName ?? "—"}</span></div> },
    { id: "category", header: ar ? "التصنيف" : "Category", cell: row => row.category ?? row.type ?? "—" },
    { id: "verification", header: ar ? "التحقق" : "Verification", cell: row => row.verificationStatus ?? row.status ?? (ar ? "قيد المراجعة" : "Pending") },
    { id: "expiry", header: ar ? "تاريخ الانتهاء" : "Expiry date", cell: row => row.expiryDate ?? row.expiresAt ?? "—" },
    { id: "expiryStatus", header: ar ? "حالة الصلاحية" : "Expiry status", cell: row => expiryState(row.expiryDate ?? row.expiresAt, ar) },
    { id: "size", header: ar ? "الحجم" : "Size", cell: row => bytes(row.size) },
    { id: "actions", header: ar ? "الإجراءات" : "Actions", cell: row => <div className="flex flex-wrap gap-1"><Button size="icon" variant="ghost" title={ar ? "معاينة / تنزيل" : "Preview / download"} onClick={() => void openDocument(row)}><Eye className="size-4"/></Button><Button size="icon" variant="ghost" title={ar ? "استبدال الملف" : "Replace file"} onClick={() => { setReplaceId(idOf(row)); setFile(null) }}><Upload className="size-4"/></Button><Button size="icon" variant="ghost" title={ar ? "اعتماد المستند" : "Mark verified"} onClick={() => verify.mutate(idOf(row))}><BadgeCheck className="size-4"/></Button><Button size="icon" variant="ghost" title={ar ? "أرشفة" : "Archive"} onClick={() => setArchiveId(idOf(row))}><Archive className="size-4"/></Button></div> },
  ], [ar])
  return <div className="space-y-6">
    <TenantPageHeading eyebrow={ar ? "ملف المؤسسة" : "ORGANIZATION PROFILE"} title={ar ? "مستندات المؤسسة" : "Organization Documents"} description={ar ? "احفظ مستندات مؤسستك وتابع تصنيفاتها وحالة التحقق وتواريخ الانتهاء." : "Store organization documents and track their categories, verification and expiry dates."}/>
    <Card><CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
      <div className="md:col-span-2"><Label>{ar ? "الملف" : "Document file"}</Label><Input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx" onChange={e => setFile(e.target.files?.[0] ?? null)} className="mt-2"/></div>
      <div><Label>{ar ? "التصنيف" : "Category"}</Label><Select value={category} onValueChange={setCategory}><SelectTrigger className="mt-2"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="legal">{ar ? "مستندات قانونية" : "Legal"}</SelectItem><SelectItem value="license">{ar ? "تراخيص" : "Licenses"}</SelectItem><SelectItem value="tax">{ar ? "مستندات ضريبية" : "Tax"}</SelectItem><SelectItem value="insurance">{ar ? "تأمين" : "Insurance"}</SelectItem><SelectItem value="other">{ar ? "أخرى" : "Other"}</SelectItem></SelectContent></Select></div>
      <div><Label>{ar ? "تاريخ الانتهاء" : "Expiry date"}</Label><Input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="mt-2"/></div>
      <div className="flex flex-wrap items-end gap-2 md:col-span-2 xl:col-span-4"><Button disabled={!file || upload.isPending} onClick={() => upload.mutate()}><FilePlus2 className="me-2 size-4"/>{upload.isPending ? (ar ? "جارٍ الرفع..." : "Uploading...") : replaceId ? (ar ? "استبدال المستند" : "Replace document") : (ar ? "رفع مستند" : "Upload document")}</Button>{replaceId && <Button variant="outline" onClick={() => { setReplaceId(null); setFile(null) }}>{ar ? "إلغاء الاستبدال" : "Cancel replace"}</Button>}</div>
      {error && <p role="alert" className="text-sm text-destructive md:col-span-2 xl:col-span-4">{error}</p>}
    </CardContent></Card>
    <section className="overflow-hidden rounded-2xl border bg-card">
      <div className="flex items-center justify-between gap-3 border-b p-5"><div><h2 className="font-semibold">{ar ? "مكتبة المستندات" : "Document library"}</h2><p className="mt-1 text-sm text-muted-foreground">{ar ? `${rows.length} مستند` : `${rows.length} documents`}</p></div><Button variant="outline" onClick={() => query.refetch()} disabled={query.isFetching}><RefreshCw className={`me-2 size-4 ${query.isFetching ? "animate-spin" : ""}`}/>{ar ? "تحديث" : "Refresh"}</Button></div>
      {query.isError && <p role="alert" className="p-5 text-sm text-destructive">{query.error instanceof Error ? query.error.message : (ar ? "تعذر تحميل المستندات" : "Unable to load documents")}</p>}
      <DataTable columns={columns} data={rows} getRowId={idOf} isLoading={query.isLoading} loadingLabel={ar ? "جارٍ تحميل المستندات..." : "Loading documents..."} emptyState={<div className="px-6 py-14 text-center text-sm text-muted-foreground">{ar ? "لا توجد مستندات مضافة حتى الآن." : "No organization documents have been added yet."}</div>}/>
    </section>
    <ConfirmDialog open={Boolean(archiveId)} title={ar ? "أرشفة المستند" : "Archive document"} description={ar ? "لن يظهر هذا المستند ضمن المستندات النشطة." : "This document will be moved out of the active document library."} confirmLabel={ar ? "أرشفة" : "Archive"} destructive isLoading={archive.isPending} onOpenChange={open => { if (!open) setArchiveId(null) }} onConfirm={() => { if (archiveId) archive.mutate(archiveId) }}/>
  </div>
}
