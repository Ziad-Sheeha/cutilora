/**
 * Proposed Tenant API surface mapped from the Organization Management plan.
 * These routes are contracts only until the backend confirms and implements them.
 * Existing tenant context, clinics and branches calls remain in tenant-api.ts.
 */
export const tenantEndpoints = {
  dashboard: {
    summary: "/api/v1/tenant/dashboard/summary",
    clinics: "/api/v1/tenant/dashboard/clinics",
    activity: "/api/v1/tenant/dashboard/activity",
    alerts: "/api/v1/tenant/dashboard/alerts",
  },
  profile: {
    read: "/api/v1/tenant/profile",
    update: "/api/v1/tenant/profile",
    preferences: "/api/v1/tenant/preferences",
    documents: "/api/v1/tenant/documents",
  },
  users: {
    list: "/api/v1/tenant/users",
    invitations: "/api/v1/tenant/invitations",
    memberships: "/api/v1/tenant/memberships",
  },
  access: {
    permissions: "/api/v1/permissions",
    roles: "/api/v1/roles",
    current: "/api/v1/access/me",
  },
  configuration: {
    defaults: "/api/v1/tenant/configuration",
    templates: "/api/v1/tenant/catalog-templates",
    previewApply: "/api/v1/tenant/configuration/preview-apply",
    apply: "/api/v1/tenant/configuration/apply",
  },
  finance: {
    summary: "/api/v1/tenant/finance/summary",
    clinicComparison: "/api/v1/tenant/finance/clinic-comparison",
    revenueTrends: "/api/v1/tenant/finance/revenue-trends",
    expenseSummary: "/api/v1/tenant/finance/expense-summary",
    reports: "/api/v1/tenant/finance/reports",
  },
  subscription: {
    current: "/api/v1/tenant/subscription",
    usage: "/api/v1/tenant/subscription/usage",
    invoices: "/api/v1/tenant/invoices",
    billingProfile: "/api/v1/tenant/billing-profile",
    changeRequest: "/api/v1/tenant/subscription/change-request",
  },
  integrations: {
    providers: "/api/v1/tenant/integrations",
    webhooks: "/api/v1/tenant/webhooks",
  },
  governance: {
    auditLogs: "/api/v1/tenant/audit-logs",
    reports: "/api/v1/tenant/reports",
  },
  settings: {
    notifications: "/api/v1/tenant/notification-preferences",
    sessions: "/api/v1/tenant/security/sessions",
    securityEvents: "/api/v1/tenant/security/events",
  },
} as const
