import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Login } from "../../auth/pages/Login";


/* ─────────── Mocks hoisted ─────────── */

// Router: solo mockeamos useNavigate; el resto queda real.
const navMock = vi.hoisted(() => ({ fn: vi.fn() }));
vi.mock("react-router-dom", async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    useNavigate: () => navMock.fn,
  };
});

// Redux: mock de dispatch
const dispatchMock = vi.hoisted(() => ({ fn: vi.fn() }));
vi.mock("react-redux", () => ({
  useDispatch: () => dispatchMock.fn,
}));

// Slice auth
const authMocks = vi.hoisted(() => ({
  checkingCredentials: vi.fn(() => ({ type: "auth/checking" })),
}));
vi.mock("../../store/auth/authSlice", () => ({
  checkingCredentials: authMocks.checkingCredentials,
}));

// firebase/auth: solo lo que usa el componente
const fbAuthMocks = vi.hoisted(() => ({
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: class GoogleAuthProvider {},
}));
vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: fbAuthMocks.signInWithEmailAndPassword,
  signInWithPopup: fbAuthMocks.signInWithPopup,
  GoogleAuthProvider: fbAuthMocks.GoogleAuthProvider,
}));

// ⚠️ Mock correcto del config (evita ejecutar el real que llama a getAuth/getFirestore)
const cfg = vi.hoisted(() => ({
  FirebaseAuth: { app: "test-app" },
  GoogleProvider: { provider: "google-mock" },
}));
vi.mock("../../firebase/config", () => ({
  FirebaseAuth: cfg.FirebaseAuth,
  GoogleProvider: cfg.GoogleProvider,
}));

/* ─────────── Helper render ─────────── */
function renderLogin(route = "/login", from = "/") {
  return render(
    <MemoryRouter
      initialEntries={[
        { pathname: route, state: { from: { pathname: from } } },
      ]}
    >
      <Login />
    </MemoryRouter>
  );
}

/* ─────────── Reset ─────────── */
beforeEach(() => {
  navMock.fn.mockReset();
  dispatchMock.fn.mockReset();
  authMocks.checkingCredentials.mockClear();

  fbAuthMocks.signInWithEmailAndPassword.mockReset();
  fbAuthMocks.signInWithPopup.mockReset();
  fbAuthMocks.signInWithEmailAndPassword.mockResolvedValue({});
  fbAuthMocks.signInWithPopup.mockResolvedValue({});
});

/* ─────────── Tests ─────────── */
describe("Login page", () => {
  it("login con email/password navega a from y despacha checking", async () => {
    const user = userEvent.setup();
    renderLogin("/login", "/library");

    await user.type(screen.getByPlaceholderText("Email"), "a@a.com");
    await user.type(screen.getByPlaceholderText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: /sign in$/i }));

    expect(authMocks.checkingCredentials).toHaveBeenCalledTimes(1);
    expect(fbAuthMocks.signInWithEmailAndPassword).toHaveBeenCalledWith(
      cfg.FirebaseAuth,
      "a@a.com",
      "secret123"
    );
    expect(navMock.fn).toHaveBeenCalledWith("/library", { replace: true });
  });

  it("muestra error si falla email/password", async () => {
    const user = userEvent.setup();
    fbAuthMocks.signInWithEmailAndPassword.mockRejectedValueOnce(
      new Error("Invalid credentials")
    );

    renderLogin("/login", "/library");
    await user.type(screen.getByPlaceholderText("Email"), "a@a.com");
    await user.type(screen.getByPlaceholderText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: /sign in$/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
    expect(navMock.fn).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /sign in$/i })).toBeEnabled();
  });

  it("login con Google usa FirebaseAuth y GoogleProvider y navega a 'from'", async () => {
    const user = userEvent.setup();
    renderLogin("/login", "/");

    await user.click(screen.getByRole("button", { name: /google/i }));

    expect(authMocks.checkingCredentials).toHaveBeenCalledTimes(1);
    expect(fbAuthMocks.signInWithPopup).toHaveBeenCalledWith(
      cfg.FirebaseAuth,
      cfg.GoogleProvider
    );
    expect(navMock.fn).toHaveBeenCalledWith("/", { replace: true });
  });

  it("mostrar/ocultar contraseña alterna el type y el aria-label", async () => {
    const user = userEvent.setup();
    renderLogin();

    const pwd = screen.getByPlaceholderText("Password");
    const toggle = screen.getByRole("button", { name: /show password/i });

    expect(pwd).toHaveAttribute("type", "password");
    await user.click(toggle);
    expect(pwd).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: /hide password/i }));
    expect(pwd).toHaveAttribute("type", "password");
  });
});