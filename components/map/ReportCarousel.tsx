"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { animate } from "animejs";
import type { Report } from "@/lib/api/reports";
import { getIcon } from "@/lib/icons";
import { cn } from "@/utils/cn";

interface ReportCarouselProps {
  reports: Report[];
  selectedReportId?: string;
  onReportSelect: (reportId: string) => void;
  isSidePanelOpen?: boolean;
}

export function ReportCarousel({
  reports,
  selectedReportId,
  onReportSelect,
  isSidePanelOpen,
}: ReportCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Hover state for auto-hide / show on bottom-middle trigger hover
  const [isHovered, setIsHovered] = useState(false);

  // Drag to scroll state for cursor style
  const [isDraggingState, setIsDraggingState] = useState(false);

  // Refs for drag and inertia mechanics
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const lastMouseXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const glideAnimationRef = useRef<any>(null);

  // Sort reports by publishedAt or createdAt descending (newest first)
  const sortedReports = React.useMemo(() => {
    return [...reports].sort((a, b) => {
      const timeA = new Date(a.publishedAt || a.createdAt).getTime();
      const timeB = new Date(b.publishedAt || b.createdAt).getTime();
      return timeB - timeA;
    });
  }, [reports]);

  // Scroll to selected card when selectedReportId changes (without forcing carousel open)
  useEffect(() => {
    if (!selectedReportId) return;
    const cardEl = cardRefs.current.get(selectedReportId);
    if (cardEl && scrollContainerRef.current) {
      cardEl.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selectedReportId]);

  // 1:1 Drag tracking & Anime.js inertia glide on release
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !scrollContainerRef.current) return;
      e.preventDefault();

      const deltaX = e.clientX - startXRef.current;
      if (Math.abs(deltaX) > 4) {
        hasDraggedRef.current = true;
      }

      const currentTime = performance.now();
      const dt = currentTime - lastTimeRef.current;
      const dx = e.clientX - lastMouseXRef.current;

      if (dt > 0) {
        velocityRef.current = dx / dt; // pixels per ms
      }

      lastMouseXRef.current = e.clientX;
      lastTimeRef.current = currentTime;

      scrollContainerRef.current.scrollLeft = startScrollLeftRef.current - deltaX;
    };

    const handleGlobalMouseUp = () => {
      if (!isDraggingRef.current || !scrollContainerRef.current) return;
      isDraggingRef.current = false;
      setIsDraggingState(false);

      const container = scrollContainerRef.current;
      const initialScroll = container.scrollLeft;
      const targetScroll = initialScroll - velocityRef.current * 250; // momentum glide distance

      if (Math.abs(velocityRef.current) > 0.05) {
        glideAnimationRef.current = animate(container, {
          scrollLeft: targetScroll,
          duration: 700,
          ease: "out(4)",
        });
      }
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    if (glideAnimationRef.current) {
      glideAnimationRef.current.pause();
      glideAnimationRef.current = null;
    }

    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    setIsDraggingState(true);
    startXRef.current = e.clientX;
    startScrollLeftRef.current = scrollContainerRef.current.scrollLeft;
    lastMouseXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
  };

  const handleScrollLeft = () => {
    if (glideAnimationRef.current) {
      glideAnimationRef.current.pause();
      glideAnimationRef.current = null;
    }
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: -340, behavior: "smooth" });
  };

  const handleScrollRight = () => {
    if (glideAnimationRef.current) {
      glideAnimationRef.current.pause();
      glideAnimationRef.current = null;
    }
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: 340, behavior: "smooth" });
  };

  const statusColors: Record<string, string> = {
    submitted: "bg-amber-500/90 text-white",
    under_review: "bg-blue-500/90 text-white",
    verified: "bg-emerald-500/90 text-white",
    rejected: "bg-rose-500/90 text-white",
    duplicate: "bg-slate-500/90 text-white",
  };

  if (sortedReports.length === 0) return null;

  return (
    <>
      {/* Bottom-Middle Trigger Area (Invisible half-circle / hover trigger zone) */}
      <div
        className="absolute hidden md:flex bottom-0 left-1/2 -translate-x-1/2 w-56 h-14 z-30 pointer-events-auto items-end justify-center pb-2 cursor-pointer group/trigger"
        onMouseEnter={() => setIsHovered(true)}
      >
        {/* Subtle peek handle pill indicator */}
        <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-full px-4 py-1.5 text-xs font-semibold text-slate-700 flex items-center gap-2 border border-slate-200 group-hover/trigger:bg-white group-hover/trigger:scale-105 transition-all">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse" />
          <span>Browse Issues ({sortedReports.length})</span>
        </div>
      </div>

      {/* Carousel Container */}
      <div
        className={cn(
          "absolute bottom-5 z-40 transition-all duration-300 ease-in-out left-3 right-3 md:left-6",
          isSidePanelOpen ? "md:right-[424px]" : "md:right-6",
          isHovered
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-6 pointer-events-none"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative group/carousel max-w-7xl mx-auto">
          {/* Left Navigation Arrow (Desktop only) */}
          <button
            type="button"
            onClick={handleScrollLeft}
            aria-label="Scroll left"
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-xl border border-slate-200 text-slate-700 hover:bg-white hover:scale-105 active:scale-95 transition-all opacity-0 group-hover/carousel:opacity-100 backdrop-blur-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Right Navigation Arrow (Desktop only) */}
          <button
            type="button"
            onClick={handleScrollRight}
            aria-label="Scroll right"
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-xl border border-slate-200 text-slate-700 hover:bg-white hover:scale-105 active:scale-95 transition-all opacity-0 group-hover/carousel:opacity-100 backdrop-blur-sm"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Scrollable Cards Container with Edge Fade Mask */}
          <div
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            className={cn(
              "relative overflow-hidden px-2 py-1 select-none cursor-grab active:cursor-grabbing",
              isDraggingState ? "cursor-grabbing" : ""
            )}
            style={{
              maskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <div className="flex items-center gap-4 py-2 px-3">
              {sortedReports.map((report) => {
                const isSelected = report.id === selectedReportId;
                const ProblemIcon = getIcon(report.problemType?.icon || "AlertCircle");
                const imageUrl = report.url || (report.media && report.media[0]?.url);
                const displayDate = new Date(report.publishedAt || report.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={report.id}
                    ref={(el) => {
                      if (el) cardRefs.current.set(report.id, el);
                      else cardRefs.current.delete(report.id);
                    }}
                    onClick={() => {
                      if (hasDraggedRef.current) return;
                      onReportSelect(report.id);
                    }}
                    className={cn(
                      "relative shrink-0 w-[220px] md:w-[280px] aspect-[4/3] rounded-2xl overflow-hidden shadow-xl cursor-pointer transition-all duration-300 group hover:scale-[1.03] hover:shadow-2xl bg-slate-900 border-2",
                      isSelected
                        ? "border-blue-500 ring-4 ring-blue-500/30 scale-[1.03] z-10"
                        : "border-white/80 hover:border-white"
                    )}
                  >
                    {/* Card Image / Fallback */}
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={report.title}
                        fill
                        sizes="(max-width: 768px) 220px, 280px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                        draggable={false}
                      />
                    ) : (
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white pointer-events-none"
                        style={{ backgroundColor: report.category?.color || "#3b82f6" }}
                      >
                        <ProblemIcon size={32} className="text-white drop-shadow-md mb-1.5" />
                        <span className="text-xs font-semibold text-center drop-shadow">
                          {report.category?.name || "Issue"}
                        </span>
                      </div>
                    )}

                    {/* Subtle dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 pointer-events-none" />

                    {/* Content overlaid on image */}
                    <div className="absolute inset-0 p-3.5 flex flex-col justify-between pointer-events-none">
                      {/* Top: Title */}
                      <div>
                        <h3 className="text-white font-semibold text-sm md:text-base leading-snug line-clamp-2 drop-shadow-md">
                          {report.title}
                        </h3>
                      </div>

                      {/* Bottom: Timestamp & Status Badge */}
                      <div className="flex items-end justify-between gap-2">
                        <span className="text-white/90 text-[11px] md:text-xs font-medium drop-shadow-sm truncate">
                          {displayDate}
                        </span>

                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold capitalize backdrop-blur-md shadow-sm shrink-0",
                            statusColors[report.status] || "bg-slate-700/90 text-white"
                          )}
                        >
                          {report.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
