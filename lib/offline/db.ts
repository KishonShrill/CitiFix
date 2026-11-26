import Dexie, { type Table } from "dexie";

export interface PendingReport {
    clientId: string;
    userId?: string;
    categoryId: string;
    problemTypeId: string;
    title: string;
    description: string;
    severity: "low" | "medium" | "high" | "critical";
    latitude: number;
    longitude: number;
    address?: string;
    barangay?: string;
    status: "queued" | "syncing" | "submitted" | "failed" | "needs_auth";
    createdAt: number;
    lastAttemptAt?: number;
    retryCount: number;
    serverId?: string;
    lastError?: string;
}

export interface ReportAttachment {
    id: string;
    reportClientId: string;
    blob: Blob;
    fileName: string;
    fileType: string;
    displayOrder: number;
}

export class CitiFIXOfflineDB extends Dexie {
    pendingReports!: Table<PendingReport, string>;
    reportAttachments!: Table<ReportAttachment, string>;

    constructor() {
        super("CitiFIXOfflineDB");
        this.version(1).stores({
            pendingReports: "clientId, status, createdAt, userId",
            reportAttachments: "id, reportClientId",
        });
    }
}

export const db = new CitiFIXOfflineDB();
