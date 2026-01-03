// FORGE - Service Worker

const CACHE_NAME = 'forge-v3';
const ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/exercises.js',
    '/js/storage.js',
    '/js/timer.js',
    '/js/app.js',
    '/manifest.json',
    '/assets/icons/icon-192.jpg',
    '/assets/icons/icon-512.jpg'
];

// インストール時にアセットをキャッシュ
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// アクティベート時に古いキャッシュを削除
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// ネットワーク優先、失敗時はキャッシュから返す（最新版を優先）
self.addEventListener('fetch', (event) => {
    // APIリクエストなどはキャッシュしない
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // 成功したらキャッシュを更新
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // ネットワーク失敗時はキャッシュから返す（オフライン対応）
                return caches.match(event.request);
            })
    );
});

// タイマー通知のスケジュール
let scheduledNotifications = [];

self.addEventListener('message', (event) => {
    if (event.data.type === 'SCHEDULE_NOTIFICATION') {
        const { endTime, title, body } = event.data;
        const delay = endTime - Date.now();

        if (delay > 0) {
            const timeoutId = setTimeout(() => {
                self.registration.showNotification(title, {
                    body: body,
                    icon: '/assets/icons/icon-192.jpg',
                    badge: '/assets/icons/icon-192.jpg',
                    vibrate: [200, 100, 200, 100, 200],
                    tag: 'timer-notification',
                    renotify: true,
                    requireInteraction: false
                });
            }, delay);

            scheduledNotifications.push(timeoutId);
        }
    }

    if (event.data.type === 'CANCEL_NOTIFICATION') {
        scheduledNotifications.forEach(id => clearTimeout(id));
        scheduledNotifications = [];
    }
});

// 通知クリック時
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            // 既存のウィンドウがあればフォーカス
            for (const client of clientList) {
                if ('focus' in client) {
                    return client.focus();
                }
            }
            // なければ新しいウィンドウを開く
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
