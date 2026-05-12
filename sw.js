
const CACHE_NAME = 'gu-military-l11-v1';
const ASSETS = [
  // Base assets
  './',
  './index.html',
  './manifest.json',
  './styles/enhancements.css',
  './content/assets/icon-192.png',
  './content/assets/icon-512.png',
  
  // Unit 01 core files
  './content/unit01/index.html',
  './content/unit01/script.js',
  './content/unit01/style.css',
  './content/unit01/audio/README.md',
  
  // Unit 02 core files
  './content/unit02/index.html',
  './content/unit02/script.js',
  './content/unit02/style.css',
  './content/unit02/audio/README.md',
  
  // Unit 03 core files
  './content/unit03/index.html',
  './content/unit03/script.js',
  './content/unit03/style.css',
  './content/unit03/audio/README.md',
  
  // Unit 04 core files
  './content/unit04/index.html',
  './content/unit04/script.js',
  './content/unit04/style.css',
  './content/unit04/audio/README.md',
  
  // Unit 05 core files
  './content/unit05/index.html',
  './content/unit05/script.js',
  './content/unit05/style.css',
  './content/unit05/audio/README.md',
  
  // Unit 06 core files
  './content/unit06/index.html',
  './content/unit06/script.js',
  './content/unit06/style.css',
  './content/unit06/audio/README.md'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  
  // Only handle same-origin GET requests for caching
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.endsWith('.pdf')) return;

  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request).then(fRes => {
        return caches.open(CACHE_NAME).then(c => {
          c.put(e.request, fRes.clone());
          return fRes;
        });
      }).catch(() => caches.match('./index.html'));
    })
  );
});
