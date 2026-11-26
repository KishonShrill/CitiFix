"use client";

import { useState, useEffect } from "react";
import { getLogs, clearLogs, type LogEntry } from "@/lib/offline/logger";
import { X, Trash2, Copy, Check, Terminal, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/utils/cn";

interface DebugLogsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DebugLogsModal({ isOpen, onClose }: DebugLogsModalProps) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [copied, setCopied] = useState(false);

    const loadLogs = () => {
        setLogs(getLogs());
    };

    useEffect(() => {
        if (isOpen) {
            loadLogs();
        }
    }, [isOpen]);

    const handleCopy = () => {
        const text = logs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}${l.details ? `\n   Details: ${l.details}` : ""}`).join("\n");
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Debug logs copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClear = () => {
        clearLogs();
        setLogs([]);
        toast.success("Debug logs cleared");
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 transition-opacity" onClick={onClose} />

            <div className="fixed inset-3 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-2xl sm:w-full bg-slate-950 text-slate-100 rounded-2xl shadow-2xl z-50 flex flex-col h-[90dvh] sm:h-[80vh] overflow-hidden border border-slate-800">
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-orange-400" />
                        <h2 className="font-bold text-base text-slate-100">PWA Debug Logs</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="px-5 py-2.5 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{logs.length} captured event(s)</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={loadLogs}
                            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                        >
                            <RefreshCw size={12} />
                            Refresh
                        </button>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            {copied ? <Check size={12} /> : <Copy size={12} />}
                            {copied ? "Copied" : "Copy Logs"}
                        </button>
                        <button
                            onClick={handleClear}
                            className="flex items-center gap-1 px-2.5 py-1 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-900/50 rounded-lg transition-colors"
                        >
                            <Trash2 size={12} />
                            Clear
                        </button>
                    </div>
                </div>

                {/* Logs List */}
                <div className="p-4 overflow-y-auto flex-1 space-y-2.5 font-mono text-xs">
                    {logs.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">
                            No logs recorded yet. Try performing actions or syncing.
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div
                                key={log.id}
                                className={cn(
                                    "p-3 rounded-xl border space-y-1",
                                    log.level === "error" && "bg-red-950/30 border-red-900/50 text-red-200",
                                    log.level === "warn" && "bg-amber-950/30 border-amber-900/50 text-amber-200",
                                    log.level === "info" && "bg-slate-900/60 border-slate-800 text-slate-300"
                                )}
                            >
                                <div className="flex items-center justify-between text-[11px] opacity-75">
                                    <span className="uppercase font-bold tracking-wider">{log.level}</span>
                                    <span>{log.timestamp}</span>
                                </div>
                                <p className="font-semibold">{log.message}</p>
                                {log.details && (
                                    <pre className="mt-1 p-2 bg-slate-950/80 rounded border border-slate-800/80 text-[10px] overflow-x-auto text-slate-400 whitespace-pre-wrap">
                                        {log.details}
                                    </pre>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
