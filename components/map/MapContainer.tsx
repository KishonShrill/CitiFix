"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Report } from "@/lib/api/reports";

interface MapContainerProps {
    reports: Report[];
    selectedReportId?: string;
    onReportSelect?: (reportId: string) => void;
    onBoundsChange?: (bounds: {
        minLat: number;
        maxLat: number;
        minLng: number;
        maxLng: number;
    }) => void;
    center?: [number, number];
    zoom?: number;
}

export function MapContainer({
    reports,
    selectedReportId,
    onReportSelect,
    onBoundsChange,
    center = [124.2452, 8.228], // Iligan City coordinates
    zoom = 16,
}: MapContainerProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: "https://tiles.openfreemap.org/styles/liberty",
            center: center as [number, number],
            zoom,
        });

        const handleMove = () => {
            if (!map.current) return;
            const bounds = map.current.getBounds();
            onBoundsChange?.({
                minLat: bounds.getSouth(),
                maxLat: bounds.getNorth(),
                minLng: bounds.getWest(),
                maxLng: bounds.getEast(),
            });
        };

        map.current.on("move", handleMove);
        map.current.on("load", handleMove);

        return () => {
            map.current?.off("move", handleMove);
            map.current?.off("load", handleMove);
        };
    }, [center, zoom, onBoundsChange]);

    // Update markers when reports change
    useEffect(() => {
        if (!map.current) return;

        // Remove old markers
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current.clear();

        // Add new markers
        reports.forEach((report) => {
            const el = document.createElement("div");
            el.className = "marker";
            el.style.width = "32px";
            el.style.height = "32px";
            el.style.cursor = "pointer";

            const isSelected = report.publicId === selectedReportId;
            const bgColor =
                report.status === "verified"
                    ? isSelected
                        ? "#ef4444"
                        : "#f97316"
                    : isSelected
                        ? "#64748b"
                        : "#cbd5e1";

            el.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" fill="${bgColor}" stroke="white" stroke-width="2"/>
          <circle cx="16" cy="16" r="4" fill="white"/>
        </svg>
      `;

            el.addEventListener("click", () => {
                onReportSelect?.(report.publicId);
            });

            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([report.longitude, report.latitude])
                .addTo(map.current!);

            markersRef.current.set(report.publicId, marker);
        });
    }, [reports, selectedReportId, onReportSelect]);

    return (
        <div
            ref={mapContainer}
            className="relative h-full w-full"
            style={{ minHeight: "100vh" }}
        />
    );
}
