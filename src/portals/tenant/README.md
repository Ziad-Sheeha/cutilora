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
