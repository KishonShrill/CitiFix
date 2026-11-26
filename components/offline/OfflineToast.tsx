"use client";

import { useEffect, useRef } from "react";
import { useConnectivity } from "@/hooks/useConnectivity";
import { toast } from "sonner";

export function OfflineToast() {
    const { isOnline, syncing, pendingCount, syncError } = useConnectivity();
    const prevOnlineRef = useRef(isOnline);
    const toastIdRef = useRef<string | number | undefined>(undefined);

    useEffect(() => {
        const wasOnline = prevOnlineRef.current;
        prevOnlineRef.current = isOnline;

        if (!isOnline && wasOnline) {
            // Just went offline
            toast.warning("You're currently offline", {
                description: "You can still create reports. They'll automatically sync when your connection returns.",
                duration: Infinity,
                id: "offline-status-toast",
            });
        } else if (isOnline && !wasOnline) {
            // Just came online
            toast.dismiss("offline-status-toast");
            toast.success("Connection restored", {
                description: "Synchronizing your pending reports...",
                duration: 4000,
            });
        }
    }, [isOnline]);

    useEffect(() => {
        if (syncing) {
            toastIdRef.current = toast.loading("Synchronizing pending reports...", {
                id: "sync-progress-toast",
            });
        } else if (toastIdRef.current) {
            toast.dismiss(toastIdRef.current);
            toastIdRef.current = undefined;
            if (pendingCount === 0 && isOnline) {
                toast.success("All reports successfully synchronized!");
            }
        }
    }, [syncing, pendingCount, isOnline]);

    useEffect(() => {
        if (syncError) {
            toast.error("Synchronization error", {
                description: syncError,
            });
        }
    }, [syncError]);

    return null;
}
