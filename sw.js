// Service worker: lets Little Seasons open with no signal once it has been visited.
// The page is fetched fresh when the network answers quickly, so updates still show up;
// weather requests aren't touched here (the app keeps its own last reading).
const CACHE = "little-seasons-v1";
const SHELL = ["./", "manifest.webmanifest", "images/icon-192.png", "images/apple-touch-icon.png"];
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (req.mode === "navigate") e.respondWith(pageFirst(req));
  else if (url.origin === location.origin || FONT_HOSTS.includes(url.hostname)) e.respondWith(cacheThenRefresh(req));
});

// The page: try the network for up to 3 seconds, otherwise use the saved copy
async function pageFirst(req) {
  const cache = await caches.open(CACHE);
  const net = fetch(req).then(res => {
    if (res.ok) cache.put("./", res.clone());
    return res;
  });
  const slow = new Promise(r => setTimeout(r, 3000)).then(() => cache.match("./"));
  try {
    return (await Promise.race([net, slow])) || await net;
  } catch (e) {
    return (await cache.match("./")) || Response.error();
  }
}

// Icons and fonts: answer from the saved copy right away and refresh it in the background
async function cacheThenRefresh(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  const net = fetch(req).then(res => {
    if (res.ok || res.type === "opaque") cache.put(req, res.clone());
    return res;
  }).catch(() => hit);
  return hit || net;
}
