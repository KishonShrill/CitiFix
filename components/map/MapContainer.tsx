"use client";

import { useMemo, useRef, useCallback } from "react";
import MapGL, {
    Source,
    Layer,
    Marker,
    type MapRef,
    type MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import type { GeoJsonObject } from "geojson";
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
    const reportsGeoJSON = useMemo<GeoJsonObject>(() => {
        return {
            type: "FeatureCollection",
            features: reports.map((report) => ({
                type: "Feature",
                properties: {
                    publicId: report.publicId,
                    status: report.status,
                    category: report.category,
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
     * Called whenever the map moves.
     *
     * This preserves the behavior of your original component where
     * the parent receives the current visible map bounds.
     */
    const handleMove = useCallback(() => {
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
     * Handle clicking the map.
     *
     * In picking mode (onPinLocationChange provided): move the pin to wherever
     * the user clicked, unless they clicked an existing report point.
     * Otherwise: select the report the user clicked on.
     */
    const handleMapClick = useCallback(
        (event: MapLayerMouseEvent) => {
            const feature = event.features?.[0];

            if (feature) {
                // Clicked an existing report — select it instead of moving pin.
                const reportId = feature.properties?.publicId;
                if (typeof reportId === "string") {
                    onReportSelect?.(reportId);
                }
                return;
            }

            // No report hit — move the pin if we're in picking mode.
            if (onPinLocationChange) {
                onPinLocationChange(event.lngLat.lat, event.lngLat.lng);
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
                                    ["get", "publicId"],
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
                                        ["get", "publicId"],
                                        selectedReportId ?? "",
                                    ],
                                    "#ef4444",
                                    "#f97316",
                                ],
                                [
                                    "case",
                                    [
                                        "==",
                                        ["get", "publicId"],
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
