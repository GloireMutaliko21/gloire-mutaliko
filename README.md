# Portfolio

Personal portfolio of a senior software engineer, in English and French, with an admin panel that manages every piece of content.

Stack: Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS 4, Supabase (Postgres and Storage), Three.js with React Three Fiber, Motion.

## What is inside

Public site, under `/en` and `/fr` (the visitor's language is detected on the first visit, then remembered):

- **Home**: hero with an interactive 3D graph of the skills, about, skills by category, experience timeline, selected projects, call to action (book a call, write a message, download the CV).
- **Projects**: every published project, filterable by technology.
- **Project details**: title, description, gallery of up to 10 images with a full-screen viewer, tags, links, similar projects (ranked by shared tags).
- **Contact**: Cal.com booking embed and a contact form that lands in the admin inbox.

Admin panel at `/admin`:

- **Dashboard**: page views, unique visitors, CV downloads, messages, views per day, most visited pages, visitor countries, referrers, over 7, 30 or 90 days.
- **Messages** from the contact form, with read state, reply by email and delete.
- **Profile, skills, experiences, projects**: every field in both languages, image and CV uploads straight to the Supabase Storage bucket.
- **History**: every save creates a version (50 kept per item). Any version can be restored, including deleted items; a restore is itself a new version, so nothing is lost.

## Run it locally

Requirements: Node 20+, pnpm, Docker and the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started).

```bash
pnpm install
supabase start
```

`supabase start` runs a local Supabase on ports 55321 to 55329 (so it can sit next to other local projects) and applies `supabase/migrations`: tables, the dashboard SQL function and the `portfolio` bucket. It prints the API URL and keys.

```bash
cp .env.example .env.local
```

Fill `.env.local`:

| Variable | What to put |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | API URL (`http://127.0.0.1:55321` locally) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key, used by the browser only to send files to signed upload URLs |
| `SUPABASE_SECRET_KEY` | Secret key, server only |
| `SUPABASE_BUCKET` | Storage bucket, `portfolio` unless you renamed it |
| `NEXT_PUBLIC_SITE_URL` | Public URL, used for metadata and the sitemap |
| `ADMIN_EMAIL` | Email used to sign in to `/admin` |
| `ADMIN_PASSWORD_HASH` | Output of `pnpm admin:hash "your password"` |
| `SESSION_SECRET` | Random string of 32+ characters, for example `openssl rand -hex 32` |

Then fill the database with sample content and start the app:

```bash
pnpm seed
pnpm dev
```

The seed only fills empty tables; `pnpm seed --force` replaces all content (messages and analytics are kept). All seeded entries are placeholders to edit from `/admin`. Supabase Studio runs at http://127.0.0.1:55323.

## Notes

- **Data access.** Every table has row level security on and no policy, so the publishable key cannot read or write anything. The server uses the secret key. The dashboard figures come from one SQL function, `dashboard_stats`, callable only with the secret key.
- **Caching.** Public pages are prerendered and cached (`"use cache"` tagged `content`). Every admin save calls `updateTag("content")`, so changes show up on the next visit. `pnpm build` reads the database, so the Supabase variables must be set at build time.
- **Analytics.** No cookie and no third party. Each page view stores the path, language, country and a visitor id that is a daily-rotating hash of IP and user agent; raw IPs are never stored. The country comes from the host's edge header (`x-vercel-ip-country` on Vercel, `cf-ipcountry` on Cloudflare), so it shows as unknown in local development.
- **Files.** Uploads go from the browser straight to the public `portfolio` bucket through signed upload URLs created by the server (10 MB max, images and PDF only). The CV button points to `/api/cv`, which counts the download and redirects to the file.
- **Booking.** Set your Cal.com link (for example `gloire/30min`) in Admin > Profile. Without it, the contact page shows the form only.
- **Images.** Removing an image from a project does not delete it from the bucket, so older versions in the history can still be restored with their images.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm typecheck` | TypeScript check |
| `pnpm seed` | Sample content |
| `pnpm admin:hash "password"` | Hash for `ADMIN_PASSWORD_HASH` |

## Deploy

1. Create a Supabase project, then push the schema:

   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

2. On Vercel, import the repository, add the environment variables above with the hosted project's URL and keys, and deploy. Country detection works out of the box there. Any Node host works too; put it behind Cloudflare to get the country header.
3. Run `pnpm seed` once against the hosted project if you want the sample content, then edit it from `/admin`.
