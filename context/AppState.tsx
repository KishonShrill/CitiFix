import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";

// --- UI Context ---
interface UIContextType {
    isLegendOpen: boolean;
    setIsLegendOpen: (open: boolean) => void;
    isReportModalOpen: boolean;
    setIsReportModalOpen: (open: boolean) => void;
    isPickingLocation: boolean;
    setIsPickingLocation: (picking: boolean) => void;
    pickedLocation: { lat: number; lng: number } | null;
    setPickedLocation: (loc: { lat: number; lng: number } | null) => void;
    isUserDashboardOpen: boolean;
    setIsUserDashboardOpen: (open: boolean) => void;
    isAdminQueueOpen: boolean;
    setIsAdminQueueOpen: (open: boolean) => void;
    isAuthModalOpen: boolean;
    setIsAuthModalOpen: (open: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
    const [isLegendOpen, setIsLegendOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isPickingLocation, setIsPickingLocation] = useState(false);
    const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isUserDashboardOpen, setIsUserDashboardOpen] = useState(false);
    const [isAdminQueueOpen, setIsAdminQueueOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <UIContext.Provider value={{
            isLegendOpen, setIsLegendOpen,
            isReportModalOpen, setIsReportModalOpen,
            isPickingLocation, setIsPickingLocation,
            pickedLocation, setPickedLocation,
            isUserDashboardOpen, setIsUserDashboardOpen,
            isAdminQueueOpen, setIsAdminQueueOpen,
            isAuthModalOpen, setIsAuthModalOpen,
        }}>
            {children}
        </UIContext.Provider>
    );
}

export function useUI() {
    const context = useContext(UIContext);
    if (!context) throw new Error("useUI must be used within UIProvider");
    return context;
}

// --- Map Context ---
interface MapContextType {
    mapBounds: { minLat: number; maxLat: number; minLng: number; maxLng: number } | null;
    setMapBounds: (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number } | null) => void;
    selectedReportId: string | null;
    setSelectedReportId: (id: string | null) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: ReactNode }) {
    const [mapBounds, setMapBounds] = useState<MapContextType['mapBounds']>(null);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const boundsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounce bounds updates so the reports query only fires
    // after the user stops panning/zooming for 1 second.
    const setMapBoundsDebounced = useCallback(
        (bounds: MapContextType['mapBounds']) => {
            if (boundsTimerRef.current) clearTimeout(boundsTimerRef.current);
            boundsTimerRef.current = setTimeout(() => setMapBounds(bounds), 1000);
        },
        [],
    );

    // Clean up any pending timer on unmount
    useEffect(() => {
        return () => {
            if (boundsTimerRef.current) clearTimeout(boundsTimerRef.current);
        };
    }, []);

    return (
        <MapContext.Provider value={{ mapBounds, setMapBounds: setMapBoundsDebounced, selectedReportId, setSelectedReportId }}>
            {children}
        </MapContext.Provider>
    );
}

export function useMapState() {
    const context = useContext(MapContext);
    if (!context) throw new Error("useMapState must be used within MapProvider");
    return context;
}

// --- User Location Context ---
interface LocationContextType {
    userLocation: [number, number];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
    const [userLocation, setUserLocation] = useState<[number, number]>([124.24, 8.24]);

    useEffect(() => {
        let mounted = true;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    if (mounted) {
                        setUserLocation([position.coords.longitude, position.coords.latitude]);
                    }
                },
                (error) => {
                    console.log("Geolocation error:", error);
                },
                { timeout: 10000 }
            );
        }
        return () => { mounted = false; };
    }, []);

    return (
        <LocationContext.Provider value={{ userLocation }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useUserLocation() {
    const context = useContext(LocationContext);
    if (!context) throw new Error("useUserLocation must be used within LocationProvider");
    return context;
}
