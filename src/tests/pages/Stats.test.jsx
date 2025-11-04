import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

/* ─────────── mocks hoisted ─────────── */
const state = vi.hoisted(() => ({
  auth: { status: "authenticated", token: "tkn" },
}));
const apiGet = vi.hoisted(() => vi.fn());

/* ─────────── Mocks de módulos ─────────── */
// axios instance
vi.mock("../../api/axios", () => ({
  default: { get: (...args) => apiGet(...args) },
}));

// Redux selectAuth
vi.mock("../../store/auth/authSlice", () => ({
  selectAuth: (s) => s.auth,
}));

// react-redux
vi.mock("react-redux", async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    useSelector: (sel) => sel(state),
  };
});

// Kpi → render simple texto para aserciones fáciles
vi.mock("../../components/Kpi", () => ({
  default: ({ title, value }) => (
    <div data-testid="kpi">
      {title}: {value}
    </div>
  ),
}));

// recharts → stubs que renderizan children sin cálculos
vi.mock("recharts", () => {
  const P = ({ children }) => <div data-testid="recharts-proxy">{children}</div>;
  const ResponsiveContainer = ({ children }) => <div data-testid="rc">{children}</div>;
  // BarChart expone su prop data para que el test pueda leerla
  const BarChart = ({ data, children }) => (
    <div data-testid="chart" data-json={JSON.stringify(data || [])}>
      {children}
    </div>
  );
  const Bar = ({ dataKey }) => <div data-testid="bar" data-key={dataKey} />;
  const XAxis = () => <div data-testid="x" />;
  const YAxis = () => <div data-testid="y" />;
  const Tooltip = () => <div data-testid="t" />;
  const CartesianGrid = () => <div data-testid="g" />;
  return { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid };
});

/* ─────────── helpers ─────────── */
const renderStats = async () => {
  // Import dinámico para resetear el scope de módulo (lastStatsCache) entre tests
  const mod = await import("../../pages/Stats");
  const { Stats } = mod;
  return render(
    <MemoryRouter>
      <Stats />
    </MemoryRouter>
  );
};

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  state.auth.status = "authenticated";
  state.auth.token = "tkn";
});

describe("<Stats />", () => {
  it("no muestra contenido si no está autenticado", async () => {
    state.auth.status = "unauthenticated";
    await renderStats();
    expect(screen.queryByText(/your stats/i)).not.toBeInTheDocument();
  });

  it("fetch OK: llama a /stats/summary con params y Authorization, y muestra KPIs", async () => {
    apiGet.mockResolvedValueOnce({
      status: 200,
      data: {
        days: 7,
        minutes: 123.4,
        plays: 9,
        uniqueTracks: 5,
        topGenres: [{ genre: "Rock", ms: 120000 }],
        daily: [{ date: "2025-10-15", ms: 1800000 }],
      },
    });

    await renderStats();

    // Llamada a la API
    expect(apiGet).toHaveBeenCalledWith("/stats/summary", expect.objectContaining({
      params: { days: 7 },
      headers: { Authorization: "Bearer tkn" },
      validateStatus: expect.any(Function),
    }));

    // KPIs visibles (redondeo de minutes ya aplicado)
    expect(await screen.findByText(/your stats \(last 7 days\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Minutes:\s*123/i)).toBeInTheDocument();
    expect(screen.getByText(/Plays:\s*9/i)).toBeInTheDocument();
    expect(screen.getByText(/Unique songs:\s*5/i)).toBeInTheDocument();

    // Top genres listado
    expect(screen.getByText(/rock/i)).toBeInTheDocument();
    expect(screen.getByText(/2 min/i)).toBeInTheDocument(); // 120000 ms → 2 min

    // Chart recibe minutes mapeados desde ms
    const chart = screen.getByTestId("chart");
    const payload = JSON.parse(chart.getAttribute("data-json"));
    expect(payload).toEqual([{ date: "10-15", minutes: 30 }]); // 1.8e6 ms → 30 min
  });

    it("204: usa emptySummary y muestra 'No data genre yet'", async () => {
    apiGet.mockResolvedValueOnce({ status: 204 });

    await renderStats();

    expect(await screen.findByText(/your stats/i)).toBeInTheDocument();
    expect(screen.getByText(/Minutes:\s*0/i)).toBeInTheDocument();
    expect(screen.getByText(/Plays:\s*0/i)).toBeInTheDocument();
    expect(screen.getByText(/Unique songs:\s*0/i)).toBeInTheDocument();
    expect(screen.getByText(/no data genre yet/i)).toBeInTheDocument();
  });

    it("401: la primera petición falla; al forzar un nuevo fetch (cambiando token) renderiza datos", async () => {
        // 1ª llamada: 401 como Error real con .response
        const unauthorized = new Error("Unauthorized");
        unauthorized.response = { status: 401 };

        apiGet
            .mockRejectedValueOnce(unauthorized) // primera: error
            .mockResolvedValueOnce({
            status: 200,
            data: { minutes: 10, plays: 2, uniqueTracks: 1, topGenres: [], daily: [] },
            }); // segunda: ok

        // render inicial
        const mod = await import("../../pages/Stats");
        const { Stats } = mod;
        const { rerender } = render(
            <MemoryRouter>
            <Stats />
            </MemoryRouter>
        );

        // asegúrate de que la 1ª petición ocurrió y el estado de error/placeholder se asentó
        await vi.waitFor(() => expect(apiGet).toHaveBeenCalledTimes(1));

        // no hay KPIs porque estamos en placeholder (data=null)
        expect(screen.queryByText(/your stats/i)).not.toBeInTheDocument();

        // 🔁 forzar un 2º fetch cambiando una dependencia del effect: el token
        state.auth.token = "tkn-2";
        rerender(
            <MemoryRouter>
            <Stats />
            </MemoryRouter>
        );

        // ahora debe hacerse la 2ª llamada y pintarse los KPIs
        await vi.waitFor(() => expect(apiGet).toHaveBeenCalledTimes(2));
        expect(await screen.findByText(/Minutes:\s*10/i)).toBeInTheDocument();
        });

          it("errores cancelados no muestran mensaje de error", async () => {
            apiGet.mockRejectedValueOnce({ code: "ERR_CANCELED" });
            await renderStats();

            // No aparece el mensaje de error 401 ni genérico
            expect(screen.queryByText(/no autorizado/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/error al cargar estadísticas/i)).not.toBeInTheDocument();
        });

        it("usa lastStatsCache para pintar al instante aunque la petición no resuelva", async () => {
            // 1ª render: resolvemos con datos y se setea cache
            apiGet.mockResolvedValueOnce({
            status: 200,
            data: {
                minutes: 7,
                plays: 3,
                uniqueTracks: 2,
                topGenres: [],
                daily: [{ date: "2025-10-10", ms: 600000 }],
            },
            });
            const first = await renderStats();
            expect(await screen.findByText(/Minutes:\s*7/i)).toBeInTheDocument();
            first.unmount();

            // 2ª render: petición NO resuelve, pero el efecto de cache debe pintar rápido
            apiGet.mockImplementationOnce(() => new Promise(() => {})); // pendiente
            await renderStats();

            // Debería pintar los KPIs con el cache inmediatamente
            expect(await screen.findByText(/Minutes:\s*7/i)).toBeInTheDocument();

            // Y el chart debería tener los datos cacheados (10-10 → 600000ms → 10 min)
            const chart = screen.getByTestId("chart");
            const payload = JSON.parse(chart.getAttribute("data-json"));
            expect(payload).toEqual([{ date: "10-10", minutes: 10 }]);
        });

});






