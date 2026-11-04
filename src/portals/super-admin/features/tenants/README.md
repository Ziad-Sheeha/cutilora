# Platform Tenants

The Platform Tenants feature is owned by the Super Admin portal. It manages tenant organizations only; clinic and branch operations remain separate platform domains.

## Structure

- `api/tenants.api.ts`: authenticated HTTP boundary, response normalization, and endpoint methods.
- `types/tenant.types.ts`: normalized tenant, subscription, payment, and create payload contracts.
- `hooks/use-tenants.ts`: TanStack Query keys, read hooks, and mutations.
- `pages/tenants.page.tsx`: searchable tenant directory, API-backed summary, and create flow.
- `pages/tenant-details.page.tsx`: dedicated tenant workspace with Overview, Subscription, and Payments tabs.

## Endpoints currently connected

- `GET /platform/tenants`: tenant directory. The supplied response is a plain `data[]` payload, so search, filters, and pagination are performed client-side until a server pagination/query contract is supplied.
- `POST /platform/tenants`: create tenant using the supplied request shape.
- `GET /platform/tenants/{tenantId}`: tenant profile.
- `PATCH /platform/tenants/{tenantId}/status`: activate a tenant with `{ "status": "active" }`.
- `GET /platform/tenants/{tenantId}/subscription`: subscription profile.
- `GET /platform/tenants/{tenantId}/subscription/payments`: payment history.

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
