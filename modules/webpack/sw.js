/*
Passport-Live is a modern web app for schools that helps them manage passes.
    Copyright (C) 2017  Joseph Hassell

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

email: hi@josephhassell.com
*/
console.log(workbox)
//set precache
workbox.precaching.precacheAndRoute(self.__precacheManifest || []);

/* Routing */

//images
workbox.routing.registerRoute(
    /\.(?:png|gif|jpg|jpeg|svg)$/,
    workbox.strategies.cacheFirst({
      cacheName: 'images',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
      ],
    }),
  ); 
/*workbox.registerRoute(
    new RegExp("\(api/media/background\)\|\(api/media/avatar\)"),
    workbox.strategies.cacheFirst({cacheName: "media"}),
    "GET"
);*/
  

/*
var CACHE_NAME = "passport-cache-v5.2.0";
var urlsToCache = [
    "/",
    "/stylesheets/passport.css",
    "/stylesheets/materialize.css",
    "/stylesheets/animate.css",
    "/js/materialize.js",
    "/js/init.js",
    "/js/passport.js",
    "/js/webpack/loader-message.min.js",
    "/js/polyfill/webcomponents-lite.js"
    //'/fonts/'
];
self.addEventListener("install", function(event) {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log("Opened cache");
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener("fetch", function(event) {
    //only allow get requests
    if (event.request.method === "GET") {
        event.respondWith(
            /*caches.open(CACHE_NAME).then(function(cache) {
                return fetch(event.request).then(function(response) {
                    cache.put(event.request, response.clone());
                    return response;
                });
            })*/
//get from cashe, then update from server
/*caches.open(CACHE_NAME).then(function(cache) {
                return cache.match(event.request).then(function (response) {
                    return response || fetch(event.request).then(function(response) {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                });
            })*/
/*fetch(event.request).catch(function() {
                return caches.match(event.request);
            })
            *//*
        );
    }
});


//Clean up old caches 
self.addEventListener("activate", function(event) {
    console.log("Activated Service Worker!");
    var cacheWhitelist = ["pages-cache-v1", "blog-posts-cache-v1"];

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
*/