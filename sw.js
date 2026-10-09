const CACHE_NAME = 'mtm-cache-v1';

// Daftar file dasar yang akan disimpan di perangkat pengguna agar aplikasi memuat lebih cepat
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

// Proses Instalasi Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache berhasil dibuka');
        return cache.addAll(urlsToCache);
      })
  );
});

// Proses Pengambilan Data (Fetch)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika file ada di cache, gunakan itu. Jika tidak, ambil dari internet (jaringan).
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Proses Pembersihan Cache Lama saat ada pembaruan
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
