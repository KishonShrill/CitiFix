"use client";

// --- React Query Setup ---
if (process.env.NEXT_PUBLIC_SCAN === "true") {
    import('react-scan').then(({ scan }) => {
        scan({ enabled: true });
    });
}
import { UIProvider, MapProvider, LocationProvider } from "@/context/AppState";
import { ReactNode, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ServiceWorkerRegister } from "@/components/common/ServiceWorkerRegister";
import { initSyncManager } from "@/lib/offline/sync-manager";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes
        },
    },
});

export function Providers({ children }: { children: ReactNode }) {
    useEffect(() => {
        initSyncManager();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <LocationProvider>
                <MapProvider>
                    <UIProvider>
                        <ServiceWorkerRegister />
                        {children}
                        <ReactQueryDevtools initialIsOpen={false} />
                    </UIProvider>
                </MapProvider>
            </LocationProvider>
        </QueryClientProvider>
    );
}
