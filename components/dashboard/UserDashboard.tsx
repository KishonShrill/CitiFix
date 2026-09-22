"use client";

import { useState } from "react";
import { X, Trash2, Edit2 } from "lucide-react";
import { useUserReports, useDeleteReport } from "@/hooks/useReports";

interface UserDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    onReportSelect?: (reportId: string) => void;
}

export function UserDashboard({
    isOpen,
    onClose,
    onReportSelect,
}: UserDashboardProps) {
    const [limit] = useState(10);
    const [offset, setOffset] = useState(0);

    const { data: userReportsData, isLoading } = useUserReports({
        limit,
        offset,
    });

    const deleteReport = useDeleteReport();

    const handleDelete = async (reportId: string) => {
        if (!confirm("Are you sure you want to delete this report?")) return;
        try {
            await deleteReport.mutateAsync(reportId);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to delete report");
        }
    };

    const reports = userReportsData?.data || [];
    const meta = userReportsData?.meta;

    const statusColors: Record<string, string> = {
        submitted: "bg-yellow-100 text-yellow-800",
        under_review: "bg-blue-100 text-blue-800",
        verified: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        duplicate: "bg-gray-100 text-gray-800",
    };

    const severityColors: Record<string, string> = {
        low: "bg-green-100 text-green-800",
        medium: "bg-yellow-100 text-yellow-800",
        high: "bg-red-100 text-red-800",
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 z-40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-4xl bg-white rounded-lg shadow-xl z-50 overflow-y-auto max-h-[90vh]">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">My Reports</h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 p-1"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="text-center py-8">
                            <p className="text-slate-600">Loading your reports...</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && reports.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-slate-600 mb-4">You haven&apos;t submitted any reports yet.</p>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700"
                            >
                                Go Back & Submit Report
                            </button>
                        </div>
                    )}

                    {/* Reports List */}
                    {!isLoading && reports.length > 0 && (
                        <div className="space-y-4">
                            {reports.map((report) => {
                                console.log(report)
                                return (
                                    <div
                                        key={report.id}
                                        className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-slate-900 text-lg truncate">
                                                    {report.title}
                                                </h3>
                                                <p className="text-sm text-slate-600 mt-1">
                                                    {new Date(report.createdAt as string).toLocaleDateString()} at{" "}
                                                    {new Date(report.createdAt as string).toLocaleTimeString()}
                                                </p>
                                            </div>
                                            <div className="flex gap-1 flex-shrink-0">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[report.status] ||
                                                        "bg-gray-100 text-gray-800"
                                                        }`}
                                                >
                                                    {report.status.replace("_", " ")}
                                                </span>
                                                {report.severity && (
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[report.severity] ||
                                                            "bg-gray-100 text-gray-800"
                                                            }`}
                                                    >
                                                        {report.severity}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                                            {report.description}
                                        </p>

                                        <div className="flex items-center gap-2 mb-3 text-sm text-slate-600">
                                            <span>📍 {report.barangay || "Location"}</span>
                                            {report.media && report.media.length > 0 && (
                                                <span>📸 {report.media.length} photo(s)</span>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    onReportSelect?.(report.id);
                                                    onClose();
                                                }}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 text-slate-900 rounded-md font-medium hover:bg-slate-50 text-sm"
                                            >
                                                <Edit2 size={16} />
                                                View Details
                                            </button>
                                            {report.status === "submitted" && (
                                                <button
                                                    onClick={() => handleDelete(report.id)}
                                                    disabled={deleteReport.isPending}
                                                    className="flex items-center justify-center px-3 py-2 border border-red-300 text-red-600 rounded-md font-medium hover:bg-red-50 disabled:opacity-50 text-sm"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {!isLoading && meta && meta.total > 0 && (
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
                            <p className="text-sm text-slate-600">
                                Showing {offset + 1} to {Math.min(offset + limit, meta.total)} of{" "}
                                {meta.total} reports
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setOffset(Math.max(0, offset - limit))}
                                    disabled={offset === 0}
                                    className="px-3 py-2 border border-slate-300 rounded-md text-sm font-medium disabled:opacity-50 hover:bg-slate-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setOffset(offset + limit)}
                                    disabled={!meta.hasMore}
                                    className="px-3 py-2 border border-slate-300 rounded-md text-sm font-medium disabled:opacity-50 hover:bg-slate-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
