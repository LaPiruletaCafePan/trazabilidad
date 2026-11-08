const CACHE = 'trazabilidad-v18';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Programas externos (Firebase y generador de PDF): se guardan para que la app funcione sin internet
  if ((u.hostname === 'www.gstatic.com' && u.pathname.startsWith('/firebasejs/')) || u.hostname === 'cdnjs.cloudflare.com'){
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const copia = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return res; })));
    return;
  }
  if (u.origin !== location.origin) return;
  if (u.searchParams.has('v')) return; // comprobación de versión nueva: siempre desde internet
  e.respondWith(
    fetch(e.request).then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
