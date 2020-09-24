const FILES_TO_CHACHE = [
    "./",
    "./index.html",
    "./index.js",
    "./db.js",
    "../routes/api.js",
    "../models/transaction.js",
    "./style.css",
    "./icons/icon-192x192.png",
    "./icons/icon-512x512.png",
];
const CACHE_NAME= "static-cache-v2";
const DATA_CACHE_NAME= "data-cache-v1";

//installation
self.addEventListener("install", function(evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Your files were pre-cached successfully!");
        })
    );
    self.skipWaiting();
});

//activation
self.addEventListener("activate", function(evt) {
    evt.waitUntil(
        caches.keys().then((keylist) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Removing old cache data", key);
                        return caches.delete(key);
                    
                    }
                })
            );
        })
    );
    self.clients.claim();
});

//fetch
self.addEventListener("fetch", function(evt) {
    if (evt.request.url.includes("/api/")) {
        evt.respondWith(
            caches.open(DATA_CACHE_NAME)
            .then((cache) => {
                return fetch(evt.request)
                .then((response) => {
                    //if response was good, clone and store it in the cache
                    if(response.status === 200) {
                        cache.put(evt.request.url, response.clone());
                    }
                    return response;
                })
                .catch((err) => {
                    //Network request failed, try to get it from the cache
                    return cache.match(evt.request);
                });
            })
            .catch((err) => console.log(err))
        );
        return;
    }
});