# Audit Logs API

System audit trail for tracking all moderation actions.

**Authentication:** Required (admin only)

---

## GET /api/v1/admin/audit-logs

Get system audit logs.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 50 | Max items (max 100) |
| offset | number | 0 | Items to skip |
| actor | string | - | Filter by user who performed action |
| action | string | - | Filter by action type |
| resourceType | string | - | Filter by resource type (e.g., "report") |
| resourceId | string | - | Filter by specific resource ID |

### Response

```json
{
  "data": [
    {
      "id": "log123",
      "actor": "user456",
      "action": "verify_report",
      "resourceType": "report",
      "resourceId": "report789",
      "changes": {
        "previousStatus": "submitted",
        "newStatus": "verified"
      },
      "metadata": null,
      "createdAt": "2024-01-15T12:00:00.000Z"
    },
    {
      "id": "log124",
      "actor": "user456",
      "action": "reject_report",
      "resourceType": "report",
      "resourceId": "report790",
      "changes": {
        "previousStatus": "submitted",
        "newStatus": "rejected",
        "reason": "Invalid location"
      },
      "metadata": null,
      "createdAt": "2024-01-15T11:30:00.000Z"
    },
    {
      "id": "log125",
      "actor": "system",
      "action": "user_registered",
      "resourceType": "user",
      "resourceId": "user999",
      "changes": null,
      "metadata": {
        "email": "user@example.com"
      },
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| id | string | Audit log entry ID |
| actor | string | User ID who performed the action, or "system" |
| action | string | Action type (e.g., verify_report, reject_report, review_report) |
| resourceType | string | Type of resource (e.g., "report", "user") |
| resourceId | string | ID of the resource |
| changes | object | Before/after state, reason, etc. |
| metadata | object | Additional context |
| createdAt | timestamp | When the action occurred |

### Common Action Types

| Action | Description |
|--------|-------------|
| review_report | Report moved to under_review |
| verify_report | Report verified and published |
| reject_report | Report rejected |
| mark_duplicate | Report marked as duplicate |
| update_status | Generic status change |
| user_registered | New user signup |
| user_role_changed | User role modified |

### Errors

- **401 Unauthorized** — Not logged in
- **403 Forbidden** — User is not an admin