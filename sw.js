// ============================================================
// TOEIC 練習室 Service Worker
// Cache strategy: app shell cache-first, api network-only, data stale-while-revalidate
// ============================================================
var CACHE = 'toeic-shell-20260704-4';
var VERSION = '20260704-4';

var PRECACHE = [
  './',
  './index.html',
  './manifest.json?v=' + VERSION,
  './css/style.css?v=' + VERSION,
  './js/storage.js?v=' + VERSION,
  './js/tts.js?v=' + VERSION,
  './js/data-loader.js?v=' + VERSION,
  './js/quiz-engine.js?v=' + VERSION,
  './js/listening.js?v=' + VERSION,
  './js/session-composer.js?v=' + VERSION,
  './js/analytics.js?v=' + VERSION,
  './js/wrongbook.js?v=' + VERSION,
  './js/ui-renderer.js?v=' + VERSION,
  './js/app.js?v=' + VERSION,
  './js/firebase-config.js?v=' + VERSION,
  './js/auth.js?v=' + VERSION,
  './js/sync.js?v=' + VERSION,
  './js/pwa.js?v=' + VERSION,
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-64.png'
];

var THIRD_PARTY = [
  /googleapis\.com/,
  /gstatic\.com/,
  /firebaseapp\.com/,
  /firebaseio\.com/,
  /firestore/,
  /identitytoolkit/
];

function isThirdParty(url) {
  for (var i = 0; i < THIRD_PARTY.length; i++) {
    if (THIRD_PARTY[i].test(url)) return true;
  }
  var parsedUrl;
  try { parsedUrl = new URL(url); } catch (e) { return false; }
  return parsedUrl.origin !== self.location.origin;
}

function isDataFile(url) {
  return /\/data\/.*\.json/.test(url);
}

function isAppShell(url) {
  var parsedUrl;
  try { parsedUrl = new URL(url); } catch (e) { return false; }
  if (parsedUrl.origin !== self.location.origin) return false;
  var path = parsedUrl.pathname.replace(/^\/+/, '');
  if (path === '' || path.endsWith('index.html')) return true;
  if (/\.(css|js|html|ico|png|svg|woff2?)$/i.test(path)) return true;
  if (/^manifest\.json/.test(path)) return true;
  if (/^icons\//i.test(path)) return true;
  return false;
}

// ── Install ──
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(PRECACHE).catch(function(err) {
        console.warn('SW precache partial failure:', err);
      });
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// ── Activate ──
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) {
          if (key !== CACHE) {
            return caches.delete(key);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// ── Fetch ──
self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;

  var url = event.request.url;

  // Third-party (Firebase, Google APIs, etc.) → network only, no cache
  if (isThirdParty(url)) {
    return;
  }

  // App shell & static resources → cache-first
  if (isAppShell(url)) {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        return fetch(event.request).then(function(response) {
          if (!response || response.status !== 200) return response;
          var cloned = response.clone();
          caches.open(CACHE).then(function(cache) {
            cache.put(event.request, cloned);
          });
          return response;
        });
      })
    );
    return;
  }

  // Data files (*.json) → cache-first with runtime caching
  if (isDataFile(url)) {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        var networkFetch = fetch(event.request).then(function(response) {
          if (response && response.status === 200) {
            var cloned = response.clone();
            caches.open(CACHE).then(function(cache) {
              cache.put(event.request, cloned);
            });
          }
          return response;
        });
        return cached || networkFetch;
      })
    );
    return;
  }

  // Navigate fallback for offline SPA
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match('./index.html');
      })
    );
    return;
  }
});
