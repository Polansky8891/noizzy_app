// src/tests/hooks/useCachedTracks.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// ───────── mocks hoisted ─────────
const apiGet = vi.hoisted(() => vi.fn());
const baseURL = "https://api.example";

// axios instance (solo para que exista defaults.baseURL si lo necesitas en otros tests)
vi.mock("../../api/axios", () => ({
  default: {
    get: (...args) => apiGet(...args),
    defaults: { baseURL },
  },
}));

// cache helper
vi.mock("../../utils/cacheWeb", () => ({
  fetchWithCacheWeb: vi.fn(),
}));
const { fetchWithCacheWeb } = await import("../../utils/cacheWeb");

// hook a probar (import dinámico para no compartir estado entre tests)
const importHook = async () => {
  const mod = await import("../../hooks/useCachedTracks");
  return mod.useCachedTracks;
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("useCachedTracks", () => {
  it("cache hit: pinta cache y luego refresca con fresh distinto (controlando el timing)", async () => {
    const cached = [{ _id: "1", title: "A", artist: "AA", audioUrl: "a.mp3", coverUrl: "a.jpg" }];
    const fresh  = [{ _id: "2", title: "B", artist: "BB", audioUrl: "b.mp3", coverUrl: "b.jpg" }];

    // promesa diferida para controlar cuándo llega el refresh
    let resolveRefresh;
    const refreshPromise = new Promise((res) => { resolveRefresh = res; });

    fetchWithCacheWeb.mockResolvedValueOnce({
      data: cached,          // hay caché
      promise: refreshPromise, // aún no llega el refresh
    });

    const useCachedTracks = await importHook();
    const { result } = renderHook(() => useCachedTracks({ genre: "rock", feel: "chill", limit: 10 }));

    // 1) esperar a que el efecto aplique la caché
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.items).toEqual(cached);
    });

    // 2) ahora “llega” el refresh
    await act(async () => resolveRefresh(fresh));

    // 3) y reemplaza items por fresh
    await waitFor(() => {
      expect(result.current.items).toEqual(fresh);
      expect(result.current.loading).toBe(false);
    });
  });

  it("sin caché: empieza con [] y loading=true; luego datos y loading=false", async () => {
    const fresh = [
      { _id: "1", title: "X", artist: "XX", audioUrl: "x.mp3", coverUrl: "x.jpg" },
      { _id: "2", title: "Y", artist: "YY", audioUrl: "y.mp3", coverUrl: "y.jpg" },
    ];

    fetchWithCacheWeb.mockResolvedValueOnce({
      data: null,                 // no hay caché
      promise: Promise.resolve(fresh), // llega la red
    });

    const useCachedTracks = await importHook();
    const { result } = renderHook(() => useCachedTracks({ limit: 2 }));

    // estado inicial antes de que resuelva el efecto
    expect(result.current.items).toEqual([]);
    expect(result.current.loading).toBe(true);

    // tras la promesa, llegan los datos
    await waitFor(() => {
      expect(result.current.items).toEqual(fresh);
      expect(result.current.loading).toBe(false);
    });
  });
});
