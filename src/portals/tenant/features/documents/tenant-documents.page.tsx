import { useMemo, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Archive, Download, FileClock, FilePlus2, FileText, RefreshCw, Search, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useI18n } from "@/i18n/i18n-provider"
import { archiveTenantDocument, createTenantDocument, downloadTenantDocument, getTenantDocumentVersions, listTenantDocuments, replaceTenantDocument, type TenantDocument, type TenantDocumentCategory } from "./api/tenant-documents.api"
import { getMyTenantAccess } from "../../api/tenant-api"
import { TenantPageHeading } from "../../components/tenant-page-heading"
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog"

type DocumentRecord = TenantDocument
type DocumentCategory = TenantDocumentCategory
const MAX_FILE_BYTES = 3 * 1024 * 1024
const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"]
const categories: DocumentCategory[] = ["registration", "tax", "license", "insurance", "contract", "other"]

function documentId(row: DocumentRecord) { return String(row._id ?? row.id ?? "") }
function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Unable to read the selected file."))
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Unable to read the selected file."))
    reader.readAsDataURL(file)
  })
}
function formatBytes(size?: number) {
  if (typeof size !== "number" || !Number.isFinite(size)) return "—"
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}
function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date)
}
function categoryName(value: DocumentCategory, ar: boolean) {
  const names: Record<DocumentCategory, [string, string]> = {
    registration: ["Registration", "سجل تجاري"], tax: ["Tax", "مستند ضريبي"], license: ["License", "ترخيص"],
    insurance: ["Insurance", "تأمين"], contract: ["Contract", "عقد"], other: ["Other", "أخرى"],
  }
  return names[value]?.[ar ? 1 : 0] ?? value
}
function expiryName(value: string | null | undefined, ar: boolean) {
  if (!value) return ar ? "غير محدد" : "No expiry date"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  const days = Math.ceil((date.getTime() - Date.now()) / 86_400_000)
  if (days < 0) return ar ? "منتهي" : "Expired"
  if (days <= 30) return ar ? "ينتهي قريباً" : "Expiring soon"
  return ar ? "ساري" : "Valid"
}

