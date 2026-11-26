"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    } else if ("serviceWorker" in navigator) {
      // Also register in development for testing PWA offline capabilities if desired
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered (dev):", registration.scope);
        })
        .catch((error) => {
          console.error("Service Worker registration failed (dev):", error);
        });
    }
  }, []);

  return null;
}
