# Taxonomy API

Public endpoints for categories and problem types. No authentication required.

---

## GET /api/v1/categories

Get all active report categories.

### Query Parameters

None.

### Response

```json
{
  "data": [
    {
      "id": "V1StGXR8_Z",
      "name": "Roads & Infrastructure",
      "description": "Potholes, damaged roads, broken sidewalks, bridges",
      "color": "#ef4444",
      "icon": "Construction",
      "active": true,
      "displayOrder": 1,
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    },
    {
      "id": "abcd1234efgh",
      "name": "Water & Sanitation",
      "description": "Water supply issues, leaks, sewage problems",
      "color": "#3b82f6",
      "icon": "Droplet",
      "active": true,
      "displayOrder": 2,
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

---

## GET /api/v1/categories/:id

Get a single category by ID.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Category ID |

### Response

```json
{
  "data": {
    "id": "V1StGXR8_Z",
    "name": "Roads & Infrastructure",
    "description": "Potholes, damaged roads, broken sidewalks, bridges",
    "color": "#ef4444",
    "icon": "Construction",
    "active": true,
    "displayOrder": 1,
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
}
```

### Errors

- **404 Not Found** — Category does not exist
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Category not found"
  }
}
```

---

## GET /api/v1/categories/:id/problem-types

Get all problem types for a specific category.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Category ID |

### Response

```json
{
  "data": [
    {
      "id": "xyz7890123",
      "categoryId": "V1StGXR8_Z",
      "name": "Pothole",
      "description": "Damaged road surface",
      "active": true,
      "displayOrder": 1,
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    },
    {
      "id": "abc4567890",
      "categoryId": "V1StGXR8_Z",
      "name": "Cracked Pavement",
      "description": "Cracks in the road or sidewalk",
      "active": true,
      "displayOrder": 2,
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

### Errors

- **404 Not Found** — Category does not exist
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Category not found"
  }
}
```

---

## GET /api/v1/problem-types

Get all active problem types across all categories.

### Query Parameters

None.

### Response

```json
{
  "data": [
    {
      "id": "xyz7890123",
      "categoryId": "V1StGXR8_Z",
      "name": "Pothole",
      "description": "Damaged road surface",
      "active": true,
      "displayOrder": 1,
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    },
    {
      "id": "def2345678",
      "categoryId": "abcd1234efgh",
      "name": "No Water Supply",
      "description": "No water in the area",
      "active": true,
      "displayOrder": 1,
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```