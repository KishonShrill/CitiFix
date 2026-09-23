"use client";

// --- React Query Setup ---
if (process.env.NEXT_PUBLIC_SCAN === "true") {
    import('react-scan').then(({ scan }) => {
        scan({ enabled: false });
    });
}
import { UIProvider, MapProvider, LocationProvider } from "@/context/AppState";
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes
        },
    },
});

export function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <LocationProvider>
                <MapProvider>
                    <UIProvider>
                        {children}
                        <ReactQueryDevtools initialIsOpen={false} />
                    </UIProvider>
                </MapProvider>
            </LocationProvider>
        </QueryClientProvider>
    );
}
