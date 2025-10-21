// src/tests/pages/Home.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Home } from "../../pages/Home";
import userEvent from "@testing-library/user-event";

/* ─────────── Mocks ─────────── */
vi.mock("../../components/TrackCarousel", () => ({
  __esModule: true,
  default: ({ feel, title }) => <div data-testid={`carousel-${feel}`}>{title}</div>,
}));

vi.mock("../../assets/images/rock.png", () => ({ default: "rock.png" }));
vi.mock("../../assets/images/pop.png", () => ({ default: "pop.png" }));
vi.mock("../../assets/images/electro.png", () => ({ default: "electro.png" }));
vi.mock("../../assets/images/blues.png", () => ({ default: "blues.png" }));
vi.mock("../../assets/images/classic.png", () => ({ default: "classic.png" }));
vi.mock("../../assets/images/dubstep.png", () => ({ default: "dubstep.png" }));
vi.mock("../../assets/images/hiphop.png", () => ({ default: "hiphop.png" }));
vi.mock("../../assets/images/reggae.png", () => ({ default: "reggae.png" }));
vi.mock("../../assets/images/house.png", () => ({ default: "house.png" }));

const axiosMocks = vi.hoisted(() => ({
  get: vi.fn(),
  defaults: { baseURL: "http://api.test/api" },
}));
vi.mock("../../api/axios", () => ({
  __esModule: true,
  default: { defaults: axiosMocks.defaults, get: axiosMocks.get },
}));

const cacheMocks = vi.hoisted(() => ({
  fetchWithCacheWeb: vi.fn((keyUrl, fetcher) => fetcher()),
}));
vi.mock("../../utils/cacheWeb", () => ({
  __esModule: true,
  fetchWithCacheWeb: cacheMocks.fetchWithCacheWeb,
}));

vi.mock("../../components/PlayerContext", () => ({
  __esModule: true,
  usePlayer: () => ({ play: vi.fn() }),
}));

function renderHome(route = "/") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Home />
    </MemoryRouter>
  );
}

beforeEach(() => {
  axiosMocks.get.mockReset();
  axiosMocks.get.mockResolvedValue({ data: { items: [] } });
  cacheMocks.fetchWithCacheWeb.mockClear();
});

describe("Home page", () => {
  it("renderiza el grid de Top genres con sus labels y links", () => {
    renderHome();

    const labels = [
      "Rock", "Pop", "Blues", "Classic", "Dubstep",
      "Electro", "Hip Hop", "Reggae", "House",
    ];

    labels.forEach((name) => {
      expect(screen.getByLabelText(name)).toBeInTheDocument();
    });

    expect(screen.getByTestId("carousel-chill")).toHaveTextContent("Let's chill");
    expect(screen.getByTestId("carousel-energy")).toHaveTextContent("Need some energy!");
    expect(screen.getByTestId("carousel-romantic")).toHaveTextContent("Let's get sentimental");
  });

  it('hace prefetch inicial de chill/energy/romantic con limit=18 y ttl de 15min', async () => {
    renderHome();

    // Espera a que se dispare el useEffect
    await waitFor(() => expect(cacheMocks.fetchWithCacheWeb).toHaveBeenCalledTimes(3));

    const calls = cacheMocks.fetchWithCacheWeb.mock.calls;

    // URLs correctas (feel + limit=18)
    const urls = calls.map(([url]) => url);
    expect(urls.some((u) => u.includes('/tracks') && u.includes('feel=chill') && u.includes('limit=18'))).toBe(true);
    expect(urls.some((u) => u.includes("/tracks") && u.includes("feel=energy") && u.includes("limit=18"))).toBe(true);
    expect(urls.some((u) => u.includes("/tracks") && u.includes("feel=romantic") && u.includes("limit=18"))).toBe(true);

    // TTL correcto en todas las llamadas
    const ttls = calls.map(([, , opts]) => opts?.ttlMs);
    expect(ttls.every((ttl) => ttl === 15 * 60 * 1000)).toBe(true);

    // Cada fetcher invoca api.get('/tracks', { params: { feel, limit: 18 } })
    await waitFor(() => expect(axiosMocks.get).toHaveBeenCalledTimes(3));
    axiosMocks.get.mock.calls.forEach(([path, cfg]) => {
        expect(path).toBe('/tracks');
        expect(cfg?.params?.limit).toBe(18);
        expect(['chill', 'energy', 'romantic']).toContain(cfg?.params?.feel);
    });
  });

  it('prefetch de género al hover (Rock) usa cache y axios con genre=Rock', async () => {
    const user = userEvent.setup();
    renderHome();

      // Espera a que termine el prefetch inicial para tener un baseline estable
      await waitFor(() => expect(cacheMocks.fetchWithCacheWeb).toHaveBeenCalled(3));
      const before = cacheMocks.fetchWithCacheWeb.mock.calls.length;

      // Hover sobre la tarjeta Rock (Link con aria-label='Rock')
      await user.hover(screen.getByLabelText('Rock'));

      await waitFor(() => expect(cacheMocks.fetchWithCacheWeb.mock.calls.length).toBe(before + 1));

      // Última llamada: genre=Rock y TTL correcto
      const lastCall = cacheMocks.fetchWithCacheWeb.mock.calls.at(-1);
      const [keyUrl, , opts] = lastCall;
      expect(keyUrl).toContain('/tracks');
      expect(keyUrl).toContain('genre=Rock');
      expect(opts?.ttlMs).toBe(15 * 60 * 1000);

      // El fetcher ejecutado debe haber llamado a axios con { genre: 'Rock' }
      expect(axiosMocks.get).toHaveBeenCalledWith('/tracks', { params: { genre: 'Rock' } });
  });

  it('renderiza exactamente 3 carouseles con los títulos esperados', () => {
    renderHome();
      expect(screen.getByTestId("carousel-chill")).toHaveTextContent("Let's chill");
      expect(screen.getByTestId("carousel-energy")).toHaveTextContent("Need some energy!");
      expect(screen.getByTestId("carousel-romantic")).toHaveTextContent("Let's get sentimental");
  })
});
