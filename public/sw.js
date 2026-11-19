const CACHE_NAME = "stamp-safar-v1";
const OFFLINE_URL = "/offline.html";

const PRECACHE_ASSETS = [
  "/",
  "/offline.html",
  "/stamp-safar-logo.jpeg",
  "/manifest.webmanifest",
];

// Install: precache offline fallback and essential icons
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: network first with offline fallback for navigation requests
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip caching for external analytics, edge functions or backend APIs
  if (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("supabase.co") ||
    url.hostname.includes("razorpay.com")
  ) {
    return;
  }

  // HTML Navigation requests: Network first, fallback to cached offline page
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // Static Assets (images, fonts, scripts): Cache first, fallback to network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache successful static responses
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (url.pathname.endsWith(".jpeg") ||
            url.pathname.endsWith(".png") ||
            url.pathname.endsWith(".webp") ||
            url.pathname.endsWith(".js") ||
            url.pathname.endsWith(".css"))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for missing images
        if (event.request.destination === "image") {
          return caches.match("/stamp-safar-logo.jpeg");
        }
      });
    })
  );
});
