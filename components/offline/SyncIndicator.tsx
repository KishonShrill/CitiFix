"use client";

import { useConnectivity } from "@/hooks/useConnectivity";
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from "@/utils/cn";
import { toast } from "sonner";

export function SyncIndicator() {
    const { isOnline, syncing, pendingCount, syncError, triggerManualSync } = useConnectivity();

    const handleClick = async () => {
        if (!isOnline) {
            toast.info("You are currently offline", {
                description: "Connect to the internet to synchronize your pending reports.",
            });
            return;
        }

        if (pendingCount === 0) {
            toast.info("All caught up!", {
                description: "Your connection is online and there are no pending reports to sync.",
            });
            return;
        }

        const toastId = toast.loading("Synchronizing pending reports...");
        try {
            await triggerManualSync();
            toast.success("Synchronization attempt complete", {
                id: toastId,
                description: "Pending reports have been processed.",
            });
        } catch (err) {
            toast.error("Synchronization failed", {
                id: toastId,
                description: err instanceof Error ? err.message : "Please check your connection and try again.",
            });
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleClick}
                disabled={syncing}
                title={isOnline ? "Click to sync pending reports" : "You are offline"}
                className={cn(
                    "cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm",
                    !isOnline && "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800",
                    isOnline && !syncing && pendingCount === 0 && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800",
                    isOnline && (syncing || pendingCount > 0) && "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800 animate-pulse"
                )}
            >
                {!isOnline ? (
                    <>
                        <WifiOff className="w-3.5 h-3.5" />
                        <span>Offline</span>
                    </>
                ) : syncing ? (
                    <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Syncing...</span>
                    </>
                ) : pendingCount > 0 ? (
                    <>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>{pendingCount} Queued</span>
                    </>
                ) : (
                    <>
                        <Wifi className="w-3.5 h-3.5" />
                        <span>Online</span>
                    </>
                )}
            </button>
            {syncError && (
                <span className="text-xs text-red-500 hidden md:inline" title={syncError}>
                    Sync error
                </span>
            )}
        </div>
    );
}
