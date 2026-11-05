# Tenant Portal — Organization Management

A dedicated multi-tenant organization workspace for tenant owners and authorized tenant administrators. It is separate from the Super Admin portal and the Clinic operational portal.

## Frontend scope

The Tenant frontend covers the organization-management workflows below:

| Area | Route | Frontend implementation |
|---|---|---|
| Organization overview | `/tenant` | Tenant context, organization summary, clinic overview and navigation |
| Organization profile | `/tenant/organization` | Read/update profile, contact and registered address, dependent country/city selectors |
| Clinics | `/tenant/clinics` | List, search, create, edit, activate and deactivate |
| Branches | `/tenant/branches` | List by active clinic, create and edit |
| Clinic workspace | `/tenant/clinic-workspace` | Clinic profile update, branches, assigned members, settings, documents and activity |
| Branch operations | `/tenant/branch-operations` | Weekly hours, multiple shifts, holidays, exceptions, settings, manager assignment and activity |
| Organization documents | `/tenant/documents` | Upload, categorize, expiry, replace, signed preview/download, verification and archive |
| Users & memberships | `/tenant/users` | Directory, membership status/role updates and clinic/branch scopes |
| Invitations | `/tenant/invitations` | Create, list, resend and revoke invitations |
| Roles & permissions | `/tenant/roles` | Role create/update, permission catalogue and grant assignment |
| Organization policies | `/tenant/configuration` | Read/update defaults, preview rollout and confirm application |
| Shared catalog | `/tenant/catalog` | Create and update shared templates, publish templates |
| Group finance | `/tenant/finance` | Consolidated summary, clinic comparison, revenue trends, expenses and reports |
| Subscription | `/tenant/subscription` | Plan, usage, Cutilora invoices, invoice detail/download, billing profile and change request |
| Integrations | `/tenant/integrations` | Providers, credential rotation, disconnect, webhook registration |
| Group reports | `/tenant/insights` | Available reports, report detail and filtered exports |
| Audit governance | `/tenant/governance` | Read-only audit timeline, event details and filtered exports |
| Preferences | `/tenant/settings/preferences` | Organization language, currency and timezone |
| Notifications | `/tenant/settings/notifications` | Email, in-app, security, billing and membership preferences |
| Security | `/tenant/settings/security` | Active sessions, session revocation and security events |

## Frontend architecture

- `api/`: tenant-scoped Axios client; attaches regular-user Bearer token and active tenant/clinic/branch headers.
- `auth/`: tenant login, membership selection, session lifecycle and route guard.
- `layout/`: Tenant shell, header, context selectors and responsive navigation.
- `pages/`: organization overview, profile, clinics and branches.
- `features/documents/`: document lifecycle UI and signed-access handling.
- `features/branch-operations/`: schedule, holiday, branch settings, manager and activity workflows.
- `features/shared/tenant-domain-workspace.page.tsx`: shared data-resource presentation and endpoint-driven module operations.
- `features/shared/tenant-feature-registry.ts`: bilingual feature metadata, fields and API operation catalogue.
- `features/shared/tenant-feature-schemas.ts`: Zod validation schemas and localized field errors.
- `features/contracts/tenant-endpoints.ts`: centralized tenant API route catalogue.
- `types/`: typed Tenant, Clinic, Branch, Membership and API envelope contracts.

## API and security boundaries

All Tenant requests use the active regular-user session. The API client attaches `Authorization: Bearer`, `X-Tenant-Id`, and optional `X-Clinic-Id` / `X-Branch-Id`. The backend must independently validate tenant membership, scope, permissions and plan entitlements for every request.

- Never trust a tenant, clinic or branch identifier supplied by the browser as proof of authorization.
- Tenant Finance is a consolidated reporting layer over Clinic financial records, not a duplicate transaction ledger.
- Cutilora subscription invoices remain separate from Clinic patient invoices and collections.
- Employee and Provider operational records remain in the Clinic domain.
- Integration credentials and webhook secrets must never be rendered from stored API responses. Only masked identifiers and one-time creation responses may be shown.
- Audit events are read-only and must redact credentials, tokens, payment secrets and unnecessary clinical data.
- Document content is accessed through backend-authorized signed URLs; private storage paths are never exposed.
- UI guards and hidden controls are UX measures only; backend authorization remains authoritative.

## Integration verification

The frontend is implemented against the agreed Tenant route and payload contracts in `features/contracts/tenant-endpoints.ts` and the feature registry. Backend runtime compatibility must be verified once Hegazy's corresponding endpoints are pushed. This does not block frontend implementation, but successful frontend compilation and API integration testing remain required before release.

## Release checklist

- [ ] Run `npm run build` and resolve TypeScript/lint errors.
- [ ] Run the Tenant route and interaction smoke test in Arabic/English and RTL/LTR.
- [ ] Verify every endpoint against the deployed backend response envelope, enum values and payload contract.
- [ ] Verify authorization failures, validation errors, empty states, loading states and mutation feedback.
- [ ] Verify file upload, signed document access, invoice/report exports and session revocation.
- [ ] Complete responsive checks at desktop, tablet and mobile breakpoints.
