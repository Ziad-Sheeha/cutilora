# Frontend Architecture

This is the source of truth for frontend ownership. Organize code by **application boundary → domain/portal → feature → responsibility**.

## Target source tree

```text
src/
├── app/
│   ├── pages/
│   ├── providers/
│   │   ├── app-providers.tsx
│   │   └── query-provider.tsx
│   └── router.tsx
│
├── platform/
│   └── super-admin/
│       ├── auth/
│       ├── layout/
│       ├── pages/
│       └── features/
│           ├── tenants/
│           ├── clinics/          # All clinics across the SaaS platform
│           ├── branches/
│           ├── users/
│           ├── access-control/
│           ├── monitoring/
│           ├── audit/
│           └── settings/
│
├── tenant/
│   ├── auth/                     # Separate tenant identity/session
│   ├── context/                  # Active tenant, clinic and branch
│   ├── authorization/            # Tenant roles, permissions and policies
│   ├── features/
│   │   ├── clinics/              # Clinics owned by the active tenant
│   │   └── branches/
│   └── clinic-workspace/         # Operations within the selected clinic
│       ├── dashboard/
│       ├── appointments/
│       ├── patients/
│       ├── medical-records/
│       ├── encounters/
│       ├── services/
│       ├── packages/
│       ├── sales/
│       ├── cash-management/
│       └── employees/
│
├── shared/
│   ├── auth/session/             # Portal-neutral session utilities only
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── types/
│   └── utils/
│
├── components/
│   ├── brand/
│   └── ui/                       # shadcn/Radix design primitives
├── config/
├── i18n/
├── lib/
├── store/
│   ├── index.ts
│   ├── root-reducer.ts
│   └── slices/
│       ├── platform-auth.slice.ts
│       ├── tenant-auth.slice.ts
│       ├── tenant-context.slice.ts
│       ├── clinic-context.slice.ts
│       ├── branch-context.slice.ts
│       └── ui.slice.ts
└── assets/
```

## Domain model

```text
Platform
└── Tenant
    ├── Clinic A
    │   ├── Branch 1
    │   └── Branch 2
    └── Clinic B
        └── Branch 1
```

- **Platform clinics** are managed globally by Super Admin.
- **Tenant clinics** are only the clinics owned by the authenticated tenant.
- **Clinic workspace** is the operational workspace for one selected clinic; it is not another ownership level.
- A branch belongs to a clinic. A clinic belongs to a tenant.
- Never trust frontend context for isolation. Laravel must authorize tenant, clinic and branch scope on every request.

## State ownership

| State | Owner |
|---|---|
| Platform authentication | Redux Toolkit `platformAuth` slice |
| Tenant authentication | Redux Toolkit `tenantAuth` slice |
| Active tenant / clinic / branch selection | Redux Toolkit context slices |
| Loading indicators and toasts | Redux Toolkit `ui` slice |
| API data, caching and invalidation | TanStack Query |
| Theme, locale provider and simple dependency injection | React Context |
| Local component interaction | React state |

Do not copy API entities such as patients, appointments or clinic records into Redux. TanStack Query owns server state. Platform and tenant sessions must never share token storage or logout behavior.

## Authentication and forced logout

- Platform and tenant have independent guards, token storage, login/logout services and session state.
- A valid JWT `exp` claim is checked on protected-route entry and scheduled for expiry logout.
- Any authenticated platform API response with HTTP 401 clears the platform session and redirects to the platform login screen.
- A tenant HTTP 401 must clear only the tenant session once the real tenant authentication contract is integrated.
- Do not treat 403 as an expired session; it means authenticated but forbidden.
- Do not infer token format, login endpoint, refresh behavior or current-user response. Confirm the Laravel contract first.
- The current Clinic Portal login is preview-only. Tenant route protection must not be switched on until the backend login contract is supplied and implemented.

## Feature ownership and dependency direction

1. `app/` composes providers and routes; it does not own business logic.
2. `platform/` owns platform-wide administration.
3. `tenant/` owns tenant and clinic operations.
4. A feature owns its API module, hooks, schemas, types, components and pages.
5. `shared/`, `components/ui/`, `lib/` and `config/` must never import from a portal/domain feature.
6. UI primitives must not know about API endpoints, auth tokens, Redux slices or business rules.

## Feature structure

Create only folders that a feature uses:

```text
feature-name/
├── api/
├── components/
├── hooks/
├── pages/
├── schemas/
└── types/
```

- API modules contain typed HTTP calls and response mapping only.
- Hooks own TanStack Query keys, queries, mutations and invalidation.
- Pages compose screens; reusable form/dialog markup belongs in components.
- Preserve backend response envelopes, pagination keys, enum values and identifiers.

## Migration note

The current working UI still has legacy implementation paths under `src/portals/clinic` and `src/portals/super-admin`. New platform/tenant foundations and authentication boundaries are being established here first; move existing feature modules in small batches, updating all imports and validating after each batch. Do not leave duplicated live implementations.

## Validation

After every migration batch run:

```bash
npm run typecheck
npm run build
```

Smoke-test landing, clinic preview/login, clinic workspace routes, platform login, platform forced logout, Geo Location CRUD, Monitoring filters/details, Arabic RTL and English LTR.
