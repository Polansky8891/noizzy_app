import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Favorites from "../../pages/Favorites";

/* ─────────────── Hoisted/shared state ─────────────── */
const dispatchMock = vi.hoisted(() => vi.fn());
const onPlayMock = vi.hoisted(() => vi.fn());

// Estado global mutable que useSelector consumirá
const state = vi.hoisted(() => ({
  favorites: {
    items: [],
    loading: false,
    hasFetchedOnce: false,
  },
  auth: {
    status: "authenticated",
    token: "tkn",
    user: { id: "u1" },
  },
}));

/* ─────────────── Mocks ─────────────── */
// Mock API_BASE para que MEDIA_BASE sea estable
vi.mock("../../api/base", () => ({ API_BASE: "http://media.test/" }));

// Mock selectors y actions del slice de favoritos
const actions = vi.hoisted(() => ({
  fetchFavoriteTracks: vi.fn(() => ({ type: "favorites/fetch" })),
  removeFavorite: vi.fn((id) => ({ type: "favorites/remove", payload: id })),
  hydrateFavoritesFromCache: vi.fn(() => ({ type: "favorites/hydrate" })),
}));

vi.mock("../../store/favoritesSlice", () => ({
  // selectors (se aplican sobre nuestro `state` del mock de useSelector)
  selectFavoriteTracks: (s) => s.favorites.items,
  selectFavoritesLoading: (s) => s.favorites.loading,
  // thunks/actions
  fetchFavoriteTracks: (...args) => actions.fetchFavoriteTracks(...args),
  removeFavorite: (...args) => actions.removeFavorite(...args),
  hydrateFavoritesFromCache: (...args) => actions.hydrateFavoritesFromCache(...args),
}));

// Mock auth selector
vi.mock("../../store/auth/authSlice", () => ({
  selectAuth: (s) => s.auth,
}));

// Mock react-redux: useSelector lee de `state`, useDispatch retorna `dispatchMock`
vi.mock("react-redux", async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    useDispatch: () => dispatchMock,
    useSelector: (selector) => selector(state),
  };
});

// Mock PlayerContext: devolvemos onPlay
vi.mock("../../components/PlayerContext", () => ({
  usePlayer: () => ({ onPlay: onPlayMock }),
}));

// Mock de DataTable: renderea filas y expone el botón de acción de la 3ª columna (trash)
vi.mock("react-data-table-component", () => ({
  default: ({ data, columns, onRowClicked }) => (
    <div data-testid="datatable">
      <div data-testid="rows-count">{data.length}</div>
      <ul>
        {data.map((r, i) => (
          <li key={r._id || r.id}>
            {/* botón para simular click de fila */}
            <button data-testid={`row-${i}`} onClick={() => onRowClicked?.(r)}>
              {r.title}
            </button>
            {/* renderizamos la celda de acción para que su onClick real funcione */}
            <div data-testid={`action-${i}`}>{columns?.[2]?.cell(r)}</div>
          </li>
        ))}
      </ul>
    </div>
  ),
}));

/* ─────────────── helpers ─────────────── */
const setup = () =>
  render(
    <MemoryRouter>
      <Favorites />
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
  // Estado base por defecto
  state.favorites.items = [];
  state.favorites.loading = false;
  state.favorites.hasFetchedOnce = false;
  state.auth.status = "authenticated";
  state.auth.token = "tkn";
  state.auth.user = { id: "u1" };
});

describe("<Favorites />", () => {
  it("muestra el título", () => {
    setup();
    expect(screen.getByRole("heading", { name: /your favorites/i })).toBeInTheDocument();
  });

  it("dispara fetchFavoriteTracks solo si authenticated, con token, sin hasFetchedOnce y !loading", () => {
    // cumple condiciones
    setup();
    expect(actions.fetchFavoriteTracks).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith({ type: "favorites/fetch" });

    // no debe disparar si hasFetchedOnce = true
    vi.clearAllMocks();
    state.favorites.hasFetchedOnce = true;
    setup();
    expect(actions.fetchFavoriteTracks).not.toHaveBeenCalled();

    // no debe disparar si loading = true
    vi.clearAllMocks();
    state.favorites.hasFetchedOnce = false;
    state.favorites.loading = true;
    setup();
    expect(actions.fetchFavoriteTracks).not.toHaveBeenCalled();

    // no debe disparar si no autenticado o sin token
    vi.clearAllMocks();
    state.favorites.loading = false;
    state.auth.status = "unauthenticated";
    setup();
    expect(actions.fetchFavoriteTracks).not.toHaveBeenCalled();

    vi.clearAllMocks();
    state.auth.status = "authenticated";
    state.auth.token = "";
    setup();
    expect(actions.fetchFavoriteTracks).not.toHaveBeenCalled();
  });

    it("hidrata desde caché cuando hay uid", () => {
    setup();
    expect(actions.hydrateFavoritesFromCache).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith({ type: "favorites/hydrate" });

    // si no hay uid, no hidrata
    vi.clearAllMocks();
    state.auth.user = null;
    state.auth.uid = null;
    state.auth.email = null;
    setup();
    expect(actions.hydrateFavoritesFromCache).not.toHaveBeenCalled();
  });

    it("renderiza filas y permite click de fila → onPlay(row)", async () => {
    state.favorites.items = [
      { _id: "a1", title: "Song A", artist: "AA", coverPath: "/img/a.jpg" },
      { _id: "b2", title: "Song B", artist: "BB", coverPath: "/img/b.jpg" },
    ];
    setup();

    expect(screen.getByTestId("datatable")).toBeInTheDocument();
    expect(screen.getByTestId("rows-count").textContent).toBe("2");

    await userEvent.click(screen.getByTestId("row-0"));
    expect(onPlayMock).toHaveBeenCalledWith(
      expect.objectContaining({ _id: "a1", title: "Song A" })
    );
  });

    it("click en el icono de borrar despacha removeFavorite con el id correcto", async () => {
    state.favorites.items = [{ _id: "x9", title: "Kill Me", artist: "Trash" }];
    setup();

    // la columna de acción renderiza un <button> real con onClick interno
    const removeBtn = screen.getByRole("button", { name: /remove from favorites/i });
    await userEvent.click(removeBtn);

    expect(actions.removeFavorite).toHaveBeenCalledWith("x9");
    expect(dispatchMock).toHaveBeenCalledWith({ type: "favorites/remove", payload: "x9" });
  });

    it("muestra vista vacía cuando hasFetchedOnce y no hay filas y !loading", () => {
    state.favorites.items = [];
    state.favorites.hasFetchedOnce = true;
    state.favorites.loading = false;

    setup();

    expect(
      screen.getByText(/you haven’t added any songs|you haven't added any songs/i)
    ).toBeInTheDocument();
  });

    it("mantiene últimas filas buenas si luego tracks llega vacío (cache visual)", () => {
    // 1ª render con filas
    state.favorites.items = [
      { _id: "c1", title: "Cached 1", artist: "C1" },
      { _id: "c2", title: "Cached 2", artist: "C2" },
    ];
    const { rerender } = setup();
    expect(screen.getByTestId("rows-count").textContent).toBe("2");

    // 2ª render: llegan tracks vacíos (p.ej. refetch) -> debe seguir mostrando 2 por cache
    state.favorites.items = [];
    rerender(
      <MemoryRouter>
        <Favorites />
      </MemoryRouter>
    );
    expect(screen.getByTestId("rows-count").textContent).toBe("2");
  });


});

