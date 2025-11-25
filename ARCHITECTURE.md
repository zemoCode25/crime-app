# Architecture Overview

This document provides a high-level overview of the Crime App's architecture, including data flow, authentication, and directory structure.

## System Overview

The Crime App is a **Next.js 15** application using the **App Router**. It leverages **Supabase** for backend services (Authentication, Database, Realtime) and **Shadcn UI** for the frontend component library.

### Core Technologies

-   **Frontend**: Next.js (React Server Components + Client Components), Tailwind CSS, Shadcn UI.
-   **Backend**: Supabase (PostgreSQL).
-   **State Management**: TanStack Query (React Query) for server state; React Context for global UI state.
-   **Maps**: Mapbox GL / React Map GL.

## Data Flow

The application uses a mix of Server Actions and Client-side fetching, but primarily leans on **Server Components** for initial data load and **Server Actions** for mutations.

1.  **Server Components (RSC)**:
    -   Fetch data directly from Supabase using the Server Client (`src/server/supabase/server.ts`).
    -   Data is passed down to Client Components as props.
    -   *Benefit*: SEO friendly, faster initial load, secure (no API keys exposed).

2.  **Client Components**:
    -   Use `useSupabaseBrowser()` hook for real-time subscriptions or client-side specific logic.
    -   Use **TanStack Query** to manage caching and re-fetching of data that needs to be dynamic or updated frequently without a full page reload.

3.  **Mutations (Create/Update/Delete)**:
    -   Handled via **Server Actions** (`src/server/actions/*`).
    -   Forms use `react-hook-form` + `zod` for validation.
    -   On submission, a Server Action is called. It validates the input, performs the DB operation via Supabase, and revalidates the Next.js cache (using `revalidatePath`) to update the UI.

## Authentication Flow

Authentication is handled entirely by Supabase Auth, integrated deeply into Next.js middleware and server/client sides.

### 1. Sign Up / Login
-   Users sign up via email/password or OAuth (Google).
-   **Invitations**: The app supports an invitation-only flow where admins invite users. This is handled by a custom table and logic (`src/server/queries/invitation.ts`).

### 2. Session Management
-   **PKCE Flow**: The app uses the Proof Key for Code Exchange (PKCE) flow for secure auth.
-   **Cookies**: Supabase sessions are stored in HTTP-only cookies.
-   **Middleware (`src/middleware.ts`)**:
    -   Runs on every request (except static assets).
    -   Calls `updateSession` (`src/server/supabase/middleware.ts`) to refresh the Auth token if it's expired.
    -   *Crucial*: This ensures the server always has a valid token for SSR.

### 3. Protected Routes
-   Routes are protected via Middleware or per-page checks.
-   If a user is not authenticated, they are redirected to `/login`.

## Directory Structure & Design Decisions

### `src/app`
Follows the Next.js App Router conventions.
-   `(auth)`: Route group for authentication pages (login, signup). Kept separate to have a different layout (e.g., no sidebar).
-   `(main)`: Route group for the main dashboard. Wraps all dashboard pages with the `AppSidebar` and authenticated layout.

### `src/server`
Centralizes all server-side logic.
-   **`supabase/`**: Contains the factory functions for creating Supabase clients.
    -   `client.ts`: Browser client (singleton).
    -   `server.ts`: Server client (uses `cookies()`).
    -   `service-client.ts`: Admin client (uses Service Role Key) - **NEVER** imported in client components.
-   **`actions/`**: Next.js Server Actions. These are the "API endpoints" of the app.
-   **`queries/`**: Reusable database queries. Separating queries from actions allows them to be reused in both RSCs and Server Actions.

### `src/components`
-   **`ui/`**: Shadcn UI primitives (Button, Input, etc.). These are "dumb" components.
-   **Feature Components**: Complex components (e.g., `CrimeMap`, `CaseForm`) are often co-located or placed in `src/components` if reused.

## Key Patterns

### "Server-Only"
We use the `server-only` package (implicitly or explicitly) to ensure sensitive database logic (like `src/server/supabase/service-client.ts`) is never bundled into the client-side JavaScript.

### Typed Database
We generate TypeScript types from the Supabase schema (`database.types.ts`). All Supabase clients are generic over this `Database` type, ensuring full type safety for all DB operations.
