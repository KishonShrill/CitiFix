"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import MapGL, {
    Source,
    Layer,
    Marker,
    AttributionControl,
    type MapRef,
    type MapLayerMouseEvent,
    type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { Report } from "@/lib/api/reports";
import "maplibre-gl/dist/maplibre-gl.css";
import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker?worker&url";

setWorkerUrl(workerUrl);

import MapControls from "./MapLibreControls";

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
    onMove?: (e: ViewStateChangeEvent) => void;
    /** When set, renders a draggable pin at this position. */
    pinLocation?: { lat: number; lng: number };
    /** Fires when the pin is dragged or the map is clicked (in picking mode). */
    onPinLocationChange?: (lat: number, lng: number) => void;
}

/*
 * Resolve a Lucide icon name string to a renderable component.
 * Falls back to AlertCircle if the name is missing or invalid.
 */
function getIcon(name: string): React.FC<LucideProps> {
    return (
        (LucideIcons as unknown as Record<string, React.FC<LucideProps>>)[name]
        ?? LucideIcons.AlertCircle
    );
}

/*
 * A single report pin rendered as a DOM marker.
 * Colours come from the report's category; the icon from the problem type.
 * Selected reports render slightly larger with a bolder ring.
 */
interface ReportMarkerProps {
    report: Report;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

function ReportMarker({ report, isSelected, onSelect }: ReportMarkerProps) {
    const Icon = getIcon(report.problemType.icon);

    // Unverified reports use a muted slate tone to signal "pending"
    const bgColor = report.status === "verified" ? report.category.color : "#94a3b8";

    const baseSize = isSelected ? 36 : 30;
    const iconSize = isSelected ? 18 : 14;
    const borderWidth = isSelected ? 3 : 2;

    return (
        <Marker
            longitude={report.longitude}
            latitude={report.latitude}
            anchor="bottom"
            onClick={(e) => {
                // Prevent the map's onClick from also firing
                e.originalEvent.stopPropagation();
                onSelect(report.id);
            }}
        >
            <div className="flex flex-col items-center cursor-pointer">
                <div
                    className="rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
                    style={{
                        width: baseSize,
                        height: baseSize,
                        backgroundColor: bgColor,
                        border: `${borderWidth}px solid white`,
                        outline: isSelected ? `2px solid ${bgColor}` : "none",
                        outlineOffset: "1px",
                    }}
                >
                    <Icon size={iconSize} color="white" strokeWidth={2.5} />
                </div>
                {/* Stem below the circle */}
                <div
                    className="rounded-full"
                    style={{
                        width: 3,
                        height: 8,
                        backgroundColor: bgColor,
                    }}
                />
            </div>
        </Marker>
    );
}

export const MapContainer = React.memo(function MapContainer({
    reports,
    selectedReportId,
    onReportSelect,
    onBoundsChange,
    center = [124.2452, 8.228],
    zoom = 16,
    onMove,
    pinLocation,
    onPinLocationChange,
}: MapContainerProps) {
    const [isTerrainEnabled, setIsTerrainEnabled] = useState(false);
    const [iliganBoundaryData, setIliganBoundaryData] = useState<any>(null);
    const mapRef = useRef<MapRef>(null);

    useEffect(() => {
        fetch("/data/iligan-city-boundary.json")
            .then(res => res.json())
            .then(data => setIliganBoundaryData(data))
            .catch(err => console.error("Failed to load boundary data:", err));
    }, []);

    /*
     * Called whenever the map finishes loading initially.
     */
    const handleLoad = useCallback(() => {
        if (!mapRef.current) return;
        const bounds = mapRef.current.getBounds();
        onBoundsChange?.({
            minLat: bounds.getSouth(),
            maxLat: bounds.getNorth(),
            minLng: bounds.getWest(),
            maxLng: bounds.getEast(),
        });
    }, [onBoundsChange]);

    /*
     * Called whenever the map moves.
     */
    const handleMove = useCallback((evt: ViewStateChangeEvent) => {
        if (onMove) onMove(evt);
        if (!mapRef.current) return;

        const bounds = mapRef.current.getBounds();
        onBoundsChange?.({
            minLat: bounds.getSouth(),
            maxLat: bounds.getNorth(),
            minLng: bounds.getWest(),
            maxLng: bounds.getEast(),
        });
    }, [onBoundsChange, onMove]);

    /*
     * In picking mode, clicking the map moves the pin.
     * Outside picking mode, report selection is handled per-Marker
     * via stopPropagation, so this handler sees only bare-map clicks.
     */
    const handleMapClick = useCallback(
        (event: MapLayerMouseEvent) => {
            if (onPinLocationChange) {
                onPinLocationChange(event.lngLat.lat, event.lngLat.lng);
            }
        },
        [onPinLocationChange],
    );

    return (
        <div
            className="relative h-full w-full"
            style={{ minHeight: "100dvh" }}
        >
            <MapGL
                ref={mapRef}
                initialViewState={{
                    longitude: center[0],
                    latitude: center[1],
                    zoom,
                }}
                mapStyle="https://tiles.openfreemap.org/styles/liberty"
                terrain={{
                    source: "terrain-source",
                    exaggeration: isTerrainEnabled ? 1 : 0,
                }}
                onLoad={handleLoad}
                onMove={handleMove}
                onClick={handleMapClick}
                cursor={onPinLocationChange ? "crosshair" : "auto"}
                attributionControl={false}
            >
                <MapControls
                    mapRef={mapRef}
                    isTerrainEnabled={isTerrainEnabled}
                    onToggleTerrain={() => setIsTerrainEnabled(!isTerrainEnabled)}
                />
                <AttributionControl compact={false} position="bottom-right" />

                {isTerrainEnabled && (
                    <Source
                        id="terrain-source"
                        type="raster-dem"
                        tiles={[
                            "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
                        ]}
                        encoding="terrarium"
                        tileSize={256}
                        maxzoom={14}
                    >
                        <Layer
                            id="hillshade-layer"
                            type="hillshade"
                            paint={{
                                "hillshade-exaggeration": 0.6,
                                "hillshade-shadow-color": "#334155",
                                "hillshade-highlight-color": "#ffffff",
                            }}
                        />
                    </Source>
                )}

                {iliganBoundaryData && (
                    <Source id="iligan-boundary" type="geojson" data={iliganBoundaryData}>
                        <Layer
                            id="iligan-boundary-line"
                            type="line"
                            paint={{
                                "line-color": "#94a3b8",
                                "line-width": 2,
                                "line-dasharray": [4, 4],
                            }}
                        />

                        <Layer
                            id="iligan-boundary-fill"
                            type="fill"
                            paint={{
                                "fill-color": "#cbd5e1",
                                "fill-opacity": 0.05,
                            }}
                        />
                    </Source>
                )}

                {/* One DOM marker per report — category color + problem type icon */}
                {reports.map((report) => (
                    <ReportMarker
                        key={report.id}
                        report={report}
                        isSelected={report.id === selectedReportId}
                        onSelect={(id) => onReportSelect?.(id)}
                    />
                ))}

                {/* Draggable pin for location picking */}
                {pinLocation && (
                    <Marker
                        longitude={pinLocation.lng}
                        latitude={pinLocation.lat}
                        draggable={!!onPinLocationChange}
                        onDragEnd={(e) => {
                            onPinLocationChange?.(
                                e.lngLat.lat,
                                e.lngLat.lng,
                            );
                        }}
                        anchor="bottom"
                    >
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 bg-orange-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="white"
                                    className="w-4 h-4"
                                >
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                            </div>
                            <div className="w-0.5 h-2 bg-orange-600" />
                        </div>
                    </Marker>
                )}
            </MapGL>
        </div>
    );
});
