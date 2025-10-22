import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Register } from "../../auth/pages/Register";

/* ─────────────── Hoisted vars para usar dentro de vi.mock ─────────────── */
const dispatchMock = vi.hoisted(() => vi.fn());
const navigateMock = vi.hoisted(() => vi.fn());
const checkingCredentialsMock = vi.hoisted(() =>
  vi.fn(() => ({ type: "auth/checkingCredentials" }))
);
const FirebaseAuth = vi.hoisted(() => ({ __FAKE__: true }));
const createUserWithEmailAndPassword = vi.hoisted(() => vi.fn());
const updateProfile = vi.hoisted(() => vi.fn());

/* ──────────────────────────── Mocks ──────────────────────────── */
vi.mock("react-redux", async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    useDispatch: () => dispatchMock,
  };
});

vi.mock("react-router-dom", async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    useNavigate: () => navigateMock,
    MemoryRouter: actual.MemoryRouter, // seguimos usando MemoryRouter real
    Link: actual.Link,
  };
});

vi.mock("../../store/auth/authSlice", () => ({
  checkingCredentials: checkingCredentialsMock,
}));

vi.mock("../../firebase/config", () => ({ FirebaseAuth }));

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: (...args) =>
    createUserWithEmailAndPassword(...args),
  updateProfile: (...args) => updateProfile(...args),
}));

/* ───────────────────── helpers de render y fill ───────────────────── */
const setup = () => {
    render(
        <MemoryRouter>
            <Register />
        </MemoryRouter>
    );
};

