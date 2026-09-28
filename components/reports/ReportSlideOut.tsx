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
}

export function ReportSlideOut({
    isOpen,
    onClose,
    onEdit,
    onDelete,
}: ReportSlideOutProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const grabRef = useRef<HTMLDivElement>(null);
    const { selectedReportId } = useMapState();
    const { data: report, isLoading } = useReport(selectedReportId || "");

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

        const peekY = -120;
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
                    "top-[100%] w-full max-md:h-dvh rounded-t-2xl",
                    // Desktop styles
                    "md:top-20 md:h-fit md:w-96 md:max-h-[80dvh] md:rounded-2xl",
                    isOpen
                        ? "md:translate-x-0 md:right-4"
                        : "md:translate-x-full right-0"
                )}
            >
                <div ref={grabRef} className="absolute top-0 right-0 w-full py-4 md:hidden cursor-grab active:cursor-grabbing">
                    <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200" />
                </div>
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
                            className="max-md:hidden absolute top-4 right-4 bg-white rounded-full text-slate-400 hover:text-slate-600 p-1"
                        >
                            <X size={20} />
                        </button>
                    </>
                )}
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{isLoading ? 'Loading...' : report?.title}</h2>
                            <p className="text-sm text-slate-600 mt-1">
                                {isLoading ? 'loading...' : report?.createdAt ? new Date(report.createdAt).toLocaleDateString() : ""}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="hidden max-md:block text-slate-400 hover:text-slate-600 p-1"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {report?.url && (
                        <div className="md:hidden w-full bg-gray-200">
                            <Image
                                key={report?.id}
                                src={report?.url}
                                width={766}
                                height={300}
                                alt={`Report media ${report?.id}`}
                                className="w-full h-52 object-cover mx-auto rounded-t-md pointer-events-none select-none"
                            />
                        </div>
                    )}

                    {/* Category & Problem Type */}
                    <div className="mb-6 p-3 bg-slate-50 rounded-b-lg md:rounded-lg border border-slate-200 space-y-2">
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

                    {/* Actions */}
                    {(onEdit || onDelete) && (
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
                    )}
                </div>
            </div>
        </>
    );
}
