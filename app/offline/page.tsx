import Link from "next/link";
import { WifiOff, RefreshCw, Home } from "lucide-react";

export default function OfflinePage() {
    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <WifiOff className="w-8 h-8" />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    You're Currently Offline
                </h1>

                <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                    CitiFIX is in offline mode. You can still create and save infrastructure reports locally on your device. They will automatically sync when your internet connection is restored.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-600/20"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Reconnecting
                    </button>

                    <Link
                        href="/"
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Return to Map
                    </Link>
                </div>
            </div>
        </main>
    );
}
