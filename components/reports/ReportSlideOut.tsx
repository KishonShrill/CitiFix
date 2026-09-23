"use client";

import { useReport } from "@/hooks/useReports";
import { useMapState } from "@/context/AppState";
import { X } from "lucide-react";
import { getIcon } from "@/lib/icons";

interface ReportSlideOutProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function ReportSlideOut({
    isOpen,
    onClose,
    onEdit,
    onDelete,
}: ReportSlideOutProps) {
    const { selectedReportId } = useMapState();
    const { data: report, isLoading } = useReport(selectedReportId || "");

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

    if (isLoading && isOpen) {
        return (
            <div className={`fixed top-0 bottom-0 right-0 w-full sm:w-96 bg-white shadow-lg z-50 p-6 flex items-center justify-center transition-transform duration-150 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
                <p className="text-slate-500">Loading details...</p>
            </div>
        );
    }

    if (!report && isOpen) return null;

    const ProblemIcon = getIcon(report?.problemType.icon as string);

    return (
        <>
            {/* Slide-out panel */}
            <div id="slide-out-panel"
                className={`fixed top-0 bottom-0 right-0 w-full sm:w-96
                bg-white shadow-lg z-50 overflow-y-auto
                transition-transform duration-150 ease-in-out
                ${isOpen ? "translate-x-0" : "translate-x-full"}
                `}
            >
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{report?.title}</h2>
                            <p className="text-sm text-slate-600 mt-1">
                                {report?.createdAt ? new Date(report.createdAt).toLocaleDateString() : ""}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 p-1"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Category & Problem Type */}
                    <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                        <div className="flex items-center gap-2">
                            <span
                                className="w-3 h-3 rounded-full inline-block"
                                style={{ backgroundColor: report?.category.color }}
                            />
                            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                {report?.category.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-900 font-medium text-sm">
                            <div
                                className="p-1.5 rounded-md text-white flex items-center justify-center"
                                style={{ backgroundColor: report?.category.color }}
                            >
                                <ProblemIcon size={16} />
                            </div>
                            <span>{report?.problemType.name}</span>
                        </div>
                    </div>

                    {/* Status and Severity */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[report?.status || ""] || "bg-gray-100 text-gray-800"
                                }`}
                        >
                            {report?.status.replace("_", " ")}
                        </span>
                        {report?.severity && (
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${severityColors[report?.severity] || "bg-gray-100 text-gray-800"
                                    }`}
                            >
                                {report?.severity} severity
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            {report?.description}
                        </p>
                    </div>

                    {/* Location */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-slate-900 mb-2">Location</h3>
                        <p className="text-slate-600 text-sm">
                            {report?.barangay && <span>{report?.barangay}, </span>}
                            <span>{report?.latitude.toFixed(4)}, {report?.longitude.toFixed(4)}</span>
                        </p>
                    </div>

                    {/* Media */}
                    {report?.media && report?.media.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-semibold text-slate-900 mb-3">Media</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {report?.media.map((media) => (
                                    <img
                                        key={media?.id}
                                        src={media?.url}
                                        alt={`Report media ${media?.id}`}
                                        className="w-full h-32 object-cover rounded-md"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                        {onEdit && (
                            <button
                                onClick={onEdit}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 text-sm"
                            >
                                Edit
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={onDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 text-sm"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
