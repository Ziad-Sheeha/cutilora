# Clinic Portal static implementation

The Clinic Portal navigation routes are implemented as static, interactive UI previews. Seeded records are demonstration-only and are not persisted or sent to the backend.

## API integration boundary

- Use `src/lib/api.ts` as the shared Axios client. It normalizes HTTP and validation errors, tracks in-flight requests, and dispatches global notifications for non-validation failures.
- Use `src/features/clinic/api/endpoints.ts` as the initial endpoint map based on the current Trello contracts.
- Use React Query for remote/server state and Redux Toolkit for cross-cutting client state (UI loading, notifications, selected branch). Do not put server collections in Redux.
- Replace demo records with typed query/mutation hooks only after the backend response envelope, pagination keys, enum values, and permission scopes are confirmed.
- Mutations must invalidate affected queries and display success feedback. Validation errors (422) should map to fields and not be duplicated as global toasts.
- 401/403 handling is UX only. The backend remains authoritative for authentication and authorization.

## Demo limitations

Create/edit/delete currently affect local component state only. Search and basic status filtering work against demo rows. Export, advanced filters, branch switcher, scheduling conflicts, clinical signing, payments/refunds, RBAC enforcement, and audit events require backend contracts and are not simulated as successful operations.

Patient Mobile App remains deferred and is intentionally not part of this Clinic Portal scope.
