import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/* ─────────── HOISTED Mocks (evita "Cannot access X before initialization") ─────────── */

// axios mock (default export) — HOISTED
const axiosMock = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("../../api/axios", () => ({
  __esModule: true,
  default: axiosMock,
}));

// PlayerContext mock — HOISTED
const playerMocks = vi.hoisted(() => ({
  playTrack: vi.fn(),
  togglePlay: vi.fn(),
  state: { currentTrack: null },
}));
vi.mock("../../components/PlayerContext", () => ({
  __esModule: true,
  usePlayer: () => ({
    playTrack: playerMocks.playTrack,
    togglePlay: playerMocks.togglePlay,
    currentTrack: playerMocks.state.currentTrack,
  }),
}));

// react-router-dom (useParams + Navigate) — HOISTED
const useParamsMock = vi.hoisted(() => vi.fn());
vi.mock("react-router-dom", () => ({
  __esModule: true,
  useParams: () => useParamsMock(),
  Navigate: () => <div data-testid="redirect" />,
}));

/* ─────────── importar el componente DESPUÉS de los mocks ─────────── */
import { GenreCard } from "../../components/GenreCard.jsx";

/* ─────────── resto del test tal cual ─────────── */

const TRACKS = [
  {
    _id: "t1",
    title: "Track One",
    artist: "Artist A",
    audioUrl: "http://media.example/audio/t1.mp3",
    coverUrl: "http://media.example/img/t1.jpg",
  },
  {
    _id: "t2",
    title: "Track Two",
    artist: "Artist B",
    audioUrl: "http://media.example/audio/t2.mp3",
    coverUrl: "http://media.example/img/t2.jpg",
  },
];

function setSlug(slug) {
  useParamsMock.mockReturnValue({ slug });
}
function primeCache(genre = "Pop", items = TRACKS) {
  sessionStorage.setItem(`tracks:${genre}`, JSON.stringify(items));
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  playerMocks.state.currentTrack = null;
  axiosMock.get.mockResolvedValue({ data: { items: TRACKS } });
});
afterEach(() => vi.restoreAllMocks());

describe("GenreCard", () => {
  it("redirecciona si el slug no existe", () => {
    setSlug("no-existe");
    render(<GenreCard />);
    expect(screen.getByTestId("redirect")).toBeInTheDocument();
  });

  it("renderiza Pop y hace fetch de los tracks", async () => {
    setSlug("pop");
    render(<GenreCard />);

    expect(await screen.findByRole("heading", { name: "Pop" })).toBeInTheDocument();
    expect(await screen.findByText("Track One")).toBeInTheDocument();
    expect(screen.getByText("Track Two")).toBeInTheDocument();

    expect(axiosMock.get).toHaveBeenCalledWith("/tracks", expect.objectContaining({
      params: { genre: "Pop" },
      signal: expect.any(AbortSignal),
    }));
  });

  it("click en carátula → playTrack con payload correcto", async () => {
    setSlug("pop");
    render(<GenreCard />);
    await screen.findByText("Track One");

    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[0]);

    expect(playerMocks.playTrack).toHaveBeenCalledWith(expect.objectContaining({
      id: "t1",
      title: "Track One",
      artist: "Artist A",
      audioPath: "http://media.example/audio/t1.mp3",
      genre: "Pop",
      cover: "http://media.example/img/t1.jpg",
    }));
  });

  it("si ya está activo → togglePlay", async () => {
    setSlug("pop");
    playerMocks.state.currentTrack = { audioPath: "http://media.example/audio/t1.mp3" };

    render(<GenreCard />);
    await screen.findByText("Track One");

    const rows = screen.getAllByRole("row");
    await userEvent.click(rows[1]);

    expect(playerMocks.togglePlay).toHaveBeenCalledTimes(1);
    expect(playerMocks.playTrack).not.toHaveBeenCalled();
  });

  it("usa cache y no re-escribe si no cambian items", async () => {
    setSlug("pop");
    primeCache("Pop", TRACKS);

    const spySet = vi.spyOn(Storage.prototype, "setItem");
    render(<GenreCard />);

    expect(await screen.findByText("Track One")).toBeInTheDocument();
    await waitFor(() => expect(axiosMock.get).toHaveBeenCalled());
    expect(spySet).not.toHaveBeenCalledWith("tracks:Pop", expect.any(String));
  });

  it("actualiza cache si cambian items", async () => {
    setSlug("pop");
    primeCache("Pop", [TRACKS[0]]);
    const spySet = vi.spyOn(Storage.prototype, "setItem");

    axiosMock.get.mockResolvedValueOnce({ data: { items: TRACKS } });
    render(<GenreCard />);

    await screen.findByText("Track Two");
    expect(spySet).toHaveBeenCalledWith("tracks:Pop", JSON.stringify(TRACKS));
  });
});
