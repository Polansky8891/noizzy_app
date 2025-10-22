// src/tests/utils/cacheWeb.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/** Util para importar el módulo *después* de preparar el entorno (caches/no caches) */
const importCacheWeb = async () => {
  const mod = await import("../../utils/cacheWeb.js");
  return mod;
};

/** Fake muy simple de Cache Storage */
class FakeResponse {
  constructor(body, { headers } = {}) {
    this._body = body;
    this.headers = headers || new Headers();
  }
  clone() { return new FakeResponse(this._body, { headers: this.headers }); }
  async json() { return JSON.parse(this._body); }
}
class FakeCache {
  constructor() { this.map = new Map(); }
  async match(key) { return this.map.get(key) || null; }
  async put(key, res) { this.map.set(key, res); }
}
class FakeCaches {
  constructor() { this.store = new Map(); }
  async open(name) {
    if (!this.store.has(name)) this.store.set(name, new FakeCache());
    return this.store.get(name);
  }
}

const ORIGINALS = {
  caches: globalThis.caches,
  Response: globalThis.Response,
  Headers: globalThis.Headers,
  DateNow: Date.now,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

afterEach(() => {
  // restaurar entorno global
  globalThis.caches = ORIGINALS.caches;
  globalThis.Response = ORIGINALS.Response;
  globalThis.Headers = ORIGINALS.Headers;
  Date.now = ORIGINALS.DateNow;
});

/* ──────────────────────────────────────────────
   Fallback en memoria (sin window.caches)
   ────────────────────────────────────────────── */
describe("fetchWithCacheWeb (fallback memoria)", () => {
  it("sin cache previa → devuelve {data:null, stale:true} y de-dupea llamadas", async () => {
    // Simula entorno sin Cache Storage
    delete globalThis.caches;

    const { fetchWithCacheWeb } = await importCacheWeb();

    const fresh = [{ id: 1 }];
    const fetcher = vi.fn().mockResolvedValue(fresh);

    const p1 = fetchWithCacheWeb("k1", fetcher, { ttlMs: 1000 });
    const p2 = fetchWithCacheWeb("k1", fetcher, { ttlMs: 1000 });

    const r1 = await p1;
    const r2 = await p2;

    // primera respuesta: aun no hay cache
    expect(r1.data).toBeNull();
    expect(r1.stale).toBe(true);
    expect(r2.data).toBeNull();

    // solo una ejecución del fetcher por de-dupe
    expect(fetcher).toHaveBeenCalledTimes(1);

    // cuando resuelva la promesa, la próxima lectura trae cache
    await r1.promise;

    const r3 = await fetchWithCacheWeb("k1", fetcher, { ttlMs: 1000 });
    expect(r3.data).toEqual(fresh);
    expect(r3.stale).toBe(false);
  });

  it("marca como stale=true cuando expira el ttl", async () => {
    delete globalThis.caches;
    // fijamos el tiempo
    const T0 = 1_000_000_000;
    Date.now = vi.fn().mockReturnValue(T0);

    const { fetchWithCacheWeb } = await importCacheWeb();

    const fresh = [{ id: 9 }];
    const fetcher = vi.fn().mockResolvedValue(fresh);

    const { promise } = await fetchWithCacheWeb("k2", fetcher, { ttlMs: 10 });
    await promise;

    // avanzamos el reloj más allá del ttl
    Date.now = vi.fn().mockReturnValue(T0 + 11);

    const r = await fetchWithCacheWeb("k2", vi.fn(), { ttlMs: 10 });
    expect(r.data).toEqual(fresh);
    expect(r.stale).toBe(true);
  });
});

/* ──────────────────────────────────────────────
   Cache Storage (con window.caches)
   ────────────────────────────────────────────── */
describe("fetchWithCacheWeb (Cache Storage)", () => {
  it("primera llamada sin cache → devuelve null y revalida; segunda lee cache (stale=false)", async () => {
    // Montamos Cache Storage fake y APIs fetch Response/Headers
    const fakeCaches = new FakeCaches();
    globalThis.caches = fakeCaches;
    globalThis.Response = FakeResponse;
    globalThis.Headers = Headers; // JSDOM la tiene, si no: globalThis.Headers = class { constructor(h={}){ this._=new Map(Object.entries(h)); } get(k){ return this._.get(k) || null; } };

    const { fetchWithCacheWeb } = await importCacheWeb();

    const fresh = [{ id: "A" }];
    const fetcher = vi.fn().mockResolvedValue(fresh);

    const first = await fetchWithCacheWeb("/api/x", fetcher, { ttlMs: 5000 });
    expect(first.data).toBeNull();
    expect(first.stale).toBe(true);
    await first.promise;

    const second = await fetchWithCacheWeb("/api/x", vi.fn(), { ttlMs: 5000 });
    expect(second.data).toEqual(fresh);
    expect(second.stale).toBe(false);
  });

  it("de-dupea múltiples llamadas concurrentes con la misma key", async () => {
    const fakeCaches = new FakeCaches();
    globalThis.caches = fakeCaches;
    globalThis.Response = FakeResponse;
    globalThis.Headers = Headers;

    const { fetchWithCacheWeb } = await importCacheWeb();

    const fresh = [{ id: 7 }];
    const deferred = (() => {
      let resolve, reject;
      const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
      return { promise, resolve, reject };
    })();

    const fetcher = vi.fn().mockReturnValue(deferred.promise);

    const r1 = await fetchWithCacheWeb("/api/y", fetcher, { ttlMs: 1000 });
    const r2 = await fetchWithCacheWeb("/api/y", fetcher, { ttlMs: 1000 });

    // mismas promesas => de-dupe
    expect(r1.promise).toBe(r2.promise);
    expect(fetcher).toHaveBeenCalledTimes(1);

    // resolvemos el fetch real
    deferred.resolve(fresh);
    await r1.promise;

    // lectura desde cache:
    const r3 = await fetchWithCacheWeb("/api/y", vi.fn(), { ttlMs: 1000 });
    expect(r3.data).toEqual(fresh);
    expect(r3.stale).toBe(false);
  });

  it("marca stale=true cuando el ttl ha expirado (headers x-cached-at/x-ttl)", async () => {
    const fakeCaches = new FakeCaches();
    globalThis.caches = fakeCaches;
    globalThis.Response = FakeResponse;
    globalThis.Headers = Headers;

    // fijamos reloj para escribir
    const T0 = 2_000_000_000;
    Date.now = vi.fn().mockReturnValue(T0);

    const { fetchWithCacheWeb } = await importCacheWeb();

    const fresh = [{ id: "Z" }];
    const fetcher = vi.fn().mockResolvedValue(fresh);

    const first = await fetchWithCacheWeb("/api/z", fetcher, { ttlMs: 5 });
    await first.promise;

    // avanzamos más que el ttl
    Date.now = vi.fn().mockReturnValue(T0 + 6);

    const r = await fetchWithCacheWeb("/api/z", vi.fn(), { ttlMs: 5 });
    expect(r.data).toEqual(fresh);
    expect(r.stale).toBe(true);
  });
});
