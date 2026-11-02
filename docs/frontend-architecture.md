# Frontend Architecture

## Goals
- Feature-first organization with explicit ownership and dependency boundaries.
- Keep route components thin; orchestration belongs in pages/hooks, presentation in components.
- Every independently meaningful dialog lives in its own component directory and exports typed props.
- Types are first-class files: API DTOs, domain models, form values, component props and query contracts are not mixed.
- All user-facing static copy belongs in shared locale dictionaries; avoid inline English/Arabic literals in pages.
- Memoize stable derived data, callbacks passed to memoized children, and expensive/pure component boundaries. Do not memoize mechanically.

## Target structure

    src/
      app/                 # router, app composition and route-level providers
      portals/
        clinic/
          app/ layout/ routes/
          features/<feature>/{api,components,hooks,pages,schemas,types}
        super-admin/
          app/ layout/ auth/
          features/<feature>/{api,components,dialogs,hooks,pages,schemas,types}
      shared/{api,components,hooks,i18n,lib,types,utils}
      components/ui/       # design-system primitives only
      config/ store/

## Feature file ownership
- api/*.api.ts: HTTP calls only; no React state.
- api/*.types.ts: request/response DTOs and endpoint contracts.
- types/*.types.ts: domain and view-model types.
- schemas/*.schema.ts: validation schemas.
- hooks/use-*.ts: query/mutation orchestration and reusable feature logic.
- components/<component-name>/: one focused component plus its .types.ts and optional local hook/style.
- dialogs/<dialog-name>/: one independently testable dialog per directory.
- pages/*.page.tsx: compose feature components; avoid embedding full forms, tables, dialogs or API logic.

## Dialog policy
Create, edit, view and destructive-confirmation flows are separate components when responsibilities differ. A page may own dialog visibility and selected record, but must not implement dialog markup or form internals inline.

## Types policy
Avoid any. Separate API DTOs from domain entities and form values. Export public feature types through a local types/index.ts or feature index.ts; do not create a global dumping ground for feature-specific types.

## i18n policy
English and Arabic dictionaries must share the same key shape. All static user-facing copy, validation messages, empty/loading/error states, navigation labels, accessible labels and dialog copy must be translated. API-provided and user-generated content is not translated.

## Memoization policy
Use useMemo for expensive derived collections/maps and stable configuration objects; useCallback when callback identity matters to memoized children or effect dependencies; memo for focused presentational components with stable props. Avoid memoizing trivial values or every function.

## Migration sequence
1. Shared foundations (types, API contracts, i18n, dialogs, error handling).
2. Portal shells and route boundaries.
3. Feature-by-feature extraction, starting with Geo Location as the first complete vertical slice.
4. Clinic Portal features, one feature at a time.
5. Typecheck, lint, production build, route smoke tests, RTL review and accessibility checks.