const fillValidForm = async ({
  name = "John",
  lastName = "Doe",
  email = "john@doe.com",
  password = "Abc123",
  confirmPassword = "Abc123",
} = {}) => {
  await userEvent.type(screen.getByPlaceholderText(/first name/i), name);
  await userEvent.type(screen.getByPlaceholderText(/last name/i), lastName);
  await userEvent.type(screen.getByPlaceholderText(/email/i), email);
  await userEvent.type(screen.getByPlaceholderText(/^password$/i), password);
  await userEvent.type(screen.getByPlaceholderText(/confirm password/i), confirmPassword);
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe('<Register />', () => {
    it('renderiza campos y botón', () => {
        setup();
        expect(screen.getByRole("heading", { name: /sign up/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/^password$/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
        // Hay dos botones de toggle contraseña (uno por cada campo)
         expect(screen.getAllByRole("button", { name: /show password/i }).length).toBe(2);
    });
    it('muestra errores de validación cuando se envía vacío', async () => {
        setup();
        await userEvent.click(screen.getByRole('button', { name: /submit/i}));

        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();

        // No debe haber intentos de registro si falla validación
        expect(dispatchMock).not.toHaveBeenCalled();
        expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it("valida: First Name mínimo 2 caracteres", async () => {
  setup();

  await userEvent.type(screen.getByPlaceholderText(/first name/i), "A"); // 1 char
  await userEvent.type(screen.getByPlaceholderText(/last name/i), "Doe");
  await userEvent.type(screen.getByPlaceholderText(/email/i), "john@doe.com");
  await userEvent.type(screen.getByPlaceholderText(/^password$/i), "Abc123");
  await userEvent.type(screen.getByPlaceholderText(/confirm password/i), "Abc123");

  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  // Espera explícita
  await screen.findByText(/first name must be at least 2/i);
});

it("valida: Last Name solo letras", async () => {
  setup();

  await userEvent.type(screen.getByPlaceholderText(/first name/i), "John");
  await userEvent.type(screen.getByPlaceholderText(/last name/i), "B1"); // contiene dígito
  await userEvent.type(screen.getByPlaceholderText(/email/i), "john@doe.com");
  await userEvent.type(screen.getByPlaceholderText(/^password$/i), "Abc123");
  await userEvent.type(screen.getByPlaceholderText(/confirm password/i), "Abc123");

  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  await screen.findByText(/last name can only contain letters/i);
});

it("valida: Email formato", async () => {
  setup();

  await userEvent.type(screen.getByPlaceholderText(/first name/i), "John");
  await userEvent.type(screen.getByPlaceholderText(/last name/i), "Doe");
  await userEvent.type(screen.getByPlaceholderText(/email/i), "badmail");
  await userEvent.type(screen.getByPlaceholderText(/^password$/i), "Abc123");
  await userEvent.type(screen.getByPlaceholderText(/confirm password/i), "Abc123");

  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  await screen.findByText(/email is not valid/i);
});

it("valida: Password mínima y composición", async () => {
  setup();

  await userEvent.type(screen.getByPlaceholderText(/first name/i), "John");
  await userEvent.type(screen.getByPlaceholderText(/last name/i), "Doe");
  await userEvent.type(screen.getByPlaceholderText(/email/i), "john@doe.com");
  await userEvent.type(screen.getByPlaceholderText(/^password$/i), "abc"); // corta
  await userEvent.type(screen.getByPlaceholderText(/confirm password/i), "abc");

  await userEvent.click(screen.getByRole("button", { name: /submit/i }));
  await screen.findByText(/password must be at least 6/i);

  // Ahora prueba la otra regla (sin mayúscula/numero)
  const pass = screen.getByPlaceholderText(/^password$/i);
  await userEvent.clear(pass);
  await userEvent.type(pass, "abcdef");
  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  await screen.findByText(/password must contain uppercase, lowercase, and a number/i);
});

it("valida: Confirm Password coincide", async () => {
  setup();

  await userEvent.type(screen.getByPlaceholderText(/first name/i), "John");
  await userEvent.type(screen.getByPlaceholderText(/last name/i), "Doe");
  await userEvent.type(screen.getByPlaceholderText(/email/i), "john@doe.com");
  await userEvent.type(screen.getByPlaceholderText(/^password$/i), "Abc123");
  await userEvent.type(screen.getByPlaceholderText(/confirm password/i), "Abc124"); // no coincide

  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  await screen.findByText(/passwords do not match/i);
});
it("toggle Show/Hide password afecta a ambos inputs y aria-labels", async () => {
  setup();

  const pass = screen.getByPlaceholderText(/^password$/i);
  const confirm = screen.getByPlaceholderText(/confirm password/i);

  expect(pass).toHaveAttribute("type", "password");
  expect(confirm).toHaveAttribute("type", "password");

  const togglesShow = screen.getAllByRole("button", { name: /show password/i });
  expect(togglesShow.length).toBe(2);

  await userEvent.click(togglesShow[0]);

  expect(pass).toHaveAttribute("type", "text");
  expect(confirm).toHaveAttribute("type", "text");
  // ahora deberían decir "Hide password"
  const togglesHide = screen.getAllByRole("button", { name: /hide password/i });
  expect(togglesHide.length).toBe(2);

  // volver a ocultar
  await userEvent.click(togglesHide[1]);
  expect(pass).toHaveAttribute("type", "password");
  expect(confirm).toHaveAttribute("type", "password");
});

it("registro exitoso: dispatch, Firebase, updateProfile y navigate", async () => {
  setup();

  const fakeUser = { uid: "123", email: "john@doe.com" };
  createUserWithEmailAndPassword.mockResolvedValueOnce({ user: fakeUser });
  updateProfile.mockResolvedValueOnce();

  await fillValidForm();
  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  // dispatch de checking
  expect(checkingCredentialsMock).toHaveBeenCalledTimes(1);
  expect(dispatchMock).toHaveBeenCalledWith({ type: "auth/checkingCredentials" });

  // firebase args
  expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
    FirebaseAuth,
    "john@doe.com",
    "Abc123"
  );

  // updateProfile con nombre completo
  expect(updateProfile).toHaveBeenCalledWith(fakeUser, { displayName: "John Doe" });

  // navegación al home con replace
  expect(navigateMock).toHaveBeenCalledWith("/", { replace: true });
});

it("mapea error Firebase: email ya en uso", async () => {
  setup();

  createUserWithEmailAndPassword.mockRejectedValueOnce({
    code: "auth/email-already-in-use",
    message: "used",
  });

  await fillValidForm();
  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  expect(await screen.findByText(/email is already in use/i)).toBeInTheDocument();
  expect(navigateMock).not.toHaveBeenCalled();
});

it("mapea error genérico de Firebase a 'Register failed'", async () => {
  setup();

  // Sin message para forzar el fallback
  createUserWithEmailAndPassword.mockRejectedValueOnce({}); 

  await fillValidForm();
  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  expect(await screen.findByText(/register failed/i)).toBeInTheDocument();
  expect(navigateMock).not.toHaveBeenCalled();
});

it('el link "Sign In" apunta a /login', () => {
  setup();
  const link = screen.getByRole("link", { name: /sign in/i });
  expect(link).toHaveAttribute("href", "/login");
});

});