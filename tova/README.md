# Tova - Event Guest Manager

## Overview

Tova is a Next.js app for managing events and guest lists with Supabase Auth and Postgres. The UI never talks to Supabase directly; all data access goes through Next.js API routes or Server Actions.

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env.local` file with:
   ```bash
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
   NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
   ```
3. Apply database schema and RLS policies in Supabase:
   - [db/schema.sql](db/schema.sql)
   - [db/rls.sql](db/rls.sql)
4. Run the dev server:
   ```bash
   npm run dev
   ```
5. Configure Supabase Auth redirect URLs:
   - Add `http://localhost:3000/auth/callback` for local development.

## Environment Variables

- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_ANON_KEY`: Supabase anon public key (server-side use only).

## Architecture Decisions

- **App Router** with Server Components for data reads and Server Actions / API routes for writes.
- **Backend-only Supabase access**: client components call Next.js routes/actions, never Supabase SDK.
- **RLS-first security**: all data access relies on Postgres RLS policies for ownership enforcement.
- **Auth flows**: sign-in/sign-up/sign-out go through Next.js API routes.

## Row Level Security (RLS)

- RLS is enabled on `events` and `guests`.
- Users can only SELECT their own events.
- INSERT/UPDATE for guests is restricted to events owned by the authenticated user.
- Policies live in [db/rls.sql](db/rls.sql).

## CSV Import Behavior

- Requires headers `Name` and `Email`.
- Validates email format.
- Returns structured results: `added`, `duplicates`, `invalid`, and `errors`.
- Partial failures are reported, not silently discarded.

## Deployment (Vercel)

Live URL: https://tova-8gkw9us5b-panchoreyashwants-projects.vercel.app/

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in Vercel project settings.
4. Deploy.

## AI Usage

AI was used for scaffolding and iteration. All output was reviewed and corrected.

### Examples of AI Corrections

1. Replaced client-side Supabase access with API routes and server actions to enforce backend-only data access.
2. Fixed CSV import edge cases by enforcing required headers and returning duplicate counts.
