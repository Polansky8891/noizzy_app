// src/utils/cacheWeb.js
const CACHE_NAME = "noizzy-api-v1";
const supportsCache = typeof window !== "undefined" && "caches" in window;

// Fallback en memoria si Cache Storage no existe (Safari muy viejo, etc.)
const memStore = new Map();
const inflight = new Map(); // de-dupe de peticiones

async function getFromCache(key) {
  if (!supportsCache) {
    const v = memStore.get(key);
    if (!v) return null;
    const { ts, ttl, data } = v;
    const stale = ttl ? Date.now() - ts > ttl : false;
    return { data, stale };
  }
  const cache = await caches.open(CACHE_NAME);
  const res = await cache.match(key);
  if (!res) return null;
  let data = null;
  try { data = await res.clone().json(); } catch {}
  const cachedAt = Number(res.headers.get("x-cached-at") || 0);
  const ttl = Number(res.headers.get("x-ttl") || 0);
  const stale = ttl ? Date.now() - cachedAt > ttl : false;
  return { data, stale };
}

async function setToCache(key, data, ttlMs = 0) {
  if (!supportsCache) {
    memStore.set(key, { ts: Date.now(), ttl: ttlMs, data });
    return;
  }
  const cache = await caches.open(CACHE_NAME);
  const body = JSON.stringify(data ?? null);
  const headers = new Headers({
    "Content-Type": "application/json",
    "x-cached-at": String(Date.now()),
    "x-ttl": String(ttlMs || 0),
  });
  const res = new Response(body, { headers });
  await cache.put(key, res);
}

export async function fetchWithCacheWeb(keyUrl, fetcher, { ttlMs = 15 * 60 * 1000 } = {}) {
  // 1) devuelve cache al instante (si existe)
  const cached = await getFromCache(keyUrl);

  // 2) de-dupe: si ya hay una request en curso con la misma key, espera esa para revalidación
  if (!inflight.has(keyUrl)) {
    const p = (async () => {
      const fresh = await fetcher();
      await setToCache(keyUrl, fresh, ttlMs);
      return fresh;
    })();
    inflight.set(keyUrl, p);
    p.finally(() => inflight.delete(keyUrl));
  }
  const promise = inflight.get(keyUrl);

  return {
    data: cached?.data ?? null,
    stale: cached?.stale ?? true,
    promise, // revalidación en background
  };
}
