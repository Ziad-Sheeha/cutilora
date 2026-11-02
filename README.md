# Cutilora Frontend

Frontend foundation for the Cutilora clinic management platform.

## Brand identity

The implementation follows **Cutilora Brand Identity Guidelines v1.0**:

- Primary: `#6C3EF2`; hover: `#5B2FDB`; active: `#4C25BC`; light: `#9B7BFF`
- Accent: `#F472B6` (reserved for restrained highlights)
- Light canvas: `#F6F3FF`; surface: `#FFFFFF`; border: `#E4DDF8`
- Light text: `#0F172A`; muted: `#475569`
- Dark canvas: `#0B1020`; surface: `#141A33`; border: `#262E52`
- Dark text: `#F1F5F9`; muted: `#A5B0C8`
- English typeface: Inter; Arabic typeface: Cairo

Theme is controlled through `data-theme="light|dark"` on the document element. Arabic content should use `lang="ar"` and RTL containers should use `dir="rtl"`. Prefer CSS logical properties for direction-aware layouts.

## Stack

- React + TypeScript + Vite
- React Router
- TanStack Query
- Axios
- Tailwind CSS v4 + shadcn/ui
- React Hook Form + Zod
- Lucide icons

## Requirements

- Node.js 20.19+ or 22.12+
- npm 10+

## Getting started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — local development server
- `npm run typecheck` — TypeScript project checks
- `npm run build` — type-check and production build
- `npm run preview` — preview production build

## Product boundaries

- This repository currently contains the web frontend foundation.
- Patient mobile app implementation is out of scope for the current phase.
- Tenant and clinic authorization must be enforced by the backend; frontend guards are UX controls, not a security boundary.
- Do not place secrets in frontend environment variables.
