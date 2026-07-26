# AgencyOS

AgencyOS is a white-label operating system for agency project delivery.

## Local setup

1. Copy `.env.example` to `.env.local` and add your Supabase project values.
2. Create a PostgreSQL database (Supabase is supported) and set `DATABASE_URL`.
3. Run `npm.cmd run dev`.

## Data and security foundation

- `prisma/schema.prisma` defines tenant-scoped organizations, memberships, projects, files, revisions, activity, and audit logs.
- Authentication uses Supabase SSR clients with server-side cookies.
- Internal-message inspection blocks emails and Pakistani phone formats before storage.
- Project inputs are validated with Zod and role permissions are centralized in `src/lib/authorization.ts`.

## Database migration on IPv4 networks

Supabase direct database connections are IPv6 by default. If your network uses the Supavisor pooler, apply [`prisma/migrations/202607250001_init/migration.sql`](./prisma/migrations/202607250001_init/migration.sql) in **Supabase Dashboard → SQL Editor**. This creates the tables, indexes, and tenant-isolation RLS policies.

After the SQL completes, run `npx.cmd prisma db pull` to confirm the connection. The secure magic-link sign-in page is available at `/auth`; enable Email authentication in **Supabase Dashboard → Authentication → Providers**.

## First workspace

Apply `prisma/migrations/202607250002_workspace_onboarding/migration.sql` in Supabase SQL Editor, then sign in at `/auth` and create your first agency at `/onboarding`. The creator is assigned the Super Admin role automatically.
