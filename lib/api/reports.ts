// API client for reports and taxonomy endpoints

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface ProblemType {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
}

export interface ReportMedia {
  id: string;
  reportId: string;
  url: string;
  publicId: string;
}

export interface Report {
  id: string;
  publicId: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  categoryId: string;
  problemTypeId: string;
  status: "submitted" | "under_review" | "verified" | "rejected" | "duplicate";
  severity?: "low" | "medium" | "high";
  barangay?: string;
  userId?: string;
  submittedAt: string;
  publishedAt?: string;
  media?: ReportMedia[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface SuccessResponse<T> {
  data: T;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

const API_BASE = "/api/v1";

// Categories
export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  const json = (await res.json()) as SuccessResponse<Category[]>;
  return json.data;
}

export async function getCategory(id: string): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories/${id}`);
  if (!res.ok) throw new Error("Failed to fetch category");
  const json = (await res.json()) as SuccessResponse<Category>;
  return json.data;
}

// Problem Types
export async function getProblemTypes(): Promise<ProblemType[]> {
  const res = await fetch(`${API_BASE}/problem-types`);
  if (!res.ok) throw new Error("Failed to fetch problem types");
  const json = (await res.json()) as SuccessResponse<ProblemType[]>;
  return json.data;
}

export async function getCategoryProblemTypes(categoryId: string): Promise<ProblemType[]> {
  const res = await fetch(`${API_BASE}/categories/${categoryId}/problem-types`);
  if (!res.ok) throw new Error("Failed to fetch problem types for category");
  const json = (await res.json()) as SuccessResponse<ProblemType[]>;
  return json.data;
}

// Reports - Public
export interface ReportsFilterParams {
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
  categoryId?: string;
  severity?: string;
  barangay?: string;
  limit?: number;
  offset?: number;
}

export async function getReports(params?: ReportsFilterParams): Promise<PaginatedResponse<Report>> {
  const query = new URLSearchParams();
  if (params?.minLat) query.append("minLat", params.minLat.toString());
  if (params?.maxLat) query.append("maxLat", params.maxLat.toString());
  if (params?.minLng) query.append("minLng", params.minLng.toString());
  if (params?.maxLng) query.append("maxLng", params.maxLng.toString());
  if (params?.categoryId) query.append("categoryId", params.categoryId);
  if (params?.severity) query.append("severity", params.severity);
  if (params?.barangay) query.append("barangay", params.barangay);
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.offset) query.append("offset", params.offset.toString());

  const res = await fetch(`${API_BASE}/reports?${query}`);
  if (!res.ok) throw new Error("Failed to fetch reports");
  const json = (await res.json()) as SuccessResponse<PaginatedResponse<Report>["data"]> & {
    meta: PaginatedResponse<Report>["meta"];
  };
  return {
    data: json.data,
    meta: json.meta,
  };
}

export async function getReport(publicId: string): Promise<Report> {
  const res = await fetch(`${API_BASE}/reports/${publicId}`);
  if (!res.ok) throw new Error("Failed to fetch report");
  const json = (await res.json()) as SuccessResponse<Report>;
  return json.data;
}

// Reports - User
export async function getUserReports(params?: Omit<ReportsFilterParams, "minLat" | "maxLat" | "minLng" | "maxLng">): Promise<PaginatedResponse<Report>> {
  const query = new URLSearchParams();
  if (params?.categoryId) query.append("categoryId", params.categoryId);
  if (params?.severity) query.append("severity", params.severity);
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.offset) query.append("offset", params.offset.toString());

  const res = await fetch(`${API_BASE}/me/reports?${query}`);
  if (!res.ok) throw new Error("Failed to fetch user reports");
  const json = (await res.json()) as SuccessResponse<PaginatedResponse<Report>["data"]> & {
    meta: PaginatedResponse<Report>["meta"];
  };
  return {
    data: json.data,
    meta: json.meta,
  };
}

export async function getUserReport(publicId: string): Promise<Report> {
  const res = await fetch(`${API_BASE}/me/reports/${publicId}`);
  if (!res.ok) throw new Error("Failed to fetch user report");
  const json = (await res.json()) as SuccessResponse<Report>;
  return json.data;
}

export interface CreateReportInput {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  categoryId: string;
  problemTypeId: string;
  severity?: "low" | "medium" | "high";
  barangay?: string;
}

export async function createReport(data: CreateReportInput): Promise<Report> {
  const res = await fetch(`${API_BASE}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json()) as ErrorResponse;
    throw new Error(err.error.message || "Failed to create report");
  }
  const json = (await res.json()) as SuccessResponse<Report>;
  return json.data;
}

export async function updateReport(publicId: string, data: Partial<CreateReportInput>): Promise<Report> {
  const res = await fetch(`${API_BASE}/me/reports/${publicId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json()) as ErrorResponse;
    throw new Error(err.error.message || "Failed to update report");
  }
  const json = (await res.json()) as SuccessResponse<Report>;
  return json.data;
}

export async function deleteReport(publicId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/me/reports/${publicId}`, { method: "DELETE" });
  if (!res.ok) {
    const err = (await res.json()) as ErrorResponse;
    throw new Error(err.error.message || "Failed to delete report");
  }
}

// Media
export async function getUploadSignature(publicId: string): Promise<{
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
}> {
  const res = await fetch(`${API_BASE}/reports/${publicId}/media/upload-signature`);
  if (!res.ok) throw new Error("Failed to get upload signature");
  const json = (await res.json()) as SuccessResponse<{
    signature: string;
    timestamp: number;
    cloudName: string;
    apiKey: string;
  }>;
  return json.data;
}

export async function registerMedia(publicId: string, cloudinaryPublicId: string, url: string): Promise<ReportMedia> {
  const res = await fetch(`${API_BASE}/reports/${publicId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicId: cloudinaryPublicId, url }),
  });
  if (!res.ok) throw new Error("Failed to register media");
  const json = (await res.json()) as SuccessResponse<ReportMedia>;
  return json.data;
}

export async function getReportMedia(publicId: string): Promise<ReportMedia[]> {
  const res = await fetch(`${API_BASE}/reports/${publicId}/media`);
  if (!res.ok) throw new Error("Failed to fetch media");
  const json = (await res.json()) as SuccessResponse<ReportMedia[]>;
  return json.data;
}

export async function deleteMedia(publicId: string, mediaId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/reports/${publicId}/media/${mediaId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete media");
}
