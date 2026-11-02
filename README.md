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

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to the hosted Laravel API origin and version prefix (for example, `https://api.example.com/v1`). The API path does not assume an `/api` segment. Never commit the real `.env` file or credentials.

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
    layouts/            # Portal layout shells
    shared/             # Reusable business-agnostic components
    ui/                 # Reusable design-system primitives
  portals/
    clinic/             # Clinic portal pages and authentication UI
    super-admin/        # Platform administration pages and authentication UI
    shared/             # Shared portal-level UI such as the login form
  config/               # Navigation and application configuration
  features/             # Feature modules (currently clinic dashboard preview)
  lib/                  # Utilities and API infrastructure
  pages/                # Route-level fallback and placeholder pages
```

## Routes

- `/` — Public landing page
- `/clinic/login` — Clinic Portal login UI
- `/clinic` — Clinic dashboard preview
- `/clinic/appointments`, `/clinic/patients`, `/clinic/team`, `/clinic/settings` — Clinic module placeholders
- `/super-admin/login` — Separate Cutilora Super Admin login UI
- `/admin/*` — Legacy preview route redirected to `/clinic`

The login screens are **frontend-only UI previews**. They do not authenticate users, issue sessions/tokens, or enforce authorization. The clinic dashboard still uses sample data. Before production, integrate each portal with the agreed Laravel authentication contract and enforce portal access, tenant/clinic scope, roles, and permissions on the server. Do not use sample screens to access real patient data.

## UI system, brand and localization

The project uses Tailwind CSS v4 and shadcn-compatible component conventions, with reusable primitives under `src/components/ui`. Brand tokens are defined in `src/index.css`. Inter is used for Latin text and Cairo for Arabic. Verify RTL/LTR and accessibility behavior on real portal workflows before production. Theme tokens support light and dark modes.
