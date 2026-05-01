# Lectio — Bible Reading Tracker

A quiet record of chapters read, from Genesis through Revelation. Track your progress through the Protestant 66-book canon, maintain reading streaks, and compare with friends.

## Stack

- **Next.js 16** · App Router · Server Components
- **TypeScript** strict mode
- **Tailwind CSS v4**
- **Supabase** — Postgres + Auth + RLS
- **TanStack Query** — reactive client-side data
- **Recharts** — progress charts
- **React Hook Form + Zod** — validated forms

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a project, then copy your credentials.

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the database migration

In your Supabase dashboard → SQL Editor, paste and run the contents of:

```
supabase/migrations/001_initial.sql
```

This creates the `profiles`, `reading_entries`, and `friendships` tables with RLS policies.

### 5. Enable Google OAuth (optional)

In Supabase dashboard → Authentication → Providers → Google, enable Google and add your OAuth credentials. Set the redirect URL to `https://your-domain/auth/callback`.

### 6. Regenerate TypeScript types (after schema changes)

```bash
pnpm db:types
```

Requires the Supabase CLI: `npm install -g supabase`.

### 7. Run dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript check |
| `pnpm test` | Run Vitest unit tests |
| `pnpm db:types` | Regenerate Supabase types |

## Deploy

Deploy to Vercel. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your Vercel project environment variables.
