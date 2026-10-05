const VERSION = 'noamtv-v1';
const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'assets/css/app.css',
  'assets/js/app.js',
  'assets/js/questions.js',
  'assets/js/store.js',
  'assets/js/sfx.js',
  'assets/fonts/rubik-hebrew.woff2',
  'assets/fonts/rubik-latin.woff2',
  'assets/icons/icon.svg',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/favicon-64.png',
  'assets/img/icons.svg',
  'assets/img/avatar.svg',
  'assets/img/banner.svg',
  'assets/img/world-blocks.svg',
  'assets/img/world-obby.svg',
  'assets/img/world-royale.svg',
  'assets/img/world-arena.svg',
  'assets/img/world-stadium.svg',
  'assets/img/world-boss.svg',
  'assets/img/world-exam.svg',
  'assets/img/plaque-silver.svg',
  'assets/img/plaque-gold.svg',
  'assets/img/plaque-diamond.svg',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Network-first so updates show up immediately; the cache keeps the app working offline.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  event.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(async () => (await caches.match(req, { ignoreSearch: true }))
        || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())),
  );
});
