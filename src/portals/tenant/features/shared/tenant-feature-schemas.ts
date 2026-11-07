import { z } from "zod"

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required`)

const optionalProfileText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""))
const validTimezone = z.string().trim().min(3).max(100).refine(value => {
  try { new Intl.DateTimeFormat("en-US", { timeZone: value }); return true }
  catch { return false }
}, "Use a valid IANA timezone.")

export const tenantProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(160),
  legalName: optionalProfileText(200),
  businessType: z.enum(["single_clinic", "clinic_group", "medical_center"]),
  description: optionalProfileText(2000),
  industry: optionalProfileText(100),
  contactEmail: z.string().trim().email().optional().or(z.literal("")),
  contactPhone: z.string().trim().min(7).max(40).optional().or(z.literal("")),
  alternatePhone: optionalProfileText(40),
  whatsapp: optionalProfileText(40),
  website: z.string().trim().url().optional().or(z.literal("")),
  countryId: z.string().optional(),
  governorateId: z.string().optional(),
  cityId: z.string().optional(),
  districtId: z.string().optional(),
  addressLine1: optionalProfileText(255),
  addressLine2: optionalProfileText(255),
  building: optionalProfileText(100),
  floor: optionalProfileText(50),
  unit: optionalProfileText(50),
  landmark: optionalProfileText(255),
  postalCode: optionalProfileText(30),
  taxNumber: optionalProfileText(100),
  vatNumber: optionalProfileText(100),
  commercialRegistrationNumber: optionalProfileText(100),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  locale: z.string().trim().min(2).max(10),
  currency: z.string().trim().length(3),
  timezone: validTimezone,
  dateFormat: z.string().trim().min(1).max(30),
  weekStartsOn: z.coerce.number().int().min(0).max(6),
})

export const clinicFormSchema = z.object({
  name: z.string().trim().min(2).max(160),
  clinicType: requiredText("Clinic type"),
  description: z.string().max(2000).optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().min(7).max(24).optional().or(z.literal("")),
  timezone: z.string().trim().min(3).max(80).regex(/^[A-Za-z_+-]+(?:\/[A-Za-z0-9_+.-]+)+$/),
})

export const branchFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  address: z.string().max(240).optional(),
  timezone: z.string().trim().min(3).max(80).regex(/^[A-Za-z_+-]+(?:\/[A-Za-z0-9_+.-]+)+$/),
})

export const branchHolidaySchema = z.object({
  name: z.string().trim().min(2).max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isClosed: z.boolean(),
  overrideOpensAt: z.string().optional(),
  overrideClosesAt: z.string().optional(),
}).superRefine((value, context) => {
  if (!value.isClosed && (!value.overrideOpensAt || !value.overrideClosesAt)) {
    context.addIssue({ code: "custom", path: ["overrideOpensAt"], message: "Opening and closing times are required for an open holiday" })
  }
  if (value.overrideOpensAt && value.overrideClosesAt && value.overrideOpensAt >= value.overrideClosesAt) {
    context.addIssue({ code: "custom", path: ["overrideClosesAt"], message: "Closing time must be later than opening time" })
  }
})

export const businessHoursDaySchema = z.object({
  weekday: z.number().int().min(0).max(6),
  isClosed: z.boolean(),
  shifts: z.array(z.object({
    opensAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    closesAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  }).refine((shift) => shift.opensAt < shift.closesAt, {
    message: "Closing time must be later than opening time",
    path: ["closesAt"],
  })).max(2),
}).superRefine((day, context) => {
  if (!day.isClosed && day.shifts.length === 0) {
    context.addIssue({ code: "custom", path: ["shifts"], message: "At least one shift is required for an open day" })
  }
  if (day.shifts.length === 2 && day.shifts[0].closesAt > day.shifts[1].opensAt) {
    context.addIssue({ code: "custom", path: ["shifts"], message: "Shifts cannot overlap" })
  }
})

export const auditFilterSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  actorId: z.string().optional(),
  action: z.string().optional(),
  module: z.string().optional(),
}).refine((value) => !value.from || !value.to || value.from <= value.to, {
  message: "Start date must be before end date",
  path: ["to"],
})

export const tenantFeatureSchemas = {
  invitation: z.object({
    email: z.string().trim().email("Enter a valid email address"),
    role: requiredText("Role"),
    scope: requiredText("Access scope"),
    expiresAt: z.string().optional(),
  }),
  role: z.object({
    name: z.string().trim().min(2, "Role name must contain at least 2 characters").max(80),
    description: z.string().max(500).optional(),
    scope: requiredText("Default scope"),
  }),
  configuration: z.object({
    defaultLocale: z.enum(["en", "ar"]),
    defaultCurrency: z.enum(["EGP", "SAR", "AED", "USD"]),
    cancellationWindowHours: z.coerce.number().int().min(0).max(720),
  }),
  catalog: z.object({
    name: z.string().trim().min(2).max(120),
    category: z.string().trim().min(2).max(80),
    durationMinutes: z.coerce.number().int().min(5).max(1440),
    bufferMinutes: z.coerce.number().int().min(0).max(240).optional(),
  }),
  billing: z.object({
    billingName: z.string().trim().min(2).max(160),
    billingEmail: z.string().trim().email(),
    taxNumber: z.string().trim().max(80).optional(),
  }),
  integration: z.object({
    name: z.string().trim().min(2).max(100),
    provider: requiredText("Provider"),
    scope: z.enum(["tenant", "clinic"]),
    clinicId: z.string().optional(),
    apiKey: z.string().optional(),
  }).superRefine((value, context) => {
    if (value.scope === "clinic" && !value.clinicId) {
      context.addIssue({ code: "custom", path: ["clinicId"], message: "Choose a clinic for this integration." })
    }
  }),
  profile: tenantProfileSchema,
  notification: z.object({
    emailEnabled: z.enum(["true", "false"]),
    inAppEnabled: z.enum(["true", "false"]),
    securityAlerts: z.enum(["true", "false"]),
    billingAlerts: z.enum(["true", "false"]),
    membershipAlerts: z.enum(["true", "false"]),
  }),
  preferences: z.object({
    locale: z.enum(["en", "ar"]),
    currency: z.enum(["EGP", "SAR", "AED", "USD"]),
    timezone: z.string().trim().min(3).max(80).regex(/^[A-Za-z_+-]+(?:\/[A-Za-z0-9_+.-]+)+$/, "Use an IANA timezone such as Africa/Cairo"),
  }),
}

export type TenantFeatureSchemaKey = keyof typeof tenantFeatureSchemas

export function validateTenantFeatureForm(
  schemaKey: TenantFeatureSchemaKey,
  values: Record<string, string>,
) {
  return tenantFeatureSchemas[schemaKey].safeParse(values)
}

export function getTenantFieldErrors(
  error: z.ZodError,
  locale: "ar" | "en" = "en",
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of error.issues) {
    const field = String(issue.path[0] || "")
    if (!field || errors[field]) continue
    if (locale === "ar") {
      if (issue.code === "too_small") errors[field] = "القيمة أقل من الحد الأدنى المطلوب"
      else if (issue.code === "too_big") errors[field] = "القيمة تتجاوز الحد المسموح"
      else if (issue.code === "invalid_format") errors[field] = "صيغة القيمة غير صحيحة"
      else if (issue.code === "invalid_type") errors[field] = "نوع القيمة غير صحيح"
      else errors[field] = "يرجى مراجعة هذه القيمة"
    } else {
      errors[field] = issue.message
    }
  }
  return errors
}
