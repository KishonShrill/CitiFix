export interface LogEntry {
    id: string;
    timestamp: string;
    level: "info" | "warn" | "error";
    message: string;
    details?: string;
}

const MAX_LOGS = 50;
const STORAGE_KEY = "citifix_debug_logs";

export function getLogs(): LogEntry[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

export function addLog(level: "info" | "warn" | "error", message: string, details?: unknown) {
    if (typeof window === "undefined") return;
    try {
        const logs = getLogs();
        const detailsStr = details instanceof Error ? details.stack || details.message : details ? JSON.stringify(details) : undefined;
        const entry: LogEntry = {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toLocaleTimeString(),
            level,
            message,
            details: detailsStr,
        };

        const updated = [entry, ...logs].slice(0, MAX_LOGS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
        console.error("Failed to save debug log:", err);
    }
}

export function clearLogs() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
}

export const logger = {
    info: (msg: string, details?: unknown) => addLog("info", msg, details),
    warn: (msg: string, details?: unknown) => addLog("warn", msg, details),
    error: (msg: string, details?: unknown) => addLog("error", msg, details),
};
