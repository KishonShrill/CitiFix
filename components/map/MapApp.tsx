"use client";

import { useUI, useMapState, useUserLocation } from "@/context/AppState";
import { MapContainer } from "@/components/map/MapContainer";
import { ReportModal } from "@/components/reports/ReportModal";
import { ReportSlideOut } from "@/components/reports/ReportSlideOut";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { AdminQueue } from "@/components/admin/AdminQueue";
import { AuthModal } from "@/components/auth/AuthModal";
import { UserMenu } from "@/components/auth/UserMenu";
import { LegendModal } from "@/components/common/LegendModal";
import { useReports, useReport } from "@/hooks/useReports";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Plus, HelpCircle } from "lucide-react";

export function MapApp({ initialReportIdFromUrl }: { initialReportIdFromUrl?: string }) {
    const { data: session, isPending: isCheckingAuth } = authClient.useSession();
    const user = session?.user;

    const {
        isLegendOpen, setIsLegendOpen,
        isReportModalOpen, setIsReportModalOpen,
        isPickingLocation, setIsPickingLocation,
        pickedLocation, setPickedLocation,
        isUserDashboardOpen, setIsUserDashboardOpen,
        isAdminQueueOpen, setIsAdminQueueOpen,
        isAuthModalOpen, setIsAuthModalOpen
    } = useUI();

    const { mapBounds, setMapBounds, selectedReportId, setSelectedReportId } = useMapState();
    const { userLocation } = useUserLocation();

    // Deep link initialization state
    const [initialReportId, setInitialReportId] = useState<string | null>(initialReportIdFromUrl || null);
    const [hasDoneInitialPan, setHasDoneInitialPan] = useState(false);
    const [panLocation, setPanLocation] = useState<{ lat: number, lng: number } | undefined>();

    // If an initial report is set via props, initialize selectedReportId
    useEffect(() => {
        if (initialReportIdFromUrl && !hasDoneInitialPan) {
            setSelectedReportId(initialReportIdFromUrl);
        }
    }, [initialReportIdFromUrl, hasDoneInitialPan, setSelectedReportId]);

    // Fetch the deep-linked report so we can pan to it
    const { data: initialReportData } = useReport(
        (!hasDoneInitialPan && initialReportId) ? initialReportId : ""
    );

    // Pan to the initial report when data arrives
    useEffect(() => {
        if (initialReportData && !hasDoneInitialPan) {
            setPanLocation({ lat: initialReportData.latitude, lng: initialReportData.longitude });
            setHasDoneInitialPan(true);
        }
    }, [initialReportData, hasDoneInitialPan]);

    // Synchronize SPA URL state when selectedReportId changes
    useEffect(() => {
        if (typeof window === "undefined") return;

        const currentMatch = window.location.pathname.match(/^\/reports\/([^/]+)$/);
        const currentUrlReportId = currentMatch ? currentMatch[1] : null;

        if (selectedReportId && selectedReportId !== currentUrlReportId) {
            window.history.pushState(null, '', `/reports/${selectedReportId}`);
        } else if (!selectedReportId && currentUrlReportId) {
            window.history.pushState(null, '', '/');
        }
    }, [selectedReportId]);

    const { data: reportsData, isFetching: reportsFetching } = useReports(
        mapBounds ? {
            minLat: mapBounds.minLat,
            maxLat: mapBounds.maxLat,
            minLng: mapBounds.minLng,
            maxLng: mapBounds.maxLng,
        } : undefined
    );

    const handleOpenReportModal = () => {
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }

        setIsPickingLocation(true);
        setPickedLocation({ lat: userLocation[1], lng: userLocation[0] });
    };

    if (isCheckingAuth) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-600">Loading...</p>
            </div>
        );
    }

    return (
        <main className="relative w-full h-dvh overflow-hidden">
            {/* Map */}
            <MapContainer
                reports={reportsData?.data || []}
                selectedReportId={selectedReportId || undefined}
                onReportSelect={setSelectedReportId}
                onBoundsChange={setMapBounds}
                center={userLocation}
                zoom={13}
                flyToLocation={panLocation}
                pinLocation={isPickingLocation ? (pickedLocation || undefined) : undefined}
                onPinLocationChange={isPickingLocation ? ((lat, lng) => setPickedLocation({ lat, lng })) : undefined}
            />

            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 bg-white shadow-sm z-30 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        B
                    </div>
                    <h1 className="font-bold text-slate-900">CitiFix</h1>
                </div>

                <div className="flex items-center gap-2">
                    {!isPickingLocation && (
                        <button
                            onClick={handleOpenReportModal}
                            className="cursor-pointer max-md:hidden flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium"
                        >
                            <Plus size={16} />
                            Report Issue
                        </button>
                    )}

                    {user ? (
                        <UserMenu
                            user={user as any}
                            onMyReportsClick={() => setIsUserDashboardOpen(true)}
                            onAdminClick={() => setIsAdminQueueOpen(true)}
                        />
                    ) : (
                        <button
                            onClick={() => setIsAuthModalOpen(true)}
                            className="cursor-pointer px-3 py-2 text-slate-900 border border-slate-300 rounded-md hover:bg-slate-50 text-sm font-medium"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </div>

            {/* Status Indicators */}
            <div className="absolute top-20 left-4 flex flex-col gap-2 z-20">
                {reportsFetching && (
                    <div className="bg-white px-3 py-2 rounded-md shadow-sm text-sm text-slate-600">
                        Loading reports...
                    </div>
                )}
            </div>

            {/* Legend Button */}
            <button
                onClick={() => setIsLegendOpen(true)}
                className="cursor-pointer absolute bottom-5 left-4 flex items-center justify-center gap-1.5 h-11 min-w-11 md:p-4 bg-white text-slate-700 rounded-xl hover:bg-slate-200 shadow-xl font-bold transition-colors"
            >
                <HelpCircle className="h-5 w-5" />
                <span className="max-md:hidden">Legend</span>
            </button>

            {/* Report Button */}
            <button
                onClick={handleOpenReportModal}
                className="cursor-pointer absolute bottom-5 left-1/2 -translate-x-1/2 md:hidden flex p-5 bg-orange-600 text-white rounded-full hover:bg-orange-700 text-sm font-medium"
            >
                <Plus size={20} />
            </button>



            {reportsData && (
                <div className="absolute top-20 right-4 bg-white px-3 py-2 rounded-md shadow-sm text-sm text-slate-600 z-20">
                    {reportsData.data.length} report{reportsData.data.length !== 1 ? "s" : ""} visible
                </div>
            )}

            {/* Modals & Overlays */}
            {user && (
                <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => {
                        setIsReportModalOpen(false);
                        setIsPickingLocation(false);
                        setPickedLocation(null);
                    }}
                    location={pickedLocation || undefined}
                />
            )}

            <LegendModal
                isOpen={isLegendOpen}
                onClose={() => setIsLegendOpen(false)}
            />

            {isPickingLocation && !isReportModalOpen && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white px-6 py-4 rounded-xl shadow-lg border border-slate-200 z-50 flex flex-col items-center gap-3 w-[90%] max-w-sm">
                    <p className="text-sm font-medium text-slate-800 text-center">
                        Drag the pin or tap the map to set the exact location
                    </p>
                    <div className="flex gap-2 w-full">
                        <button
                            onClick={() => {
                                setIsPickingLocation(false);
                                setPickedLocation(null);
                            }}
                            className="flex-1 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => setIsReportModalOpen(true)}
                            disabled={!pickedLocation}
                            className="flex-1 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                        >
                            Confirm →
                        </button>
                    </div>
                </div>
            )}

            <ReportSlideOut
                isOpen={!!selectedReportId}
                onClose={() => setSelectedReportId(null)}
            />

            {user && (
                <UserDashboard
                    isOpen={isUserDashboardOpen}
                    onClose={() => setIsUserDashboardOpen(false)}
                    onReportSelect={(id) => {
                        setSelectedReportId(id);
                        setIsUserDashboardOpen(false);
                    }}
                />
            )}

            {user && ((user as any).role === "admin" || (user as any).role === "moderator") && (
                <AdminQueue
                    isOpen={isAdminQueueOpen}
                    onClose={() => setIsAdminQueueOpen(false)}
                />
            )}

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={() => {
                    window.location.reload();
                }}
            />
        </main>
    );
}
