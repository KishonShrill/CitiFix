# Media API

Image upload flow using Cloudinary. The browser uploads directly to Cloudinary (server provides signed authorization), then registers the media with the report.

---

## POST /api/v1/reports/:publicId/media/upload-signature

Get a signed authorization for direct Cloudinary upload from the browser.

**Authentication:** Required

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| publicId | string | Report ID |

### Response

```json
{
  "data": {
    "signature": "abc123def456...",
    "timestamp": 1705312200,
    "cloudName": "my-cloud",
    "apiKey": "123456789012345",
    "folder": "cityfix/reports/abc123xyz"
  }
}
```

### Frontend Usage

```javascript
// Upload to Cloudinary using the signature
const formData = new FormData();
formData.append('file', imageFile);
formData.append('api_key', response.apiKey);
formData.append('timestamp', response.timestamp);
formData.append('signature', response.signature);
formData.append('folder', response.folder);

const uploadRes = await fetch(
  `https://api.cloudinary.com/v1_1/${response.cloudName}/image/upload`,
  { method: 'POST', body: formData }
);
const { public_id, secure_url } = await uploadRes.json();

// Then register with the report
await fetch(`/api/v1/reports/${publicId}/media`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: secure_url,
    cloudinaryPublicId: public_id
  })
});
```

### Errors

- **401 Unauthorized** — Not logged in

---

## POST /api/v1/reports/:publicId/media

Register an uploaded image with a report.

**Authentication:** Required

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| publicId | string | Report ID |

### Request Body

```json
{
  "url": "https://res.cloudinary.com/my-cloud/image/upload/v1/cityfix/reports/abc123.jpg",
  "cloudinaryPublicId": "cityfix/reports/abc123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| url | string | Yes | Cloudinary secure URL |
| cloudinaryPublicId | string | Yes | Cloudinary public ID |

### Response (201 Created)

```json
{
  "data": {
    "id": "media123abc",
    "reportId": "report456",
    "url": "https://res.cloudinary.com/my-cloud/image/upload/v1/cityfix/reports/abc123.jpg",
    "cloudinaryPublicId": "cityfix/reports/abc123",
    "displayOrder": 0,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Errors

- **400 Validation Error** — Missing url or cloudinaryPublicId
- **401 Unauthorized** — Not logged in
- **403 Forbidden** — Can only add media to your own reports

---

## GET /api/v1/reports/:publicId/media

Get all media attached to a report.

**Authentication:** None required (public reports)

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| publicId | string | Report ID |

### Response

```json
{
  "data": [
    {
      "id": "media123abc",
      "reportId": "report456",
      "url": "https://res.cloudinary.com/my-cloud/image/upload/v1/cityfix/reports/abc123.jpg",
      "cloudinaryPublicId": "cityfix/reports/abc123",
      "displayOrder": 0,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "media456def",
      "reportId": "report456",
      "url": "https://res.cloudinary.com/my-cloud/image/upload/v1/cityfix/reports/def456.jpg",
      "cloudinaryPublicId": "cityfix/reports/def456",
      "displayOrder": 1,
      "createdAt": "2024-01-15T10:31:00.000Z"
    }
  ]
}
```

---

## DELETE /api/v1/reports/:publicId/media/:mediaId

Delete media from a report. Removes from Cloudinary and database.

**Authentication:** Required

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| publicId | string | Report ID |
| mediaId | string | Media ID |

### Response

```json
{
  "data": {
    "success": true,
    "message": "Media deleted"
  }
}
```

### Errors

- **401 Unauthorized** — Not logged in
- **403 Forbidden** — Can only delete media from your own reports
- **404 Not Found** — Report or media not found