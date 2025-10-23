import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cacheSet, cacheGet } from "../../utils/cacheLocal"; // ajusta la ruta si difiere

const PREFIX = "noizzy_cache_v1:";

beforeEach(() => {
  vi.useRealTimers();
  vi.setSystemTime(new Date("2025-01-01T00:00:00Z")); // base estable para Date.now()
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("cache utils (cacheSet/cacheGet)", () => {
  it("guarda y lee dentro del TTL", () => {
    cacheSet("k1", { a: 1 }, 1000);
    expect(cacheGet("k1")).toEqual({ a: 1 });
  });

  it("al expirar devuelve null y elimina la clave", () => {
    const spyRemove = vi.spyOn(Storage.prototype, "removeItem");
    cacheSet("k2", "value", 500);

    // avanzamos el tiempo más allá del ttl
    vi.setSystemTime(new Date("2025-01-01T00:00:01Z")); // +1000ms
    expect(cacheGet("k2")).toBeNull();

    // debe borrar la entrada expirada
    expect(spyRemove).toHaveBeenCalledWith(PREFIX + "k2");
    expect(localStorage.getItem(PREFIX + "k2")).toBeNull();
  });

  it("si no existe la clave, devuelve null", () => {
    expect(cacheGet("missing")).toBeNull();
  });

  it("soporta entradas sin 'exp' (retorna data)", () => {
    // simulamos una entrada antigua sin exp
    localStorage.setItem(PREFIX + "k3", JSON.stringify({ data: 123 }));
    expect(cacheGet("k3")).toBe(123);
  });

  it("si el JSON está corrupto, devuelve null de forma segura", () => {
    localStorage.setItem(PREFIX + "bad", "{not-json");
    expect(cacheGet("bad")).toBeNull();
  });

  it("cacheSet no lanza si setItem falla (ej. cuota llena)", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() => cacheSet("k4", "x", 1000)).not.toThrow();
    expect(spy).toHaveBeenCalled(); // intentó guardar
  });

  it("usa el prefijo correcto en la clave", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem");
    cacheSet("pref", "ok", 1000);
    expect(spy).toHaveBeenCalledWith(
      PREFIX + "pref",
      expect.stringMatching(/"data":"ok"/)
    );
  });
});
