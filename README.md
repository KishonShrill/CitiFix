# BetterIligan

A civic reporting platform for Iligan City that enables citizens to report infrastructure issues, view them on a map, and track resolution progress.

## Tech Stack

- **Frontend**: React with Vinext (Next.js-compatible framework)
- **Backend**: Cloudflare Workers
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better-Auth (email/password + OAuth)
- **Media**: Cloudinary for image uploads
- **Maps**: MapLibre (frontend integration)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Cloudinary account (for media uploads)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your .env with:
# - DATABASE_URL (PostgreSQL connection string)
# - BETTER_AUTH_SECRET (generate a secure secret)
# - BETTER_AUTH_URL (your app URL)
# - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
# - OAuth credentials (optional)
```

### Development

```bash
# Start development server
npm run dev
```

### Build & Deploy

```bash
# Build for production
npm run build

# Run locally with Wrangler
npm run start

# Deploy to Cloudflare
npm run deploy
```

## API Endpoints

### Public

- `GET /api/v1/categories` — List report categories
- `GET /api/v1/problem-types` — List problem types
- `GET /api/v1/reports` — Get published reports (supports bbox filtering)
- `GET /api/v1/reports/:id` — Get single report

### Citizen (Authenticated)

- `POST /api/v1/reports` — Submit a new report
- `GET /api/v1/me/reports` — Get your reports
- `GET /api/v1/me/reports/:id` — Get your report
- `PATCH /api/v1/me/reports/:id` — Edit your report
- `DELETE /api/v1/me/reports/:id` — Withdraw your report

### Media

- `POST /api/v1/reports/:id/media/upload-signature` — Get Cloudinary upload signature
- `POST /api/v1/reports/:id/media` — Register uploaded media
- `DELETE /api/v1/reports/:id/media/:mediaId` — Delete media

### Admin/Moderation

- `GET /api/v1/admin/reports` — Moderation queue
- `POST /api/v1/admin/reports/:id/review` — Move to review
- `POST /api/v1/admin/reports/:id/verify` — Verify & publish
- `POST /api/v1/admin/reports/:id/reject` — Reject report
- `POST /api/v1/admin/reports/:id/duplicate` — Mark as duplicate
- `GET /api/v1/admin/audit-logs` — View audit logs

## Database

```bash
# Generate migrations after schema changes
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate

# Seed initial data
node --import tsx lib/seed.ts
```

## Project Structure

```
├── app/
│   └── api/
│       └── v1/
│           ├── admin/         # Admin endpoints
│           ├── categories/    # Category routes
│           ├── me/            # User-specific routes
│           ├── problem-types/ # Problem type routes
│           └── reports/       # Report routes
├── lib/
│   ├── auth.ts               # Better-Auth configuration
│   ├── auth-schema.ts        # User/auth database schema
│   ├── db.ts                 # Database connection
│   ├── report-schema.ts      # Report data schema
│   └── seed.ts               # Database seeding
├── drizzle/                  # Database migrations
└── wrangler.jsonc            # Cloudflare Workers config
```

## License

MIT