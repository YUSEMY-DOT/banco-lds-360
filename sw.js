const CACHE_NAME = 'banco-lds-360-pwa-v8';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-512-maskable.png',
  './assets/splash-screen.webp',
];

/* =========================================================
   INSTALACIÓN
   ========================================================= */

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

/* =========================================================
   ACTIVACIÓN
   ========================================================= */

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* =========================================================
   CACHÉ / NAVEGACIÓN
   ========================================================= */

self.addEventListener('fetch', (event) => {

  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {

    event.respondWith(
      fetch(event.request)
        .then(response => {

          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(cache =>
              cache.put('./index.html', copy)
            );

          return response;
        })
        .catch(() =>
          caches.match('./index.html')
        )
    );

    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cached => {

        if (cached) {
          return cached;
        }

        return fetch(event.request)
          .then(response => {

            if (response && response.ok) {

              const copy = response.clone();

              caches.open(CACHE_NAME)
                .then(cache =>
                  cache.put(event.request, copy)
                );
            }

            return response;
          });
      })
  );
});

/* =========================================================
   NOTIFICACIONES
   ========================================================= */

self.addEventListener('notificationclick', (event) => {

  event.notification.close();

  const datos =
    event.notification.data || {};

  const url =
    datos.url ||
    '/banco-lds-360/';

  event.waitUntil(

    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then(clientes => {

      for (const cliente of clientes) {

        if ('focus' in cliente) {

          if (
            'navigate' in cliente &&
            cliente.url !== url
          ) {
            cliente.navigate(url);
          }

          return cliente.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }

    })
  );
});

/* =========================================================
   CERRAR NOTIFICACIÓN
   ========================================================= */

self.addEventListener('notificationclose', () => {
  // Reservado para futuras estadísticas de notificaciones.
});
