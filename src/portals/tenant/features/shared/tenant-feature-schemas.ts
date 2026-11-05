import { z } from "zod"

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required`)

export const tenantProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(160),
  legalName: z.string().trim().min(2).max(200),
  businessType: requiredText("Business type"),
  contactEmail: z.string().trim().email(),
  contactPhone: z.string().trim().min(7).max(24),
  website: z.string().trim().url().optional().or(z.literal("")),
  countryId: requiredText("Country"),
  cityId: requiredText("City"),
  addressLine1: z.string().trim().min(5).max(240),
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
  }),
  profile: tenantProfileSchema,
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

export function getTenantFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of error.issues) {
    const field = String(issue.path[0] || "")
    if (field && !errors[field]) errors[field] = issue.message
  }
  return errors
}
