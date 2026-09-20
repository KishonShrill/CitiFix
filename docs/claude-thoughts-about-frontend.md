# Frontend Plan

## SPA Architecture

This is a single-page application with a persistent map background. Views overlay or slide in on top of the map.

## Frontend Summary

### Pages/Views Needed

| View | Purpose | API Endpoints Used |
|------|---------|-------------------|
| **Home/Map** | Show verified reports on map | `GET /api/v1/reports` (bbox filter) |
| **Submit Report** | Form to create new report | `GET /api/v1/categories`, `GET /api/v1/problem-types`, `POST /api/v1/reports`, media upload |
| **My Reports** | User's own reports dashboard | `GET /api/v1/me/reports`, `PATCH`, `DELETE` |
| **Report Detail** | View single report | `GET /api/v1/reports/:id`, media |
| **Admin Queue** | Moderation dashboard | `GET /api/v1/admin/reports`, all moderation actions |
| **Login/Signup** | Auth pages | Better-Auth (handled) |

### Auth Roles
- `user` — Submit reports, view own
- `moderator` — Can verify/reject/review/duplicate
- `admin` — All above + view audit logs

---

## SPA Components Needed

| Component | Purpose |
|-----------|---------|
| **Map** | Leaflet/Mapbox with report markers + bbox fetching |
| **ReportFormModal** | Submit new report with category picker, geolocation, photo upload |
| **ReportDetailPanel** | Slide-out panel showing report info + media |
| **FilterBar** | Category, severity, barangay filters |
| **UserMenu** | Login/logout, "My Reports" link |
| **UserDashboard** | Modal showing user's reports |
| **AdminPanel** | Moderation queue with approve/reject/duplicate actions |
| **AuthModal** | Sign in / sign up forms |

## Data Flow

1. **On load** → fetch categories, fetch initial reports (bbox of viewport)
2. **Map pan/zoom** → fetch reports for new bbox
3. **Submit report** → POST → optimistic update → refetch
4. **Admin actions** → POST to action endpoints → refetch queue

## API Endpoints Summary

### Taxonomy (public)
- `GET /api/v1/categories`
- `GET /api/v1/categories/:id`
- `GET /api/v1/categories/:id/problem-types`
- `GET /api/v1/problem-types`

### Reports
- `GET /api/v1/reports` — Public verified reports (bbox, filters, pagination)
- `GET /api/v1/reports/:publicId` — Single public report
- `POST /api/v1/reports` — Create report (auth required)
- `GET /api/v1/me/reports` — User's reports (auth)
- `GET /api/v1/me/reports/:publicId` — Single user report
- `PATCH /api/v1/me/reports/:publicId` — Edit (only if submitted)
- `DELETE /api/v1/me/reports/:publicId` — Withdraw (only if submitted)

### Media
- `POST /api/v1/reports/:publicId/media/upload-signature` — Get Cloudinary signature
- `POST /api/v1/reports/:publicId/media` — Register uploaded media
- `GET /api/v1/reports/:publicId/media` — List media
- `DELETE /api/v1/reports/:publicId/media/:mediaId` — Delete media

### Admin (moderator/admin)
- `GET /api/v1/admin/reports` — Queue (filter by status)
- `GET /api/v1/admin/reports/:id` — Full report + media
- `POST /api/v1/admin/reports/:id/review` → under_review
- `POST /api/v1/admin/reports/:id/verify` → verified + publishedAt
- `POST /api/v1/admin/reports/:id/reject` → rejected (requires reason)
- `POST /api/v1/admin/reports/:id/duplicate` → duplicate
- `POST /api/v1/admin/reports/:id/status` → generic status change
- `GET /api/v1/admin/audit-logs` — Admin only

## Response Formats

**Success:**
```json
{ "data": { ... } }
{ "data": [...], "meta": { total, limit, offset, hasMore } }
```

**Error:**
```json
{ "error": { "code": "ERROR_CODE", "message": "Human readable" } }
```

## Common Errors

| Code | Meaning |
|------|---------|
| UNAUTHORIZED | Not logged in |
| FORBIDDEN | Wrong role |
| NOT_FOUND | Resource doesn't exist |
| VALIDATION_ERROR | Bad input data |
| NOT_EDITABLE | Can only edit submitted reports |
| NOT_DELETABLE | Can only delete submitted reports |