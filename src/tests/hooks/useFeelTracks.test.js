import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

// ──────────────── mocks hoisted ────────────────
const apiGet = vi.hoisted(() => vi.fn());
const baseURL = "https://api.example";

// axios instance
vi.mock("../../api/axios", () => ({
  default: {
    get: (...args) => apiGet(...args),
    defaults: { baseURL },
  },
}));

// util: import dinámico para aislar estado entre tests
const importHook = async () => {
  const mod = await import("../../hooks/useFeelTracks");
  return mod.useFeelTracks;
};

// ──────────────── fake sessionStorage ────────────────
let store;
const makeStorage = () => {
  store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size; },
  };
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();

  // resetear storage por test
  globalThis.sessionStorage = makeStorage();
});

describe("useFeelTracks", () => {
  it("si no hay feel: no llama API ni toca storage; queda en loading=true", async () => {
    const useFeelTracks = await importHook();
    const { result } = renderHook(() => useFeelTracks(undefined));

    expect(apiGet).not.toHaveBeenCalled();
    expect(result.current.items).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe("");
  });

    it("cache hit en sessionStorage: devuelve items y loading=false sin llamar API", async () => {
    const key = "tracks:feel:focus:24";
    const cached = [{ _id: "1", title: "A" }];
    sessionStorage.setItem(key, JSON.stringify(cached));

    const useFeelTracks = await importHook();
    const { result } = renderHook(() => useFeelTracks("focus"));

    // Espera al efecto que lee el cache
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.items).toEqual(cached);
    });
    expect(apiGet).not.toHaveBeenCalled();
  });

    it("cache miss: llama API con params y guarda en sessionStorage; deja loading=false", async () => {
    const feel = "chill";
    const limit = 12;
    const payload = { items: [{ _id: "x", title: "Song X" }] };

    apiGet.mockResolvedValueOnce({ data: payload });

    const useFeelTracks = await importHook();
    const { result } = renderHook(() => useFeelTracks(feel, { limit }));

    // estado inicial
    expect(result.current.items).toEqual([]);
    expect(result.current.loading).toBe(true);

    // tras la llamada
    await waitFor(() => {
      expect(result.current.items).toEqual(payload.items);
      expect(result.current.loading).toBe(false);
    });

    expect(apiGet).toHaveBeenCalledWith("/tracks", { params: { feel, limit } });

    const key = `tracks:feel:${feel}:${limit}`;
    expect(JSON.parse(sessionStorage.getItem(key))).toEqual(payload.items);
  });

  it("error de API: setea error y loading=false; reload() vuelve a pedir y sana", async () => {
    // 1ª → error 500
    apiGet.mockRejectedValueOnce({
      response: { data: { message: "Boom" } },
      message: "Boom",
    });
    // 2ª → OK
    const okItems = [{ _id: "2", title: "B" }];
    apiGet.mockResolvedValueOnce({ data: { items: okItems } });

    const useFeelTracks = await importHook();
    const { result } = renderHook(() => useFeelTracks("energy", { limit: 5 }));

    // error mostrado
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toMatch(/boom/i);
      expect(result.current.items).toEqual([]);
    });

    // reload dispara nuevo fetch
    await act(async () => result.current.reload());

    await waitFor(() => {
      expect(result.current.error).toBe(""); // el hook lo limpia antes de pedir
      expect(result.current.items).toEqual(okItems);
      expect(result.current.loading).toBe(false);
    });

    expect(apiGet).toHaveBeenCalledTimes(2);
  });

    it("cambio de props (feel/limit) genera nuevo fetch y cacheKey distinto", async () => {
    const useFeelTracks = await importHook();

    // 1ª llamada
    apiGet.mockResolvedValueOnce({ data: { items: [{ _id: "a" }] } });
    const { rerender } = renderHook((p) => useFeelTracks(p.feel, { limit: p.limit }), {
      initialProps: { feel: "calm", limit: 10 },
    });
    await waitFor(() => expect(JSON.parse(sessionStorage.getItem("tracks:feel:calm:10"))).toEqual([{ _id: "a" }]));

    // 2ª con props nuevas
    apiGet.mockResolvedValueOnce({ data: { items: [{ _id: "b" }] } });
    rerender({ feel: "party", limit: 8 });
    await waitFor(() => expect(JSON.parse(sessionStorage.getItem("tracks:feel:party:8"))).toEqual([{ _id: "b" }]));

    expect(apiGet).toHaveBeenCalledTimes(2);
  });

  it("cache=false: no lee ni escribe sessionStorage", async () => {
    const items = [{ _id: "9" }];
    apiGet.mockResolvedValueOnce({ data: { items } });

    // Preseed algo en storage que NO debería usarse
    sessionStorage.setItem("tracks:feel:boost:24", JSON.stringify([{ _id: "stale" }]));

    const useFeelTracks = await importHook();
    const { result } = renderHook(() => useFeelTracks("boost", { cache: false }));

    await waitFor(() => {
      expect(result.current.items).toEqual(items);
      expect(result.current.loading).toBe(false);
    });

    // no leyó ni sobrescribió (sigue el stale)
    expect(JSON.parse(sessionStorage.getItem("tracks:feel:boost:24"))).toEqual([{ _id: "stale" }]);
  });

  });