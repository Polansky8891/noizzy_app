import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/* ───────── control del estado para useSelector ───────── */
const storeState = {
  auth: { status: "authenticated" },
  favorites: { ids: [] },
};
const setFavs = (ids) => { storeState.favorites.ids = ids; };

/* ─────────── mocks del slice de favoritos ─────────── */
// 🔧 Importante: toggleLocal ahora acepta UN SOLO argumento (payloadObj)
const slice = vi.hoisted(() => ({
  addFavorite: vi.fn((id) => ({ __thunk: true, kind: "add", id })),
  removeFavorite: vi.fn((id) => ({ __thunk: true, kind: "remove", id })),
  toggleLocal: vi.fn((payloadObj) => ({
    type: "favorites/toggleLocal",
    payload: payloadObj,
  })),
}));

vi.mock("../../store/favoritesSlice", () => ({
  __esModule: true,
  ...slice,
}));

/* ─────────── mocks de react-redux ─────────── */
let dispatched = [];
let thunkOutcome = "resolve";

vi.mock("react-redux", () => {
  const useSelector = (selector) => selector(storeState);
  const useDispatch = () => (action) => {
    dispatched.push(action);
    if (action && action.__thunk) {
      return thunkOutcome === "resolve"
        ? Promise.resolve()
        : Promise.reject(new Error("thunk failed"));
    }
    return action;
  };
  return { __esModule: true, useSelector, useDispatch, Provider: ({ children }) => children };
});

/* ───────── import robusto del componente ───────── */
import * as FavButtonModule from "../../components/FavButton";
const FavButton = FavButtonModule.default ?? FavButtonModule.FavButton;

/* ───────── helpers ───────── */
const TRACK_ID = "507f1f77bcf86cd799439011";
const reset = () => {
  dispatched = [];
  slice.addFavorite.mockClear();
  slice.removeFavorite.mockClear();
  slice.toggleLocal.mockClear();
  thunkOutcome = "resolve";
};

/* ───────── tests ───────── */
describe("FavButton", () => {
  beforeEach(() => reset());

  it("añade a favoritos con optimismo cuando no es fav", async () => {
    setFavs([]); // no es favorito
    render(<FavButton trackId={TRACK_ID} />);

    const btn = screen.getByRole("button", { name: /añadir a favoritos/i });
    await userEvent.click(btn);

    // 1) La PRIMERA llamada es optimista y con payload objeto { id, track }
    expect(slice.toggleLocal).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        id: TRACK_ID,
        track: expect.objectContaining({ _id: TRACK_ID }),
      }),
    );

    // 2) La PRIMERA acción despachada es el toggle optimista con ese payload
    expect(dispatched[0]).toMatchObject({
      type: "favorites/toggleLocal",
      payload: expect.objectContaining({
        id: TRACK_ID,
        track: expect.objectContaining({ _id: TRACK_ID }),
      }),
    });

    // 3) Después se dispara el thunk de ADD
    const addThunk = dispatched.find((a, idx) => idx > 0 && a?.__thunk && a.kind === "add");
    expect(addThunk).toBeTruthy();
    expect(slice.addFavorite).toHaveBeenCalledWith(TRACK_ID);
  });

  it("elimina de favoritos con optimismo cuando ya es fav", async () => {
    setFavs([TRACK_ID]); // ya es favorito
    render(<FavButton trackId={TRACK_ID} />);

    const btn = screen.getByRole("button", { name: /quitar de favoritos/i });
    await userEvent.click(btn);

    // 1) Optimismo con UN SOLO argumento objeto
    expect(slice.toggleLocal).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        id: TRACK_ID,
        track: expect.objectContaining({ _id: TRACK_ID }),
      }),
    );

    // 2) Después se dispara el thunk de REMOVE
    const removeThunk = dispatched.find((a, idx) => idx > 0 && a?.__thunk && a.kind === "remove");
    expect(removeThunk).toBeTruthy();
    expect(slice.removeFavorite).toHaveBeenCalledWith(TRACK_ID);
  });
});
