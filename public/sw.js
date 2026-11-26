const CACHE_NAME = "citifix-cache-v3";
const OFFLINE_URL = "/offline";

const ASSETS_TO_CACHE = [
  "/",
  "/offline",
  "/manifest.json",
  "/icon.png",
  "/icon.svg",
  "/favicon.ico"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)) // Deletes old caches
      )
    ).then(() => self.clients.claim()) // Takes control of open pages immediately
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests (e.g. POST report submissions handled by sync manager)
  if (event.request.method !== "GET") {
    return;
  }

  // Handle navigation requests
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL) || caches.match("/");
        })
    );
    return;
  }

  // Handle static assets and other GET requests
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => { });
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && url.protocol.startsWith("http")) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for images or specific assets if needed
        if (event.request.destination === "image") {
          return caches.match("/icon.png");
        }
        return new Response("Network error happened", {
          status: 408,
          headers: { "Content-Type": "text/plain" },
        });
      });
    })
  );
});
