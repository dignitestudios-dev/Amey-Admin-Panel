# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev     # Next.js dev server on http://localhost:3000
npm run build   # production build
npm run start   # serve production build
npm run lint    # eslint (flat config, eslint.config.mjs)
```

There is no test runner configured. Verify changes with `npm run lint` and `npm run build` (type-checks).

Optional `.env.local`: `NEXT_PUBLIC_API_BASE_URL` (falls back to `https://api.theameyapp.com/api/v1` in `lib/api/axios.ts`; README/GEMINI.md mention an older IP-based default, which is stale).

## Architecture

Admin panel for the Amey ride app (drivers, rides, users, states, reports, notifications). Next.js 16 App Router, React 19, TypeScript, Tailwind v4, shadcn/ui (`radix-vega` style, `@/` alias to repo root).

### Auth flow (spans several files)
- JWT lives in `localStorage` under `AUTH_TOKEN_KEY` (`lib/api/axios.ts`). `components/providers.tsx` reads it on mount and dispatches `hydrateAuth` to the Redux `auth` slice (`lib/slices/authSlice.ts`), which exposes `isAuthenticated` + `isHydrated`.
- `ProtectedRoute` / `PublicRoute` render nothing until `isHydrated`, then redirect (`/auth/login` ↔ `/dashboard`). Both are client components used in `app/dashboard/layout.tsx` and `app/auth/layout.tsx`.
- The shared Axios instance `API` attaches the Bearer token and, on any 401, clears auth/reset keys and hard-redirects to `/auth/login`.
- Password reset passes state between pages via `RESET_EMAIL_KEY` / `RESET_TOKEN_KEY` in localStorage.

### Data layer
- Redux Toolkit is used **only** for auth. All server data goes through TanStack Query (`lib/react-query.ts`: 60s staleTime, no refetch on focus, no retry on 4xx except 429, mutations never retry).
- `lib/api/*.api.ts` — one file per backend resource; each exports its TS types (e.g. `Driver`, `DriversResponse`, `GetDriversParams`) plus functions that call `API`. Pages/tables call these inside `useQuery`/`useMutation`.
- `lib/constants/states.ts` holds the US-state list used by state filters/tables.

### UI structure
- `app/dashboard/<feature>/page.tsx` with feature-specific tables in a sibling `components/` folder (e.g. `drivers/components/drivers-data-table.tsx`, built on TanStack Table). Detail routes use `[id]` (drivers, users).
- Shared shell: `components/app-sidebar.tsx`, `nav-main.tsx`, `site-header.tsx`, `hooks/use-sidebar-config.ts`, `contexts/sidebar-context.tsx`. `components/ui/` is shadcn-generated — add components with the shadcn CLI rather than hand-writing.
- Theming uses `next-themes` via `components/theme-provider.tsx` (default dark, class strategy) and `theme-toggle.tsx`; `components/animated-background.tsx` is a decorative layer. `contexts/theme-context.ts` is a leftover from an earlier theme approach.
- Charts live in `components/charts-and-graphs/` and follow shadcn chart patterns (Recharts via `components/ui/chart.tsx`).
- Forms: React Hook Form + Zod (v4).
