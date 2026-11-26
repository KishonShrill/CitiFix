"use client";

import { useState, useEffect } from "react";
import { db, type PendingReport, type ReportAttachment } from "@/lib/offline/db";
import { X, Trash2, RefreshCw, Database, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { updateReportSyncStatus, removeSyncedReport } from "@/lib/offline/report-queue";

interface IndexedDBInspectorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function IndexedDBInspectorModal({ isOpen, onClose }: IndexedDBInspectorModalProps) {
    const [pendingReports, setPendingReports] = useState<PendingReport[]>([]);
    const [attachments, setAttachments] = useState<ReportAttachment[]>([]);
    const [activeTab, setActiveTab] = useState<"reports" | "attachments">("reports");
    const [isLoading, setIsLoading] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const reports = await db.pendingReports.toArray();
            const atts = await db.reportAttachments.toArray();
            setPendingReports(reports);
            setAttachments(atts);
        } catch (err) {
            console.error("Failed to inspect IndexedDB:", err);
            toast.error("Failed to read IndexedDB storage");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const handleResetStatus = async (clientId: string) => {
        await updateReportSyncStatus(clientId, "queued", { lastError: undefined, retryCount: 0 });
        toast.success(`Reset status for report ${clientId} to 'queued'`);
        loadData();
    };

    const handleDeleteReport = async (clientId: string) => {
        if (!confirm(`Delete report ${clientId} from IndexedDB?`)) return;
        await removeSyncedReport(clientId);
        toast.success(`Deleted report ${clientId}`);
        loadData();
    };

    const handleClearAll = async () => {
        if (!confirm("Are you sure you want to clear all IndexedDB tables? All local unsynced reports will be lost!")) return;
        await db.pendingReports.clear();
        await db.reportAttachments.clear();
        toast.success("Cleared all IndexedDB tables");
        loadData();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 transition-opacity" onClick={onClose} />

            <div className="fixed inset-3 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-4xl sm:w-full bg-slate-950 text-slate-100 rounded-2xl shadow-2xl z-50 flex flex-col h-[90dvh] sm:h-[85vh] overflow-hidden border border-slate-800">
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
                    <div className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-blue-400" />
                        <h2 className="font-bold text-base text-slate-100">IndexedDB Storage Inspector</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs & Toolbar */}
                <div className="px-5 py-3 bg-slate-900/40 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveTab("reports")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                activeTab === "reports"
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                            }`}
                        >
                            pendingReports ({pendingReports.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("attachments")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                activeTab === "attachments"
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                            }`}
                        >
                            reportAttachments ({attachments.length})
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={loadData}
                            disabled={isLoading}
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                        >
                            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
                            Refresh
                        </button>
                        <button
                            onClick={handleClearAll}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-900/50 rounded-lg text-xs font-medium transition-colors"
                        >
                            <Trash2 size={13} />
                            Clear Database
                        </button>
                    </div>
                </div>

                {/* Content Table */}
                <div className="p-4 overflow-y-auto flex-1 font-mono text-xs">
                    {activeTab === "reports" ? (
                        pendingReports.length === 0 ? (
                            <div className="text-center py-20 text-slate-500 font-sans">
                                No records found in `pendingReports` table.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingReports.map((r) => (
                                    <div key={r.clientId} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                                        <div className="flex items-center justify-between text-slate-400 text-[11px]">
                                            <span>ID: <strong className="text-slate-200">{r.clientId}</strong></span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                r.status === "queued" ? "bg-amber-950 text-amber-300 border border-amber-800" :
                                                r.status === "failed" ? "bg-red-950 text-red-300 border border-red-800" :
                                                r.status === "syncing" ? "bg-blue-950 text-blue-300 border border-blue-800" :
                                                "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                            }`}>
                                                {r.status}
                                            </span>
                                        </div>
                                        <h4 className="font-semibold text-slate-100 text-sm font-sans">{r.title}</h4>
                                        <p className="text-slate-400 text-xs font-sans line-clamp-2">{r.description}</p>
                                        <div className="text-[11px] text-slate-400 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800/80">
                                            <div>Lat/Lng: {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}</div>
                                            <div>Retries: {r.retryCount}</div>
                                            <div>Created: {new Date(r.createdAt).toLocaleTimeString()}</div>
                                            <div>Server ID: {r.serverId || "None"}</div>
                                        </div>
                                        {r.lastError && (
                                            <div className="text-red-400 bg-red-950/40 p-2 rounded border border-red-900/40 text-[11px]">
                                                Error: {r.lastError}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 pt-2">
                                            <button
                                                onClick={() => handleResetStatus(r.clientId)}
                                                className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] transition-colors"
                                            >
                                                <RotateCcw size={11} />
                                                Reset to Queued
                                            </button>
                                            <button
                                                onClick={() => handleDeleteReport(r.clientId)}
                                                className="flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] transition-colors"
                                            >
                                                <Trash2 size={11} />
                                                Delete Record
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        attachments.length === 0 ? (
                            <div className="text-center py-20 text-slate-500 font-sans">
                                No records found in `reportAttachments` table.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {attachments.map((a) => (
                                    <div key={a.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-4">
                                        <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                                <span>Att ID: {a.id}</span>
                                                <span>•</span>
                                                <span>Report ID: <strong className="text-slate-200">{a.reportClientId}</strong></span>
                                            </div>
                                            <p className="font-semibold text-slate-200 truncate">{a.fileName} ({a.fileType})</p>
                                            <p className="text-[10px] text-slate-500 truncate">DataUrl length: {a.dataUrl?.length || 0} chars</p>
                                        </div>
                                        {a.dataUrl && (
                                            <div className="w-16 h-16 rounded-lg bg-slate-950 overflow-hidden shrink-0 border border-slate-800">
                                                <img src={a.dataUrl} alt={a.fileName} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </>
    );
}
