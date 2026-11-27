const BUILD_ID = "__CITIFIX_BUILD_ID__";
const CACHE_NAME = `citifix-${BUILD_ID}`;
const CACHE_PREFIX = "citifix-";

const OFFLINE_URL = "/offline";

const ASSETS_TO_CACHE = [
  "/",
  "/offline",
  "/manifest.json",
  "/icon.png",
  "/icon.svg",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (name) =>
                name.startsWith(CACHE_PREFIX) &&
                name !== CACHE_NAME
            )
            .map((name) => caches.delete(name)) // Deletes old caches
        )
      )
      .then(() => self.clients.claim()) // Takes control of open pages immediately
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(event.request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Handle navigation requests
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        return (
          await caches.match(OFFLINE_URL)
        ) || Response.error();
      })
    );
    return;
  }

  // Only cache static assets.
  const cacheableDestinations = [
    "style",
    "script",
    "image",
    "font",
  ];

  if (!cacheableDestinations.includes(request.destination)) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request);

      const networkRequest = fetch(request).then(
        (response) => {
          if (response.ok && response.type === "basic") {
            cache.put(request, response.clone());
          }

          return response;
        }
      );

      if (cachedResponse) {
        event.waitUntil(networkRequest.catch(() => { }));
        return cachedResponse;
      }

      try {
        return await networkRequest;
      } catch {
        if (request.destination === "image") {
          return (
            await cache.match("/icon.png")
          ) || Response.error();
        }

        return Response.error();
      }
    })()
  );
});
