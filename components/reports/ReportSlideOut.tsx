"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate, createDraggable, type Draggable } from "animejs";
import { useReport, useReportMedia } from "@/hooks/useReports";
import { useMapState } from "@/context/AppState";
import { X, Copy, Check, Share2, Maximize2, ImageOff, ChevronLeft, ChevronRight } from "lucide-react";
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
    const { data: mediaItems = [] } = useReportMedia(selectedReportId || "");

    const allMediaUrls: string[] =
        mediaItems && mediaItems.length > 0
            ? mediaItems.map((m) => m.url)
            : report?.url
                ? [report.url]
                : [];

    const [isCopiedCoords, setIsCopiedCoords] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [activeLightboxIndex, setActiveLightboxIndex] = useState(0);

    const draggableRef = useRef<any>(null);
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    // Reset active photo index when selected report changes
    useEffect(() => {
        setActiveLightboxIndex(0);
        setIsLightboxOpen(false);
    }, [selectedReportId]);

    // Handle Escape key to close panel or lightbox, and Arrow keys to navigate lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (isLightboxOpen) {
                    setIsLightboxOpen(false);
                } else if (isOpen) {
                    onClose();
                }
            } else if (isLightboxOpen && allMediaUrls.length > 1) {
                if (e.key === "ArrowLeft") {
                    setActiveLightboxIndex((prev) => (prev === 0 ? allMediaUrls.length - 1 : prev - 1));
                } else if (e.key === "ArrowRight") {
                    setActiveLightboxIndex((prev) => (prev === allMediaUrls.length - 1 ? 0 : prev + 1));
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isLightboxOpen, onClose, allMediaUrls.length]);

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
                panel.style.zIndex = "60";
                if (d.y <= fullY + 50) {
                    panel.style.overflowY = "auto";
                } else {
                    panel.style.overflowY = "hidden";
                }
                if (image) {
                    if (d.y <= fullY + 50) {
                        image.style.pointerEvents = "auto";
                    } else {
                        image.style.pointerEvents = "none";
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
                    panel.scrollTo({
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
                            <div className="flex items-center justify-between pr-8">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Report Media
                                </h3>
                                {allMediaUrls.length > 1 && (
                                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                        {allMediaUrls.length} photos
                                    </span>
                                )}
                            </div>

                            {/* Media Box */}
                            {allMediaUrls.length > 0 ? (
                                <div className="space-y-2">
                                    {/* Primary Main Photo Preview */}
                                    <div
                                        onClick={() => {
                                            setActiveLightboxIndex(0);
                                            setIsLightboxOpen(true);
                                        }}
                                        className="relative group w-full h-48 bg-slate-100 rounded-xl overflow-hidden cursor-pointer border border-slate-200 shadow-inner"
                                    >
                                        <Image
                                            src={allMediaUrls[0]}
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
                                        {allMediaUrls.length > 1 && (
                                            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
                                                1 / {allMediaUrls.length}
                                            </div>
                                        )}
                                    </div>

                                    {/* Remaining Photos Thumbnails Grid */}
                                    {allMediaUrls.length > 1 && (
                                        <div className="grid grid-cols-2 gap-2">
                                            {allMediaUrls.slice(1).map((url, index) => {
                                                const photoIndex = index + 1;
                                                return (
                                                    <div
                                                        key={photoIndex}
                                                        onClick={() => {
                                                            setActiveLightboxIndex(photoIndex);
                                                            setIsLightboxOpen(true);
                                                        }}
                                                        className="relative group aspect-video bg-slate-100 rounded-lg overflow-hidden cursor-pointer border border-slate-200 hover:border-blue-400 transition-all shadow-2xs"
                                                    >
                                                        <Image
                                                            src={url}
                                                            alt={`${report.title} photo ${photoIndex + 1}`}
                                                            fill
                                                            sizes="180px"
                                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                                                                <Maximize2 size={11} />
                                                            </div>
                                                        </div>
                                                        <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-medium px-1.5 py-0.5 rounded">
                                                            {photoIndex + 1} / {allMediaUrls.length}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
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
                        {allMediaUrls.length > 0 && (
                            <div className="space-y-2">
                                <div
                                    ref={previewImgRef}
                                    onClick={() => {
                                        setActiveLightboxIndex(0);
                                        setIsLightboxOpen(true);
                                    }}
                                    className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 cursor-pointer"
                                >
                                    <Image
                                        src={allMediaUrls[0]}
                                        alt={report.title}
                                        fill
                                        sizes="100vw"
                                        className="object-cover"
                                    />
                                    {allMediaUrls.length > 1 && (
                                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
                                            1 / {allMediaUrls.length}
                                        </div>
                                    )}
                                </div>

                                {/* Mobile Remaining Photos Grid */}
                                {allMediaUrls.length > 1 && (
                                    <div className="grid grid-cols-2 gap-2">
                                        {allMediaUrls.slice(1).map((url, index) => {
                                            const photoIndex = index + 1;
                                            return (
                                                <div
                                                    key={photoIndex}
                                                    onClick={() => {
                                                        setActiveLightboxIndex(photoIndex);
                                                        setIsLightboxOpen(true);
                                                    }}
                                                    className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 cursor-pointer"
                                                >
                                                    <Image
                                                        src={url}
                                                        alt={`${report.title} photo ${photoIndex + 1}`}
                                                        fill
                                                        sizes="50vw"
                                                        className="object-cover"
                                                    />
                                                    <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-medium px-1.5 py-0.5 rounded">
                                                        {photoIndex + 1} / {allMediaUrls.length}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
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
            {isLightboxOpen && allMediaUrls.length > 0 && (
                <div
                    className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    {/* Top Counter Badge */}
                    {allMediaUrls.length > 1 && (
                        <div className="absolute top-4 left-4 text-white bg-black/50 border border-white/20 px-3 py-1 rounded-full text-xs font-medium z-50">
                            {activeLightboxIndex + 1} / {allMediaUrls.length}
                        </div>
                    )}

                    {/* Close Button */}
                    <button
                        onClick={() => setIsLightboxOpen(false)}
                        className="cursor-pointer absolute top-4 right-4 text-white hover:text-slate-300 p-2 rounded-full bg-black/50 border border-white/20 z-50 transition-colors"
                        title="Close (Esc)"
                    >
                        <X size={22} />
                    </button>

                    {/* Previous Button */}
                    {allMediaUrls.length > 1 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveLightboxIndex((prev) => (prev === 0 ? allMediaUrls.length - 1 : prev - 1));
                            }}
                            className="cursor-pointer absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-slate-200 bg-black/50 hover:bg-black/70 border border-white/20 p-2.5 rounded-full z-50 transition-all hover:scale-105"
                            title="Previous photo (Left Arrow)"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    {/* Next Button */}
                    {allMediaUrls.length > 1 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveLightboxIndex((prev) => (prev === allMediaUrls.length - 1 ? 0 : prev + 1));
                            }}
                            className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-slate-200 bg-black/50 hover:bg-black/70 border border-white/20 p-2.5 rounded-full z-50 transition-all hover:scale-105"
                            title="Next photo (Right Arrow)"
                        >
                            <ChevronRight size={24} />
                        </button>
                    )}

                    {/* Main Image View */}
                    <div
                        className="relative w-full h-[80dvh] max-w-5xl flex items-center justify-center overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={allMediaUrls[activeLightboxIndex] || allMediaUrls[0]}
                            alt={`${report?.title || "Report photo"} ${activeLightboxIndex + 1}`}
                            unoptimized
                            className="object-contain max-h-full w-auto max-w-full"
                            fill
                            priority
                        />
                    </div>

                    {/* Bottom Thumbnail Selector in Lightbox */}
                    {allMediaUrls.length > 1 && (
                        <div
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 z-50 max-w-[90vw] overflow-x-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {allMediaUrls.map((url, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveLightboxIndex(idx)}
                                    className={cn(
                                        "relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0",
                                        activeLightboxIndex === idx
                                            ? "border-blue-500 scale-105 shadow-md"
                                            : "border-transparent opacity-60 hover:opacity-100"
                                    )}
                                    title={`View photo ${idx + 1}`}
                                >
                                    <Image
                                        src={url}
                                        alt={`Thumbnail ${idx + 1}`}
                                        fill
                                        sizes="48px"
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
