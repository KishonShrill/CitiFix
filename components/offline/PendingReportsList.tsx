"use client";

import { usePendingReports } from "@/hooks/usePendingReports";
import { syncPendingReports } from "@/lib/offline/sync-manager";
import { Clock, AlertCircle, CheckCircle2, RefreshCw, Trash2, ShieldAlert, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function PendingReportsList() {
    const { pendingReports, isLoading, refreshPendingReports, deletePendingReport } = usePendingReports();
    const [retryingId, setRetryingId] = useState<string | null>(null);

    const handleRetry = async (clientId: string) => {
        try {
            setRetryingId(clientId);
            await syncPendingReports();
            await refreshPendingReports();
            toast.success("Attempted synchronization");
        } catch (error) {
            toast.error("Synchronization failed");
        } finally {
            setRetryingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>Loading local reports...</span>
            </div>
        );
    }

    if (pendingReports.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <Clock className="w-10 h-10 mx-auto mb-3 text-slate-400 opacity-60" />
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">No local reports</h3>
                <p className="text-sm text-slate-500 mt-1">Reports created offline will appear here until successfully synchronized.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    Offline & Queued Reports ({pendingReports.length})
                </h3>
                <button
                    onClick={() => syncPendingReports().then(refreshPendingReports)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl text-xs font-medium transition-colors"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Sync All
                </button>
            </div>

            <div className="space-y-3">
                {pendingReports.map((report) => {
                    const dateStr = new Date(report.createdAt).toLocaleString();
                    const isRetrying = retryingId === report.clientId;

                    return (
                        <div
                            key={report.clientId}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                                        {report.title}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Created: {dateStr}
                                    </p>
                                </div>

                                <div>
                                    {report.status === "queued" && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                            <Clock className="w-3 h-3" /> Queued
                                        </span>
                                    )}
                                    {report.status === "syncing" && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 animate-pulse">
                                            <Loader2 className="w-3 h-3 animate-spin" /> Syncing
                                        </span>
                                    )}
                                    {report.status === "submitted" && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                            <CheckCircle2 className="w-3 h-3" /> Submitted
                                        </span>
                                    )}
                                    {report.status === "failed" && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                                            <AlertCircle className="w-3 h-3" /> Failed
                                        </span>
                                    )}
                                    {report.status === "needs_auth" && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                            <ShieldAlert className="w-3 h-3" /> Needs sign-in
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                                {report.description}
                            </p>

                            {report.lastError && (
                                <div className="text-xs bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 p-2.5 rounded-xl border border-red-200 dark:border-red-900">
                                    <span className="font-medium">Error:</span> {report.lastError}
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-xs text-slate-400">
                                    Severity: <strong className="capitalize">{report.severity}</strong> {report.retryCount > 0 && `• Retries: ${report.retryCount}`}
                                </span>

                                <div className="flex items-center gap-2">
                                    {(report.status === "failed" || report.status === "queued" || report.status === "needs_auth") && (
                                        <button
                                            onClick={() => handleRetry(report.clientId)}
                                            disabled={isRetrying}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
                                        >
                                            {isRetrying ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                            Retry
                                        </button>
                                    )}

                                    <button
                                        onClick={() => deletePendingReport(report.clientId)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-medium transition-colors"
                                        title="Delete local report"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
