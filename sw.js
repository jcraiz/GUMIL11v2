const CACHE_NAME = 'gu-military-l11-v1';
const ASSETS = [
  // Base assets
  './',
  './index.html',
  './manifest.json',
  './styles/enhancements.css',
  './content/assets/icon-192.png',
  './content/assets/icon-192.webp',
  './content/assets/icon-512.png',
  './content/assets/icon-512.webp',
  './content/assets/logo_gu2_mil2.webp',
  './content/assets/level11_military.webp',
  './content/assets/level11_militaryb.webp',
  './content/assets/level11_militaryc.webp',
  './content/assets/level11_militaryd.webp',
  './content/assets/unit1_banner.webp',
  './content/assets/unit2_banner.webp',
  './content/assets/unit3_banner.webp',
  './content/assets/unit4_banner.webp',
  './content/assets/unit5_banner.webp',
  './content/assets/unit6_banner.webp',
  
  // Unit 01 core files
  './content/unit01/index.html',
  './content/unit01/script.js',
  './content/unit01/style.css',
  './content/unit01/audio/README.md',
  './content/unit01/unit1_modal.html',
  
  // Unit 02 core files
  './content/unit02/',
  './content/unit02/script.js',
  './content/unit02/style.css',
  './content/unit02/audio/README.md',
  
  // Unit 03 core files
  './content/unit03/',
  './content/unit03/script.js',
  './content/unit03/style.css',
  './content/unit03/audio/README.md',
  
  // Unit 04 core files
  './content/unit04/',
  './content/unit04/script.js',
  './content/unit04/style.css',
  './content/unit04/audio/README.md',
  
  // Unit 05 core files
  './content/unit05/',
  './content/unit05/script.js',
  './content/unit05/style.css',
  './content/unit05/audio/README.md',
  
  // Unit 06 core files
  './content/unit06/',
  './content/unit06/script.js',
  './content/unit06/style.css',
  './content/unit06/audio/README.md',
  // Unit 06 assets
  './content/unit06/assets/officers.webp',
  './content/unit06/assets/petty_subofficers.webp',
  
  // PDF resources in extras (CRITICAL FOR OFFLINE USE)
  './content/extras/glossary/AAP-06_2019_EF.pdf',
  './content/extras/glossary/',
  './content/extras/mapreading/US-Army-Map-Reading-and-Land-Navigation.pdf',
  './content/extras/mapreading/',
  './content/extras/selfstudyguide/Military-English-Guide-Version-1.4-March-2025.pdf',
  './content/extras/selfstudyguide/'
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
