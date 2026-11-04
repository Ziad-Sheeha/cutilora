# Frontend Architecture

This document is the source of truth for where frontend code belongs. The project is organized by **application layer → portal → feature → responsibility**. Do not create new top-level folders for one-off features.

## Source tree

```text
src/
├── app/
│   ├── pages/                 # Public landing, not-found and route-level fallback pages
│   ├── providers/             # App-wide providers and error boundary
│   ├── router.tsx             # Route definitions only
│   └── ...
├── portals/
│   ├── clinic/
│   │   ├── auth/              # Clinic authentication and guards
│   │   ├── config/            # Clinic-only navigation/configuration
│   │   ├── layout/            # Clinic shell, header and sidebar
│   │   └── features/
│   │       ├── clinic/
│   │       │   ├── api/
│   │       │   ├── pages/
│   │       │   └── types/
│   │       └── dashboard/
│   │           ├── components/
│   │           └── pages/
│   └── super-admin/
│       ├── auth/
│       ├── layout/
│       ├── pages/
│       └── features/
│           ├── geo-location/
│           │   ├── api/
│           │   ├── components/
│           │   ├── hooks/
│           │   ├── pages/
│           │   ├── schemas/
│           │   └── types/
│           └── monitoring/
│               ├── api/
│               ├── components/
│               └── pages/
├── components/
│   ├── brand/                 # Brand-specific reusable components
│   └── ui/                    # Design-system primitives only
├── config/                    # Environment and app-wide configuration
├── i18n/                      # The single source of truth for locales/provider
├── lib/                       # Technical infrastructure (HTTP, utilities)
├── shared/
│   ├── components/             # Cross-portal business-agnostic components
│   ├── types/
│   ├── validation/
│   └── ...
├── store/                     # Cross-feature client state only
└── index.css
```

## Ownership rules

| Concern | Put it here |
|---|---|
| Route composition and app providers | `app/` |
| Clinic-only code | `portals/clinic/` |
| Platform administration code | `portals/super-admin/` |
| Feature-specific HTTP calls | `portals/<portal>/features/<feature>/api/` |
| React Query orchestration | Feature `hooks/` |
| Feature UI | Feature `components/` |
| Route-level feature composition | Feature `pages/*.page.tsx` |
| Yup/Zod validation | Feature `schemas/*.schema.ts` |
| Feature domain/view-model types | Feature `types/*.types.ts` |
| Cross-portal generic components | `shared/components/` |
| shadcn/Radix design primitives | `components/ui/` |
| Cross-cutting API client and utilities | `lib/` |
| Global locale dictionaries/provider | `i18n/` |
| Global client-only state | `store/` |

## Naming conventions

- Pages: `*.page.tsx`
- Hooks: `use-*.ts`
- API modules: `*.api.ts`
- Schemas: `*.schema.ts`
- Domain/type modules: `*.types.ts` (a local `types/index.ts` is acceptable for a small type barrel)
- Components: descriptive kebab-case file names, one primary component per file.
- Tests: colocate as `*.test.ts(x)` or `*.spec.ts(x)` beside the unit under test.

## Dependency direction

1. `app` may compose portals and shared infrastructure.
2. A portal may depend on shared infrastructure and its own features.
3. A feature may depend on shared infrastructure and other explicitly public feature contracts; avoid feature-to-feature implementation imports.
4. `shared`, `components/ui`, `lib`, and `config` must never import from a portal or feature.
5. UI primitives must not know about API endpoints, Redux slices, portal navigation, or business rules.

## Feature implementation pattern

For a normal CRUD feature:

- `api/<feature>.api.ts`: typed HTTP calls and response mapping only.
- `types/`: API DTOs and domain/view types, kept distinct when their shapes differ.
- `schemas/`: validation rules.
- `hooks/`: React Query keys, queries, mutations, invalidation and feature orchestration.
- `components/`: focused reusable feature UI.
- `dialogs/<name>/`: separate create/edit/view/confirm dialogs when the flows have independent responsibilities.
- `pages/<feature>.page.tsx`: compose the screen; keep API details and large form/dialog markup out of the page.

A small feature does not need every folder. Create only the responsibilities it actually uses; do not create empty placeholder files or directories.

## State and API rules

- TanStack Query owns remote/server state. Redux Toolkit is for cross-feature client state only.
- API modules do not import React hooks or components.
- Keep one documented HTTP client strategy. Do not introduce another Axios instance/interceptor stack without an explicit requirement.
- Preserve backend contracts exactly; do not rename pagination keys, response envelopes, enum values or identifiers in the frontend without a mapper.
- Mutation hooks own cache invalidation. Components own user interaction and present loading/error/success states.
- Do not put secrets or tenant authorization assumptions in the frontend; Laravel is authoritative.

## Localization and RTL

- `src/i18n/` is the only locale source of truth.
- English and Arabic dictionaries must have matching key shapes.
- All static user-facing copy, validation messages, loading/empty/error states, tooltips and accessible labels must be translated.
- API-provided/user-generated content is not translated automatically.
- Layouts must use logical CSS properties and respect the provider's `dir` value.

## Component and dialog rules

- `components/ui/` contains generic design-system primitives, not business components.
- Use the existing shared primitives before creating a new native control or one-off visual pattern.
- Feature dialogs live in the feature that owns the workflow. A page may own open/close state and selected entity, but dialog form markup belongs in the dialog component.
- Keep table action columns at the end and avoid leaking internal backend identifiers into user-facing tables.

## Memoization

Use `useMemo`, `useCallback`, and `memo` only when referential stability or measured computation cost matters. Do not memoize every variable or callback mechanically.

## Migration and validation policy

This branch establishes the structure for the current screens. Continue moving future portal modules feature-by-feature, preserving routes and API contracts. After each structural batch run:

```bash
npm run typecheck
npm run build
```

Then smoke-test public landing, Clinic login/dashboard/module routes, Super Admin login, Geo Location CRUD, Monitoring tabs/filters/detail dialog, Arabic RTL and English LTR. No large reorganization is complete until these checks pass.
