import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import * as api from "@/lib/api/reports";

// Categories
export function useCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: api.getCategories,
        gcTime: 1000 * 60 * 5,
        staleTime: 1000 * 60 * 2,
        refetchOnWindowFocus: false,
    });
}

export function useCategory(id: string) {
    return useQuery({
        queryKey: ["category", id],
        queryFn: () => api.getCategory(id),
        gcTime: 1000 * 60 * 5,    // 5 minutes
        staleTime: 1000 * 60 * 2, // 2 minutes
        refetchOnWindowFocus: false,
        enabled: !!id,
    });
}

// Problem Types
export function useProblemTypes() {
    return useQuery({
        queryKey: ["problemTypes"],
        queryFn: api.getProblemTypes,
        gcTime: 1000 * 60 * 5,    // 5 minutes
        staleTime: 1000 * 60 * 2, // 2 minutes
        refetchOnWindowFocus: false,
    });
}

export function useCategoryProblemTypes(categoryId: string) {
    return useQuery({
        queryKey: ["problemTypes", categoryId],
        queryFn: () => api.getCategoryProblemTypes(categoryId),
        gcTime: 1000 * 60 * 5,    // 5 minutes
        staleTime: 1000 * 60 * 2, // 2 minutes
        refetchOnWindowFocus: false,
        enabled: !!categoryId,
    });
}

// Reports - Public
export interface UseReportsParams {
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

export function useReports(params?: UseReportsParams) {
    return useQuery({
        queryKey: ["reports", params],
        queryFn: () => api.getReports(params),
        staleTime: Infinity,
        gcTime: 1000 * 60 * 60, // 1 hour
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        placeholderData: keepPreviousData,
    });
}

export function useReport(publicId: string) {
    return useQuery({
        queryKey: ["report", publicId],
        queryFn: () => api.getReport(publicId),
        enabled: !!publicId,
    });
}

// Reports - User
export function useUserReports(params?: Omit<UseReportsParams, "minLat" | "maxLat" | "minLng" | "maxLng">) {
    return useQuery({
        queryKey: ["userReports", params],
        queryFn: () => api.getUserReports(params),
    });
}

export function useUserReport(publicId: string) {
    return useQuery({
        queryKey: ["userReport", publicId],
        queryFn: () => api.getUserReport(publicId),
        enabled: !!publicId,
    });
}

// Mutations
export function useCreateReport() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.createReport,
        onSuccess: (newReport) => {
            queryClient.setQueriesData<api.PaginatedResponse<api.Report>>(
                { queryKey: ["userReports"] },
                (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        data: [newReport, ...oldData.data],
                        meta: {
                            ...oldData.meta,
                            total: oldData.meta.total + 1,
                        },
                    };
                }
            );

            if (newReport.status === "verified") {
                queryClient.setQueriesData<api.PaginatedResponse<api.Report>>(
                    { queryKey: ["reports"] },
                    (oldData) => {
                        if (!oldData) return oldData;
                        return {
                            ...oldData,
                            data: [newReport, ...oldData.data],
                            meta: {
                                ...oldData.meta,
                                total: oldData.meta.total + 1,
                            },
                        };
                    }
                );
            }
        },
    });
}

export function useUpdateReport() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ publicId, data }: { publicId: string; data: Partial<api.CreateReportInput> }) =>
            api.updateReport(publicId, data),
        onSuccess: (updatedReport, { publicId }) => {
            queryClient.setQueryData(["report", publicId], updatedReport);
            queryClient.setQueryData(["userReport", publicId], updatedReport);

            queryClient.setQueriesData<api.PaginatedResponse<api.Report>>(
                { queryKey: ["reports"] },
                (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        data: oldData.data.map((r) => (r.id === publicId ? { ...r, ...updatedReport } : r)),
                    };
                }
            );

            queryClient.setQueriesData<api.PaginatedResponse<api.Report>>(
                { queryKey: ["userReports"] },
                (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        data: oldData.data.map((r) => (r.id === publicId ? { ...r, ...updatedReport } : r)),
                    };
                }
            );
        },
    });
}

export function useDeleteReport() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.deleteReport,
        onSuccess: (_, publicId) => {
            queryClient.removeQueries({ queryKey: ["report", publicId] });
            queryClient.removeQueries({ queryKey: ["userReport", publicId] });

            queryClient.setQueriesData<api.PaginatedResponse<api.Report>>(
                { queryKey: ["reports"] },
                (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        data: oldData.data.filter((r) => r.id !== publicId),
                        meta: {
                            ...oldData.meta,
                            total: Math.max(0, oldData.meta.total - 1),
                        },
                    };
                }
            );

            queryClient.setQueriesData<api.PaginatedResponse<api.Report>>(
                { queryKey: ["userReports"] },
                (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        data: oldData.data.filter((r) => r.id !== publicId),
                        meta: {
                            ...oldData.meta,
                            total: Math.max(0, oldData.meta.total - 1),
                        },
                    };
                }
            );
        },
    });
}

// Media


export function useReportMedia(publicId: string) {
    return useQuery({
        queryKey: ["reportMedia", publicId],
        queryFn: () => api.getReportMedia(publicId),
        enabled: !!publicId,
    });
}

