# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### QuickSeva (artifacts/quickseva)
- React + Vite web app at `/`
- Local service marketplace for finding providers by PIN code
- Uses localStorage for all data (no backend)
- Features: Provider signup/approval, booking system, user/provider dashboards, admin panel, ratings, earnings

#### Credentials
- Admin login: `admin@quickseva.com` / `admin123`
- Demo providers preloaded (use "Find Services" button)

#### Pages
- `/` — Home with PIN code search and category browse
- `/login` — User/Provider login (tabs)
- `/signup` — User registration
- `/provider-signup` — Provider registration form
- `/book/:id` — Book a specific provider
- `/dashboard` — User dashboard with booking status tracking
- `/provider-dashboard` — Provider dashboard with earnings, job management
- `/admin` — Admin panel to approve/reject providers

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
