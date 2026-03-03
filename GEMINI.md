# Amey Admin Panel - Project Context

This document provides architectural overview, development standards, and technical context for the Amey Admin Panel.

## Project Overview
The Amey Admin Panel is a comprehensive management dashboard built with **Next.js 16 (App Router)** and **React 19**. It facilitates administrative operations for managing drivers, rides, and users.

### Core Tech Stack
- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/) (Auth) & [TanStack Query v5](https://tanstack.com/query/latest) (Server State)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with PostCSS
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (based on Radix UI)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **API Client:** [Axios](https://axios-http.com/)
- **Charts:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)

## Architecture & Conventions

### Directory Structure
- `app/`: Routing and Page components.
  - `auth/`: Authentication flow (Login, Reset Password, Verification).
  - `dashboard/`: Main application features (Drivers, Rides, Users).
- `components/`: UI components.
  - `ui/`: Base shadcn/ui components.
  - `charts-and-graphs/`: Visualization components.
- `lib/`: Core logic and configurations.
  - `api/`: Axios instances and endpoint-specific services (`auth.api.ts`, `users.api.ts`, etc.).
  - `slices/`: Redux slices (primarily for Auth).
- `hooks/`: Custom React hooks (e.g., `use-sidebar-config`).
- `contexts/`: React Contexts (Theme, Sidebar).

### Authentication Strategy
- **Persistence:** Auth tokens are stored in `localStorage` (`authToken`).
- **Redux State:** Tracks `isAuthenticated` and `isHydrated` to prevent flash of unauthenticated content.
- **Guarding:** 
  - `ProtectedRoute`: Wraps authenticated routes. Redirects to `/auth/login` if not authenticated.
  - `PublicRoute`: Wraps auth pages. Redirects to `/dashboard` if already authenticated.
- **API Interceptors:** `lib/api/axios.ts` automatically attaches the Bearer token to requests and handles `401 Unauthorized` by clearing storage and redirecting to login.

### API Integration
- Centralized Axios instance (`API`) in `lib/api/axios.ts`.
- Environment variable: `NEXT_PUBLIC_API_BASE_URL` (default: `http://18.144.10.94/api/v1`).
- Server state management via TanStack Query for caching and synchronization.

### Styling & UI
- Adheres to shadcn/ui patterns.
- Tailwind CSS 4 utility-first approach.
- Responsive design with a persistent sidebar (managed via `sidebar-context.tsx`).

## Development Workflow

### Key Commands
- **Dev Server:** `npm run dev`
- **Build:** `npm run build`
- **Start Production:** `npm run start`
- **Linting:** `npm run lint`

### Environment Setup
Create a `.env.local` file with the following:
```bash
NEXT_PUBLIC_API_BASE_URL=http://18.144.10.94/api/v1
```

### Coding Standards
- Use **functional components** and **React Hooks**.
- Strict **TypeScript** typing for all props, states, and API responses.
- Define validation schemas using **Zod** alongside React Hook Form.
- Prefer **TanStack Query** for all data fetching and mutations.
- Keep UI components in `components/ui` and feature-specific logic in `app/dashboard/[feature]`.
