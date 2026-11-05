# Tenant portal

A dedicated organization-management workspace for tenant owners and tenant administrators. It is separate from both the Super Admin portal and the clinic operations portal.

## Backend contracts

- `POST /auth/login` — regular user login and active tenant memberships.
- `POST /auth/logout` — revoke the regular user token.
- `GET /tenant/context` — resolve tenant, optional clinic/branch context, and access role.
- `GET|POST /tenant/clinics`, `GET|PATCH /tenant/clinics/:clinicId` — tenant clinic management.
- `GET|POST /tenant/branches` — branch management; an active clinic context is required.
- `GET /tenant/geo/:resource` — tenant-scoped geographic lookups.

Requests use the regular Bearer token and `X-Tenant-Id`. `X-Clinic-Id` and `X-Branch-Id` are added only when those contexts are selected.

## Structure

- `api/` — tenant-scoped API client and endpoint functions.
- `auth/` — login, membership selection, session and route guard.
- `components/` — reusable forms, membership picker, page heading, empty state and status presentation.
- `config/` — navigation definitions.
- `layout/` — independent tenant shell, header and sidebar.
- `pages/` — organization overview, clinics, branches and organization profile.
- `types/` — API contracts.

## Backend boundaries

The current backend does not expose tenant-profile update, tenant subscription/billing management, staff invitation, tenant user/role management, or tenant analytics endpoints. Those screens and actions are intentionally not fabricated. The organization profile is read-only until a tenant-profile update API is available.


## Organization Management frontend map

The Tenant Portal now follows the `TENANT — Organization Management` Trello scope.

### Navigation and route map

| Area | Route | Frontend status |
|---|---|---|
| Organization overview | `/tenant` | Existing context/clinic overview |
| Organization profile | `/tenant/organization` | Read-only until profile API is implemented |
| Clinics | `/tenant/clinics` | Existing tenant clinic list/create/update |
| Branches | `/tenant/branches` | Existing branch list/create |
| Organization documents | `/tenant/documents` | UI/API contract placeholder |
| Users & memberships | `/tenant/users` | UI/API contract placeholder |
| Invitations | `/tenant/invitations` | UI + local Zod validation; no submit request |
| Roles & permissions | `/tenant/roles` | UI + local Zod validation; shared RBAC contract |
| Shared catalog | `/tenant/catalog` | UI + local Zod validation; no publish request |
| Organization policies | `/tenant/configuration` | UI + local Zod validation; no apply request |
| Group finance | `/tenant/finance` | Reporting-only placeholder |
| Subscription | `/tenant/subscription` | Cutilora billing placeholder |
| Integrations | `/tenant/integrations` | Secret-safe UI contract placeholder |
| Group reports | `/tenant/insights` | Aggregate reporting placeholder |
| Audit governance | `/tenant/governance` | Read-only audit placeholder |
| Preferences | `/tenant/settings/preferences` | UI + local Zod validation |
| Notifications | `/tenant/settings/notifications` | UI/API contract placeholder |
| Security | `/tenant/settings/security` | UI/API contract placeholder |

### Frontend architecture

- `config/navigation.ts`: grouped Tenant navigation.
- `features/shared/tenant-feature-registry.ts`: module metadata, capability scope, field definitions and endpoint mapping.
- `features/shared/tenant-feature-page.tsx`: reusable module workspace shell.
- `features/shared/tenant-feature-form.tsx`: reusable form renderer with field-level validation errors.
- `features/shared/tenant-feature-schemas.ts`: Zod schemas for invitations, roles, configuration, catalog, billing, integrations, preferences, organization profile, clinic, branch, holidays, business hours and audit filters.
- `features/contracts/tenant-endpoints.ts`: proposed API paths grouped by domain. This file is a contract catalogue; it does not issue requests to endpoints that do not exist yet.

### Backend handoff rules

1. Proposed endpoints shown in the Tenant modules are pending contracts. Confirm request/response envelopes, pagination, filters, status enums and permission keys with Frontend before implementation.
2. All tenant endpoints must derive/verify tenant membership server-side. Never trust a tenant ID supplied by the browser as authorization.
3. Keep Tenant Finance as a consolidated read/reporting layer over Clinic financial records. Do not create a duplicate Tenant transaction ledger.
4. Keep Cutilora subscription invoices separate from Clinic patient invoices and collections.
5. Tenant UI does not create Employee/Provider records; those remain Clinic operational entities.
6. Invitation tokens, API secrets and webhook signing secrets must never be returned in plaintext after creation.
7. Audit events are append-only/read-only for Tenant users and must redact secrets and unnecessary clinical data.
8. Backend authorization and entitlement checks remain authoritative; hiding a route or button is UX only.

### Integration policy

- Existing endpoints are used only where the current backend contract has already been verified (tenant context, clinics, branches and tenant geo).
- New modules deliberately do not make placeholder HTTP requests. Their pages show a pending-backend state and list the proposed endpoint contract.
- Local form validation is a UX layer and must be duplicated/enforced by the backend.
- No placeholder form reports that data was saved. A successful local validation is explicitly labelled as validation only.
