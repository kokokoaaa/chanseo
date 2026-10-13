// 찬서 앱(PWA) 오프라인 캐시
// 인터넷이 되면 항상 서버의 최신 파일을 받고(받은 것은 캐시에 보관), 안 되면 보관해 둔 마지막 버전으로 실행.
// 같은 주소의 게임 파일만 다룸 (명예의 전당 서버·글꼴 등 다른 주소 요청은 건드리지 않음)
const CACHE = 'chanseo-app-v1';
const CORE = ['./', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.filter(k => k.startsWith('chanseo-app-') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin) return;
  // 캐시 칸은 주소 뒤 ?b=… (업데이트 확인용) 를 뺀 경로로 하나만
  const key = new Request(u.origin + u.pathname);
  e.respondWith((async () => {
    try {
      const res = await fetch(r, { cache: 'no-store' });
      if (res && res.ok) { const c = await caches.open(CACHE); c.put(key, res.clone()).catch(() => {}); }
      return res;
    } catch (err) {
      const c = await caches.open(CACHE);
      return (await c.match(key)) || (await c.match('./')) || Response.error();
    }
  })());
});
