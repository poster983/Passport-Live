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

/*set precache*/
workbox.precaching.precacheAndRoute(self.__precacheManifest || []);
 
  
/* Routing */

//images
workbox.routing.registerRoute(
    /\.(?:png|gif|jpg|jpeg|svg)$/,
    workbox.strategies.cacheFirst({
        cacheName: "images",
        plugins: [
            new workbox.expiration.Plugin({
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
            }),
        ],
    })
); 

  

//(?:\/student|\/teacher|\/account|\/administrator)(\/(.+)?)?|(\/([/])$)

//serve offline page 
workbox.routing.registerRoute(
    ({event}) => event.request.mode === "navigate",
    (args) => workbox.strategies.networkOnly().handle(args).catch(() => caches.match("/offline"))
);

self.addEventListener('activate', (event) => {
    console.log("Activated Service Worker!")
});