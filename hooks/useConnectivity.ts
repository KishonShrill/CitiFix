"use client";

import { useState, useEffect } from "react";
import { checkServerReachability } from "@/lib/offline/connectivity";
import { syncPendingReports, subscribeSyncStatus } from "@/lib/offline/sync-manager";

export function useConnectivity() {
  // Consistent initial state for SSR and browser hydration
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isReachable, setIsReachable] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [syncError, setSyncError] = useState<string | undefined>();

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);

      const reachable = await checkServerReachability();
      setIsReachable(reachable);

      if (reachable) {
        syncPendingReports();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsReachable(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check actual browser connectivity after hydration
    setIsOnline(navigator.onLine);

    checkServerReachability().then((reachable) => {
      setIsReachable(reachable);
    });

    const unsubscribe = subscribeSyncStatus((status) => {
      setSyncing(status.syncing);
      setPendingCount(status.pendingCount);
      setSyncError(status.error);
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      unsubscribe();
    };
  }, []);

  const triggerManualSync = async () => {
    const reachable = await checkServerReachability();
    setIsReachable(reachable);

    if (reachable) {
      await syncPendingReports();
    }
  };

  return {
    isOnline: isOnline && isReachable,
    isBrowserOnline: isOnline,
    isReachable,
    syncing,
    pendingCount,
    syncError,
    triggerManualSync,
  };
}
