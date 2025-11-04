import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

/* ────────────── HOISTED state + mocks ────────────── */

// auth state controlado por el test
const authState = vi.hoisted(() => ({ status: "not-authenticated", photoURL: "", displayName: "" }));

// mock react-redux (useSelector lee de authState)
vi.mock("react-redux", () => ({
  __esModule: true,
  useSelector: (sel) => sel({ auth: authState }),
}));

// mock SettingsMenu para inspeccionar props
vi.mock("../../components/SettingsMenu", () => ({
  __esModule: true,
  SettingsMenu: (props) => (
    <div
      data-testid="settings-menu"
      data-status={props.status}
      data-displayname={props.displayName || ""}
      data-photourl={props.photoURL || ""}
      onClick={() => props.onClose?.()}
    >
      Settings
    </div>
  ),
}));

// importar DESPUÉS de mocks
import { MobileHeader } from "../../components/MobileHeader.jsx";

/* ────────────── helpers ────────────── */
const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  authState.status = "not-authenticated";
  authState.photoURL = "";
  authState.displayName = "";
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MobileHeader", () => {
  it("muestra el botón de abrir menú y llama a onToggle al hacer click", async () => {
    const onToggle = vi.fn();
    renderWithRouter(<MobileHeader onToggle={onToggle} />);

    const btn = screen.getByRole("button", { name: /abrir menú/i });
    await userEvent.click(btn);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("cuando NO está autenticado, muestra el link al perfil (login)", () => {
    authState.status = "not-authenticated";
    renderWithRouter(<MobileHeader />);

    // el atributo tiene un typo 'arial-label' en el componente, así que buscamos el link sin depender del label
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/profile");
  });

  it("cuando está autenticado sin foto, muestra el icono y abre/cierra el menú", async () => {
    authState.status = "authenticated";
    authState.displayName = "Pol";
    renderWithRouter(<MobileHeader />);

    // botón del avatar (no hay imagen, así que es el botón que contiene el icono)
    const avatarBtn = screen.getByRole("button", { name: /settings|pol/i });
    // abre
    await userEvent.click(avatarBtn);
    const menu = screen.getByRole("menu");
    expect(menu).toBeInTheDocument();
    // el SettingsMenu recibe props correctos
    const sm = screen.getByTestId("settings-menu");
    expect(sm.getAttribute("data-status")).toBe("authenticated");
    expect(sm.getAttribute("data-displayname")).toBe("Pol");

    // cierra al clickar fuera (mousedown en document)
    fireEvent.mouseDown(document);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("cuando está autenticado con foto (desde redux), renderiza la imagen y el título usa displayName", async () => {
    authState.status = "authenticated";
    authState.displayName = "Pol";
    authState.photoURL = "http://img/pol.jpg";

    renderWithRouter(<MobileHeader />);
    // abre el menú para localizar el botón del avatar por title
    const avatarBtn = screen.getByRole("button", { name: /pol|settings/i });
    expect(avatarBtn).toHaveAttribute("title", "Pol");

    // hay una imagen de perfil
    const img = screen.getByRole("img", { name: /pol|profile/i });
    expect(img).toHaveAttribute("src", "http://img/pol.jpg");
    expect(img).toHaveClass("rounded-full");
  });

  it("si no hay photoURL en redux pero existe en localStorage, usa la de localStorage", async () => {
    authState.status = "authenticated";
    authState.displayName = "User LS";
    authState.photoURL = ""; // vacío en redux
    localStorage.setItem("photoURL", "http://img/local.jpg");

    renderWithRouter(<MobileHeader />);
    const img = screen.getByRole("img", { name: /user ls|profile/i });
    expect(img).toHaveAttribute("src", "http://img/local.jpg");
  });

  it("toggle del menú por el propio SettingsMenu (onClose) funciona", async () => {
    authState.status = "authenticated";
    renderWithRouter(<MobileHeader />);

    const avatarBtn = screen
        .getAllByRole("button")
        .find(b => b.getAttribute("aria-haspopup") === "menu");
        expect(avatarBtn).toBeTruthy();
        await userEvent.click(avatarBtn);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    // nuestro mock de SettingsMenu llama a onClose al clickar en él
    await userEvent.click(screen.getByTestId("settings-menu"));

    expect(screen.queryByRole("menu")).toBeNull();
  });
});
