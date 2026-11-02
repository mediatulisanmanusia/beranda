const CACHE_NAME = 'mtm-cache-v3'; // Dinaikkan ke v3 agar cache v2 otomatis terhapus

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/rev.png',
  '/rev1.png',
  '/rev2.png',
  '/load.webp',
  '/mascipta.webp',
  '/menyapa.webp'
];

// 1. TAHAP INSTALL: Simpan aset dasar & langsung aktifkan Service Worker baru
self.addEventListener('install', event => {
  self.skipWaiting(); // Paksa langsung aktif tanpa menunggu tab ditutup
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.log('Lewati file pre-cache yang tidak ditemukan:', err))
  );
});

// 2. TAHAP ACTIVATE: Bersihkan seluruh cache versi lama (v1, v2, dst)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Langsung ambil alih kontrol halaman saat ini
  );
});

// 3. TAHAP FETCH: Strategi Network-First (Utamakan Server, Cache hanya saat Offline)
self.addEventListener('fetch', event => {
  // Jangan simpan request selain GET (seperti pengiriman form / database Firebase)
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then(networkResponse => {
        // Jika berhasil ambil versi terbaru dari server, perbarui juga salinan di cache
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Jika pengguna sedang offline / sinyal mati, baru tampilkan dari cache
        return caches.match(event.request);
      })
  );
});
