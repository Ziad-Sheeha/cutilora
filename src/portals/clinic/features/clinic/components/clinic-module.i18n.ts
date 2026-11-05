import type { ClinicModuleField, ClinicModuleKey } from "../api/clinic-module.api"

type Locale = "ar" | "en"

const fieldLabels: Record<string, Record<Locale, string>> = {
  firstName: { en: "First name", ar: "الاسم الأول" },
  lastName: { en: "Last name", ar: "اسم العائلة" },
  patientId: { en: "Patient", ar: "المريض" },
  providerId: { en: "Provider", ar: "مقدم الخدمة" },
  serviceId: { en: "Service", ar: "الخدمة" },
  branchId: { en: "Branch", ar: "الفرع" },
  scheduledAt: { en: "Appointment date and time", ar: "تاريخ ووقت الموعد" },
  notes: { en: "Notes", ar: "ملاحظات" },
  name: { en: "Name", ar: "الاسم" },
  categoryId: { en: "Category", ar: "الفئة" },
  durationMinutes: { en: "Duration (minutes)", ar: "المدة (بالدقائق)" },
  price: { en: "Price", ar: "السعر" },
  currency: { en: "Currency", ar: "العملة" },
  description: { en: "Description", ar: "الوصف" },
  validityDays: { en: "Validity (days)", ar: "مدة الصلاحية (بالأيام)" },
  email: { en: "Email", ar: "البريد الإلكتروني" },
  phone: { en: "Phone", ar: "الهاتف" },
  dateOfBirth: { en: "Date of birth", ar: "تاريخ الميلاد" },
  gender: { en: "Gender", ar: "النوع" },
  code: { en: "Code", ar: "الكود" },
  slug: { en: "URL slug", ar: "المعرف المختصر" },
  address: { en: "Address", ar: "العنوان" },
  timezone: { en: "Time zone", ar: "المنطقة الزمنية" },
  recordType: { en: "Member type", ar: "نوع العضو" },
  jobTitle: { en: "Job title", ar: "المسمى الوظيفي" },
  status: { en: "Status", ar: "الحالة" },
  createdAt: { en: "Created at", ar: "تاريخ الإنشاء" },
  created_at: { en: "Created at", ar: "تاريخ الإنشاء" },
  updatedAt: { en: "Updated at", ar: "آخر تحديث" },
  updated_at: { en: "Updated at", ar: "آخر تحديث" },
  title: { en: "Title", ar: "العنوان" },
  amount: { en: "Amount", ar: "المبلغ" },
  total: { en: "Total", ar: "الإجمالي" },
  invoiceNumber: { en: "Invoice number", ar: "رقم الفاتورة" },
}

const pageLabels: Record<string, Record<Locale, string>> = {
  allStatuses: { en: "All statuses", ar: "كل الحالات" },
  search: { en: "Search records", ar: "ابحث في السجلات" },
  refresh: { en: "Refresh", ar: "تحديث" },
  loading: { en: "Loading records…", ar: "جارٍ تحميل السجلات…" },
  empty: { en: "No records found", ar: "لا توجد سجلات" },
  emptyDescription: { en: "Try changing your search or filters.", ar: "جرّب تغيير البحث أو عوامل التصفية." },
  noData: { en: "This section is not available yet", ar: "هذا القسم غير متاح حاليًا" },
  noDataDescription: { en: "There is no supported collection available for this section.", ar: "لا توجد قائمة بيانات متاحة لهذا القسم حاليًا." },
  clinicalRecordsDescription: { en: "Clinical records are accessed from an individual patient's chart.", ar: "يتم الوصول إلى السجلات الطبية من الملف الخاص بكل مريض." },
  goToPatients: { en: "Go to patients", ar: "الانتقال إلى المرضى" },
  actions: { en: "Actions", ar: "الإجراءات" },
  view: { en: "View", ar: "عرض" },
  edit: { en: "Edit", ar: "تعديل" },
  delete: { en: "Delete", ar: "حذف" },
  details: { en: "Record details", ar: "تفاصيل السجل" },
  editTitle: { en: "Edit record", ar: "تعديل السجل" },
  scope: { en: "Changes are saved for the active clinic and branch.", ar: "يتم حفظ التغييرات للعيادة والفرع الحاليين." },
  save: { en: "Save", ar: "حفظ" },
  cancel: { en: "Cancel", ar: "إلغاء" },
  close: { en: "Close", ar: "إغلاق" },
  required: { en: "This field is required.", ar: "هذا الحقل مطلوب." },
  invalidEmail: { en: "Enter a valid email address.", ar: "أدخل بريدًا إلكترونيًا صحيحًا." },
  invalidNumber: { en: "Enter a valid number.", ar: "أدخل رقمًا صحيحًا." },
  invalidLanguage: { en: "Use the selected language for this text field.", ar: "استخدم اللغة المحددة في هذا الحقل النصي." },
  saveError: { en: "Unable to save this record.", ar: "تعذر حفظ السجل." },
  missingId: { en: "This record cannot be changed because it has no resource identifier.", ar: "لا يمكن تعديل هذا السجل لعدم وجود معرّف صالح له." },
  loadError: { en: "Unable to load records.", ar: "تعذر تحميل السجلات." },
  createSuccess: { en: "Record created successfully.", ar: "تم إنشاء السجل بنجاح." },
  updateSuccess: { en: "Changes saved successfully.", ar: "تم حفظ التغييرات بنجاح." },
  deleteSuccess: { en: "Record deleted successfully.", ar: "تم حذف السجل بنجاح." },
  deleteTitle: { en: "Delete this record?", ar: "هل تريد حذف هذا السجل؟" },
  deleteDescription: { en: "This action cannot be undone.", ar: "لا يمكن التراجع عن هذا الإجراء." },
  confirmDelete: { en: "Delete record", ar: "حذف السجل" },
  recordTypeEmployee: { en: "Employee", ar: "موظف" },
  recordTypeProvider: { en: "Provider", ar: "مقدم خدمة" },
}

export function clinicModuleText(key: string, locale: Locale): string {
  return pageLabels[key]?.[locale] ?? key
}

export function clinicModuleFieldLabel(field: ClinicModuleField, locale: Locale): string {
  return fieldLabels[field.name]?.[locale] ?? field.label
}

export function clinicModuleColumnLabel(field: string, locale: Locale): string {
  const known = fieldLabels[field]?.[locale]
  if (known) return known
  const readable = field.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ")
  return readable.charAt(0).toLocaleUpperCase(locale) + readable.slice(1)
}

export function clinicModuleStatusLabel(status: string, locale: Locale): string {
  const labels: Record<string, Record<Locale, string>> = {
    active: { en: "Active", ar: "نشط" },
    inactive: { en: "Inactive", ar: "غير نشط" },
    pending: { en: "Pending", ar: "قيد الانتظار" },
    confirmed: { en: "Confirmed", ar: "مؤكد" },
    completed: { en: "Completed", ar: "مكتمل" },
    cancelled: { en: "Cancelled", ar: "ملغي" },
    draft: { en: "Draft", ar: "مسودة" },
    paid: { en: "Paid", ar: "مدفوع" },
    unpaid: { en: "Unpaid", ar: "غير مدفوع" },
    suspended: { en: "Suspended", ar: "موقوف" },
    invited: { en: "Invited", ar: "تمت دعوته" },
  }
  return labels[status.toLowerCase()]?.[locale] ?? status
}

