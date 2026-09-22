"use client";

import { useMemo, useRef, useCallback } from "react";
import MapGL, {
    Source,
    Layer,
    Marker,
    type MapRef,
    type MapLayerMouseEvent,
    type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import type { Report } from "@/lib/api/reports";
import "maplibre-gl/dist/maplibre-gl.css";
import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker?worker&url";

setWorkerUrl(workerUrl);

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

export function MapContainer({
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
    const mapRef = useRef<MapRef>(null);

    /*
     * Convert reports into GeoJSON.
     *
     * MapLibre can render this entire collection as one source/layer
     * instead of creating a separate DOM marker for every report.
     */
    const reportsGeoJSON = useMemo<any>(() => {
        return {
            type: "FeatureCollection",
            features: reports.map((report) => ({
                type: "Feature",
                properties: {
                    id: report.id,
                    status: report.status,
                    category: report.category, // fix string mismatch error manually if any, currently missing categoryId? Note this is from before
                },
                geometry: {
                    type: "Point",
                    coordinates: [
                        report.longitude,
                        report.latitude,
                    ],
                },
            })),
        };
    }, [reports]);

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
     * Handle clicking the map.
     *
     * In picking mode (onPinLocationChange provided): move the pin to wherever
     * the user clicked. Ignore report clicks during picking.
     * Otherwise: select the report the user clicked on.
     */
    const handleMapClick = useCallback(
        (event: MapLayerMouseEvent) => {
            // If in picking mode, just move the pin.
            if (onPinLocationChange) {
                onPinLocationChange(event.lngLat.lat, event.lngLat.lng);
                return;
            }

            const feature = event.features?.[0];

            if (feature) {
                const reportId = feature.properties?.id;
                if (typeof reportId === "string") {
                    onReportSelect?.(reportId);
                }
            }
        },
        [onReportSelect, onPinLocationChange],
    );

    return (
        <div
            className="relative h-full w-full"
            style={{ minHeight: "100vh" }}
        >
            <MapGL
                ref={mapRef}
                initialViewState={{
                    longitude: center[0],
                    latitude: center[1],
                    zoom,
                }}
                mapStyle="https://tiles.openfreemap.org/styles/liberty"
                interactiveLayerIds={["report-points"]}
                onLoad={handleLoad}
                onMove={handleMove}
                onClick={handleMapClick}
                cursor={onPinLocationChange ? "crosshair" : "auto"}
            >
                <Source
                    id="reports"
                    type="geojson"
                    data={reportsGeoJSON}
                >
                    <Layer
                        id="report-points"
                        type="circle"
                        paint={{
                            /*
                             * Selected reports become larger.
                             */
                            "circle-radius": [
                                "case",
                                [
                                    "==",
                                    ["get", "id"],
                                    selectedReportId ?? "",
                                ],
                                10,
                                7,
                            ],

                            /*
                             * Verified reports are orange.
                             * Other reports are gray.
                             */
                            "circle-color": [
                                "case",
                                [
                                    "==",
                                    ["get", "status"],
                                    "verified",
                                ],
                                [
                                    "case",
                                    [
                                        "==",
                                        ["get", "id"],
                                        selectedReportId ?? "",
                                    ],
                                    "#ef4444",
                                    "#f97316",
                                ],
                                [
                                    "case",
                                    [
                                        "==",
                                        ["get", "id"],
                                        selectedReportId ?? "",
                                    ],
                                    "#64748b",
                                    "#cbd5e1",
                                ],
                            ],

                            /*
                             * White border around every report.
                             */
                            "circle-stroke-color": "#ffffff",
                            "circle-stroke-width": 2,

                            /*
                             * Make selected reports slightly more prominent.
                             */
                            "circle-opacity": 1,
                        }}
                    />
                </Source>

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
}
