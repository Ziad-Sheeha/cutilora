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

Tenant features are organized by domain ownership. Each feature owns its pages, components, forms, hooks, API adapters, schemas and types where applicable. Cross-feature primitives stay in the shared tenant layer; generic metadata-driven modules remain registry-driven only where their workflows are genuinely uniform.

```text
features/
  clinics/
    api/                 # clinic-specific API adapters
    components/          # clinic cards, details, form, metrics
    hooks/               # clinic queries and mutations
    pages/               # clinics directory
    schemas/
    types/
    utils/
    index.ts
  branches/
    api/
    components/          # branch cards, details, form, metrics
    hooks/
    pages/               # branches directory
    schemas/
    types/
    utils/
    index.ts
  organization/
    api/
    components/
    hooks/
    pages/               # organization profile
    schemas/
    types/
    utils/
    index.ts
  branch-operations/
  documents/
  users/
  invitations/
  roles/
  configuration/
  catalog/
  finance/
  subscription/
  integrations/
  insights/
  governance/
  settings/
  shared/                # feature registry, generic contracts and reusable domain primitives
```

- `api/`: tenant-scoped Axios client and cross-feature tenant context endpoints.
- `auth/`: tenant login, membership selection, session lifecycle and route guard.
- `layout/`: Tenant shell, header, context selectors and responsive navigation.
- `components/`: only components shared by multiple Tenant features; feature-only UI belongs inside its feature.
- `features/*/components`: reusable UI scoped to that feature (cards, detail dialogs, forms, metrics and section components).
- `features/*/pages`: route-level screens; pages orchestrate feature hooks and components rather than owning every UI detail.
- `features/shared/`: shared feature metadata, generic schemas and generic API operations. Feature-specific business rules should not be added here.
- `types/`: tenant-wide Tenant, Clinic, Branch, Membership and API envelope contracts.

Phone inputs must use the shared `PhoneNumberField` component. It owns country-code selection and local-number formatting; form adapters normalize submitted values to E.164 (`+<calling-code><national-number>`) and preserve existing international values when editing.

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
