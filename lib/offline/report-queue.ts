import { db, type PendingReport, type ReportAttachment } from "./db";
import { nanoid } from "nanoid";
import { logger } from "./logger";

export interface PreReadAttachment {
    dataUrl: string;
    fileName: string;
    fileType: string;
}

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
}, files: (File | PreReadAttachment)[]): Promise<string> {
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
    logger.info(`Saved report offline: ${clientId} (${files.length} attachments)`);

    if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const item = files[i];
            try {
                let dataUrl = "";
                let fileName = `photo_${i + 1}.jpg`;
                let fileType = "image/jpeg";

                if ("dataUrl" in item) {
                    dataUrl = item.dataUrl;
                    fileName = item.fileName;
                    fileType = item.fileType;
                } else {
                    const file = item as File;
                    fileName = file.name || fileName;
                    fileType = file.type || fileType;
                    const arrayBuffer = await file.arrayBuffer();
                    const bytes = new Uint8Array(arrayBuffer);
                    let binary = "";
                    const len = bytes.byteLength;
                    const CHUNK_SIZE = 0x8000;
                    for (let j = 0; j < len; j += CHUNK_SIZE) {
                        binary += String.fromCharCode.apply(
                            null,
                            Array.from(bytes.subarray(j, j + CHUNK_SIZE)) as number[]
                        );
                    }
                    const base64 = btoa(binary);
                    dataUrl = `data:${fileType};base64,${base64}`;
                }

                const attachment: ReportAttachment = {
                    id: nanoid(),
                    reportClientId: clientId,
                    dataUrl,
                    fileName,
                    fileType,
                    displayOrder: i,
                };
                await db.reportAttachments.add(attachment);
            } catch (err) {
                logger.error(`Failed to process attachment ${i + 1} for offline storage`, err);
            }
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
    logger.info(`Removed synced report: ${clientId}`);
}