export function useDeleteMedia() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ publicId, mediaId }: { publicId: string; mediaId: string }) =>
            api.deleteMedia(publicId, mediaId),
        onSuccess: (_, { publicId }) => {
            queryClient.invalidateQueries({ queryKey: ["reportMedia", publicId] });
        },
    });
}

// Admin Mutations
export function useVerifyReport() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.verifyReportAdmin(id),
        onSuccess: (verifiedReport, id) => {
            queryClient.setQueryData(["report", id], verifiedReport);

            queryClient.setQueriesData<api.PaginatedResponse<api.Report>>(
                { queryKey: ["reports"] },
                (oldData) => {
                    if (!oldData) return oldData;
                    const exists = oldData.data.some((r) => r.id === id);
                    const newData = exists
                        ? oldData.data.map((r) => (r.id === id ? verifiedReport : r))
                        : [verifiedReport, ...oldData.data];
                    return {
                        ...oldData,
                        data: newData,
                        meta: {
                            ...oldData.meta,
                            total: exists ? oldData.meta.total : oldData.meta.total + 1,
                        },
                    };
                }
            );

            queryClient.setQueriesData<api.PaginatedResponse<api.Report>>(
                { queryKey: ["adminReports"] },
                (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        data: oldData.data.filter((r) => r.id !== id),
                        meta: {
                            ...oldData.meta,
                            total: Math.max(0, oldData.meta.total - 1),
                        },
                    };
                }
            );
        },
    });
}

export function useRejectReport() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => api.rejectReportAdmin(id, reason),
        onSuccess: (_, { id }) => {
            queryClient.setQueriesData<api.PaginatedResponse<api.Report>>(
                { queryKey: ["reports"] },
                (oldData) => {
                    if (!oldData) return oldData;
                    const exists = oldData.data.some((r) => r.id === id);
                    if (!exists) return oldData;
                    return {
                        ...oldData,
                        data: oldData.data.filter((r) => r.id !== id),
                        meta: {
                            ...oldData.meta,
                            total: Math.max(0, oldData.meta.total - 1),
                        },
                    };
                }
            );

            queryClient.setQueriesData<api.PaginatedResponse<api.Report>>(
                { queryKey: ["adminReports"] },
                (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        data: oldData.data.filter((r) => r.id !== id),
                        meta: {
                            ...oldData.meta,
                            total: Math.max(0, oldData.meta.total - 1),
                        },
                    };
                }
            );

            queryClient.setQueryData(["report", id], (old: api.Report | undefined) => {
                if (!old) return old;
                return { ...old, status: "rejected" as const, media: undefined };
            });
        },
    });
}

export function useDuplicateReport() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, duplicateOfId }: { id: string; duplicateOfId?: string }) => api.duplicateReportAdmin(id, duplicateOfId),
        onSuccess: (_, { id }) => {
            queryClient.setQueriesData<api.PaginatedResponse<api.Report>>(
                { queryKey: ["reports"] },
                (oldData) => {
                    if (!oldData) return oldData;
                    const exists = oldData.data.some((r) => r.id === id);
                    if (!exists) return oldData;
                    return {
                        ...oldData,
                        data: oldData.data.filter((r) => r.id !== id),
                        meta: {
                            ...oldData.meta,
                            total: Math.max(0, oldData.meta.total - 1),
                        },
                    };
                }
            );

            queryClient.setQueriesData<api.PaginatedResponse<api.Report>>(
                { queryKey: ["adminReports"] },
                (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        data: oldData.data.filter((r) => r.id !== id),
                        meta: {
                            ...oldData.meta,
                            total: Math.max(0, oldData.meta.total - 1),
                        },
                    };
                }
            );

            queryClient.setQueryData(["report", id], (old: api.Report | undefined) => {
                if (!old) return old;
                return { ...old, status: "duplicate" as const };
            });
        },
    });
}

export function useDeleteReportAdmin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.deleteReportAdmin(id),
        onSuccess: (_, id) => {
            queryClient.removeQueries({ queryKey: ["report", id] });
            queryClient.removeQueries({ queryKey: ["userReport", id] });

            queryClient.setQueriesData<api.PaginatedResponse<api.Report>>(
                { queryKey: ["reports"] },
                (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        data: oldData.data.filter((r) => r.id !== id),
                        meta: {
                            ...oldData.meta,
                            total: Math.max(0, oldData.meta.total - 1),
                        },
                    };
                }
            );

            queryClient.setQueriesData<api.PaginatedResponse<api.Report>>(
                { queryKey: ["adminReports"] },
                (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        data: oldData.data.filter((r) => r.id !== id),
                        meta: {
                            ...oldData.meta,
                            total: Math.max(0, oldData.meta.total - 1),
                        },
                    };
                }
            );

            queryClient.setQueriesData<api.PaginatedResponse<api.Report>>(
                { queryKey: ["userReports"] },
                (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        data: oldData.data.filter((r) => r.id !== id),
                        meta: {
                            ...oldData.meta,
                            total: Math.max(0, oldData.meta.total - 1),
                        },
                    };
                }
            );
        },
    });
}

export function useAdminReports(params?: { status?: string, limit?: number, offset?: number }) {
    return useQuery({
        queryKey: ["adminReports", params],
        queryFn: () => api.getAdminReports(params),
    });
}
