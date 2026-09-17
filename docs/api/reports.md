# Reports API

## Public Endpoints

### GET /api/v1/reports

Get published (verified) reports for the map. Only returns `status: "verified"` reports.

**Authentication:** None required

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 50 | Max items to return (max 100) |
| offset | number | 0 | Number of items to skip |
| status | string | "verified" | Filter by status (typically use default) |
| category | string | - | Filter by category ID |
| problemType | string | - | Filter by problem type ID |
| severity | string | - | Filter by severity (low, medium, high, critical) |
| barangay | string | - | Filter by barangay name |
| bbox | string | - | Bounding box: `west,south,east,north` (e.g., `123.9,7.8,124.0,7.9`) |

### Response

```json
{
  "data": [
    {
      "id": "abcd1234efgh",
      "title": "Large pothole on main road",
      "description": "Dangerous pothole near the market",
      "latitude": 8.2464,
      "longitude": 124.4365,
      "address": "123 Main Street",
      "barangay": "Poblacion",
      "severity": "high",
      "status": "verified",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "publishedAt": "2024-01-15T12:00:00.000Z",
      "category": {
        "id": "cat123",
        "name": "Roads & Infrastructure",
        "color": "#ef4444"
      },
      "problemType": {
        "id": "pt456",
        "name": "Pothole"
      }
    }
  ],
  "meta": {
    "total": 45,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

---

### GET /api/v1/reports/:publicId

Get a single public report. Only returns verified reports.

**Authentication:** None required

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| publicId | string | Report's public ID |

### Response

```json
{
  "data": {
    "id": "abcd1234efgh",
    "title": "Large pothole on main road",
    "description": "Dangerous pothole near the market",
    "latitude": 8.2464,
    "longitude": 124.4365,
    "address": "123 Main Street",
    "barangay": "Poblacion",
    "severity": "high",
    "status": "verified",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z",
    "publishedAt": "2024-01-15T12:00:00.000Z",
    "category": {
      "id": "cat123",
      "name": "Roads & Infrastructure",
      "color": "#ef4444"
    },
    "problemType": {
      "id": "pt456",
      "name": "Pothole"
    }
  }
}
```

### Errors

- **404 Not Found** — Report doesn't exist or isn't verified
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Report not found"
  }
}
```

---

## Citizen Endpoints (Authenticated)

### POST /api/v1/reports

Submit a new report.

**Authentication:** Required (session cookie)

### Request Body

```json
{
  "categoryId": "cat123",
  "problemTypeId": "pt456",
  "title": "Large pothole on main road",
  "description": "Dangerous pothole near the market that has been there for weeks",
  "latitude": 8.2464,
  "longitude": 124.4365,
  "address": "123 Main Street",
  "barangay": "Poblacion",
  "severity": "high"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| categoryId | string | Yes | Category ID |
| problemTypeId | string | Yes | Problem type ID |
| title | string | Yes | Report title (max 200 chars) |
| description | string | Yes | Detailed description |
| latitude | number | Yes | Latitude (-90 to 90) |
| longitude | number | Yes | Longitude (-180 to 180) |
| address | string | No | Street address |
| barangay | string | No | Barangay name |
| severity | string | No | One of: low, medium, high, critical (default: medium) |

### Response (201 Created)

```json
{
  "data": {
    "id": "newReportId123",
    "title": "Large pothole on main road",
    "description": "Dangerous pothole near the market that has been there for weeks",
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
}
```

### Errors

- **400 Validation Error** — Missing required fields or invalid data
- **401 Unauthorized** — Not logged in

---

### GET /api/v1/me/reports

Get the authenticated user's reports (all statuses).

**Authentication:** Required

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 20 | Max items (max 100) |
| offset | number | 0 | Items to skip |

### Response

```json
{
  "data": [
    {
      "id": "report123",
      "title": "My first report",
      "description": "...",
      "latitude": 8.2464,
      "longitude": 124.4365,
      "severity": "medium",
      "status": "submitted",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "publishedAt": null,
      "category": {
        "id": "cat123",
        "name": "Roads & Infrastructure",
        "color": "#ef4444"
      },
      "problemType": {
        "id": "pt456",
        "name": "Pothole"
      }
    },
    {
      "id": "report456",
      "title": "Another report",
      "description": "...",
      "latitude": 8.2500,
      "longitude": 124.4400,
      "severity": "low",
      "status": "verified",
      "createdAt": "2024-01-10T08:00:00.000Z",
      "publishedAt": "2024-01-10T09:00:00.000Z",
      "category": {
        "id": "cat789",
        "name": "Waste Management",
        "color": "#22c55e"
      },
      "problemType": {
        "id": "pt000",
        "name": "Uncollected Garbage"
      }
    }
  ],
  "meta": {
    "total": 2,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

---

### GET /api/v1/me/reports/:publicId

Get one of your own reports.

**Authentication:** Required

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| publicId | string | Report ID |

### Response

```json
{
  "data": {
    "id": "report123",
    "title": "My first report",
    "description": "...",
    "latitude": 8.2464,
    "longitude": 124.4365,
    "address": "123 Main Street",
    "barangay": "Poblacion",
    "severity": "medium",
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
    }
  }
}
```

### Errors

- **404 Not Found** — Report doesn't exist or isn't yours

---

### PATCH /api/v1/me/reports/:publicId

Edit your own report. Only allowed while status is "submitted".

**Authentication:** Required

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| publicId | string | Report ID |

### Request Body

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "latitude": 8.2500,
  "longitude": 124.4400,
  "severity": "high"
}
```

Only provided fields will be updated. All fields are optional.

### Response

```json
{
  "data": {
    "id": "report123",
    "title": "Updated title",
    "description": "Updated description",
    "latitude": 8.2500,
    "longitude": 124.4400,
    "severity": "high",
    "status": "submitted",
    "updatedAt": "2024-01-15T14:00:00.000Z"
  }
}
```

### Errors

- **400 Not Editable** — Report status is not "submitted"
- **400 Validation Error** — Invalid data
- **404 Not Found** — Report doesn't exist or isn't yours

---

### DELETE /api/v1/me/reports/:publicId

Withdraw (delete) your own report. Only allowed while status is "submitted".

**Authentication:** Required

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| publicId | string | Report ID |

### Response

```json
{
  "data": {
    "message": "Report withdrawn successfully"
  }
}
```

### Errors

- **400 Not Deletable** — Report status is not "submitted"
- **404 Not Found** — Report doesn't exist or isn't yours