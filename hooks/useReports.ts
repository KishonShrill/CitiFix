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
        enabled: params?.minLat !== undefined && params?.maxLat !== undefined,
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reports"] });
            queryClient.invalidateQueries({ queryKey: ["userReports"] });
        },
    });
}

export function useUpdateReport() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ publicId, data }: { publicId: string; data: Partial<api.CreateReportInput> }) =>
            api.updateReport(publicId, data),
        onSuccess: (_, { publicId }) => {
            queryClient.invalidateQueries({ queryKey: ["report", publicId] });
            queryClient.invalidateQueries({ queryKey: ["userReport", publicId] });
            queryClient.invalidateQueries({ queryKey: ["reports"] });
            queryClient.invalidateQueries({ queryKey: ["userReports"] });
        },
    });
}

export function useDeleteReport() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.deleteReport,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reports"] });
            queryClient.invalidateQueries({ queryKey: ["userReports"] });
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
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["reports"] });
            queryClient.invalidateQueries({ queryKey: ["adminReports"] });
            queryClient.invalidateQueries({ queryKey: ["report", id] });
        },
    });
}

export function useRejectReport() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => api.rejectReportAdmin(id, reason),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["reports"] });
            queryClient.invalidateQueries({ queryKey: ["adminReports"] });
            queryClient.invalidateQueries({ queryKey: ["report", id] });
        },
    });
}

export function useDuplicateReport() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, duplicateOfId }: { id: string; duplicateOfId?: string }) => api.duplicateReportAdmin(id, duplicateOfId),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["reports"] });
            queryClient.invalidateQueries({ queryKey: ["adminReports"] });
            queryClient.invalidateQueries({ queryKey: ["report", id] });
        },
    });
}

export function useAdminReports(params?: { status?: string, limit?: number, offset?: number }) {
    return useQuery({
        queryKey: ["adminReports", params],
        queryFn: () => api.getAdminReports(params),
    });
}
