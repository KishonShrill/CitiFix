"use client";

import { useConnectivity } from "@/hooks/useConnectivity";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
    const { isOnline, syncing, pendingCount } = useConnectivity();

    if (isOnline && pendingCount === 0 && !syncing) {
        return null;
    }

    if (!isOnline) {
        return (
            <div className="bg-amber-500 text-white px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 shadow-sm sticky top-0 z-50 transition-all">
                <WifiOff className="w-4 h-4 shrink-0" />
                <span>
                    You're currently offline. You can still create reports. They'll automatically sync when your connection returns.
                </span>
                {pendingCount > 0 && (
                    <span className="bg-amber-600 px-2 py-0.5 rounded-full text-xs font-bold ml-2">
                        {pendingCount} pending
                    </span>
                )}
            </div>
        );
    }

    if (syncing || pendingCount > 0) {
        return (
            <div className="bg-blue-600 text-white px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 shadow-sm sticky top-0 z-50 transition-all">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                <span>
                    {syncing ? "Connection restored. Synchronizing your pending reports..." : `${pendingCount} report(s) waiting to sync.`}
                </span>
            </div>
        );
    }

    return null;
}
