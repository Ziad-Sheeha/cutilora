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

The visible request schema supplied for the tenant body does not show owner-specific fields. The API validation response confirms that create requires an `owner` field, but does not reveal its shape. No guessed owner payload is sent; the owner request schema is required before adding owner fields to the form.

## Form UX, image handling, and PDF export

- Required identity fields are visibly marked and validated before the user can unlock the next step. The final review step allows jumping back to any completed section before submission.
- Business type, industry, timezone, organization language, currency, date format, and week start use the shared SelectMenu. Geographic fields use the shared searchable cascading selectors.
- Logo and cover uploads accept PNG, JPEG, and WebP up to 5 MB. The browser reads each selected file as a base64 data URI for preview; newly selected images are sent in the existing `branding.logoUrl` and `branding.coverImageUrl` fields. Existing server image URLs are previewed but omitted from PATCH unless the user replaces or removes them.
- After a successful create/update, a confirmation dialog offers a print-ready organization profile. The PDF is generated entirely in the browser using the print stylesheet; choose Save as PDF in the browser print destination. No PDF API or server endpoint is used.

## Reusable international phone input

- `src/components/ui/phone-number-field.tsx` is a shared phone field built from the existing Input and SelectMenu primitives.
- Its country selector contains 245 regions from libphonenumber-js calling-code metadata, with flag emoji and international calling prefixes.
- The tenant contact section shares one `contact.phoneCode` value across primary, alternate, and WhatsApp numbers.
- The UI displays a leading local trunk zero (for example, `010...`); payload mapping removes that leading zero from each phone value and sends the calling code separately, including its `+` prefix.
- Primary and alternate numbers are validated as different values. Entered phone numbers must contain 7–15 digits after removing the local leading zero.

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
