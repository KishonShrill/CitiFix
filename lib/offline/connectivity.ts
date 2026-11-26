export async function checkServerReachability(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    if (!navigator.onLine) return false;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch("/api/hello", {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return response.ok;
    } catch {
        // If /api/hello fails, try fetching categories or health check
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch("/api/v1/categories", {
                method: "GET",
                cache: "no-store",
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response.ok;
        } catch {
            return false;
        }
    }
}
