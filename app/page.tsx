"use client";

import { useState, useEffect } from "react";
import { MapContainer } from "@/components/map/MapContainer";
import { ReportModal } from "@/components/reports/ReportModal";
import { ReportSlideOut } from "@/components/reports/ReportSlideOut";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { AdminQueue } from "@/components/admin/AdminQueue";
import { AuthModal } from "@/components/auth/AuthModal";
import { UserMenu } from "@/components/auth/UserMenu";
import { useReports, useReport } from "@/hooks/useReports";
import { authClient } from "@/lib/auth-client";
import { Plus } from "lucide-react";

export default function Home() {
    const [mapBounds, setMapBounds] = useState<{
        minLat: number;
        maxLat: number;
        minLng: number;
        maxLng: number;
    } | null>(null);

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isUserDashboardOpen, setIsUserDashboardOpen] = useState(false);
    const [isAdminQueueOpen, setIsAdminQueueOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [user, setUser] = useState<{ id: string; name: string | null; email: string; role?: string } | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const { data: reportsData, isLoading: reportsLoading } = useReports(
        mapBounds
            ? {
                minLat: mapBounds.minLat,
                maxLat: mapBounds.maxLat,
                minLng: mapBounds.minLng,
                maxLng: mapBounds.maxLng,
            }
            : undefined
    );

    const { data: selectedReport } = useReport(selectedReportId || "");

    // Check authentication on mount
    useEffect(() => {
        const checkSession = async () => {
            const session = await authClient.getSession();
            if (session.data?.user) {
                setUser(session.data.user as typeof user);
            }
            setIsCheckingAuth(false);
        };

        checkSession();
    }, []);

    // Get user's geolocation on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.longitude, position.coords.latitude]);
                },
                (error) => {
                    console.log("Geolocation error:", error);
                    // Default to Iligan City if geolocation fails
                    setUserLocation([124.24, 8.24]);
                }
            );
        }
    }, []);

    const handleOpenReportModal = () => {
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }
        setIsReportModalOpen(true);
    };

    if (isCheckingAuth) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-600">Loading...</p>
            </div>
        );
    }

    return (
        <main className="relative w-full h-screen overflow-hidden">
            {/* Map */}
            {userLocation && (
                <MapContainer
                    reports={reportsData?.data || []}
                    selectedReportId={selectedReportId || undefined}
                    onReportSelect={setSelectedReportId}
                    onBoundsChange={setMapBounds}
                    center={userLocation}
                    zoom={13}
                />
            )}

            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 bg-white shadow-sm z-30 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        B
                    </div>
                    <h1 className="font-bold text-slate-900">CitiFix</h1>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleOpenReportModal}
                        className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium"
                    >
                        <Plus size={16} />
                        Report Issue
                    </button>

                    {user ? (
                        <UserMenu
                            user={user}
                            setUser={setUser}
                            onMyReportsClick={() => setIsUserDashboardOpen(true)}
                            onAdminClick={() => setIsAdminQueueOpen(true)}
                        />
                    ) : (
                        <button
                            onClick={() => setIsAuthModalOpen(true)}
                            className="px-3 py-2 text-slate-900 border border-slate-300 rounded-md hover:bg-slate-50 text-sm font-medium"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </div>

            {/* Loading indicator */}
            {reportsLoading && (
                <div className="absolute top-20 left-4 bg-white px-3 py-2 rounded-md shadow-sm text-sm text-slate-600 z-20">
                    Loading reports...
                </div>
            )}

            {/* Report count */}
            {reportsData && (
                <div className="absolute top-20 right-4 bg-white px-3 py-2 rounded-md shadow-sm text-sm text-slate-600 z-20">
                    {reportsData.data.length} report{reportsData.data.length !== 1 ? "s" : ""} visible
                </div>
            )}

            {/* Report Modal */}
            {user && (
                <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    defaultLocation={
                        userLocation
                            ? { lat: userLocation[1], lng: userLocation[0] }
                            : undefined
                    }
                />
            )}

            {/* Report Slide Out */}
            {selectedReport && (
                <ReportSlideOut
                    report={selectedReport}
                    isOpen={!!selectedReportId}
                    onClose={() => setSelectedReportId(null)}
                />
            )}

            {/* User Dashboard */}
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

            {/* Admin Queue */}
            {user && (user.role === "admin" || user.role === "moderator") && (
                <AdminQueue
                    isOpen={isAdminQueueOpen}
                    onClose={() => setIsAdminQueueOpen(false)}
                    reports={reportsData?.data || []}
                    isLoading={reportsLoading}
                    onVerify={async (reportId) => {
                        // This will be implemented with actual API calls
                        console.log("Verify:", reportId);
                    }}
                    onReject={async (reportId, reason) => {
                        console.log("Reject:", reportId, reason);
                    }}
                    onDuplicate={async (reportId) => {
                        console.log("Duplicate:", reportId);
                    }}
                />
            )}

            {/* Auth Modal */}
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
