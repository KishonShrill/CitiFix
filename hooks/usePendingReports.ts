"use client";

import { useState, useEffect, useCallback } from "react";
import { getPendingReports, removeSyncedReport } from "@/lib/offline/report-queue";
import type { PendingReport } from "@/lib/offline/db";
import { subscribeSyncStatus } from "@/lib/offline/sync-manager";

export function usePendingReports() {
    const [pendingReports, setPendingReports] = useState<PendingReport[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const loadReports = useCallback(async () => {
        try {
            const reports = await getPendingReports();
            setPendingReports(reports);
        } catch (error) {
            console.error("Failed to load pending reports from IndexedDB:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadReports();

        const unsubscribe = subscribeSyncStatus(() => {
            loadReports();
        });

        return () => {
            unsubscribe();
        };
    }, [loadReports]);

    const deletePendingReport = async (clientId: string) => {
        try {
            await removeSyncedReport(clientId);
            await loadReports();
        } catch (error) {
            console.error("Failed to delete pending report:", error);
        }
    };

    return {
        pendingReports,
        isLoading,
        refreshPendingReports: loadReports,
        deletePendingReport,
    };
}
