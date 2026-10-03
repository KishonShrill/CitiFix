"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate, createDraggable, type Draggable } from "animejs";
import { useReport } from "@/hooks/useReports";
import { useMapState } from "@/context/AppState";
import { X, Copy, Check, Share2, Maximize2, ImageOff } from "lucide-react";
import { getIcon } from "@/lib/icons";
import { cn } from "@/utils/cn";
import { toast } from "sonner";

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
    const previewImgRef = useRef<HTMLDivElement>(null);
    const { selectedReportId } = useMapState();
    const { data: report, isLoading, isFetching } = useReport(selectedReportId || "");

    const [isCopiedCoords, setIsCopiedCoords] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const draggableRef = useRef<any>(null);
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    // Handle Escape key to close panel or lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (isLightboxOpen) {
                    setIsLightboxOpen(false);
                } else if (isOpen) {
                    onClose();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isLightboxOpen, onClose]);

    // Initialize Mobile Anime.js Draggable
    useEffect(() => {
        if (!panelRef.current || !grabRef.current) return;
        if (window.innerWidth >= 768) return;

        const panel = panelRef.current;
        const height = window.innerHeight;
        const image = previewImgRef.current;

        const peekY = -100;
        const midY = -height * 0.45;
        const fullY = -height + 61;

        const snapPoints = [0, peekY, midY, fullY];

        const draggable = createDraggable(panel, {
            trigger: grabRef.current,
            x: false,
            y: { snap: snapPoints },
            releaseStiffness: 75,
            releaseEase: "out(5)",
            onUpdate: (d: Draggable) => {
                panelRef.current.style.zIndex = "60";
                if (d.y <= fullY + 50) {
                    panelRef.current.style.overflowY = "auto";
                } else {
                    panelRef.current.style.overflowY = "hidden";
                }
                if (image) {
                    if (d.y <= fullY + 50) {
                        previewImgRef.current.style.pointerEvents = "auto";

                    } else {
                        previewImgRef.current.style.pointerEvents = "none";
                    }
                }
            },
            onSettle: (d: Draggable) => {
                if (d.y >= -10) {
                    onCloseRef.current();
                }
            },
            onDrag: (d: Draggable) => {
                if (d.y > fullY + 50) {
                    panelRef.current.scrollTo({
                        top: 0,
                        behavior: "smooth",
                    });
                }
            },
        });

        draggableRef.current = draggable;

        return () => {
            if (draggableRef.current && typeof draggableRef.current.revert === "function") {
                draggableRef.current.revert();
            }
            draggableRef.current = null;
        };
    }, []);

    // Mobile slide animation on open/close or report change
    useEffect(() => {
        const panel = panelRef.current;
        if (!panel) return;

        if (window.innerWidth < 768) {
            if (isOpen && selectedReportId) {
                const height = window.innerHeight;
                animate(panel, {
                    y: -height * 0.45,
                    duration: 350,
                    ease: "out(3)",
                }).then(() => {
                    if (draggableRef.current && typeof draggableRef.current.setY === "function") {
                        draggableRef.current.setY(-height * 0.45, true);
                    }
                });
            } else if (!isOpen) {
                animate(panel, {
                    y: 0,
                    duration: 350,
                    ease: "out(3)",
                }).then(() => {
                    if (draggableRef.current && typeof draggableRef.current.setY === "function") {
                        draggableRef.current.setY(0, true);
                    }
                });
            }
        }
    }, [isOpen, selectedReportId]);

    const statusColors: Record<string, string> = {
        submitted: "bg-yellow-100 text-yellow-800 border-yellow-200",
        under_review: "bg-blue-100 text-blue-800 border-blue-200",
        verified: "bg-green-100 text-green-800 border-green-200",
        rejected: "bg-red-100 text-red-800 border-red-200",
        duplicate: "bg-gray-100 text-gray-800 border-gray-200",
    };

    const severityColors: Record<string, string> = {
        low: "bg-green-100 text-green-800 border-green-200",
        medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
        high: "bg-red-100 text-red-800 border-red-200",
    };

    const handleCopyCoords = () => {
        if (!report) return;
        const coordsText = `${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}`;
        navigator.clipboard.writeText(coordsText);
        setIsCopiedCoords(true);
        toast.success("Coordinates copied to clipboard!");
        setTimeout(() => setIsCopiedCoords(false), 2000);
    };

    const handleShare = () => {
        if (!report) return;
        const url = `${window.location.origin}/reports/${report.id}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
            toast.success("Report link copied to clipboard!");
        }
    };

    const ProblemIcon = getIcon(report?.problemType?.icon as string);

    return (
        <>
            {/* ========================================================================= */}
            {/* DESKTOP DUAL-ISLAND FLOATING HUD (>= 768px)                               */}
            {/* Center space is 100% open so users can freely pan/drag the map             */}
            {/* ========================================================================= */}
            <div
                className={cn(
                    "fixed top-18 left-4 right-4 z-40 pointer-events-none hidden md:flex justify-between items-start gap-6 transition-all duration-300",
                    isOpen && selectedReportId
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-4 pointer-events-none"
                )}
            >
                {/* ----------------- LEFT ISLAND: REPORT DOSSIER ----------------- */}
                <div
                    className={cn(
                        "w-[440px] max-w-[45vw] bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 p-5 space-y-4 max-h-[calc(100dvh-5.5rem)] overflow-y-auto",
                        selectedReportId
                            ? "pointer-events-auto"
                            : "pointer-events-none"
                    )}
                >
                    {isLoading || !report ? (
                        /* Left Island Skeleton */
                        <div className="space-y-4 animate-pulse">
                            <div className="flex justify-between items-center">
                                <div className="h-4 bg-slate-200 rounded w-28" />
                                <div className="flex gap-2">
                                    <div className="h-5 bg-slate-200 rounded-full w-16" />
                                    <div className="h-5 bg-slate-200 rounded-full w-20" />
                                </div>
                            </div>
                            <div className="h-7 bg-slate-200 rounded-md w-3/4" />
                            <div className="h-10 bg-slate-100 rounded-lg w-full" />
                            <div className="space-y-2 pt-2">
                                <div className="h-4 bg-slate-200 rounded w-24" />
                                <div className="h-3 bg-slate-100 rounded w-full" />
                                <div className="h-3 bg-slate-100 rounded w-5/6" />
                            </div>
                            <div className="space-y-2 pt-2">
                                <div className="h-4 bg-slate-200 rounded w-20" />
                                <div className="h-3 bg-slate-100 rounded w-1/2" />
                            </div>
                        </div>
                    ) : (
                        /* Left Island Content */
                        <>
                            {/* Header: Date + Status & Severity Badges */}
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <p className="text-xs font-medium text-slate-500">
                                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString(undefined, {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        }) : ""}
                                    </p>
                                    {isFetching && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 animate-pulse">
                                            Updating
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span
                                        className={cn(
                                            "px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border",
                                            statusColors[report.status] || "bg-gray-100 text-gray-800 border-gray-200"
                                        )}
                                    >
                                        {report.status.replace("_", " ")}
                                    </span>
                                    {report.severity && (
                                        <span
                                            className={cn(
                                                "px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border",
                                                severityColors[report.severity] || "bg-gray-100 text-gray-800 border-gray-200"
                                            )}
                                        >
                                            {report.severity}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 leading-snug">
                                    {report.title}
                                </h2>
                            </div>

                            {/* Category & Problem Type Pill */}
                            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/90 gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span
                                        className="w-3 h-3 rounded-full shrink-0"
                                        style={{ backgroundColor: report.category?.color || "#94a3b8" }}
                                    />
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider truncate">
                                        {report.category?.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-900 font-medium text-xs bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs shrink-0">
                                    <div
                                        className="p-1 rounded text-white flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: report.category?.color || "#94a3b8" }}
                                    >
                                        <ProblemIcon size={13} />
                                    </div>
                                    <span className="truncate">{report.problemType?.name}</span>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                                    Description
                                </h3>
                                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                    {report.description}
                                </p>
                            </div>

                            {/* Location */}
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                                    Location
                                </h3>
                                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                                    <div className="text-slate-700 space-y-0.5">
                                        {report.barangay && (
                                            <p className="font-semibold text-slate-900">{report.barangay}, Iligan City</p>
                                        )}
                                        <p className="text-slate-500 font-mono">
                                            {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleCopyCoords}
                                        title="Copy Coordinates"
                                        className="cursor-pointer flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
                                    >
                                        {isCopiedCoords ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                                        <span className="text-[11px] font-medium">{isCopiedCoords ? "Copied" : "Copy GPS"}</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* ----------------- RIGHT ISLAND: MEDIA & ACTION CONTROLS ----------------- */}
                <div
                    className={cn("w-[360px] max-w-[40vw] bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 p-4 space-y-3 relative max-h-[calc(100dvh-5.5rem)] overflow-y-auto",
                        selectedReportId
                            ? "pointer-events-auto"
                            : "pointer-events-none"
                    )}
                >
                    {/* Top Close Button */}
                    <button
                        onClick={onClose}
                        title="Close details (Esc)"
                        className="cursor-pointer absolute top-2.5 right-3 z-10 p-1 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 shadow-sm border border-slate-200 transition-all hover:scale-105"
                    >
                        <X size={18} />
                    </button>

                    {isLoading || !report ? (
                        /* Right Island Skeleton */
                        <div className="space-y-3 animate-pulse">
                            <div className="w-full h-48 bg-slate-200 rounded-xl" />
                            <div className="h-9 bg-slate-100 rounded-lg w-full" />
                            <div className="flex gap-2">
                                <div className="h-9 bg-slate-200 rounded-lg flex-1" />
                            </div>
                        </div>
                    ) : (
                        /* Right Island Content */
                        <>
                            <div className="pr-8">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Report Media
                                </h3>
                            </div>

                            {/* Media Box */}
                            {report.url ? (
                                <div
                                    onClick={() => setIsLightboxOpen(true)}
                                    className="relative group w-full h-48 bg-slate-100 rounded-xl overflow-hidden cursor-pointer border border-slate-200 shadow-inner"
                                >
                                    <Image
                                        src={report.url}
                                        alt={report.title}
                                        fill
                                        sizes="360px"
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-xs text-white text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5">
                                            <Maximize2 size={13} />
                                            <span>Click to expand</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-36 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 gap-1.5">
                                    <ImageOff size={24} />
                                    <span className="text-xs font-medium">No image attached</span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-2 pt-1">
                                <button
                                    onClick={handleShare}
                                    className="cursor-pointer w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors border border-slate-200"
                                >
                                    <Share2 size={14} />
                                    Share Report Link
                                </button>

                                {(onEdit || onDelete) && (
                                    <div className="flex gap-2 pt-1 border-t border-slate-100">
                                        {onEdit && (
                                            <button
                                                onClick={onEdit}
                                                disabled={isDeleting}
                                                className="cursor-pointer flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                                            >
                                                Edit
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                onClick={onDelete}
                                                disabled={isDeleting}
                                                className="cursor-pointer flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
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
            </div>

            {/* ========================================================================= */}
            {/* MOBILE BOTTOM SHEET (< 768px)                                             */}
            {/* Gesture-driven Anime.js draggable bottom sheet                             */}
            {/* ========================================================================= */}
            <div
                ref={panelRef}
                id="slide-out-panel"
                className={cn(
                    "fixed bg-white shadow-2xl z-60 md:hidden",
                    "top-full left-0 right-0 w-full max-md:h-[calc(100dvh-64px)] rounded-t-2xl"
                )}
            >
                {/* Grab handle for touch drag */}
                <div ref={grabRef} className="sticky top-0 left-0 right-0 w-full pt-2.75 pb-2.75 mb-2.5 bg-white/95 backdrop-blur-xs cursor-grab active:cursor-grabbing z-30 border-b border-slate-100">
                    <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-300" />
                </div>

                {/* Progress bar during refetch */}
                {(isLoading || isFetching) && (
                    <div className="sticky top-[25px] left-0 right-0 h-1 bg-slate-100 overflow-hidden z-20">
                        <div className="h-full bg-blue-600 animate-pulse w-full" />
                    </div>
                )}

                {/* Loading / Skeleton State */}
                {isLoading || !report ? (
                    <div className="p-5 space-y-5">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1 mr-4">
                                <div className="h-6 bg-slate-200 rounded-md animate-pulse w-3/4" />
                                <div className="h-4 bg-slate-100 rounded animate-pulse w-1/3" />
                            </div>
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="w-full h-44 bg-slate-200 animate-pulse rounded-xl" />
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
                            <div className="h-5 bg-slate-200 rounded w-36 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 bg-slate-200 rounded w-20 animate-pulse" />
                            <div className="h-3 bg-slate-100 rounded w-full animate-pulse" />
                            <div className="h-3 bg-slate-100 rounded w-4/5 animate-pulse" />
                        </div>
                    </div>
                ) : (
                    <div className="px-5 space-y-4 pb-12 overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-slate-900 leading-snug">
                                    {report.title}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-slate-500">
                                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : ""}
                                    </p>
                                    {isFetching && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 animate-pulse">
                                            Updating
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleShare}
                                    className="cursor-pointer w-full flex items-center justify-center gap-2 p-2.5 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold border border-slate-200"
                                >
                                    <Share2 size={18} />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="cursor-pointer text-slate-700 md:text-slate-400 hover:text-slate-700 p-2.5 bg-slate-100 rounded-full border border-slate-200"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Status and Severity Badges */}
                        <div className="flex gap-2 flex-wrap">
                            <span
                                className={cn(
                                    "px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border",
                                    statusColors[report.status] || "bg-gray-100 text-gray-800 border-gray-200"
                                )}
                            >
                                {report.status.replace("_", " ")}
                            </span>
                            {report.severity && (
                                <span
                                    className={cn(
                                        "px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border",
                                        severityColors[report.severity] || "bg-gray-100 text-gray-800 border-gray-200"
                                    )}
                                >
                                    {report.severity} severity
                                </span>
                            )}
                        </div>

                        {/* Mobile Media */}
                        {report.url && (
                            <div
                                ref={previewImgRef}
                                onClick={() => setIsLightboxOpen(true)}
                                className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 cursor-pointer"
                            >
                                <Image
                                    src={report.url}
                                    alt={report.title}
                                    fill
                                    sizes="100vw"
                                    className="object-cover"
                                />
                            </div>
                        )}

                        {/* Category & Problem Type */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={{ backgroundColor: report.category?.color || "#94a3b8" }}
                                />
                                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                    {report.category?.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-900 font-medium text-sm">
                                <div
                                    className="p-1.5 rounded-md text-white flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: report.category?.color || "#94a3b8" }}
                                >
                                    <ProblemIcon size={16} />
                                </div>
                                <span>{report.problemType?.name}</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="font-semibold text-slate-900 text-sm mb-1.5">Description</h3>
                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 p-3 rounded-xl border border-slate-100">
                                {report.description}
                            </p>
                        </div>

                        {/* Location */}
                        <div>
                            <h3 className="font-semibold text-slate-900 text-sm mb-1.5">Location</h3>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                                <div>
                                    {report.barangay && <p className="font-medium text-slate-900">{report.barangay}, Iligan City</p>}
                                    <p className="text-slate-500 font-mono">
                                        {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                                    </p>
                                </div>
                                <button
                                    onClick={handleCopyCoords}
                                    className="cursor-pointer flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white text-slate-700 border border-slate-200"
                                >
                                    {isCopiedCoords ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                                    <span className="text-[11px] font-medium">{isCopiedCoords ? "Copied" : "Copy GPS"}</span>
                                </button>
                            </div>
                        </div>

                        {/* Mobile Actions */}
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                            <button
                                onClick={handleShare}
                                className="cursor-pointer w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold border border-slate-200"
                            >
                                <Share2 size={16} />
                                Share Report Link
                            </button>

                            {(onEdit || onDelete) && (
                                <div className="flex gap-2">
                                    {onEdit && (
                                        <button
                                            onClick={onEdit}
                                            disabled={isDeleting}
                                            className="cursor-pointer flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            Edit
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={onDelete}
                                            disabled={isDeleting}
                                            className="cursor-pointer flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {isDeleting ? "Deleting..." : "Delete"}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* FULLSCREEN LIGHTBOX MODAL                                                 */}
            {/* ========================================================================= */}
            {isLightboxOpen && report?.url && (
                <div
                    className="fixed inset-0 z-70 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    <button
                        onClick={() => setIsLightboxOpen(false)}
                        className="cursor-pointer absolute top-4 right-4 text-white hover:text-slate-300 p-2 rounded-full bg-black/40 border border-white/20"
                        title="Close (Esc)"
                    >
                        <X size={24} />
                    </button>

                    <div
                        className="relative w-full h-[85dvh] overflow-auto flex justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={report.url}
                            alt={report.title}
                            unoptimized
                            className="object-contain w-full"
                            priority
                        />
                    </div>
                </div>
            )}
        </>
    );
}
