// Garde la telecommande en cache : elle s'ouvre sans reseau (dans le van).
// Changer CACHE a chaque publication pour que les telephones prennent la nouvelle version.
const CACHE = 'vanduro-8.0.0';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon_192.png', './icon_512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Le cache d'abord (ouverture immediate, meme hors reseau), puis mise a jour en arriere-plan
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => {
    const net = fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => hit || Response.error());
    return hit || net;
  }));
});
