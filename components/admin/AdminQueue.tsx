"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, XCircle, Copy, RefreshCw, HelpCircle } from "lucide-react";
import { Report } from "@/lib/api/reports";
import { toast } from "sonner";
import { useAdminReports, useVerifyReport, useRejectReport, useDuplicateReport } from "@/hooks/useReports";
import { getIcon } from "@/lib/icons";
import { LegendModal } from "@/components/common/LegendModal";

interface AdminQueueProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AdminQueue({
    isOpen,
    onClose,
}: AdminQueueProps) {
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Refresh controls state
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
    const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(60000); // Default 1 min
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    const [isLegendOpen, setIsLegendOpen] = useState(false);

    const { data: adminReportsQuery, isLoading, refetch, isRefetching } = useAdminReports({ status: "submitted" });
    const pendingReports = adminReportsQuery?.data || [];

    const verifyMutation = useVerifyReport();
    const rejectMutation = useRejectReport();
    const duplicateMutation = useDuplicateReport();

    // Setup auto-refresh interval
    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        if (isOpen && autoRefreshEnabled) {
            intervalId = setInterval(() => {
                refetch();
                toast.info("Auto-refreshed queue", { id: "auto-refresh", duration: 1500 });
            }, autoRefreshInterval);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isOpen, autoRefreshEnabled, autoRefreshInterval, refetch]);

    // Setup cooldown timer ticks
    useEffect(() => {
        if (cooldownRemaining > 0) {
            const timer = setTimeout(() => {
                setCooldownRemaining(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldownRemaining]);

    const handleManualRefresh = () => {
        if (cooldownRemaining > 0) {
            toast.error(`Please wait ${cooldownRemaining}s before refreshing again.`);
            return;
        }
        refetch();
        setCooldownRemaining(15);
        toast.success("Refreshed queue manually", { id: "manual-refresh", duration: 2000 });
    };

    const handleVerify = async (reportId: string) => {
        setActionLoading(reportId);
        try {
            await verifyMutation.mutateAsync(reportId);
            setSelectedReport(null);
            toast.success("Report verified successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to verify report");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (reportId: string) => {
        if (!rejectReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }
        setActionLoading(reportId);
        try {
            await rejectMutation.mutateAsync({ id: reportId, reason: rejectReason });
            setSelectedReport(null);
            setRejectReason("");
            toast.success("Report rejected");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to reject report");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDuplicate = async (reportId: string) => {
        setActionLoading(reportId);
        try {
            await duplicateMutation.mutateAsync({ id: reportId });
            setSelectedReport(null);
            toast.success("Report marked as duplicate");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to mark as duplicate");
        } finally {
            setActionLoading(null);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <LegendModal isOpen={isLegendOpen} onClose={() => setIsLegendOpen(false)} />
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 z-40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-5xl bg-white rounded-lg shadow-xl z-50 overflow-y-auto max-h-[90vh]">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Moderation Queue</h2>
                            <p className="text-sm text-slate-600 mt-1">
                                {pendingReports.length} report{pendingReports.length !== 1 ? "s" : ""} pending review
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Refresh controls */}
                            <div className="flex items-center gap-2 relative">
                                <div className="flex items-center gap-2 border border-slate-200 rounded-md py-1 px-2">
                                    <label className="text-xs font-medium text-slate-600 flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                            checked={autoRefreshEnabled}
                                            onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                                        />
                                        Auto-refresh
                                    </label>

                                    <select
                                        className="text-xs border-none bg-slate-50 focus:ring-0 p-1 rounded text-slate-700 outline-none"
                                        disabled={!autoRefreshEnabled}
                                        value={autoRefreshInterval}
                                        onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                                    >
                                        <option value={60000}>1 min</option>
                                        <option value={120000}>2 min</option>
                                        <option value={300000}>5 min</option>
                                    </select>
                                </div>

                                <button
                                    onClick={handleManualRefresh}
                                    disabled={cooldownRemaining > 0 || isRefetching}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <RefreshCw size={14} className={isRefetching ? "animate-spin" : ""} />
                                    {cooldownRemaining > 0 ? `Wait ${cooldownRemaining}s` : "Refresh"}
                                </button>

                                <button
                                    onClick={() => setIsLegendOpen(true)}
                                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                                    title="View Legend"
                                >
                                    <HelpCircle size={20} />
                                </button>
                            </div>

                            <div className="h-6 w-px bg-slate-200 mx-1"></div>

                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Queue List */}
                        <div className="lg:col-span-1 border-r border-slate-200">
                            {isLoading && !adminReportsQuery && (
                                <div className="text-center py-8">
                                    <p className="text-slate-600">Loading queue...</p>
                                </div>
                            )}

                            {(!isLoading || adminReportsQuery) && pendingReports.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-slate-600">All caught up! No pending reports.</p>
                                </div>
                            )}

                            <div className="space-y-2 max-h-[calc(90vh-200px)] overflow-y-auto">
                                {pendingReports.map((report) => (
                                    <button
                                        key={report.id}
                                        onClick={() => setSelectedReport(report)}
                                        className={`w-full text-left p-3 rounded-md border transition-colors ${selectedReport?.id === report.id
                                            ? "bg-blue-50 border-blue-300"
                                            : "border-slate-200 hover:bg-slate-50"
                                            }`}
                                    >
                                        <p className="font-medium text-sm text-slate-900 truncate">
                                            {report.title}
                                        </p>
                                        <p className="text-xs text-slate-600 mt-1 truncate">
                                            {report.barangay || "Unknown"}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {new Date(report.submittedAt || Date.now()).toLocaleDateString()}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Report Details */}
                        <div className="lg:col-span-2">
                            {selectedReport ? (
                                (() => {
                                    const ProblemIcon = getIcon(selectedReport.problemType.icon);
                                    return (
                                        <div className="space-y-6">
                                            <div>
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="text-xl font-bold text-slate-900">
                                                        {selectedReport.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-md border border-slate-200">
                                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                            {selectedReport.category.name}
                                                        </span>
                                                        <span className="text-slate-300">|</span>
                                                        <div className="flex items-center gap-1.5 text-sm text-slate-700">
                                                            <div
                                                                className="p-1 rounded-sm text-white"
                                                                style={{ backgroundColor: selectedReport.category.color }}
                                                            >
                                                                <ProblemIcon size={14} />
                                                            </div>
                                                            <span className="font-medium">{selectedReport.problemType.name}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-600 mb-4">
                                                    Submitted {selectedReport.submittedAt ? new Date(selectedReport.submittedAt).toLocaleDateString() : "N/A"} at{" "}
                                                    {selectedReport.submittedAt ? new Date(selectedReport.submittedAt).toLocaleTimeString() : "N/A"}
                                                </p>
                                                <p className="text-slate-700 mb-4">{selectedReport.description}</p>
                                            </div>

                                            {/* Metadata */}
                                            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-md">
                                                <div>
                                                    <p className="text-xs font-medium text-slate-600 mb-1">Location</p>
                                                    <p className="text-sm text-slate-900">
                                                        {selectedReport.barangay || "Not specified"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-slate-600 mb-1">Severity</p>
                                                    <p className="text-sm text-slate-900 capitalize">
                                                        {selectedReport.severity || "Not specified"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-slate-600 mb-1">Coordinates</p>
                                                    <p className="text-sm text-slate-900 font-mono">
                                                        {selectedReport.latitude.toFixed(4)}, {selectedReport.longitude.toFixed(4)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-slate-600 mb-1">Report ID</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm text-slate-900 font-mono truncate">
                                                            {selectedReport.id.slice(0, 8)}...
                                                        </p>
                                                        <button className="p-1 hover:bg-slate-200 rounded">
                                                            <Copy size={14} className="text-slate-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Media */}
                                            {selectedReport.media && selectedReport.media.length > 0 && (
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 mb-2">Attached Media</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {selectedReport.media.map((media) => (
                                                            <img
                                                                key={media.id}
                                                                src={media.url}
                                                                alt="Report media"
                                                                className="w-full h-32 object-cover rounded-md"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="space-y-3 pt-4 border-t border-slate-200">
                                                <button
                                                    onClick={() => handleVerify(selectedReport.id)}
                                                    disabled={actionLoading === selectedReport.id}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    <CheckCircle size={18} />
                                                    Verify Report
                                                </button>

                                                <button
                                                    onClick={() => handleDuplicate(selectedReport.id)}
                                                    disabled={actionLoading === selectedReport.id}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 text-white rounded-md font-medium hover:bg-yellow-700 disabled:opacity-50"
                                                >
                                                    <Copy size={18} />
                                                    Mark as Duplicate
                                                </button>

                                                <div className="space-y-2">
                                                    <textarea
                                                        value={rejectReason}
                                                        onChange={(e) => setRejectReason(e.target.value)}
                                                        placeholder="Enter reason for rejection..."
                                                        rows={3}
                                                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                                    />
                                                    <button
                                                        onClick={() => handleReject(selectedReport.id)}
                                                        disabled={actionLoading === selectedReport.id}
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 disabled:opacity-50"
                                                    >
                                                        <XCircle size={18} />
                                                        Reject Report
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()
                            ) : (
                                <div className="flex items-center justify-center h-full min-h-[400px] text-slate-600">
                                    Select a report from the queue to review
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
