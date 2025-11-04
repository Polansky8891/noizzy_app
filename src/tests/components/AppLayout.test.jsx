// src/tests/components/AppLayout.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppLayout from "../../components/AppLayout";

/* ─────────── Mocks hoisted con RUTAS REALES ─────────── */
const headerMocks = vi.hoisted(() => ({ lastOnOpen: null }));
vi.mock("../../components/Header", () => ({
  Header: (props) => {
    headerMocks.lastOnOpen = props.onOpenSideBar;
    return (
      <button aria-label="open sidebar" onClick={props.onOpenSideBar}>
        Open
      </button>
    );
  },
}));

const sideBarMocks = vi.hoisted(() => ({ lastOnNavigate: null }));
vi.mock("../../components/SideBar", () => ({
  SideBar: (props) => {
    sideBarMocks.lastOnNavigate = props.onNavigate ?? null;
    return (
      <div>
        <span>Sidebar</span>
        {props.onNavigate && (
          <button aria-label="sidebar navigate" onClick={props.onNavigate}>
            Go
          </button>
        )}
      </div>
    );
  },
}));

vi.mock("../../components/AuthGate", () => ({
  default: () => <div data-testid="auth-gate">AuthGate</div>,
}));

/* ─────────── Helpers ─────────── */
function setup(ui) {
  const player = <div data-testid="player">Player</div>;
  const children = ui ?? <div data-testid="content">Content</div>;
  const utils = render(<AppLayout player={player}>{children}</AppLayout>);

  const mobileHeader = screen.getByTestId("header-mobile");
  const openBtn = within(mobileHeader).getByRole("button", { name: /open sidebar/i });

  return { ...utils, openBtn };
}

beforeEach(() => {
  headerMocks.lastOnOpen = null;
  sideBarMocks.lastOnNavigate = null;
});

/* ─────────── Tests ─────────── */
describe("AppLayout", () => {
  it("renderiza children en <main> y el player en <footer>", () => {
    setup();
    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(screen.getByTestId("player")).toBeInTheDocument();
    expect(screen.getByTestId("auth-gate")).toBeInTheDocument();
  });

  it("abre y cierra el drawer (Close)", async () => {
    const user = userEvent.setup();
    const { openBtn } = setup();

    await user.click(openBtn);

    // drawer visible
    const drawer = await screen.findByTestId("mobile-drawer");

    // 🔎 botón Close por rol+nombre dentro del drawer (no hay data-testid en tu DOM)
    const closeBtn = within(drawer).getByRole("button", { name: /close/i });

    await user.click(closeBtn);

    expect(screen.queryByTestId("mobile-drawer")).not.toBeInTheDocument();
  });

  it("SideBar onNavigate cierra el drawer", async () => {
    const user = userEvent.setup();
    const { openBtn } = setup();

    await user.click(openBtn);
    expect(await screen.findByTestId("mobile-drawer")).toBeInTheDocument();

    const goBtn = screen.getByRole("button", { name: /sidebar navigate/i });
    await user.click(goBtn);

    expect(screen.queryByTestId("mobile-drawer")).not.toBeInTheDocument();
  });

  it("también puede cerrar clicando el backdrop", async () => {
    const user = userEvent.setup();
    const { openBtn } = setup();

    await user.click(openBtn);
    const drawer = await screen.findByTestId("mobile-drawer");

    // 👇 backdrop = primer hijo del drawer (el overlay con bg-black/50)
    const backdrop = drawer.firstChild;
    await user.click(backdrop);

    expect(screen.queryByTestId("mobile-drawer")).not.toBeInTheDocument();
  });

  it('no abre el drawer desde el header de desktop', async () => {
    const user = userEvent.setup();
    setup();

    // dentro del contenedor de desktop
    const desktopHeader = screen.getByTestId('header-desktop');
    const desktopOpenBtn = within(desktopHeader).getByRole('button', { name: /open sidebar/i });

    await user.click(desktopOpenBtn);

    // no debería abrirse el drawer
    expect(screen.queryByTestId('mobile-drawer')).not.toBeInTheDocument();
  });

  it('el botón Go solo aparece en el drawer (no en el aside desktop)', async () => {
    setup();

    // en render inicial (drawer cerrado) no hay botón Go
    expect(screen.queryByRole('button', { name: /sidebar navigate/i })).not.toBeInTheDocument();
  })
});
