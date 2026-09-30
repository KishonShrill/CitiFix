"use client";

import { useState } from "react";
import Image from "next/image";
import {
    X,
    Trash2,
    Share2,
    CheckCircle2,
    Clock,
    XCircle,
    MapPin,
    Image as ImageIcon,
    FileText,
} from "lucide-react";
import { useUserReports, useDeleteReport } from "@/hooks/useReports";
import { toast } from "sonner";
import { getIcon } from "@/lib/icons";
import { cn } from "@/utils/cn";

interface UserDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    onReportSelect?: (reportId: string) => void;
}

type TabType = "active" | "rejected";

function formatReportDate(dateString: string): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const formattedDate = date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let daysText = "";
    if (diffDays === 0) {
        daysText = "today";
    } else if (diffDays === 1) {
        daysText = "1 day ago";
    } else {
        daysText = `${diffDays} days ago`;
    }

    return `${formattedDate} (${daysText})`;
}

export function UserDashboard({
    isOpen,
    onClose,
    onReportSelect,
}: UserDashboardProps) {
    const [activeTab, setActiveTab] = useState<TabType>("active");
    const [limit] = useState(50);
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
            toast.success("Report deleted successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete report");
        }
    };

    const handleShare = (reportId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `${window.location.origin}/reports/${reportId}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
            toast.success("Report link copied to clipboard!");
        } else {
            toast.info(`Link: ${url}`);
        }
    };

    const allReports = userReportsData?.data || [];
    const meta = userReportsData?.meta;

    const activeReports = allReports.filter((r) => r.status !== "rejected");
    const rejectedReports = allReports.filter((r) => r.status === "rejected");

    const displayedReports = activeTab === "active" ? activeReports : rejectedReports;

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div className="fixed inset-3 top-1/2 sm:left-1/2 sm:-translate-x-1/2 -translate-y-1/2 sm:w-full sm:max-w-4xl bg-white rounded-2xl shadow-2xl z-50 flex flex-col h-[95dvh] sm:h-fit sm:max-h-[95dvh] overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">My Reports</h2>
                        <p className="max-sm:hidden text-xs text-slate-500 mt-0.5">
                            Track the status and details of your submitted civic reports
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs Bar */}
                <div className="px-6 border-b border-slate-100 bg-white flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setActiveTab("active")}
                        className={cn(
                            "py-3 px-1 text-sm font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-colors",
                            activeTab === "active"
                                ? "border-orange-600 text-orange-600"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <span>Displayed & Pending</span>
                        <span
                            className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-bold",
                                activeTab === "active"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-slate-100 text-slate-600"
                            )}
                        >
                            {activeReports.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("rejected")}
                        className={cn(
                            "py-3 px-1 text-sm font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-colors",
                            activeTab === "rejected"
                                ? "border-red-600 text-red-600"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <span>Rejected</span>
                        <span
                            className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-bold",
                                activeTab === "rejected"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-slate-100 text-slate-600"
                            )}
                        >
                            {rejectedReports.length}
                        </span>
                    </button>
                </div>

                {/* Content Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/40">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-500">
                            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm">Loading your reports...</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && displayedReports.length === 0 && (
                        <div className="py-16 text-center flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                                <FileText size={24} />
                            </div>
                            <p className="font-semibold text-slate-800 text-base">
                                {activeTab === "active"
                                    ? "No active reports found"
                                    : "No rejected reports"}
                            </p>
                            <p className="text-sm text-slate-500 max-w-sm mt-1">
                                {activeTab === "active"
                                    ? "You haven't submitted any active or pending reports yet."
                                    : "You have no reports that were marked as rejected."}
                            </p>
                        </div>
                    )}

                    {/* Reports List */}
                    {!isLoading && displayedReports.length > 0 && (
                        <div className="space-y-3.5 grid lg:grid-cols-2 lg:gap-x-3.5">
                            {displayedReports.map((report) => {
                                const ProblemTypeIcon = getIcon(report.problemType?.icon ?? "");

                                // Determine Status Badge
                                let statusLabel = "Submitted";
                                let statusStyle = "bg-amber-100 text-amber-800 border-amber-200";
                                let StatusIcon = Clock;

                                if (report.status === "verified") {
                                    statusLabel = "Verified";
                                    statusStyle = "bg-emerald-100 text-emerald-800 border-emerald-200";
                                    StatusIcon = CheckCircle2;
                                } else if (report.status === "under_review") {
                                    statusLabel = "Under Review";
                                    statusStyle = "bg-blue-100 text-blue-800 border-blue-200";
                                    StatusIcon = Clock;
                                } else if (report.status === "rejected") {
                                    statusLabel = "Rejected";
                                    statusStyle = "bg-red-100 text-red-800 border-red-200";
                                    StatusIcon = XCircle;
                                } else if (report.status === "duplicate") {
                                    statusLabel = "Duplicate";
                                    statusStyle = "bg-slate-100 text-slate-800 border-slate-200";
                                    StatusIcon = XCircle;
                                }

                                return (
                                    <div
                                        key={report.id}
                                        onClick={() => {
                                            if (onReportSelect && report.status !== "rejected") {
                                                onReportSelect(report.id);
                                                onClose();
                                            }
                                        }}
                                        className={cn(
                                            "bg-white border border-slate-200 rounded-xl p-4 sm:p-5 transition-all flex flex-col gap-3 group shadow-sm",
                                            report.status !== "rejected"
                                                ? "hover:border-slate-300 hover:shadow-md cursor-pointer"
                                                : ""
                                        )}
                                    >
                                        {/* ----------------- ROW 1 (2 Divs: Left Title+Date, Right Status) ----------------- */}
                                        <div className="flex items-start justify-between gap-3">
                                            {/* Left Div */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-900 text-base sm:text-lg truncate group-hover:text-orange-600 transition-colors">
                                                    {report.title}
                                                </h3>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {formatReportDate(report.createdAt)}
                                                </p>
                                            </div>

                                            {/* Right Div */}
                                            <div className="shrink-0">
                                                <span
                                                    className={cn(
                                                        "px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 border",
                                                        statusStyle
                                                    )}
                                                >
                                                    <StatusIcon size={13} />
                                                    {statusLabel}
                                                </span>
                                            </div>
                                        </div>

                                        {/* ----------------- ROW 2 (3/4 Left: Location+Desc, 1/4 Right: Rounded Preview Image) ----------------- */}
                                        {activeTab === "active" ? (
                                            <div className="flex gap-4 items-start">
                                                {/* 3/4 Left Div */}
                                                <div className="w-3/4 flex-1 min-w-0 space-y-1.5">
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                                        <MapPin size={14} className="text-orange-600 shrink-0" />
                                                        <span className="truncate">
                                                            {report.barangay
                                                                ? `${report.barangay}, Iligan City`
                                                                : `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                                                        {report.description}
                                                    </p>
                                                </div>

                                                {/* 1/4 Right Div (Preview image rounded) */}
                                                <div className="w-1/4 max-w-[100px] sm:max-w-[120px] shrink-0">
                                                    {report.url ? (
                                                        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
                                                            <Image
                                                                src={report.url}
                                                                alt={report.title}
                                                                height={100}
                                                                width={120}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-full aspect-[4/3] rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
                                                            <ImageIcon size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            /* Rejected Tab: No image since it has been deleted */
                                            <div className="w-full space-y-1.5">
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                                    <MapPin size={14} className="text-red-500 shrink-0" />
                                                    <span className="truncate">
                                                        {report.barangay
                                                            ? `${report.barangay}, Iligan City`
                                                            : `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`}
                                                    </span>
                                                </div>
                                                <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                                                    {report.description}
                                                </p>
                                            </div>
                                        )}

                                        {/* ----------------- ROW 3 (Category + Problem Type on Left, Share on Far Right) ----------------- */}
                                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                                            <div className="flex items-center gap-2 min-w-0">
                                                {/* Category Pill */}
                                                <span
                                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold truncate"
                                                    style={{
                                                        backgroundColor: `${report.category?.color || "#ea580c"}15`,
                                                        color: report.category?.color || "#ea580c",
                                                    }}
                                                >
                                                    <span
                                                        className="w-1.5 h-1.5 rounded-full shrink-0"
                                                        style={{ backgroundColor: report.category?.color || "#ea580c" }}
                                                    />
                                                    <span className="truncate">{report.category?.name}</span>
                                                </span>

                                                {/* Problem Type */}
                                                {report.problemType?.name && (
                                                    <>
                                                        <span className="text-slate-300 text-xs">•</span>
                                                        <span className="text-xs text-slate-600 font-medium truncate flex items-center gap-1">
                                                            <ProblemTypeIcon size={13} className="shrink-0 text-slate-500" />
                                                            <span className="truncate">{report.problemType.name}</span>
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Far Right: Share Button & optional Delete for submitted */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                {report.status === "submitted" && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(report.id);
                                                        }}
                                                        disabled={deleteReport.isPending}
                                                        title="Delete report"
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={(e) => handleShare(report.id, e)}
                                                    title="Copy share link"
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <Share2 size={13} />
                                                    <span>Share</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {!isLoading && meta && meta.total > limit && (
                        <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs text-slate-500">
                            <p>
                                Showing {offset + 1} to {Math.min(offset + limit, meta.total)} of{" "}
                                {meta.total} reports
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setOffset(Math.max(0, offset - limit))}
                                    disabled={offset === 0}
                                    className="px-3 py-1.5 border border-slate-300 rounded-lg font-medium disabled:opacity-50 hover:bg-slate-50 transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setOffset(offset + limit)}
                                    disabled={!meta.hasMore}
                                    className="px-3 py-1.5 border border-slate-300 rounded-lg font-medium disabled:opacity-50 hover:bg-slate-50 transition-colors"
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
