// src/tests/auth/components/RequireAuth.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  MemoryRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

/* ────────── Estado hoisted para useSelector ────────── */
const testState = vi.hoisted(() => ({
  auth: { status: "checking" }, // lo cambiaremos en cada test
}));

/* ────────── Mocks ────────── */
// mock del selector de auth
vi.mock("../../../store/auth/authSlice", () => ({
  selectAuth: (s) => s.auth,
}));

// mock de react-redux para inyectar nuestro estado
vi.mock("react-redux", async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    useSelector: (sel) => sel(testState),
  };
});

/* ────────── Import dinámico del componente (no comparte módulo entre tests) ────────── */
const importComp = async () => {
  const mod = await import("../../../auth/components/RequireAuth.jsx");
  return mod.default;
};

/* ────────── Helper para ver el state tras navegar a /profile ────────── */
function ProfileProbe() {
  const loc = useLocation();
  return (
    <pre data-testid="profile-probe">
      {JSON.stringify(
        {
          pathname: loc.pathname,
          fromPathname: loc.state?.from?.pathname,
        },
        null,
        2
      )}
    </pre>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  // default
  testState.auth.status = "checking";
});

describe("<RequireAuth />", () => {
  it("status 'checking' → no renderiza nada", async () => {
    testState.auth.status = "checking";
    const RequireAuth = await importComp();

    const { container } = render(
      <MemoryRouter initialEntries={["/secret"]}>
        <RequireAuth>
          <div>Secret Stuff</div>
        </RequireAuth>
      </MemoryRouter>
    );

    expect(container).toBeTruthy();
    // no hay texto de children ni CTA
    expect(screen.queryByText(/Secret Stuff/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/you must log in to see this page/i)
    ).not.toBeInTheDocument();
    // suele ser un nodo vacío
    expect(container.innerHTML.trim()).toBe("");
  });

  it("status 'authenticated' → renderiza children", async () => {
    testState.auth.status = "authenticated";
    const RequireAuth = await importComp();

    render(
      <MemoryRouter initialEntries={["/private"]}>
        <RequireAuth>
          <div>Secret Stuff</div>
        </RequireAuth>
      </MemoryRouter>
    );

    expect(screen.getByText(/Secret Stuff/i)).toBeInTheDocument();
  });

  it("status not-authenticated → muestra CTA y el Link lleva state.from con la ruta actual", async () => {
    testState.auth.status = "not-authenticated";
    const RequireAuth = await importComp();

    render(
      <MemoryRouter initialEntries={["/very-private?foo=1"]}>
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <div>Secret Stuff</div>
              </RequireAuth>
            }
          />
          <Route path="/very-private" element={
            <RequireAuth>
              <div>Secret Stuff</div>
            </RequireAuth>
          } />
          <Route path="/profile" element={<ProfileProbe />} />
        </Routes>
      </MemoryRouter>
    );

    // mensaje + botón
    expect(
      screen.getByText(/you must log in to see this page/i)
    ).toBeInTheDocument();
    const loginLink = screen.getByRole("link", { name: /log in/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/profile");

    // navegar y comprobar state.from
    await userEvent.click(loginLink);

    const probe = await screen.findByTestId("profile-probe");
    const parsed = JSON.parse(probe.textContent || "{}");

    expect(parsed.pathname).toBe("/profile");
    expect(parsed.fromPathname).toBe("/very-private");
  });
});
