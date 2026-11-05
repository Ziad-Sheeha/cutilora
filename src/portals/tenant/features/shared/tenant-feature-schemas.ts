import { z } from "zod"

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required`)

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
