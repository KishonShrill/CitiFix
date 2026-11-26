import { getPendingReports, getReportAttachments, updateReportSyncStatus } from "./report-queue";
import { checkServerReachability } from "./connectivity";
import { logger } from "./logger";
import { db } from "./db";
import { toast } from "sonner";

let isSyncing = false;
let autoSyncTimer: NodeJS.Timeout | null = null;
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

export async function resetStuckSyncingReports(): Promise<void> {
    try {
        const stuck = await db.pendingReports.where("status").equals("syncing").toArray();
        if (stuck.length > 0) {
            logger.warn(`Resetting ${stuck.length} stuck 'syncing' report(s) back to 'queued' due to prior page reload.`);
            for (const r of stuck) {
                await updateReportSyncStatus(r.clientId, "queued", {
                    lastError: "Interrupted by page reload / reconnection",
                });
            }
        }
    } catch (err) {
        logger.error("Failed to reset stuck syncing reports:", err);
    }
}

export async function syncPendingReports(): Promise<void> {
    if (isSyncing) {
        logger.info("Sync already in progress, skipping concurrent trigger.");
        return;
    }

    logger.info("Checking server reachability before sync...");
    const reachable = await checkServerReachability();
    if (!reachable) {
        logger.warn("Sync skipped: Server not reachable or offline.");
        return;
    }

    const pending = await getPendingReports();
    const actionable = pending.filter((p) => p.status === "queued" || p.status === "failed");

    if (actionable.length === 0) {
        logger.info("No actionable pending reports to sync.");
        return;
    }

    isSyncing = true;
    logger.info(`Starting synchronization of ${actionable.length} pending report(s)...`);
    await notifyListeners(true);

    try {
        for (const report of actionable) {
            try {
                logger.info(`Syncing report: ${report.clientId} ("${report.title}")`);
                await updateReportSyncStatus(report.clientId, "syncing");
                await notifyListeners(true);

                const attachments = await getReportAttachments(report.clientId);
                logger.info(`Found ${attachments.length} attachment(s) for report ${report.clientId}`);

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
                    logger.info(`Processing attachment ${i + 1}/${attachments.length} (${att.fileName})...`);
                    const res = await fetch(att.dataUrl);
                    const blob = await res.blob();
                    const file = new File([blob], att.fileName, { type: att.fileType });
                    formData.append("files", file);
                }

                logger.info(`Executing POST /api/v1/reports for report ${report.clientId}...`);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

                const response = await fetch("/api/v1/reports", {
                    method: "POST",
                    body: formData,
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);

                logger.info(`Received response for ${report.clientId}: status ${response.status}`);

                if (response.status === 401 || response.status === 403) {
                    logger.warn(`Sync auth error for report ${report.clientId}: ${response.status} (Session expired)`);
                    await updateReportSyncStatus(report.clientId, "needs_auth", {
                        lastError: "Authentication required or session expired.",
                    });
                    continue;
                }

                if (!response.ok) {
                    const errData = (await response.json().catch(() => ({}))) as any;
                    const errorMsg = errData.message || `Server error: ${response.status}`;
                    logger.error(`Server rejected sync for ${report.clientId}: ${errorMsg}`, errData);
                    throw new Error(errorMsg);
                }

                const result = (await response.json()) as any;
                const serverId = result.data?.id || "unknown";

                logger.info(`Successfully synced report ${report.clientId} -> Server ID: ${serverId}`);
                await updateReportSyncStatus(report.clientId, "submitted", {
                    serverId,
                    lastError: undefined,
                });
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : "Synchronization failed";
                logger.error(`Failed to sync report ${report.clientId}:`, error);
                await updateReportSyncStatus(report.clientId, "failed", {
                    lastError: errorMsg,
                });
            }
        }
    } finally {
        isSyncing = false;
        logger.info("Synchronization batch finished. Resetting isSyncing lock.");
        await notifyListeners(false);
    }
}

export function scheduleAutoSync(delayMs = 10000) {
    if (autoSyncTimer) clearTimeout(autoSyncTimer);

    let secondsLeft = delayMs / 1000;
    const toastId = "auto-sync-countdown";

    logger.info(`Scheduling auto-sync in ${secondsLeft} seconds...`);

    const updateToast = () => {
        toast("Connection restored", {
            description: `Synchronizing pending reports in ${secondsLeft}s...`,
            action: {
                label: "Cancel",
                onClick: () => {
                    if (autoSyncTimer) {
                        clearTimeout(autoSyncTimer);
                        autoSyncTimer = null;
                    }
                    if (intervalId) clearInterval(intervalId);
                    toast.dismiss(toastId);
                    toast.info("Auto-sync cancelled by user.");
                    logger.info("Auto-sync cancelled by user.");
                },
            },
            duration: Infinity,
            id: toastId,
        });
    };

    updateToast();

    const intervalId = setInterval(() => {
        secondsLeft -= 1;
        if (secondsLeft > 0) {
            updateToast();
        } else {
            clearInterval(intervalId);
        }
    }, 1000);

    autoSyncTimer = setTimeout(async () => {
        autoSyncTimer = null;
        if (intervalId) clearInterval(intervalId);
        toast.dismiss(toastId);
        await resetStuckSyncingReports();
        await syncPendingReports();
    }, delayMs);
}

export function initSyncManager() {
    if (typeof window === "undefined") return;

    // Reset stuck syncing reports on startup, then check if pending reports exist
    resetStuckSyncingReports().then(async () => {
        const pending = await getPendingReports();
        const actionable = pending.filter((p) => p.status === "queued" || p.status === "failed");
        if (actionable.length > 0) {
            logger.info(`Detected ${actionable.length} pending report(s) on startup. Checking reachability for auto-sync...`);
            const reachable = await checkServerReachability();
            if (reachable) {
                scheduleAutoSync(10000); // 10s countdown toast
            }
        }
    });

    window.addEventListener("online", async () => {
        logger.info("Browser online event detected.");
        const reachable = await checkServerReachability();
        if (reachable) {
            const pending = await getPendingReports();
            const actionable = pending.filter((p) => p.status === "queued" || p.status === "failed");
            if (actionable.length > 0) {
                scheduleAutoSync(10000); // 10 second delay with cancel option
            }
        }
    });

    document.addEventListener("visibilitychange", async () => {
        if (document.visibilityState === "visible") {
            logger.info("App became visible, checking sync...");
            const reachable = await checkServerReachability();
            if (reachable) {
                const pending = await getPendingReports();
                const actionable = pending.filter((p) => p.status === "queued" || p.status === "failed");
                if (actionable.length > 0) {
                    scheduleAutoSync(5000); // 5s delay on tab return if pending reports exist
                }
            }
        }
    });

    setInterval(async () => {
        const reachable = await checkServerReachability();
        if (reachable) {
            await resetStuckSyncingReports();
        }
    }, 120000);
}
