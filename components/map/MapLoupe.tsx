"use client";

import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";

export interface MapLoupeProps {
    /** Whether the loupe is currently active and visible */
    isVisible: boolean;
    /** Current geographic coordinate of the pin tip */
    coords: { lat: number; lng: number } | null;
    /** Pixel position of the marker/touch on the map canvas container */
    screenPos: { x: number; y: number } | null;
    /** Container element dimensions to clamp within */
    containerSize: { width: number; height: number };
    /** Current zoom level of the parent map */
    parentZoom?: number;
    /** Current bearing/rotation of the parent map */
    parentBearing?: number;
    /** Map style URL to render */
    mapStyle?: string;
    /** Magnification zoom delta (default: +1.8) */
    zoomOffset?: number;
    /** Diameter in pixels (default: 148) */
    diameter?: number;
}

export function MapLoupe({
    isVisible,
    coords,
    screenPos,
    containerSize,
    parentZoom = 16,
    parentBearing = 0,
    mapStyle = "https://tiles.openfreemap.org/styles/liberty",
    zoomOffset = 1.8,
    diameter = 148,
}: MapLoupeProps) {
    const subMapContainerRef = useRef<HTMLDivElement>(null);
    const subMapRef = useRef<maplibregl.Map | null>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    const radius = diameter / 2;
    const verticalOffset = 110;

    // Calculate clamped screen position & boundary flip
    let posX = containerSize.width / 2;
    let posY = containerSize.height / 2;
    let isFlippedBelow = false;
    let pointerOffsetX = 0;

    if (screenPos) {
        const rawTargetY = screenPos.y - verticalOffset;

        // If too close to the top edge (e.g. under header/top bar), flip below the finger
        if (rawTargetY - radius < 60) {
            isFlippedBelow = true;
            posY = screenPos.y + verticalOffset;
        } else {
            isFlippedBelow = false;
            posY = rawTargetY;
        }

        // Clamp within container boundaries
        const minX = radius + 12;
        const maxX = Math.max(minX, containerSize.width - radius - 12);
        posX = Math.max(minX, Math.min(maxX, screenPos.x));

        const minY = radius + 12;
        const maxY = Math.max(minY, containerSize.height - radius - 12);
        posY = Math.max(minY, Math.min(maxY, posY));

        // Horizontal offset for the pointer arrow to point toward the true finger position
        pointerOffsetX = Math.max(-radius + 20, Math.min(radius - 20, screenPos.x - posX));
    }

    // Initialize sub-map instance
    useEffect(() => {
        if (!subMapContainerRef.current) return;

        const initialCenter: [number, number] = coords
            ? [coords.lng, coords.lat]
            : [124.2511, 8.2283];

        const subMap = new maplibregl.Map({
            container: subMapContainerRef.current,
            style: mapStyle,
            center: initialCenter,
            zoom: Math.min(19.5, parentZoom + zoomOffset),
            bearing: parentBearing,
            pitch: 0, // Orthogonal top-down view ensures optical reticle precision
            interactive: false,
            attributionControl: false,
        });

        subMap.on("load", () => {
            setIsMapLoaded(true);
            subMap.resize();
        });

        subMapRef.current = subMap;

        return () => {
            subMap.remove();
            subMapRef.current = null;
            setIsMapLoaded(false);
        };
    }, [mapStyle]);

    // Synchronize position & zoom on drag
    useEffect(() => {
        if (!subMapRef.current || !coords) return;

        subMapRef.current.jumpTo({
            center: [coords.lng, coords.lat],
            zoom: Math.min(19.5, parentZoom + zoomOffset),
            bearing: parentBearing,
            pitch: 0,
        });
    }, [coords?.lat, coords?.lng, parentZoom, parentBearing, zoomOffset]);

    // Handle container resize
    useEffect(() => {
        if (subMapRef.current && isVisible) {
            subMapRef.current.resize();
        }
    }, [isVisible]);

    const targetZoomDisplay = (parentZoom + zoomOffset).toFixed(1);

    return (
        <div
            className="pointer-events-none absolute z-[70] transition-[opacity,transform] duration-150 ease-out"
            style={{
                left: `${posX}px`,
                top: `${posY}px`,
                transform: `translate(-50%, -50%) scale(${isVisible ? 1 : 0.85})`,
                opacity: isVisible ? 1 : 0,
            }}
            aria-hidden={!isVisible}
        >
            {/* Circular Magnifier Lens */}
            <div
                className="relative rounded-full border-[3px] border-white bg-slate-100 shadow-[0_12px_32px_rgba(0,0,0,0.35)] ring-2 ring-black/10 overflow-hidden flex items-center justify-center"
                style={{
                    width: `${diameter}px`,
                    height: `${diameter}px`,
                }}
            >
                {/* Secondary Synchronized Map Container */}
                <div
                    ref={subMapContainerRef}
                    className={`w-full h-full rounded-full overflow-hidden transition-opacity duration-150 ${
                        isMapLoaded ? "opacity-100" : "opacity-40"
                    }`}
                />

                {/* Subtle Inner Lens Vignette Gradient */}
                <div
                    className="pointer-events-none absolute inset-0 rounded-full"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,0.18) 100%)",
                    }}
                />

                {/* Precision Crosshair Target Reticle */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    {/* Outer Target Ring */}
                    <div className="w-8 h-8 rounded-full border border-orange-500/80 shadow-[0_0_2px_rgba(0,0,0,0.5)] flex items-center justify-center">
                        {/* Inner Target Ring */}
                        <div className="w-3.5 h-3.5 rounded-full border border-orange-600/90" />
                    </div>

                    {/* Horizontal Crosshair Hairlines */}
                    <div className="absolute w-full h-[1.5px] flex justify-between px-2">
                        <div className="w-5 h-full bg-orange-600 shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
                        <div className="w-5 h-full bg-orange-600 shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
                    </div>

                    {/* Vertical Crosshair Hairlines */}
                    <div className="absolute h-full w-[1.5px] flex flex-col justify-between py-2">
                        <div className="h-5 w-full bg-orange-600 shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
                        <div className="h-5 w-full bg-orange-600 shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
                    </div>

                    {/* High Precision Center Aperture Dot */}
                    <div className="absolute w-2 h-2 rounded-full bg-orange-600 border border-white shadow-sm" />
                </div>

                {/* Glassmorphism Zoom Badge */}
                <div className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 tracking-tight shadow-sm">
                    {targetZoomDisplay}x
                </div>
            </div>

            {/* Directional Tether Pointer Arrow */}
            <div
                className="pointer-events-none absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
                style={{
                    transform: `translateX(${pointerOffsetX}px)`,
                    ...(isFlippedBelow
                        ? { bottom: "100%", marginBottom: "-2px" }
                        : { top: "100%", marginTop: "-2px" }),
                }}
            >
                <div
                    className="w-0 h-0 border-x-[7px] border-x-transparent"
                    style={
                        isFlippedBelow
                            ? {
                                borderBottom: "8px solid white",
                                filter: "drop-shadow(0 -2px 2px rgba(0,0,0,0.15))",
                            }
                            : {
                                borderTop: "8px solid white",
                                filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.15))",
                            }
                    }
                />
            </div>
        </div>
    );
}
