"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallBanner, setShowInstallBanner] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        // Check if already installed (standalone mode)
        const isStandalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as any).standalone === true;

        if (isStandalone) {
            return;
        }

        // Check if dismissed previously in session/local storage
        const dismissed = localStorage.getItem("citifix_install_dismissed");
        if (dismissed) {
            return;
        }

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(ios);

        if (ios) {
            // Show iOS install hint after a short delay if not dismissed
            const timer = setTimeout(() => {
                setShowInstallBanner(true);
            }, 3000);
            return () => clearTimeout(timer);
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallBanner(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            setShowIOSInstructions(true);
            return;
        }

        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            console.log("User accepted the install prompt");
        } else {
            console.log("User dismissed the install prompt");
        }

        setDeferredPrompt(null);
        setShowInstallBanner(false);
        localStorage.setItem("citifix_install_dismissed", "true");
    };

    const handleDismiss = () => {
        setShowInstallBanner(false);
        setShowIOSInstructions(false);
        localStorage.setItem("citifix_install_dismissed", "true");
    };

    if (!showInstallBanner) return null;

    return (
        <>
            <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xl z-50 flex items-start gap-3 animate-slide-up">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                </div>

                <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                        Install CitiFIX App
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {isIOS
                            ? "Add CitiFIX to your home screen for quick offline civic reporting."
                            : "Install CitiFIX for offline reporting, faster access, and app experience."}
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                        <button
                            onClick={handleInstallClick}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-medium transition-colors shadow-sm"
                        >
                            <Download className="w-3.5 h-3.5" />
                            {isIOS ? "How to Install" : "Install App"}
                        </button>

                        <button
                            onClick={handleDismiss}
                            className="px-3 py-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-medium transition-colors"
                        >
                            Not now
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleDismiss}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* iOS Instructions Modal */}
            {showIOSInstructions && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                            Install on iPhone / iPad
                        </h3>
                        <ol className="text-sm text-slate-600 dark:text-slate-300 space-y-2 text-left bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                            <li>
                                1. Tap the <strong>Share</strong> button <span className="text-lg">⎋</span> at the bottom of Safari.
                            </li>
                            <li>
                                2. Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong> ➕.
                            </li>
                            <li>
                                3. Tap <strong>Add</strong> in the top right corner.
                            </li>
                        </ol>
                        <button
                            onClick={() => setShowIOSInstructions(false)}
                            className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-medium transition-colors"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
