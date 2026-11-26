import { getPendingReports, getReportAttachments, updateReportSyncStatus } from "./report-queue";
import { checkServerReachability } from "./connectivity";

let isSyncing = false;
let syncListeners: ((status: { syncing: boolean; pendingCount: number; error?: string }) => void)[] = [];

export function subscribeSyncStatus(listener: (status: { syncing: boolean; pendingCount: number; error?: string }) => void) {
    syncListeners.push(listener);
    return () => {
        syncListeners = syncListeners.filter((l) => l !== listener);
    };
}

async function notifyListeners(syncing: boolean, error?: string) {
    const pending = await getPendingReports();
    const queuedCount = pending.filter((p) => p.status === "queued" || p.status === "failed").length;
    for (const listener of syncListeners) {
        listener({ syncing, pendingCount: queuedCount, error });
    }
}

export async function syncPendingReports(): Promise<void> {
    if (isSyncing) return;

    const reachable = await checkServerReachability();
    if (!reachable) {
        return;
    }

    const pending = await getPendingReports();
    const actionable = pending.filter((p) => p.status === "queued" || p.status === "failed");

    if (actionable.length === 0) {
        return;
    }

    isSyncing = true;
    await notifyListeners(true);

    try {
        for (const report of actionable) {
            try {
                await updateReportSyncStatus(report.clientId, "syncing");
                await notifyListeners(true);

                const attachments = await getReportAttachments(report.clientId);

                const formData = new FormData();
                formData.append("id", report.clientId);
                formData.append("categoryId", report.categoryId);
                formData.append("problemTypeId", report.problemTypeId);
                formData.append("title", report.title);
                formData.append("description", report.description);
                formData.append("latitude", report.latitude.toString());
                formData.append("longitude", report.longitude.toString());
                formData.append("severity", report.severity);
                if (report.address) formData.append("address", report.address);
                if (report.barangay) formData.append("barangay", report.barangay);

                for (let i = 0; i < attachments.length; i++) {
                    const att = attachments[i];
                    formData.append("files", att.blob, att.fileName);
                }

                const response = await fetch("/api/v1/reports", {
                    method: "POST",
                    body: formData,
                });

                if (response.status === 401 || response.status === 403) {
                    await updateReportSyncStatus(report.clientId, "needs_auth", {
                        lastError: "Authentication required or session expired.",
                    });
                    continue;
                }

                if (!response.ok) {
                    const errData = (await response.json().catch(() => ({}))) as any;
                    const errorMsg = errData.message || `Server error: ${response.status}`;
                    throw new Error(errorMsg);
                }

                const result = (await response.json()) as any;
                const serverId = result.data?.id || "unknown";

                // Successfully submitted and confirmed by server
                await updateReportSyncStatus(report.clientId, "submitted", {
                    serverId,
                    lastError: undefined,
                });

                // Successfully synchronized reports can be kept as submitted or cleaned up
            } catch (error) {
                console.error(`Failed to sync report ${report.clientId}:`, error);
                const errorMsg = error instanceof Error ? error.message : "Synchronization failed";
                await updateReportSyncStatus(report.clientId, "failed", {
                    lastError: errorMsg,
                });
            }
        }
    } finally {
        isSyncing = false;
        await notifyListeners(false);
    }
}

export function initSyncManager() {
    if (typeof window === "undefined") return;

    // Listen to online events
    window.addEventListener("online", () => {
        syncPendingReports();
    });

    // Listen to visibility changes (when user returns to app)
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            syncPendingReports();
        }
    });

    // Periodically check if online and sync every 2 minutes
    setInterval(() => {
        syncPendingReports();
    }, 120000);

    // Initial sync check on load
    setTimeout(() => {
        syncPendingReports();
    }, 3000);
}
