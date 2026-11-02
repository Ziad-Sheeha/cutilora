# Cutilora Frontend

Clinic management platform frontend built with React, TypeScript, Vite, React Router, TanStack Query, Axios, and Tailwind CSS v4.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Local development

```bash
npm install
npm run dev
```

## Environment configuration

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to your Laravel API URL. The default frontend API prefix is `/api/v1`.

## Quality checks

```bash
npm run typecheck
npm run build
```

## Application structure

```text
src/
  app/                  # Router and application-level setup
  components/
    layouts/            # Shared page shells (admin portal)
    shared/             # Reusable business-agnostic components
    ui/                 # Low-level design-system primitives
  config/               # Navigation and application configuration
  features/
    dashboard/          # Dashboard-specific pages and components
  hooks/                # Shared React hooks
  lib/                  # Utilities and API infrastructure
  pages/                # Route-level fallback and placeholder pages
  types/                # Shared TypeScript types
```

Feature code should live inside its feature folder. Reusable components belong in `components/shared` or `components/ui`; avoid importing one feature's internals directly into another feature.

## Routes

- `/` — Public landing page
- `/admin` — Clinic admin dashboard preview
- `/admin/appointments`
- `/admin/patients`
- `/admin/team`
- `/admin/settings`

The Admin Login navigation currently opens a **frontend-only preview**. It is not authentication. Do not use sample screens to access real patient data. Authentication, tenant resolution, role/permission enforcement, and live data must be integrated with the Laravel API before production use.

## Brand and localization

Brand tokens are defined in `src/index.css`. Inter is used for Latin text and Cairo for Arabic. The UI foundation is intended to support RTL/LTR; verify every component in both directions before production. Theme tokens support light and dark modes.
