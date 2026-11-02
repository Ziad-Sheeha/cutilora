# Cutilora Frontend

Frontend foundation for the Cutilora clinic management platform.

## Stack

- React + TypeScript
- Vite
- React Router
- TanStack Query
- Axios (API client to be configured in the next foundation step)
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

## Available scripts

- `npm run dev` — start the local development server
- `npm run typecheck` — run TypeScript project checks
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build

## Project structure

```
src/
  app/          # Application setup and routing
  components/   # Shared and shadcn/ui components
  features/     # Feature-oriented modules (added incrementally)
  hooks/        # Shared React hooks
  lib/          # Shared utilities
  services/     # API and external service clients
  App.tsx
  index.css
  main.tsx
```

## UI components

The repository is configured for shadcn/ui using the New York style, neutral base color, and Lucide icons. Add components with the shadcn CLI when needed.

## Product boundaries

- This repository currently contains the web frontend foundation.
- Patient mobile app implementation is out of scope for the current phase.
- Tenant and clinic authorization must be enforced by the backend; frontend guards are UX controls, not a security boundary.
- Do not place secrets in frontend environment variables.
