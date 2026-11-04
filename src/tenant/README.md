# Tenant Application

Owns the customer workspace. A tenant may own multiple clinics; each clinic may contain multiple branches according to the backend domain model.

- `auth/`: tenant session and authentication (must remain isolated from platform auth).
- `context/`: active tenant, clinic and branch selection.
- `features/clinics/`: management of clinics owned by the current tenant.
- `clinic-workspace/`: operational features scoped to the currently selected clinic.

Laravel remains authoritative for tenant isolation and authorization.
