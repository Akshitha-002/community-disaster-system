/* =====================================================================
   SW.JS - Service Worker (makes the site work offline)
   ---------------------------------------------------------------------
   A service worker is a script the browser runs in the background.
   It sits between the page and the network:
   1. On first visit ("install"), it saves a copy of every site file.
   2. On later visits ("fetch"), it answers from that saved copy, so
      pages load even with no internet.
   3. When the internet IS available, it quietly refreshes the saved
      copy, so new versions of the site still arrive.

   Service workers only run on https:// or localhost (so on GitHub
   Pages and Live Server, but not when opening index.html by double-click).

   IMPORTANT: when you change any site file, bump CACHE_VERSION below
   so visitors' old saved copies are replaced.
   ===================================================================== */

var CACHE_VERSION = "v1";
var APP_CACHE = "cdps-app-" + CACHE_VERSION;   // the site's own files
var TILE_CACHE = "cdps-tiles";                  // map tiles the user has viewed
var MAX_TILES = 300;                            // keep the tile cache from growing forever

// Every file the site needs, saved on first visit.
var APP_FILES = [
  "./",
  "index.html",
  "alerts.html",
  "preparedness.html",
  "contacts.html",
  "resources.html",
  "report.html",
  "safety-guides.html",
  "admin.html",
  "about.html",
  "css/style.css",
  "js/main.js",
  "js/alerts.js",
  "js/report.js",
  "js/contacts.js",
  "js/safety.js",
  "js/resources.js",
  "js/admin.js",
  "manifest.webmanifest",
  "assets/images/icon.svg",
  "assets/images/icon-192.png",
  "assets/images/icon-512.png",
  "assets/vendor/fonts/fonts.css",
  "assets/vendor/fonts/archivo-latin-600-normal.woff2",
  "assets/vendor/fonts/archivo-latin-700-normal.woff2",
  "assets/vendor/fonts/archivo-latin-800-normal.woff2",
  "assets/vendor/fonts/inter-latin-400-normal.woff2",
  "assets/vendor/fonts/inter-latin-500-normal.woff2",
  "assets/vendor/fonts/inter-latin-600-normal.woff2",
  "assets/vendor/fontawesome/css/all.min.css",
  "assets/vendor/fontawesome/webfonts/fa-solid-900.woff2",
  "assets/vendor/fontawesome/webfonts/fa-regular-400.woff2",
  "assets/vendor/fontawesome/webfonts/fa-brands-400.woff2",
  "assets/vendor/fontawesome/webfonts/fa-v4compatibility.woff2",
  "assets/vendor/leaflet/leaflet.css",
  "assets/vendor/leaflet/leaflet.js",
  "assets/vendor/leaflet/images/marker-icon.png",
  "assets/vendor/leaflet/images/marker-icon-2x.png",
  "assets/vendor/leaflet/images/marker-shadow.png",
  "assets/vendor/leaflet/images/layers.png",
  "assets/vendor/leaflet/images/layers-2x.png"
];

// --- INSTALL: save all site files ---
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(APP_CACHE).then(function (cache) {
      return cache.addAll(APP_FILES);
    })
  );
  self.skipWaiting(); // activate the new version straight away
});

// --- ACTIVATE: delete saved copies from older versions ---
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names
          .filter(function (name) { return name.indexOf("cdps-app-") === 0 && name !== APP_CACHE; })
          .map(function (name) { return caches.delete(name); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

// --- FETCH: answer requests from the saved copy when possible ---
self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;

  var url = new URL(request.url);

  // Map tiles (OpenStreetMap): network first, remember what the user has
  // viewed, and fall back to the saved tile when offline.
  if (url.hostname.endsWith("tile.openstreetmap.org")) {
    event.respondWith(handleTile(request));
    return;
  }

  // Anything else from another website (e.g. directions page): don't touch it.
  if (url.origin !== self.location.origin) return;

  // The site's own files: show the saved copy immediately, and refresh it
  // in the background when online ("stale-while-revalidate").
  // ignoreSearch lets "style.css?v=5" match the saved "style.css".
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then(function (saved) {
      var refresh = fetch(request).then(function (response) {
        if (response && response.ok) {
          var copy = response.clone();
          caches.open(APP_CACHE).then(function (cache) { cache.put(request, copy); });
        }
        return response;
      }).catch(function () {
        // Offline: use the saved copy; if a page was never saved, show the home page.
        return saved || (request.mode === "navigate" ? caches.match("index.html") : Response.error());
      });

      return saved || refresh;
    })
  );
});

function handleTile(request) {
  return fetch(request).then(function (response) {
    if (response && response.ok) {
      var copy = response.clone();
      caches.open(TILE_CACHE).then(function (cache) {
        cache.put(request, copy).then(function () { trimTileCache(cache); });
      });
    }
    return response;
  }).catch(function () {
    return caches.match(request); // offline: use a tile saved earlier (or nothing)
  });
}

// Keep only the newest MAX_TILES tiles.
function trimTileCache(cache) {
  cache.keys().then(function (keys) {
    if (keys.length > MAX_TILES) {
      cache.delete(keys[0]).then(function () { trimTileCache(cache); });
    }
  });
}
