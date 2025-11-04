// src/tests/pages/Home.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// mocks (ojo a las rutas: ../../ en vez de ../src)
vi.mock("../../api/axios", () => {
  return {
    default: {
      defaults: { baseURL: "http://api.example.com/api" },
      get: vi.fn(async () => ({
        data: {
          items: Array.from({ length: 3 }).map((_, i) => ({
            id: `id${i}`,
            title: `t${i}`,
            artist: `a${i}`,
          })),
        },
      })),
    },
  };
});

const fetchWithCacheWebMock = vi.fn();
vi.mock("../../utils/cacheWeb", () => ({
  fetchWithCacheWeb: (...args) => fetchWithCacheWebMock(...args),
}));

const cacheGetMock = vi.fn();
const cacheSetMock = vi.fn();
vi.mock("../../utils/cacheLocal", () => ({
  cacheGet: (...args) => cacheGetMock(...args),
  cacheSet: (...args) => cacheSetMock(...args),
}));

vi.mock("../../hooks/useDelayedVisible", async (orig) => {
  const actual = await orig();
  return actual; // usamos la real
});

vi.mock("../../components/TrackCarousel", () => ({
  default: ({ feel, title, limit, initialItems }) => (
    <div
      data-testid="track-carousel"
      data-feel={feel}
      data-title={title}
      data-limit={String(limit)}
      data-has-initial={initialItems ? "1" : "0"}
    >
      TrackCarousel {feel} {title}
    </div>
  ),
}));

vi.mock("../../components/SkeletonCarousel", () => ({
  default: ({ title }) => (
    <div data-testid="skeleton-carousel">Skeleton {title}</div>
  ),
}));

vi.mock("../../components/SmartImage", () => ({
  default: () => <div />,
}));

// importa Home con la ruta correcta relativa a este test
import { Home } from "../../pages/Home";

const renderHome = () =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

beforeEach(() => {
  fetchWithCacheWebMock.mockReset();
  cacheGetMock.mockReset();
  cacheSetMock.mockReset();
});

describe("Home", () => {
  it("pinta con snapshot inicial (sin skeleton) y pasa limit=18", async () => {
    cacheGetMock.mockImplementation((key) => {
      if (key.includes("feel=chill")) return [{ id: "c1" }];
      if (key.includes("feel=energy")) return [{ id: "e1" }];
      if (key.includes("feel=romantic")) return [{ id: "r1" }];
      return null;
    });

    fetchWithCacheWebMock.mockResolvedValueOnce([{ id: "c1" }]);
    fetchWithCacheWebMock.mockResolvedValueOnce([{ id: "e1" }]);
    fetchWithCacheWebMock.mockResolvedValueOnce([{ id: "r1" }]);

    renderHome();

    const carousels = await screen.findAllByTestId("track-carousel");
    expect(carousels).toHaveLength(3);
    expect(screen.queryByTestId("skeleton-carousel")).toBeNull();

    carousels.forEach((c) => {
      expect(c.getAttribute("data-limit")).toBe("18");
      expect(c.getAttribute("data-has-initial")).toBe("1");
    });

    await waitFor(() => {
      expect(fetchWithCacheWebMock).toHaveBeenCalledTimes(3);
    });
    const urls = fetchWithCacheWebMock.mock.calls.map(([keyUrl]) => keyUrl);
    expect(urls.every((u) => u.includes("limit=18"))).toBe(true);
    expect(urls).toEqual(
      expect.arrayContaining([
        expect.stringContaining("feel=chill"),
        expect.stringContaining("feel=energy"),
        expect.stringContaining("feel=romantic"),
      ])
    );
  });

  it("sin snapshot y red rápida: no muestra skeleton", async () => {
    cacheGetMock.mockReturnValue(null);
    fetchWithCacheWebMock.mockResolvedValueOnce([{ id: "c1" }]);
    fetchWithCacheWebMock.mockResolvedValueOnce([{ id: "e1" }]);
    fetchWithCacheWebMock.mockResolvedValueOnce([{ id: "r1" }]);

    renderHome();

    const carousels = await screen.findAllByTestId("track-carousel");
    expect(carousels).toHaveLength(3);
    expect(screen.queryByTestId("skeleton-carousel")).toBeNull();
  });

  });




