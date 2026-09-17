# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BetterIligan is a civic reporting platform for Iligan City. Citizens report infrastructure issues, view them on a map, and track resolution progress. Built on Cloudflare Workers with PostgreSQL.

## Tech Stack

- **Framework**: Vinext (Next.js-compatible, deploys to Cloudflare Workers)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Better-Auth (email/password + Google/GitHub OAuth)
- **Media**: Cloudinary for image uploads

## Common Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Run built worker locally with Wrangler
npm run deploy       # Deploy to Cloudflare

npx drizzle-kit generate   # Generate SQL migration after schema changes
npx drizzle-kit migrate    # Apply migrations
node --import tsx lib/seed.ts   # Seed categories and problem types
```

## Architecture

### Database Schema

Two schema files in `lib/`:
- `auth-schema.ts` — User, session, account, verification tables
- `report-schema.ts` — Category, problemType, report, media, auditLog tables

### API Structure

All routes are under `/app/api/v1/`:

| Path | Description |
|------|-------------|
| `/categories*` | Public taxonomy endpoints |
| `/problem-types` | Public problem types list |
| `/reports` | Public report listing (bbox filtering for map) |
| `/me/reports` | Citizen's own reports (auth required) |
| `/admin/reports` | Moderation queue (moderator+) |
| `/admin/audit-logs` | Audit trail (admin only) |
| `/reports/:id/media` | Cloudinary upload flow |

### Authentication

Uses Better-Auth with session cookies. Protected routes use guards from `app/api/_lib/api-guard.ts`:
- `getCurrentUser(request)` — Returns user or null
- `requireUser(request)` — Throws 401 if not authenticated
- `requireRole(request, ["moderator", "admin"])` — Throws 403 if role insufficient
- `createAuditLog(...)` — Records moderation actions

### Response Helpers

`app/api/_lib/http.ts` provides:
- `sendSuccess(data, status)` — JSON success response
- `sendError(status, code, message)` — JSON error response
- `sendPaginated(data, total, limit, offset)` — Paginated list response
- `parsePagination(url)` — Parse ?limit and ?offset query params

### Report Status Flow

```
submitted → under_review → verified → (resolved)
                       ↘ rejected
                       ↘ duplicate
```

Only `verified` reports appear in public `/api/v1/reports` endpoint.

## Environment Variables

Required in `.env`:
- `DATABASE_URL` — PostgreSQL connection string
- `BETTER_AUTH_SECRET` — Auth secret
- `BETTER_AUTH_URL` — App base URL
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

Optional:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`