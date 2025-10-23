import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";

// ⬆️ Hoisted mock de api (get/post/delete)
const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}));
vi.mock("../../api/axios", () => ({ __esModule: true, default: apiMock }));

// Import del slice DESPUÉS de los mocks
import reducer, {
  toggleLocal,
  resetFavorites,
  hydrateFavoritesFromCache,
  fetchFavoriteTracks,
  addFavorite,
  removeFavorite,
  selectFavoriteTracks,
  selectFavoritesLoading,
  selectFavoritesHasFetchedOnce,
} from "../../store/favoritesSlice";

const USER = { id: "u1" };
const AUTH_DEFAULT = { user: USER, token: "tok" };

// store helper con auth “mínimo”
const makeStore = (authState = AUTH_DEFAULT) =>
  configureStore({
    reducer: {
      favorites: reducer,
      auth: (state = authState, _action) => state,
    },
  });

// key que usa el slice para cachear
const cacheKey = (uid = USER.id) => `fav_cache_v1:${uid}`;

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("favoritesSlice", () => {
  it("toggleLocal: añade optimista con track y luego elimina con id", () => {
    const store = makeStore();

    // add optimista con track
    store.dispatch(
      toggleLocal({
        id: "t1",
        track: { _id: "t1", title: "Song", artist: "AA", coverUrl: "c.jpg" },
      }),
    );

    let s = store.getState().favorites;
    expect(s.ids).toEqual(["t1"]);
    expect(s.items[0]).toMatchObject({ _id: "t1", title: "Song" });

    // remove optimista con id
    store.dispatch(toggleLocal("t1"));
    s = store.getState().favorites;
    expect(s.ids).toEqual([]);
    expect(s.items).toEqual([]);
  });

  it("hydrateFavoritesFromCache: carga ids/items desde localStorage sin marcar fetched", async () => {
    const items = [{ _id: "a1" }, { _id: "a2" }];
    localStorage.setItem(cacheKey(), JSON.stringify({ items, ids: ["a1", "a2"] }));

    const store = makeStore();
    await store.dispatch(hydrateFavoritesFromCache());

    const s = store.getState().favorites;
    expect(s.ids).toEqual(["a1", "a2"]);
    expect(s.items).toEqual(items);
    expect(selectFavoritesHasFetchedOnce(store.getState())).toBe(false);
  });

  it("fetchFavoriteTracks: devuelve array y persiste cache", async () => {
    const items = [{ _id: "x1" }, { _id: "x2" }];
    apiMock.get.mockResolvedValueOnce({ status: 200, data: items });
    const setSpy = vi.spyOn(Storage.prototype, "setItem");

    const store = makeStore();
    await store.dispatch(fetchFavoriteTracks());

    const s = store.getState().favorites;
    expect(s.ids).toEqual(["x1", "x2"]);
    expect(s.items).toEqual(items);
    expect(selectFavoritesHasFetchedOnce(store.getState())).toBe(true);
    expect(setSpy).toHaveBeenCalledWith(cacheKey(), JSON.stringify({ items, ids: ["x1", "x2"] }));
  });

  it("fetchFavoriteTracks: 204 vacía estado y cache", async () => {
    apiMock.get.mockResolvedValueOnce({ status: 204, data: null });
    const setSpy = vi.spyOn(Storage.prototype, "setItem");

    const store = makeStore();
    await store.dispatch(fetchFavoriteTracks());

    const s = store.getState().favorites;
    expect(s.ids).toEqual([]);
    expect(s.items).toEqual([]);
    expect(setSpy).toHaveBeenCalledWith(cacheKey(), JSON.stringify({ items: [], ids: [] }));
  });

  it("fetchFavoriteTracks: 401 unauthorized no marca fetchedOnce ni error bloqueante", async () => {
    const err = new Error("unauthorized");
    err.response = { status: 401, data: { message: "Unauthorized" } };
    apiMock.get.mockRejectedValueOnce(err);

    const store = makeStore();
    await store.dispatch(fetchFavoriteTracks());

    const s = store.getState().favorites;
    expect(s.loading).toBe(false);
    // En rejected con 'unauthorized' el slice NO marca hasFetchedOnce
    expect(selectFavoritesHasFetchedOnce(store.getState())).toBe(false);
  });

  it("addFavorite: si API devuelve favoritesIds, reemplaza ids y sincroniza cache", async () => {
    apiMock.post.mockResolvedValueOnce({ data: { favoritesIds: ["a", "b"] } });
    const setSpy = vi.spyOn(Storage.prototype, "setItem");

    const store = makeStore();
    await store.dispatch(addFavorite("x"));

    const s = store.getState().favorites;
    expect(s.ids).toEqual(["a", "b"]);
    expect(setSpy).toHaveBeenCalledWith(cacheKey(), JSON.stringify({ items: [], ids: ["a", "b"] }));
  });

  it("addFavorite: si API NO devuelve lista, añade el id", async () => {
    apiMock.post.mockResolvedValueOnce({ data: {} });

    const store = makeStore();
    await store.dispatch(addFavorite("z"));

    const s = store.getState().favorites;
    expect(s.ids).toEqual(["z"]);
  });

  it("removeFavorite: si API devuelve favoritesIds, sincroniza ids/items y cache", async () => {
    // estado inicial con items/ids
    const store = makeStore();
    store.dispatch(
      toggleLocal({ id: "k1", track: { _id: "k1", title: "K" } }),
    );

    apiMock.delete.mockResolvedValueOnce({ data: { favoritesIds: [] } });
    const setSpy = vi.spyOn(Storage.prototype, "setItem");

    await store.dispatch(removeFavorite("k1"));

    const s = store.getState().favorites;
    expect(s.ids).toEqual([]);
    expect(s.items).toEqual([]);
    expect(setSpy).toHaveBeenCalledWith(cacheKey(), JSON.stringify({ items: [], ids: [] }));
  });

  it("resetFavorites: limpia estado y todas las caches con prefijo", () => {
    // rellenamos caches de distintos usuarios
    localStorage.setItem(cacheKey("u1"), "{}");
    localStorage.setItem(cacheKey("u2"), "{}");
    localStorage.setItem("otro:key", "{}");

    const store = makeStore();
    store.dispatch(resetFavorites());

    const s = store.getState().favorites;
    expect(s.ids).toEqual([]);
    expect(s.items).toEqual([]);

    // las de fav_cache_v1:* se deben eliminar
    expect(localStorage.getItem(cacheKey("u1"))).toBeNull();
    expect(localStorage.getItem(cacheKey("u2"))).toBeNull();
    // otras claves no relacionadas permanecen
    expect(localStorage.getItem("otro:key")).toBe("{}");
  });

  it("logout (por type): limpia estado y borra caches del prefijo", () => {
    // precondición: hay cache
    localStorage.setItem(cacheKey("u1"), "{}");

    const store = makeStore();
    // No importamos logout real; despachamos por type esperado
    store.dispatch({ type: "auth/logout" });

    const s = store.getState().favorites;
    expect(s.ids).toEqual([]);
    expect(s.items).toEqual([]);
    expect(localStorage.getItem(cacheKey("u1"))).toBeNull();
  });

  it("selectores básicos funcionan", () => {
    const store = makeStore();
    store.dispatch(toggleLocal({ id: "t1", track: { _id: "t1" } }));
    const state = store.getState();

    expect(selectFavoriteTracks(state).map(t => t._id)).toEqual(["t1"]);
    expect(selectFavoritesLoading(state)).toBe(false);
    expect(selectFavoritesHasFetchedOnce(state)).toBe(false);
  });
});
