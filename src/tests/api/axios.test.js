// src/tests/api/axios.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";

/* ────────── Mocks hoisted ────────── */
const FirebaseAuthRef = vi.hoisted(() => ({ currentUser: null }));
const transportMock   = vi.hoisted(() => vi.fn());

// Mock de axios: devolvemos una “instancia” mínima compatible
vi.mock("axios", () => {
  const makeInstance = () => {
    const reqFns = [];
    const resFns = [];
    const resErrFns = [];
    const instance = async (cfg = {}) => {
      // request interceptors
      let config = cfg;
      for (const fn of reqFns) config = await fn(config);

      try {
        const resp = await instance._transport(config);
        // response (fulfilled) interceptors
        let r = resp;
        for (const fn of resFns) r = await fn(r);
        return r;
      } catch (err) {
        // response (rejected) interceptors
        let e = err;
        for (const fn of resErrFns) {
          try {
            return await fn(e);
          } catch (e2) {
            e = e2;
          }
        }
        throw e;
      }
    };

    instance._transport = async () => ({ status: 200, data: {} });
    instance.get = (url, cfg = {}) => instance({ ...cfg, method: "get", url });

    instance.interceptors = {
      request: { use: (fn) => reqFns.push(fn) },
      response: { use: (ok, bad) => { resFns.push(ok || ((x) => x)); resErrFns.push(bad); } },
    };
    return instance;
  };

  return {
    default: {
      create: () => {
        const inst = makeInstance();
        // el test controlará el "transporte" real
        inst._transport = (...args) => transportMock(...args);
        return inst;
      },
    },
  };
});

// Mock del FirebaseAuth usado por el módulo
vi.mock("../../firebase/config", () => ({
  FirebaseAuth: FirebaseAuthRef,
}));

// Mock del API_BASE para que no importe
vi.mock("../../api/base", () => ({ API_BASE: "https://api.test" }));

const importApi = async () => {
  // Import dinámico para reinicializar interceptores entre tests
  const mod = await import("../../api/axios.js");
  return mod.default;
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  FirebaseAuthRef.currentUser = null;
  transportMock.mockReset();
});

describe("api/axios interceptores", () => {
  it("request: añade Authorization cuando hay usuario", async () => {
    const user = { getIdToken: vi.fn().mockResolvedValue("TKN1") };
    FirebaseAuthRef.currentUser = user;

    const api = await importApi();
    transportMock.mockResolvedValueOnce({ status: 200, data: "ok" });

    await api.get("/foo");

    // el transporte recibe el header con Bearer TKN1
    expect(transportMock).toHaveBeenCalledTimes(1);
    const cfg = transportMock.mock.calls[0][0];
    expect(cfg.headers.Authorization).toBe("Bearer TKN1");
    expect(user.getIdToken).toHaveBeenCalledTimes(1);
  });

    it("request: no añade Authorization si no hay usuario", async () => {
    FirebaseAuthRef.currentUser = null;
    const api = await importApi();

    transportMock.mockResolvedValueOnce({ status: 200 });

    await api.get("/bar");

    const cfg = transportMock.mock.calls[0][0];
    expect(cfg.headers?.Authorization).toBeUndefined();
  });
    it("response: 401 → refresca una sola vez y reintenta con el nuevo token (concurrente)", async () => {
  // Simula comportamiento real de Firebase: tras refresh, getIdToken(false) da el nuevo
  let current = "OLD_TKN";
  const getIdToken = vi.fn((force) => {
    if (force) {
      current = "NEW_TKN";
      return Promise.resolve("NEW_TKN");
    }
    return Promise.resolve(current);
  });
  FirebaseAuthRef.currentUser = { getIdToken };

  transportMock
    .mockRejectedValueOnce({ response: { status: 401 }, config: { url: "/a" } })
    .mockRejectedValueOnce({ response: { status: 401 }, config: { url: "/b" } })
    .mockResolvedValueOnce({ status: 200, data: "A_OK" })
    .mockResolvedValueOnce({ status: 200, data: "B_OK" });

  const api = await importApi();

  await Promise.all([api.get("/a"), api.get("/b")]);

  expect(getIdToken.mock.calls.filter(c => c[0] === true)).toHaveLength(1);

  const retryCfgs = transportMock.mock.calls.slice(2).map(c => c[0]);
  retryCfgs.forEach(cfg => {
    expect(cfg.headers.Authorization).toBe("Bearer NEW_TKN");
  });

  expect(transportMock).toHaveBeenCalledTimes(4);
});

  it("response: 401 y sin usuario → propaga el error (sin reintentar)", async () => {
    FirebaseAuthRef.currentUser = null;
    transportMock.mockRejectedValueOnce({
      response: { status: 401 },
      config: { url: "/x" },
    });

    const api = await importApi();

    await expect(api.get("/x")).rejects.toMatchObject({
      response: { status: 401 },
    });
    // sólo una llamada al “servidor”
    expect(transportMock).toHaveBeenCalledTimes(1);
  });

    it("response: no 401 (p.ej. 500) → propaga el error tal cual", async () => {
    FirebaseAuthRef.currentUser = { getIdToken: vi.fn().mockResolvedValue("TKN") };
    transportMock.mockRejectedValueOnce({
      response: { status: 500 },
      config: { url: "/oops" },
    });

    const api = await importApi();
    await expect(api.get("/oops")).rejects.toMatchObject({
      response: { status: 500 },
    });
    expect(transportMock).toHaveBeenCalledTimes(1);
  });

    it("response: ya venía con _retry (2º 401) → no reintenta de nuevo", async () => {
    FirebaseAuthRef.currentUser = { getIdToken: vi.fn().mockResolvedValue("TKN") };
    transportMock.mockRejectedValueOnce({
      response: { status: 401 },
      config: { url: "/loop", _retry: true },
    });

    const api = await importApi();
    await expect(api.get("/loop")).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(transportMock).toHaveBeenCalledTimes(1);
  });

    it("response: error refrescando token → propaga el 401", async () => {
    const getIdToken = vi.fn((force) =>
      force ? Promise.reject(new Error("refresh-failed")) : Promise.resolve("OLD")
    );
    FirebaseAuthRef.currentUser = { getIdToken };

    transportMock.mockRejectedValueOnce({
      response: { status: 401 },
      config: { url: "/need-refresh" },
    });

    const api = await importApi();
    await expect(api.get("/need-refresh")).rejects.toMatchObject({
      response: { status: 401 },
    });

    // se intentó refrescar 1 vez
    expect(getIdToken).toHaveBeenCalledWith(true);
  });

  });