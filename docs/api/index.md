# API Reference

BetterIligan REST API documentation for frontend development.

## Base URL

```
https://your-domain.com/api/v1
```

## Authentication

Most endpoints require authentication via session cookie. Endpoints that require authentication will note it in their description.

## Response Format

All responses follow this structure:

```json
// Success
{
  "data": { ... }
}

// Paginated
{
  "data": [...],
  "meta": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}

// Error
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

## Endpoints

| Category | File | Description |
|----------|------|-------------|
| Taxonomy | [taxonomy.md](taxonomy.md) | Categories and problem types |
| Reports | [reports.md](reports.md) | Report CRUD operations |
| Media | [media.md](media.md) | Image uploads via Cloudinary |
| Admin | [admin.md](admin.md) | Moderation and queue management |
| Audit | [audit-logs.md](audit-logs.md) | System audit trail |

## Common Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |