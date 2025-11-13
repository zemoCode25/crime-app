# Crime App — Next.js + Supabase

A crime case management and analytics platform built with Next.js (App Router) and Supabase. It provides user onboarding via invitations, secure authentication, crime case CRUD and mapping, analytics dashboards, and emergency notification workflows.

## Purpose

Enable local government units and authorized personnel to log, analyze, and visualize crime incidents. The app centralizes user accounts, case records, locations, and roles, and supports secure session management across client and server.

## Key Features

- Authentication via Supabase Auth (email/password + Google OAuth)
- Invitation-based onboarding with token validation and profile provisioning
- Role-aware user records stored in Supabase
- Crime case CRUD with multi-step forms and typed queries
- Map-based view and filters for incidents
- Analytics dashboards (charts, date ranges, metrics)
- Emergency notification UIs (email/SMS/push flows)
- Protected routes and session refresh via middleware

## Tech Stack

- Next.js App Router (TypeScript, SSR/RSC, Middleware)
- Supabase (Auth, Postgres, Realtime)
- Shadcn UI component library
- React Query provider and Theme provider
- Mapbox integration for mapping/search

## Supabase Integration Overview

Typed clients are used across server and browser, with cookie-based session persistence and middleware refresh.

- Browser client: `src/server/supabase/client.ts`
  - Creates a typed browser client via `@supabase/ssr` using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Server client: `src/server/supabase/server.ts`
  - Creates a server-side client with `@supabase/ssr` and Next `cookies()` to persist and refresh sessions for SSR and server actions.
- Middleware session refresh: `src/server/supabase/middleware.ts` and `src/middleware.ts`
  - Updates/sets cookies, refreshes sessions, and redirects unauthenticated users to `/login` when needed.
- Auth routes and flows:
  - Code exchange: `src/app/auth/route.ts` exchanges `code` for a session and redirects.
  - Email OTP confirm + invitation provisioning: `src/app/auth/confirm/route.ts` verifies OTP, finalizes user profile from invitation, and marks invitations as consumed.
  - Server actions: `src/server/queries/auth.ts` (login, signup with invitation, Google OAuth, password reset, change password).
- Service role for trusted operations: `src/server/supabase/service-client.ts`
  - Uses `SUPABASE_SERVICE_ROLE_KEY` for backend-only mutations (never expose to the browser).
- Typed database: `src/server/supabase/database.types.ts`
  - Generated types for tables and enums; used by clients and queries.
- Invitations: `src/server/queries/invitation.ts`
  - Create/update invitations, hash/validate tokens, and lookup active invitations by email.

## Environment Variables

Create a `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Notes:

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Ensure Supabase Auth redirect URLs include your site URL.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up `.env.local` as above.
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000

Optional (Supabase CLI): Local config lives at `supabase/config.toml`. You can run local services and preview emails with Inbucket if you choose to use the CLI.

## Folder Structure

High-level directories and their purpose:

- `src/app`
  - App Router routes, layouts, and pages.
  - Auth flows under `src/app/(auth)` (login, signup, check-email, request/change password).
  - Main application areas under `src/app/(main)` (dashboard, analytics, crime cases, map, emergency, settings, manage-accounts).
  - Auth handlers:
    - `src/app/auth/route.ts`: Auth code exchange handler.
    - `src/app/auth/confirm/route.ts`: Email OTP verification + invitation provisioning.
  - Global layout and styles: `src/app/layout.tsx`, `src/app/globals.css`.

- `src/server`
  - Server-side logic.
  - Supabase clients and types: `src/server/supabase/*` (browser/server/service clients, middleware, database types).
  - Queries and domain helpers: `src/server/queries/*` (auth, users, crime, invitation).
  - Server actions used by forms/components: `src/server/actions/*`.

- `src/middleware.ts`
  - Next.js middleware entry that delegates to Supabase middleware to update sessions and protect routes.

- `src/components`
  - Reusable UI components.
  - Shadcn UI primitives under `src/components/ui/*` and small utility components under `src/components/utils/*`.
  - Feature-specific components co-located under their route folders within `src/app`.

- `src/providers`
  - App-level providers (ThemeProvider, QueryProvider).

- `src/context`
  - React context for shared state (e.g., crime type provider).

- `src/hooks`
  - Custom hooks, e.g., crime case data hooks, mobile detection, Mapbox search.

- `src/constants`
  - Domain and UI constants (crime case enums, personal info fields, etc.).

- `src/lib`
  - Shared utilities used across client/server code.

- `src/types`
  - Shared TypeScript types and Supabase client typings.

- `public`
  - Static assets (images, icons).

- `supabase`
  - Supabase local development config and seed files.

- Root configs
  - `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `components.json`.

## Deployment

- Deploy the Next.js app (e.g., Vercel) and connect to your hosted Supabase project.
- Set the same environment variables in your hosting platform.
- In Supabase Auth settings, add allowed redirect URLs that match `NEXT_PUBLIC_SITE_URL`.

## Security Notes

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only; never expose it to the browser or public repos.
- Middleware ensures session consistency; avoid adding logic between client creation and `auth.getUser()` that could interfere with cookie handling.

---

For database schema changes, re-generate `database.types.ts` and keep client imports typed. If you want more setup automation or scripts, open an issue or PR.
