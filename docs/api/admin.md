# Admin API

Moderation and administration endpoints. Require `moderator` or `admin` role.

---

## GET /api/v1/admin/reports

Get reports in the moderation queue.

**Authentication:** Required (moderator or admin)

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 30 | Max items (max 100) |
| offset | number | 0 | Items to skip |
| status | string | "submitted" | Filter by status |

Typical usage: fetch `?status=submitted` to get pending reports.

### Response

```json
{
  "data": [
    {
      "id": "report123",
      "userId": "user456",
      "title": "Large pothole on main road",
      "description": "Dangerous pothole near the market",
      "latitude": 8.2464,
      "longitude": 124.4365,
      "address": "123 Main Street",
      "barangay": "Poblacion",
      "severity": "high",
      "status": "submitted",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "category": {
        "id": "cat123",
        "name": "Roads & Infrastructure"
      },
      "problemType": {
        "id": "pt456",
        "name": "Pothole"
      }
    }
  ],
  "meta": {
    "total": 5,
    "limit": 30,
    "offset": 0,
    "hasMore": false
  }
}
```

### Errors

- **401 Unauthorized** — Not logged in
- **403 Forbidden** — User is not a moderator or admin

---

## GET /api/v1/admin/reports/:id

Get full report details for moderation (includes media).

**Authentication:** Required (moderator or admin)

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Report ID (internal ID, same as publicId) |

### Response

```json
{
  "data": {
    "id": "report123",
    "userId": "user456",
    "title": "Large pothole on main road",
    "description": "Dangerous pothole near the market that has been there for weeks",
    "latitude": 8.2464,
    "longitude": 124.4365,
    "address": "123 Main Street",
    "barangay": "Poblacion",
    "severity": "high",
    "status": "submitted",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "publishedAt": null,
    "category": {
      "id": "cat123",
      "name": "Roads & Infrastructure",
      "color": "#ef4444"
    },
    "problemType": {
      "id": "pt456",
      "name": "Pothole"
    },
    "media": [
      {
        "id": "media123",
        "reportId": "report123",
        "url": "https://res.cloudinary.com/...",
        "cloudinaryPublicId": "cityfix/reports/abc123",
        "displayOrder": 0,
        "createdAt": "2024-01-15T10:35:00.000Z"
      }
    ]
  }
}
```

### Errors

- **401 Unauthorized** — Not logged in
- **403 Forbidden** — User is not a moderator or admin
- **404 Not Found** — Report doesn't exist

---

## POST /api/v1/admin/reports/:id/review

Move a report to "under review" status.

**Authentication:** Required (moderator or admin)

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Report ID |

### Request Body

None required.

### Response

```json
{
  "data": {
    "id": "report123",
    "status": "under_review",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### Errors

- **400 Invalid Status** — Report is not in "submitted" status

---

## POST /api/v1/admin/reports/:id/verify

Verify and publish a report. Sets `status: "verified"` and `publishedAt`.

**Authentication:** Required (moderator or admin)

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Report ID |

### Request Body

None required.

### Response

```json
{
  "data": {
    "id": "report123",
    "status": "verified",
    "publishedAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### Errors

- **400 Invalid Status** — Report must be in "submitted" or "under_review" status

---

## POST /api/v1/admin/reports/:id/reject

Reject a report. Requires a reason.

**Authentication:** Required (moderator or admin)

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Report ID |

### Request Body

```json
{
  "reason": "Report does not describe a valid infrastructure issue"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | string | Yes | Rejection reason |

### Response

```json
{
  "data": {
    "id": "report123",
    "status": "rejected",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### Errors

- **400 Validation Error** — Reason is required

---

## POST /api/v1/admin/reports/:id/duplicate

Mark a report as a duplicate.

**Authentication:** Required (moderator or admin)

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Report ID |

### Request Body

```json
{
  "duplicateOfId": "originalReport123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| duplicateOfId | string | No | ID of the original report (if known) |

### Response

```json
{
  "data": {
    "id": "report123",
    "status": "duplicate",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

## POST /api/v1/admin/reports/:id/status

Generic status change endpoint.

**Authentication:** Required (moderator or admin)

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Report ID |

### Request Body

```json
{
  "status": "resolved",
  "reason": "Issue has been fixed"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | New status |
| reason | string | No | Optional reason/note |

### Valid Statuses

- submitted
- under_review
- verified
- rejected
- duplicate
- resolved
- hidden

### Response

```json
{
  "data": {
    "id": "report123",
    "status": "resolved",
    "publishedAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T14:00:00.000Z"
  }
}
```

### Errors

- **400 Validation Error** — Invalid status value
- **400 No Change** — Report is already in the target status