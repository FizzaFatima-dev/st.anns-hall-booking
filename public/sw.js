// public/sw.js
self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  return self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  // Required by Chrome to trigger the install prompt
});