# Platform Tenants

The Platform Tenants feature is owned by the Super Admin portal. It manages tenant organizations only; clinic and branch operations remain separate platform domains.

## Structure

- `api/tenants.api.ts`: authenticated HTTP boundary, response normalization, and endpoint methods.
- `types/tenant.types.ts`: normalized tenant, subscription, payment, and create payload contracts.
- `hooks/use-tenants.ts`: TanStack Query keys, read hooks, and mutations.
- `pages/tenants.page.tsx`: searchable tenant directory, API-backed summary, and create flow.
- `pages/tenant-details.page.tsx`: dedicated tenant workspace with Overview, Subscription, and Payments tabs.

## API contract

All seven routes from the supplied Postman collection are represented in the API layer with their exact HTTP methods:

- `GET /platform/tenants`: list tenants. The supplied list response is a plain `data[]` array; filtering and pagination currently happen client-side.
- `POST /platform/tenants`: create tenant and owner.
- `PATCH /platform/tenants/{tenantId}/status`: update status.
- `GET /platform/tenants/{tenantId}`: tenant details.
- `PATCH /platform/tenants/{tenantId}`: partial tenant profile update.
- `PUT /platform/tenants/{tenantId}/subscription`: create or replace subscription.
- `POST /platform/tenants/{tenantId}/subscription/payments`: record a subscription payment.
- `GET /platform/tenants/{tenantId}/subscription`: read subscription details.
- `GET /platform/tenants/{tenantId}/subscription/payments`: read payment history.

The three write endpoints for profile, subscription, and payment are exposed through typed query mutations, but their write forms must use the exact request schemas from the collection. The provided subscription/payment examples are response-shaped examples, not sufficient proof of required request fields. The create example also needs confirmation of how the owner payload is represented.

## Tenant create and edit workflow

Create and edit share the dedicated page flow:

- `/super-admin/tenants/new` creates a tenant with `POST /platform/tenants`.
- `/super-admin/tenants/:tenantId/edit` loads the existing tenant and saves through `PATCH /platform/tenants/{tenantId}`.
- The form is split into identity, contact, location, legal/branding, and preferences sections.
- Shared UI primitives are used for inputs, textareas, buttons, checkboxes, cards and selects. Geographic selectors reuse the Geo Location feature and cascade country → governorate → city → district.
- Form mapping is isolated in `types/tenant-form.types.ts`; reusable field and section presentation lives in `components/`.

The visible request schema supplied for the tenant body does not show owner-specific fields. No guessed owner payload is sent; the remaining owner schema is required before adding owner fields to the form.

## Boundaries and assumptions

- The API normalizer supports the supplied Mongo-style `_id` and camelCase fields, while accepting `id` as a compatibility fallback.
- Empty strings and null nested fields are rendered as unavailable values rather than fabricated content.
- Only the `active` status and `starter` plan are offered as explicit filters because those are the only concrete enum values present in the supplied examples. Other values returned by the API remain visible.
- Activation is exposed because the status endpoint example explicitly documents `active`. Other status transitions are intentionally not invented.
- The supplied list example does not include pagination metadata or query parameters. Directory search, status/plan filtering, and page slicing therefore run client-side over the returned collection.
- No payment creation or subscription mutation is exposed; the provided payment object is treated as a payment record, not assumed to be a create request.
- The UI does not display internal database IDs in the directory table.

## Follow-up contract details to confirm

1. Server-side list query parameters and pagination metadata.
2. Allowed tenant status and plan enum values.
3. Whether tenant update, suspension, and deletion endpoints exist.
4. Whether payment history is always returned as `data[]` or has a paginated envelope.
