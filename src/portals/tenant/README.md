# Tenant portal

The tenant portal is a separate organization-management workspace for tenant owners and tenant administrators. It is not the clinic operations portal and it does not reuse the Super Admin layout.

## Backend contracts currently implemented

- `POST /auth/login` — regular user login and active memberships.
- `POST /auth/logout` — revoke the regular user token.
- `GET /tenant/context` — resolve tenant, optional clinic/branch context, and access role.
- `GET|POST /tenant/clinics`, `GET|PATCH /tenant/clinics/:clinicId` — tenant clinic management.
- `GET|POST /tenant/branches` — branch management, requiring an active clinic context.
- `GET /tenant/geo/:resource` — tenant-scoped geographic lookups.

Requests use the regular Bearer token plus `X-Tenant-Id`; clinic and branch headers are added only when selected.

## Structure

- `api/` — tenant-scoped API client and endpoint functions.
- `auth/` — tenant login, membership selection, session and route guard.
- `config/` — navigation definitions.
- `layout/` — independent tenant shell, header and sidebar.
- `pages/` — organization overview, clinic list, branch list and read-only organization profile.
- `types/` — API contracts.

## Deliberate backend boundaries

The current backend does not expose tenant-profile update, tenant subscription/billing management, staff invitation, tenant user/role management, or tenant analytics endpoints. The portal therefore does not invent save buttons, billing data, staff records, or dashboard metrics for those areas. The organization profile is read-only until a tenant-profile update API is available.
