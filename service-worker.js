// service-worker.js
const CACHE_NAME = "sanishop-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/script.js",
  "/style.css",
  "/products.json",
  "/bootstrap.min.css",
  "/bootstrap.bundle.min.js"
];

// Installation du service worker
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activation : nettoyage des anciens caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

// Interception des requêtes
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la connexion est réussie, on met à jour le cache
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request)) // Sinon on sert depuis le cache
  );
});
