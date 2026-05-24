const CACHE_NAME = 'gu-maritime-l11-v6';
const ASSETS = [
  './',
  './content/assets/icon-192.png',
  './content/assets/icon-192.webp',
  './content/assets/icon-512.png',
  './content/assets/icon-512.webp',
  './content/assets/level11_maritime.webp',
  './content/assets/level11_maritimeb.webp',
  './content/assets/level11_maritimec.webp',
  './content/assets/level11_maritimed.webp',
  './content/assets/logo_gu2.webp',
  './content/assets/unit1_banner.webp',
  './content/assets/unit2_banner.webp',
  './content/assets/unit3_banner.webp',
  './content/assets/unit4_banner.webp',
  './content/assets/unit5_banner.webp',
  './content/assets/unit6_banner.webp',
  './content/extras/imo_smcp/02_IMO_ SMCP.pdf',
  './content/extras/imo_smcp/index.html',
  './content/extras/maritime_vocabulary/01_basic-maritime-vocabulary.pdf',
  './content/extras/maritime_vocabulary/index.html',
  './content/extras/solas_convention/03_SOLAS Convention.pdf',
  './content/extras/solas_convention/index.html',
  './content/unit01/assets/anchor.webp',
  './content/unit01/assets/bollard.webp',
  './content/unit01/assets/bow.jpg',
  './content/unit01/assets/bow.webp',
  './content/unit01/assets/bridge.webp',
  './content/unit01/assets/capstan.webp',
  './content/unit01/assets/davit.webp',
  './content/unit01/assets/hatch.webp',
  './content/unit01/assets/hull.webp',
  './content/unit01/assets/keel.webp',
  './content/unit01/assets/mooring_cleat.webp',
  './content/unit01/assets/port',
  './content/unit01/assets/port.webp',
  './content/unit01/assets/propeller.webp',
  './content/unit01/assets/rudder.webp',
  './content/unit01/assets/starboard.webp',
  './content/unit01/assets/stern.webp',
  './content/unit01/assets/windlass.webp',
  './content/unit01/index.html',
  './content/unit01/script.js',
  './content/unit01/style.css',
  './content/unit02/index.html',
  './content/unit02/script.js',
  './content/unit02/style.css',
  './content/unit03/index.html',
  './content/unit03/script.js',
  './content/unit03/style.css',
  './content/unit04/index.html',
  './content/unit04/script.js',
  './content/unit04/style.css',
  './content/unit05/index.html',
  './content/unit05/script.js',
  './content/unit05/style.css',
  './content/unit06/index.html',
  './content/unit06/script.js',
  './content/unit06/style.css',
  './index.html',
  './lib/api-client.js',
  './manifest.json',
  './scripts/progress-manager.js',
  './styles/enhancements.css'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Use Promise.allSettled to ensure install succeeds even if some assets fail
      const results = await Promise.allSettled(
        ASSETS.map(asset => 
          cache.add(asset).catch(err => {
            console.warn('⚠️ Cache miss (non-critical):', asset, err);
          })
        )
      );
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        console.warn(`⚠️ ${failed.length} resources failed to cache. App may have limited offline functionality.`);
      } else {
        console.log('✅ All assets cached successfully for offline use');
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.map(k => {
          if (k !== CACHE_NAME) {
            return caches.delete(k);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  
  // Only handle same-origin GET requests for caching
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(res => {
      if (res) return res; 

      return fetch(e.request).then(fRes => {
        return caches.open(CACHE_NAME).then(c => {
          c.put(e.request, fRes.clone());
          return fRes;
        });
      }).catch(err => {
        if (e.request.mode === 'navigate' || e.request.destination === 'document') {
          return caches.match('./', { ignoreSearch: true });
        }
        throw err;
      });
    })
  );
});