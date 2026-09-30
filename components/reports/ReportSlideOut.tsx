"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { animate, createDraggable } from 'animejs';
import { useReport } from "@/hooks/useReports";
import { useMapState } from "@/context/AppState";
import { X } from "lucide-react";
import { getIcon } from "@/lib/icons";
import { cn } from "@/utils/cn";

interface ReportSlideOutProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    isDeleting?: boolean;
}

export function ReportSlideOut({
    isOpen,
    onClose,
    onEdit,
    onDelete,
    isDeleting,
}: ReportSlideOutProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const grabRef = useRef<HTMLDivElement>(null);
    const { selectedReportId } = useMapState();
    const { data: report, isLoading, isFetching } = useReport(selectedReportId || "");

    const draggableRef = useRef<any>(null);
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!panelRef.current || !grabRef.current) return;
        if (window.innerWidth >= 768) return;

        const panel = panelRef.current;
        const height = window.innerHeight;

        const peekY = -100;
        const midY = -height * 0.45;
        const fullY = -height + 61;

        const snapPoints = [0, peekY, midY, fullY];

        const draggable = createDraggable(panel, {
            trigger: grabRef.current,
            x: false,
            y: { snap: snapPoints },
            releaseStiffness: 75,
            releaseEase: 'out(5)',
            onSettle: (d: any) => {
                if (d.y >= -10) {
                    onCloseRef.current();
                }
            }
        });

        draggableRef.current = draggable;

        return () => {
            if (draggableRef.current && typeof draggableRef.current.revert === 'function') {
                draggableRef.current.revert();
            }
            draggableRef.current = null;
        };
    }, []); // Run initialization once

    useEffect(() => {
        const panel = panelRef.current;
        if (!panel) return;

        if (window.innerWidth < 768) {
            // Manage sliding internally
            if (isOpen && selectedReportId) {
                const height = window.innerHeight;
                animate(panel, {
                    y: -height * 0.45,
                    duration: 350,
                    ease: "out(3)",
                }).then(() => {
                    // Update instance internally so next drag doesn't jump
                    if (draggableRef.current && typeof draggableRef.current.setY === 'function') {
                        draggableRef.current.setY(-height * 0.45, true);
                    }
                });
            } else if (!isOpen) {
                animate(panel, {
                    y: 0,
                    duration: 350,
                    ease: "out(3)",
                }).then(() => {
                    if (draggableRef.current && typeof draggableRef.current.setY === 'function') {
                        draggableRef.current.setY(0, true);
                    }
                });
            }
        }
    }, [isOpen, selectedReportId]); // Animate on open or ID change!

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

    //if (!report && isOpen) return null;

    const ProblemIcon = getIcon(report?.problemType.icon as string);

    return (
        <>
            {/* Slide-out panel */}
            <div
                ref={panelRef}
                id="slide-out-panel"
                className={cn(
                    "fixed bg-white shadow-lg z-50 overflow-y-auto",
                    // Mobile bottom sheet styles
                    "top-full w-full max-md:h-dvh rounded-t-2xl",
                    // Desktop styles
                    "md:top-16 md:h-fit md:w-96 md:max-h-[80dvh] md:rounded-2xl",
                    isOpen
                        ? "md:translate-x-0 md:right-4"
                        : "md:translate-x-full right-0"
                )}
            >
                <div ref={grabRef} className="absolute top-0 right-0 w-full py-4 md:hidden cursor-grab active:cursor-grabbing z-10">
                    <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200" />
                </div>

                {/* Top subtle progress bar when fetching or loading */}
                {(isLoading || isFetching) && (
                    <div className="sticky top-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden z-20">
                        <div className="h-full bg-blue-600 animate-pulse w-full" />
                    </div>
                )}

                {/* Loading / Skeleton State */}
                {isLoading || !report ? (
                    <div className="p-6 space-y-6">
                        {/* Skeleton Media (desktop) */}
                        <div className="max-md:hidden w-full h-52 bg-slate-200 animate-pulse rounded-t-md -mt-6 -mx-6 mb-6" style={{ width: "calc(100% + 3rem)" }} />

                        {/* Header Skeleton */}
                        <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1 mr-4">
                                <div className="h-7 bg-slate-200 rounded-md animate-pulse w-3/4" />
                                <div className="h-4 bg-slate-100 rounded animate-pulse w-1/3" />
                            </div>
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Skeleton Media (mobile) */}
                        <div className="md:hidden w-full h-44 bg-slate-200 animate-pulse rounded-lg" />

                        {/* Category & Problem Type Skeleton */}
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-slate-200 animate-pulse" />
                                <div className="h-3 bg-slate-200 rounded w-20 animate-pulse" />
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-md bg-slate-200 animate-pulse" />
                                <div className="h-4 bg-slate-200 rounded w-32 animate-pulse" />
                            </div>
                        </div>

                        {/* Status and Severity Skeleton */}
                        <div className="flex gap-2">
                            <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse" />
                            <div className="h-6 w-24 bg-slate-200 rounded-full animate-pulse" />
                        </div>

                        {/* Description Skeleton */}
                        <div className="space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-24 animate-pulse mb-2" />
                            <div className="h-3 bg-slate-100 rounded w-full animate-pulse" />
                            <div className="h-3 bg-slate-100 rounded w-5/6 animate-pulse" />
                            <div className="h-3 bg-slate-100 rounded w-4/6 animate-pulse" />
                        </div>

                        {/* Location Skeleton */}
                        <div className="space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-20 animate-pulse mb-2" />
                            <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse" />
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Media */}
                        {report?.url && (
                            <>
                                <div className="max-md:hidden w-full bg-gray-200">
                                    <Image
                                        key={report?.id}
                                        src={report?.url}
                                        width={766}
                                        height={300}
                                        alt={`Report media ${report?.id}`}
                                        className="w-full h-52 object-cover mx-auto rounded-t-md pointer-events-none select-none"
                                    />
                                </div>
                                <button
                                    onClick={onClose}
                                    className="max-md:hidden absolute top-4 right-4 z-50 bg-white rounded-full text-slate-400 hover:text-slate-600 p-1 shadow-sm"
                                >
                                    <X size={20} />
                                </button>
                            </>
                        )}
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center justify-center gap-2">
                                        <h2 className="text-2xl font-bold text-slate-900">{report?.title}</h2>
                                        {isFetching && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 animate-pulse">
                                                Updating
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className={cn("md:hidden z-40 text-slate-400 hover:text-slate-600 p-1",
                                        !report.url && "block!")}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex justify-between ">
                                <p className="text-sm text-slate-600 mt-1">
                                    {report?.createdAt ? new Date(report.createdAt).toLocaleDateString() : ""}
                                </p>

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
                            </div>


                            {report?.url && (
                                <div className="md:hidden w-full bg-gray-200">
                                    <Image
                                        key={report?.id}
                                        src={report?.url}
                                        width={766}
                                        height={300}
                                        alt={`Report media ${report?.id}`}
                                        className="w-full h-52 object-cover mx-auto rounded-md pointer-events-none select-none"
                                    />
                                </div>
                            )}

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

                            {/* Actions */}
                            {(onEdit || onDelete) && (
                                <div className="flex gap-3 pt-4 border-t border-slate-200">
                                    {onEdit && (
                                        <button
                                            onClick={onEdit}
                                            disabled={isDeleting}
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 text-sm cursor-pointer transition-colors"
                                        >
                                            Edit
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={onDelete}
                                            disabled={isDeleting}
                                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 disabled:opacity-50 text-sm cursor-pointer transition-colors"
                                        >
                                            {isDeleting ? "Deleting..." : "Delete"}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
