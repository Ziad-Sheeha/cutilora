import type { TenantFeatureEndpoint } from "./tenant-feature.types"

export type Row = Record<string, unknown> & { id?: string; _id?: string; uuid?: string }
export type Resource = { endpoint: TenantFeatureEndpoint; rows: Row[]; summary: Record<string, unknown> | null; pagination?: { page?: number; per_page?: number; total?: number; total_pages?: number } }
export type SelectedOperation = { endpoint: TenantFeatureEndpoint; row: Row }
export const hidden = new Set(["id", "_id", "uuid", "tenantId", "tenant_id", "createdAt", "updatedAt", "created_at", "updated_at", "deletedAt"])
export const sensitive = /password|token|secret|credential|authorization|signature|^(api.?key|client.?secret|private.?key)$/i
export const apiPath = (path: string) => path.replace(/^\/api\/v1/, "")
export function unwrap(value: unknown): unknown {
  let current = value
  for (let i = 0; i < 3; i += 1) {
    if (!current || typeof current !== "object" || !("data" in current)) break
    current = (current as { data: unknown }).data
  }
  return current
}
export function toRows(value: unknown): Row[] {
  const data = unwrap(value)
  if (Array.isArray(data)) return data as Row[]
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>
    for (const key of ["items", "records", "results", "rows", "data", "permissions", "users", "memberships", "roles", "invitations", "templates", "invoices", "reports", "sessions", "events", "branches", "documents", "activity"]) {
      if (Array.isArray(record[key])) return record[key] as Row[]
    }
    return [record as Row]
  }
  return []
}
export function rowId(row: Row) {
  const value = row.id ?? row._id ?? row.uuid ?? row.key ?? row.reportKey ?? row.membershipId ?? row.membership_id ?? row.userId ?? row.user_id ?? row.invitationId ?? row.invitation_id ?? row.roleId ?? row.role_id ?? row.templateId ?? row.template_id ?? row.integrationId ?? row.integration_id ?? row.webhookId ?? row.webhook_id ?? row.invoiceId ?? row.invoice_id ?? row.reportId ?? row.report_id ?? row.auditEventId ?? row.audit_event_id ?? row.sessionId ?? row.session_id
  return value === undefined || value === null ? "" : String(value)
}
export function label(value: string, ar: boolean) {
  const known: Record<string, [string, string]> = {
    "Users directory": ["Users", "المستخدمون"], "Organization memberships": ["Memberships", "العضويات"],
    "List invitations": ["Invitations", "الدعوات"], "Roles directory": ["Roles", "الأدوار"],
    "Permission catalogue": ["Available permissions", "الصلاحيات المتاحة"], "Read organization defaults": ["Organization policies", "سياسات المؤسسة"],
    "List shared templates": ["Shared templates", "القوالب المشتركة"], "Consolidated summary": ["Financial summary", "الملخص المالي"],
    "Clinic comparison": ["Clinic comparison", "مقارنة العيادات"], "Revenue trends": ["Revenue trends", "اتجاهات الإيرادات"],
    "Expense breakdown": ["Expense breakdown", "تحليل المصروفات"], "Consolidated reports": ["Financial reports", "التقارير المالية"],
    "Current subscription": ["Current subscription", "الاشتراك الحالي"], "Entitlement usage": ["Plan usage", "استهلاك الخطة"],
    "Cutilora invoices": ["Invoices", "الفواتير"], "Connected providers": ["Connected services", "الخدمات المتصلة"],
    "Webhook endpoints": ["Webhooks", "روابط Webhook"], "Available group reports": ["Available reports", "التقارير المتاحة"],
    "Audit timeline": ["Audit timeline", "سجل التدقيق"], "Read preferences": ["Workspace preferences", "تفضيلات مساحة العمل"],
    "Read notification preferences": ["Notification preferences", "تفضيلات الإشعارات"], "Active sessions": ["Active sessions", "الجلسات النشطة"],
    "Security events": ["Security events", "أحداث الأمان"], "Clinic details": ["Clinic profile", "ملف العيادة"],
    "Clinic branches": ["Clinic branches", "فروع العيادة"], "Assigned users": ["Assigned members", "الأعضاء المعينون"],
    "Clinic settings and overrides": ["Clinic settings", "إعدادات العيادة"], "Clinic documents": ["Clinic documents", "مستندات العيادة"],
    "Clinic activity": ["Clinic activity", "نشاط العيادة"],
    "Update membership status and role": ["Update membership", "تعديل العضوية"],
    "Assign clinic and branch scopes": ["Assign access scope", "تحديد نطاق الوصول"],
    "Invoice details": ["Invoice details", "تفاصيل الفاتورة"],
    "Download invoice": ["Download invoice", "تنزيل الفاتورة"],
    "Read organization profile": ["Organization profile", "ملف المؤسسة"],
    "Read weekly schedule": ["Weekly schedule", "جدول العمل الأسبوعي"],
    "List holidays and closures": ["Holidays and closures", "العطلات والإغلاقات"],
    "Update branch settings": ["Branch settings", "إعدادات الفرع"],
    "Update preferences": ["Update preferences", "تحديث التفضيلات"],
    "Update notification preferences": ["Update notification preferences", "تحديث تفضيلات الإشعارات"],
    "Revoke session": ["Revoke session", "إنهاء الجلسة"],
    "Report data": ["Report details", "تفاصيل التقرير"],
    "Generate export": ["Generate export", "إنشاء تصدير"],
    "Audit event details": ["Audit event details", "تفاصيل حدث التدقيق"],
    "Export filtered audit events": ["Export audit events", "تصدير أحداث التدقيق"],
    "Update verification status": ["Update verification", "تحديث حالة التحقق"],
    "Get authorized signed download URL": ["Secure download", "تنزيل آمن"],
    "Update clinic settings and overrides": ["Update clinic settings", "تحديث إعدادات العيادة"],
    "Replace role grants": ["Update role permissions", "تحديث صلاحيات الدور"],
    "Effective current-user access": ["My effective access", "صلاحياتي الفعلية"],
    "Update organization defaults": ["Update policies", "تحديث السياسات"],
    "Preview selected rollout": ["Preview changes", "معاينة التغييرات"],
    "Apply confirmed rollout": ["Apply changes", "تطبيق التغييرات"],
    "Create template": ["Create template", "إنشاء قالب"],
    "Template details": ["Template details", "تفاصيل القالب"],
    "Update template": ["Update template", "تحديث القالب"],
    "Publish template": ["Publish template", "نشر القالب"],
    "Submit plan change request": ["Request plan change", "طلب تغيير الخطة"],
    "Connect provider": ["Connect provider", "ربط مزود الخدمة"],
    "Update integration": ["Update integration", "تحديث التكامل"],
    "Register webhook": ["Register webhook", "تسجيل Webhook"],
    "List documents": ["Documents", "المستندات"],
    "Upload document metadata/file": ["Upload document", "رفع مستند"],
    "Document details": ["Document details", "تفاصيل المستند"],
    "Replace document file": ["Replace document", "استبدال المستند"],
    "Archive document": ["Archive document", "أرشفة المستند"],
    "Update clinic profile": ["Update clinic profile", "تحديث ملف العيادة"],
    "Create holiday or exception": ["Add holiday or exception", "إضافة عطلة أو استثناء"],
    "Assign branch manager": ["Assign branch manager", "تعيين مدير الفرع"],
  }
  const pair = known[value]
  return pair ? pair[ar ? 1 : 0] : value
}
export function humanize(key: string, ar: boolean) {
  const dictionary: Record<string, [string, string]> = {
    name: ["Name", "الاسم"], email: ["Email", "البريد الإلكتروني"], status: ["Status", "الحالة"], role: ["Role", "الدور"],
    scope: ["Scope", "نطاق الصلاحية"], lastActivityAt: ["Last activity", "آخر نشاط"], displayName: ["Display name", "الاسم التجاري"],
    legalName: ["Legal name", "الاسم القانوني"], amount: ["Amount", "المبلغ"], currency: ["Currency", "العملة"],
    invoiceNumber: ["Invoice", "رقم الفاتورة"], provider: ["Provider", "مزود الخدمة"], category: ["Category", "التصنيف"],
    date: ["Date", "التاريخ"], expiresAt: ["Expires", "تاريخ الانتهاء"], plan: ["Plan", "الخطة"],
    renewalDate: ["Renewal", "تاريخ التجديد"], isActive: ["Active", "نشط"], clinicName: ["Clinic", "العيادة"],
    branchName: ["Branch", "الفرع"], clinicType: ["Clinic type", "نوع العيادة"], clinicId: ["Clinic", "العيادة"], branchId: ["Branch", "الفرع"],
    emailEnabled: ["Email notifications", "إشعارات البريد"], inAppEnabled: ["In-app notifications", "إشعارات داخل التطبيق"],
    securityAlerts: ["Security alerts", "تنبيهات الأمان"], billingAlerts: ["Billing alerts", "تنبيهات الفوترة"], membershipAlerts: ["Membership alerts", "تنبيهات العضويات"],
    action: ["Action", "الإجراء"], actor: ["Performed by", "المنفذ"], module: ["Module", "الوحدة"], timezone: ["Timezone", "المنطقة الزمنية"],
    invoiceStatus: ["Invoice status", "حالة الفاتورة"], billingCycle: ["Billing cycle", "دورة الفوترة"],
    verificationStatus: ["Verification", "حالة التحقق"], expiryDate: ["Expiry date", "تاريخ الانتهاء"],
  }
  if (dictionary[key]) return dictionary[key][ar ? 1 : 0]
  return key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ").replace(/^./, x => x.toUpperCase())
}
export function display(value: unknown, ar: boolean) {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "boolean") return value ? (ar ? "نعم" : "Yes") : (ar ? "لا" : "No")
  if (typeof value === "string") {
    const statuses: Record<string, [string, string]> = {
      active: ["Active", "نشط"], inactive: ["Inactive", "غير نشط"], suspended: ["Suspended", "موقوف"],
      pending: ["Pending", "قيد الانتظار"], accepted: ["Accepted", "مقبول"], expired: ["Expired", "منتهي"],
      revoked: ["Revoked", "ملغي"], verified: ["Verified", "تم التحقق"], rejected: ["Rejected", "مرفوض"],
      tenant: ["Entire organization", "المؤسسة بالكامل"], clinic: ["Selected clinics", "عيادات محددة"], branch: ["Selected branches", "فروع محددة"],
      tenant_admin: ["Tenant admin", "مسؤول المؤسسة"], organization_manager: ["Organization manager", "مدير المؤسسة"],
      clinic_manager: ["Clinic manager", "مدير العيادة"], branch_manager: ["Branch manager", "مدير الفرع"],
      read_only_analyst: ["Read-only analyst", "محلل للقراءة فقط"],
    }
    const normalized = value.toLowerCase()
    if (statuses[normalized]) return statuses[normalized][ar ? 1 : 0]
  }
  if (Array.isArray(value)) return value.map(item => typeof item === "object" ? JSON.stringify(item) : String(item)).join(", ")
  if (typeof value === "object") return ar ? "تفاصيل إضافية" : "Additional details"
  return String(value)
}
export function resolvePath(path: string, row?: Row) {
  return path.replace(/\{([^}]+)\}/g, (_match, token: string) => {
    const aliases: Record<string, unknown> = {
      id: row?.id ?? row?._id ?? row?.uuid ?? row?.invitationId ?? row?.invitation_id ?? row?.roleId ?? row?.role_id ?? row?.templateId ?? row?.template_id ?? row?.integrationId ?? row?.integration_id ?? row?.webhookId ?? row?.webhook_id ?? row?.invoiceId ?? row?.invoice_id ?? row?.reportId ?? row?.report_id ?? row?.auditEventId ?? row?.audit_event_id ?? row?.sessionId ?? row?.session_id, membershipId: row?.membershipId ?? row?.membership_id ?? row?.id ?? row?._id, invitationId: row?.invitationId ?? row?.invitation_id ?? row?.id ?? row?._id, roleId: row?.roleId ?? row?.role_id ?? row?.id ?? row?._id, integrationId: row?.integrationId ?? row?.integration_id ?? row?.id ?? row?._id,
      userId: row?.userId ?? row?.user_id ?? row?.id ?? row?._id, reportKey: row?.key ?? row?.reportKey ?? row?.id,
      webhookId: row?.webhookId ?? row?.webhook_id ?? row?.id ?? row?._id,
      clinicId: row?.clinicId ?? row?.id ?? row?._id,
    }
    const value = aliases[token] ?? row?.[token]
    return encodeURIComponent(value === undefined || value === null ? "" : String(value))
  })
}
export function operationLabel(endpoint: TenantFeatureEndpoint, ar: boolean) {
  const localized: Record<string, [string, string]> = {
    "Create invitation": ["Send invitation", "إرسال دعوة"], "Revoke invitation": ["Revoke invitation", "إلغاء الدعوة"],
    "Update membership status and role": ["Update membership", "تعديل العضوية"], "Assign clinic and branch scopes": ["Assign access scope", "تحديد نطاق الوصول"],
    "Create role": ["Create role", "إنشاء دور"], "Update role": ["Update role", "تحديث الدور"], "Replace role grants": ["Save permissions", "حفظ الصلاحيات"],
    "Update organization defaults": ["Save policies", "حفظ السياسات"], "Preview selected rollout": ["Preview changes", "معاينة التغييرات"],
    "Apply confirmed rollout": ["Apply changes", "تطبيق التغييرات"], "Create template": ["Create template", "إنشاء قالب"],
    "Update template": ["Update template", "تحديث القالب"], "Submit plan change request": ["Request plan change", "طلب تغيير الخطة"],
    "Connect provider": ["Connect provider", "ربط مزود الخدمة"], "Update integration": ["Update integration", "تحديث التكامل"],
    "Register webhook": ["Register webhook", "تسجيل Webhook"], "Generate export": ["Generate report", "إنشاء تقرير"],
    "Export filtered audit events": ["Export audit log", "تصدير سجل التدقيق"], "Update clinic profile": ["Save clinic profile", "حفظ ملف العيادة"],
    "Update clinic settings and overrides": ["Save clinic settings", "حفظ إعدادات العيادة"],
  }
  if (localized[endpoint.purpose]) return localized[endpoint.purpose][ar ? 1 : 0]
  const p = endpoint.purpose.toLowerCase()
  if (p.includes("resend")) return ar ? "إعادة الإرسال" : "Resend"
  if (p.includes("revoke")) return ar ? "إلغاء" : "Revoke"
  if (p.includes("publish")) return ar ? "نشر" : "Publish"
  if (p.includes("rotate")) return ar ? "تدوير بيانات الاتصال" : "Rotate credentials"
  if (p.includes("disconnect")) return ar ? "فصل الاتصال" : "Disconnect"
  if (p.includes("export")) return ar ? "تصدير" : "Export"
  if (p.includes("download")) return ar ? "تنزيل" : "Download"
  if (p.includes("update")) return ar ? "تحديث" : "Update"
  if (p.includes("create")) return ar ? "إنشاء" : "Create"
  if (p.includes("replace")) return ar ? "استبدال" : "Replace"
  if (p.includes("assign")) return ar ? "تعيين" : "Assign"
  return endpoint.purpose
}