export function TenantDocumentsPage() {
  const { locale } = useI18n()
  const ar = locale === "ar"
  const accessQuery = useQuery({ queryKey: ["tenant-access-me"], queryFn: getMyTenantAccess, staleTime: 60_000 })
  const canWrite = Boolean(accessQuery.data?.grants.some(grant => grant.permission === "documents.manage" && grant.scope === "tenant"))
  const qc = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState("")
  const [category, setCategory] = useState<DocumentCategory>("registration")
  const [expiryDate, setExpiryDate] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [replaceId, setReplaceId] = useState<string | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [archiveId, setArchiveId] = useState<string | null>(null)
  const [historyId, setHistoryId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [formError, setFormError] = useState("")
  const [downloadId, setDownloadId] = useState<string | null>(null)

  const documentsQuery = useQuery({
    queryKey: ["tenant-documents"],
    queryFn: listTenantDocuments,
    staleTime: 20_000,
    enabled: canWrite,
  })
  const historyQuery = useQuery({
    queryKey: ["tenant-document-versions", historyId],
    queryFn: () => getTenantDocumentVersions(historyId!),
    enabled: canWrite && Boolean(historyId),
  })

  function resetForm() {
    setName(""); setCategory("registration"); setExpiryDate(""); setFile(null); setReplaceId(null); setFormError(""); setUploadOpen(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }
  function beginReplace(row: DocumentRecord) {
    setReplaceId(documentId(row)); setName(row.name); setCategory(row.category); setExpiryDate(row.expiresAt ? row.expiresAt.slice(0, 10) : "")
    setFile(null); setFormError("")
    if (fileInputRef.current) fileInputRef.current.value = ""
    setUploadOpen(true)
  }
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error(ar ? "اختر ملفاً أولاً." : "Choose a file first.")
      if (!name.trim()) throw new Error(ar ? "اسم المستند مطلوب." : "Document name is required.")
      if (!allowedMimeTypes.includes(file.type)) throw new Error(ar ? "الملف يجب أن يكون PDF أو JPEG أو PNG أو WebP." : "Only PDF, JPEG, PNG and WebP files are supported.")
      if (file.size > MAX_FILE_BYTES) throw new Error(ar ? "الحد الأقصى لحجم الملف 3 ميجابايت." : "The maximum file size is 3 MB.")
      const fileBase64 = await readAsDataUrl(file)
      const payload = { name: name.trim(), fileBase64, ...(expiryDate ? { expiresAt: new Date(`${expiryDate}T00:00:00.000Z`).toISOString() } : { expiresAt: null }) }
      return replaceId
        ? replaceTenantDocument(replaceId, payload)
        : createTenantDocument({ ...payload, category })
    },
    onSuccess: async () => { resetForm(); await qc.invalidateQueries({ queryKey: ["tenant-documents"] }); if (historyId) await qc.invalidateQueries({ queryKey: ["tenant-document-versions", historyId] }) },
    onError: error => setFormError(error instanceof Error ? error.message : (ar ? "تعذر حفظ المستند." : "Unable to save document.")),
  })
  const archiveMutation = useMutation({
    mutationFn: async (id: string) => archiveTenantDocument(id),
    onSuccess: async () => { setArchiveId(null); setFormError(""); await qc.invalidateQueries({ queryKey: ["tenant-documents"] }) },
    onError: error => setFormError(error instanceof Error ? error.message : (ar ? "تعذرت أرشفة المستند." : "Unable to archive document.")),
  })

  async function downloadDocument(row: DocumentRecord) {
    const id = documentId(row)
    if (!id) { setFormError(ar ? "معرف المستند غير متاح." : "Document identifier is missing."); return }
    setDownloadId(id)
    try {
      const blob = await downloadTenantDocument(id)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url; anchor.download = row.name || "organization-document"
      document.body.appendChild(anchor); anchor.click(); anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : (ar ? "تعذر تنزيل المستند." : "Unable to download document."))
    } finally { setDownloadId(null) }
  }

  const rows = useMemo(() => (documentsQuery.data ?? []).filter(row => {
    const matchesSearch = !search.trim() || row.name.toLowerCase().includes(search.trim().toLowerCase())
    return matchesSearch && (categoryFilter === "all" || row.category === categoryFilter)
  }), [documentsQuery.data, search, categoryFilter])
  const columns = useMemo<DataTableColumn<DocumentRecord>[]>(() => [
    { id: "name", header: ar ? "المستند" : "Document", cell: row => <div className="flex min-w-0 items-center gap-2"><FileText className="size-4 shrink-0 text-primary"/><div className="min-w-0"><p className="truncate font-medium">{row.name}</p><p className="text-xs text-muted-foreground">{row.mimeType ?? "—"}</p></div></div> },
    { id: "category", header: ar ? "التصنيف" : "Category", cell: row => categoryName(row.category, ar) },
    { id: "version", header: ar ? "الإصدار" : "Version", cell: row => `v${row.version ?? 1}` },
    { id: "size", header: ar ? "الحجم" : "Size", cell: row => formatBytes(row.sizeBytes) },
    { id: "uploaded", header: ar ? "تاريخ الرفع" : "Uploaded", cell: row => formatDate(row.createdAt, locale) },
    { id: "expiry", header: ar ? "تاريخ الانتهاء" : "Expires", cell: row => <div><p>{formatDate(row.expiresAt, locale)}</p><p className="text-xs text-muted-foreground">{expiryName(row.expiresAt, ar)}</p></div> },
    ...(canWrite ? [{ id: "actions", header: ar ? "الإجراءات" : "Actions", cell: (row: DocumentRecord) => <div className="flex items-center gap-1">
      <Button type="button" size="icon" variant="ghost" title={ar ? "تنزيل" : "Download"} aria-label={ar ? "تنزيل" : "Download"} disabled={!documentId(row) || downloadId === documentId(row)} onClick={() => void downloadDocument(row)}>{downloadId === documentId(row) ? <RefreshCw className="size-4 animate-spin"/> : <Download className="size-4"/>}</Button>
      <Button type="button" size="icon" variant="ghost" title={ar ? "سجل الإصدارات" : "Version history"} aria-label={ar ? "سجل الإصدارات" : "Version history"} disabled={!documentId(row)} onClick={() => setHistoryId(documentId(row))}><FileClock className="size-4"/></Button>
      <Button type="button" size="icon" variant="ghost" title={ar ? "استبدال" : "Replace"} aria-label={ar ? "استبدال" : "Replace"} disabled={!documentId(row)} onClick={() => beginReplace(row)}><Upload className="size-4"/></Button>
      <Button type="button" size="icon" variant="ghost" title={ar ? "أرشفة" : "Archive"} aria-label={ar ? "أرشفة" : "Archive"} disabled={!documentId(row)} onClick={() => setArchiveId(documentId(row))}><Archive className="size-4"/></Button>
    </div> }] : []),
  ], [ar, canWrite, locale, downloadId])
  const selectedDocument = (documentsQuery.data ?? []).find(row => documentId(row) === archiveId)

  return <div className="space-y-6">
    <TenantPageHeading eyebrow={ar ? "ملف المؤسسة" : "ORGANIZATION PROFILE"} title={ar ? "مستندات المؤسسة" : "Organization Documents"} description={ar ? "إدارة المستندات القانونية والتراخيص والتأمين والعقود مع سجل إصدارات آمن." : "Manage legal records, licenses, insurance and contracts with secure document version history."}/>
    {canWrite && <div className="flex justify-end"><Button type="button" onClick={() => { resetForm(); setUploadOpen(true) }}><FilePlus2 className="me-2 size-4"/>{ar ? "إضافة مستند" : "Add document"}</Button></div>}
    {canWrite && <Dialog open={uploadOpen} onOpenChange={open => { if (!saveMutation.isPending) { setUploadOpen(open); if (!open) resetForm() } }}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle>{replaceId ? (ar ? "استبدال المستند" : "Replace document") : (ar ? "إضافة مستند للمؤسسة" : "Upload organization document")}</DialogTitle><DialogDescription>{ar ? "يتم حفظ الملفات بشكل خاص مع التحقق من نوع الملف وحجمه." : "Files are stored privately after validating their content type and size."}</DialogDescription></DialogHeader>
      <Card><CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
      <div className="md:col-span-2"><Label>{ar ? "اسم المستند" : "Document name"} *</Label><Input value={name} onChange={event => setName(event.target.value)} maxLength={180} className="mt-2" placeholder={ar ? "مثال: السجل التجاري" : "e.g. Commercial registration"}/></div>
      <div><Label>{ar ? "التصنيف" : "Category"} *</Label><Select value={category} onValueChange={value => setCategory(value as DocumentCategory)} disabled={Boolean(replaceId)}><SelectTrigger className="mt-2"><SelectValue/></SelectTrigger><SelectContent>{categories.map(value => <SelectItem key={value} value={value}>{categoryName(value, ar)}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>{ar ? "تاريخ الانتهاء" : "Expiry date"}</Label><div className="mt-2 flex gap-2"><DatePicker value={expiryDate} onChange={setExpiryDate} placeholder={ar ? "اختياري" : "Optional"} locale={ar ? "ar" : "en"} dir={ar ? "rtl" : "ltr"} className="mt-0 flex-1"/>{expiryDate && <Button type="button" variant="outline" size="icon" onClick={() => setExpiryDate("")} aria-label={ar ? "مسح التاريخ" : "Clear date"}><X className="size-4"/></Button>}</div></div>
      <div className="md:col-span-2 xl:col-span-4"><Label>{ar ? "الملف (PDF أو صورة)" : "File (PDF or image)"} *</Label><div className="mt-2 flex flex-wrap items-center gap-3 rounded-xl border border-dashed bg-muted/20 p-3">
        <Input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" className="sr-only" onChange={event => { setFile(event.target.files?.[0] ?? null); setFormError("") }}/>
        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="me-2 size-4"/>{ar ? "اختيار ملف" : "Choose file"}</Button>
        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{file?.name ?? (ar ? "PDF أو JPEG أو PNG أو WebP — حتى 3 ميجابايت" : "PDF, JPEG, PNG or WebP — up to 3 MB")}</span>
        {file && <Button type="button" size="sm" variant="ghost" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = "" }}><X className="me-1 size-4"/>{ar ? "إزالة" : "Remove"}</Button>}
      </div></div>
      {replaceId && <p className="text-sm text-muted-foreground md:col-span-2 xl:col-span-4">{ar ? "سيتم إنشاء إصدار جديد وأرشفة الإصدار السابق تلقائياً." : "A new immutable version will be created and the previous version will be archived automatically."}</p>}
      {formError && <p role="alert" className="text-sm text-destructive md:col-span-2 xl:col-span-4">{formError}</p>}
      <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-4">
        <Button type="button" disabled={!file || !name.trim() || saveMutation.isPending} onClick={() => saveMutation.mutate()}><FilePlus2 className="me-2 size-4"/>{saveMutation.isPending ? (ar ? "جارٍ الحفظ..." : "Saving...") : replaceId ? (ar ? "حفظ الإصدار الجديد" : "Save new version") : (ar ? "رفع المستند" : "Upload document")}</Button>
        {replaceId && <Button type="button" variant="outline" disabled={saveMutation.isPending} onClick={resetForm}>{ar ? "إلغاء الاستبدال" : "Cancel replacement"}</Button>}
      </div>
    </CardContent></Card></DialogContent></Dialog>}
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">{ar ? "مكتبة المستندات" : "Document library"}</h2><p className="mt-1 text-sm text-muted-foreground">{ar ? `${rows.length} مستند نشط` : `${rows.length} active documents`}</p></div><Button type="button" variant="outline" onClick={() => void documentsQuery.refetch()} disabled={documentsQuery.isFetching}><RefreshCw className={`me-2 size-4 ${documentsQuery.isFetching ? "animate-spin" : ""}`}/>{ar ? "تحديث" : "Refresh"}</Button></div>
        <div className="grid gap-3 sm:grid-cols-2"><div className="relative"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={search} onChange={event => setSearch(event.target.value)} className="ps-9" placeholder={ar ? "ابحث باسم المستند..." : "Search documents..."}/></div><Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">{ar ? "كل التصنيفات" : "All categories"}</SelectItem>{categories.map(value => <SelectItem key={value} value={value}>{categoryName(value, ar)}</SelectItem>)}</SelectContent></Select></div>
        {accessQuery.isLoading && <p className="text-sm text-muted-foreground">{ar ? "جارٍ التحقق من الصلاحيات..." : "Checking permissions..."}</p>}
        {accessQuery.isError && <p role="alert" className="text-sm text-destructive">{accessQuery.error instanceof Error ? accessQuery.error.message : (ar ? "تعذر التحقق من الصلاحيات." : "Unable to verify permissions.")}</p>}
        {!accessQuery.isLoading && !accessQuery.isError && !canWrite && <p role="alert" className="text-sm text-destructive">{ar ? "ليس لديك صلاحية إدارة مستندات المؤسسة." : "You do not have permission to manage organization documents."}</p>}
        {documentsQuery.isError && <p role="alert" className="text-sm text-destructive">{documentsQuery.error instanceof Error ? documentsQuery.error.message : (ar ? "تعذر تحميل المستندات." : "Unable to load documents.")}</p>}
        {formError && !uploadOpen && <p role="alert" className="text-sm text-destructive">{formError}</p>}
        <DataTable columns={columns} data={rows} getRowId={row => documentId(row)} isLoading={accessQuery.isLoading || documentsQuery.isLoading} loadingLabel={ar ? "جارٍ تحميل المستندات..." : "Loading documents..."} emptyState={<div className="px-6 py-14 text-center text-sm text-muted-foreground">{ar ? "لا توجد مستندات نشطة تطابق البحث." : "No active documents match your search."}</div>}/>
      </CardContent>
    </Card>
    <ConfirmDialog open={Boolean(archiveId)} title={ar ? "أرشفة المستند" : "Archive document"} description={ar ? `سيتم إخفاء "${selectedDocument?.name ?? "المستند"}" من المكتبة النشطة مع الاحتفاظ بالملف وسجل التدقيق.` : `"${selectedDocument?.name ?? "This document"}" will be removed from the active library while its file and audit history are retained.`} confirmLabel={ar ? "أرشفة" : "Archive"} destructive isLoading={archiveMutation.isPending} onOpenChange={open => { if (!open) setArchiveId(null) }} onConfirm={() => { if (archiveId) archiveMutation.mutate(archiveId) }}/>
    <Dialog open={Boolean(historyId)} onOpenChange={open => { if (!open) setHistoryId(null) }}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>{ar ? "سجل إصدارات المستند" : "Document version history"}</DialogTitle><DialogDescription>{ar ? "الإصدارات السابقة محفوظة ولا يتم حذفها عند الاستبدال." : "Previous versions are retained and are not deleted when a document is replaced."}</DialogDescription></DialogHeader>
        {historyQuery.isLoading && <p className="py-6 text-center text-sm text-muted-foreground">{ar ? "جارٍ تحميل سجل الإصدارات..." : "Loading version history..."}</p>}
        {historyQuery.isError && <p role="alert" className="text-sm text-destructive">{historyQuery.error instanceof Error ? historyQuery.error.message : (ar ? "تعذر تحميل سجل الإصدارات." : "Unable to load version history.")}</p>}
        <div className="space-y-3">{(historyQuery.data ?? []).map(version => <div key={documentId(version)} className="flex items-center justify-between gap-3 rounded-xl border p-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{version.name}</p><p className="mt-1 text-xs text-muted-foreground">{`v${version.version ?? 1} · ${formatBytes(version.sizeBytes)} · ${formatDate(version.createdAt, locale)}`}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-muted px-2 py-1 text-xs">{version.status === "active" ? (ar ? "نشط" : "Active") : (ar ? "مؤرشف" : "Archived")}</span>{version.status === "active" && canWrite && <Button type="button" size="sm" variant="outline" onClick={() => { setHistoryId(null); beginReplace(version) }}><Upload className="me-1 size-3"/>{ar ? "استبدال" : "Replace"}</Button>}</div></div>)}</div>
      </DialogContent>
    </Dialog>
  </div>
}
