# Portfolio

Personal portfolio of a senior software engineer, in English and French, with an admin panel that manages every piece of content.

Stack: Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS 4, MongoDB with Mongoose, Cloudinary, Three.js with React Three Fiber, Motion.

## What is inside

Public site, under `/en` and `/fr` (the visitor's language is detected on the first visit, then remembered):

- **Home**: hero with an interactive 3D graph of the skills, about, skills by category, experience timeline, selected projects, call to action (book a call, write a message, download the CV).
- **Projects**: every published project, filterable by technology.
- **Project details**: title, description, gallery of up to 10 images with a full-screen viewer, tags, links, similar projects (ranked by shared tags).
- **Contact**: Cal.com booking embed and a contact form that lands in the admin inbox.

Admin panel at `/admin`:

- **Dashboard**: page views, unique visitors, CV downloads, messages, views per day, most visited pages, visitor countries, referrers, over 7, 30 or 90 days.
- **Messages** from the contact form, with read state, reply by email and delete.
- **Profile, skills, experiences, projects**: every field in both languages, image and CV uploads straight to Cloudinary.
- **History**: every save creates a version (50 kept per item). Any version can be restored, including deleted items; a restore is itself a new version, so nothing is lost.

## Run it locally

Requirements: Node 20+, pnpm, a MongoDB database (local or Atlas).

```bash
pnpm install
cp .env.example .env.local
```

Fill `.env.local`:

| Variable | What to put |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `NEXT_PUBLIC_SITE_URL` | Public URL, used for metadata and the sitemap |
| `ADMIN_EMAIL` | Email used to sign in to `/admin` |
| `ADMIN_PASSWORD_HASH` | Output of `pnpm admin:hash "your password"` |
| `SESSION_SECRET` | Random string of 32+ characters, for example `openssl rand -hex 32` |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | From Cloudinary, Settings > API Keys |

A local MongoDB with Docker:

```bash
docker run -d --name portfolio-mongo -p 27017:27017 mongo:8
```

Then fill the database with sample content and start the app:

```bash
pnpm seed
pnpm dev
```

The seed only fills empty collections; `pnpm seed --force` replaces all content (messages and analytics are kept). All seeded entries are placeholders to edit from `/admin`.

## Notes

- **Caching.** Public pages are prerendered and cached (`"use cache"` tagged `content`). Every admin save calls `updateTag("content")`, so changes show up on the next visit. `pnpm build` reads the database, so `MONGODB_URI` must be set at build time.
- **Analytics.** No cookie and no third party. Each page view stores the path, language, country and a visitor id that is a daily-rotating hash of IP and user agent; raw IPs are never stored. The country comes from the host's edge header (`x-vercel-ip-country` on Vercel, `cf-ipcountry` on Cloudflare), so it shows as unknown in local development.
- **CV downloads.** The CV button points to `/api/cv`, which counts the download and redirects to the file. On free Cloudinary accounts, PDF delivery is off by default: enable "Allow delivery of PDF and ZIP files" in Settings > Security.
- **Booking.** Set your Cal.com link (for example `gloire/30min`) in Admin > Profile. Without it, the contact page shows the form only.
- **Images.** Removing an image from a project does not delete it from Cloudinary, so older versions in the history can still be restored with their images.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm typecheck` | TypeScript check |
| `pnpm seed` | Sample content |
| `pnpm admin:hash "password"` | Hash for `ADMIN_PASSWORD_HASH` |

## Deploy

Vercel is the shortest path: import the repository, add the environment variables above, deploy. Country detection works out of the box there. Any Node host works too; put it behind Cloudflare to get the country header.
