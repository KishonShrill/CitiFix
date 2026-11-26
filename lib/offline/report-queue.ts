import { db, type PendingReport, type ReportAttachment } from "./db";
import { nanoid } from "nanoid";

export async function saveReportOffline(reportData: {
    categoryId: string;
    problemTypeId: string;
    title: string;
    description: string;
    severity: "low" | "medium" | "high" | "critical";
    latitude: number;
    longitude: number;
    address?: string;
    barangay?: string;
    userId?: string;
}, files: File[]): Promise<string> {
    const clientId = nanoid(12);
    const createdAt = Date.now();

    const pendingReport: PendingReport = {
        clientId,
        userId: reportData.userId,
        categoryId: reportData.categoryId,
        problemTypeId: reportData.problemTypeId,
        title: reportData.title,
        description: reportData.description,
        severity: reportData.severity || "medium",
        latitude: reportData.latitude,
        longitude: reportData.longitude,
        address: reportData.address,
        barangay: reportData.barangay,
        status: "queued",
        createdAt,
        retryCount: 0,
    };

    await db.pendingReports.add(pendingReport);

    if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const attachment: ReportAttachment = {
                id: nanoid(),
                reportClientId: clientId,
                blob: file, // File inherits from Blob
                fileName: file.name || `photo_${i + 1}.jpg`,
                fileType: file.type || "image/jpeg",
                displayOrder: i,
            };
            await db.reportAttachments.add(attachment);
        }
    }

    return clientId;
}

export async function getPendingReports(): Promise<PendingReport[]> {
    return await db.pendingReports.orderBy("createdAt").toArray();
}

export async function getReportAttachments(clientId: string): Promise<ReportAttachment[]> {
    return await db.reportAttachments.where("reportClientId").equals(clientId).sortBy("displayOrder");
}

export async function updateReportSyncStatus(
    clientId: string,
    status: PendingReport["status"],
    updates?: {
        serverId?: string;
        lastError?: string;
        retryCount?: number;
        lastAttemptAt?: number;
    }
): Promise<void> {
    const patch: Partial<PendingReport> = { status, ...updates };
    if (updates?.retryCount === undefined) {
        // Increment retry count if status is failed
        if (status === "failed") {
            const existing = await db.pendingReports.get(clientId);
            if (existing) {
                patch.retryCount = (existing.retryCount || 0) + 1;
            }
        }
    }
    patch.lastAttemptAt = Date.now();
    await db.pendingReports.update(clientId, patch);
}

export async function removeSyncedReport(clientId: string): Promise<void> {
    await db.pendingReports.delete(clientId);
    await db.reportAttachments.where("reportClientId").equals(clientId).delete();
}
