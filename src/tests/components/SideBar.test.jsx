import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

// ─────────────────── Mocks de componentes hijos ───────────────────
vi.mock('../../../src/components/SideBarButton', () => ({
    SideBarButton: ({ title, to, onClick, className }) => (
        <a href={to} className={className} aria-label={title} onClick={onClick}>
            {title}
        </a>
    ),
}));

vi.mock('../../../src/components/SettingsMenu', () => ({
    SettingsMenu: ({ closeMenu }) => (
        <div role='menu'>
            <button onClick={closeMenu}>Cerrar</button>
            <div>SettingsMenu</div>
        </div>
    ),
}));

vi.mock('../../../src/components/PopoverPortal', () => ({
    __esModule: true,
    default: ({ open, children }) => (open ? <div data-testid='portal'>{children}</div> : null),
}));

// ─────────────────── Import del componente a probar ───────────────────
import { SideBar } from "../../components/SideBar";

// Helper para renderizar con Redux + Router
const renderWithStore = (ui, { authState, route = '/' } = {}) => {
    const store = configureStore({
        reducer: {
            auth: (state = authState) => state,
        },
        preloadedState: {
            auth: authState,
        },
    });

    return render(
        <Provider store={store}>
            <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
        </Provider>
    );
};

const AUTHED = {
    status: 'authenticated',
    uid: 'u1',
    email: 'pol@google.com',
    displayName: 'Pol',
    photoURL: 'http://img/pol.png',
    token: 't',
    errorMessage: null,
    hydrated: true,
};

const GUEST = {
    status: 'not-authenticated',
    uid: null,
    email: null,
    displayName: null,
    photoURL: null,
    token: null,
    errorMessage: null,
    hydrated: true,
};

beforeEach(() => {
    localStorage.clear();
});

// ─────────────────── Tests ───────────────────
describe('SideBar (no compacto)', () => {
    it('muestra Home, Favorites y Stats', () => {
        renderWithStore(<SideBar />, { authState: AUTHED });
        expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /favorites/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /stats/i })).toBeInTheDocument();
    });

    it('si estás autenticado muestra el botón de avatar (abrir ajustes) y puede abrir/cerrar el menú', () => {
        renderWithStore(<SideBar />, { authState: AUTHED });

        const avatarBtn = screen.getByRole('button', { name: /abrir ajustes/i });
        expect(avatarBtn).toBeInTheDocument;

        // Abre menú (SideBar usa onMouseUp para toggle)
        fireEvent.mouseDown(avatarBtn);
        fireEvent.mouseUp(avatarBtn);
        expect(screen.getByText(/SettingsMenu/i)).toBeInTheDocument();

        // Cierra clicando fuera (document)
        fireEvent.mouseDown(document.body);
        expect(screen.queryByText(/SettingsMenu/i)).not.toBeInTheDocument();
    });

    it('si NO estás autenticado muestra el link a /profile (Iniciar sesión)', () => {
        renderWithStore(<SideBar />, { authState: GUEST });
        const loginLink = screen.getByRole('link', { name: /iniciar sesión/i });
        expect(loginLink).toBeInTheDocument();
        expect(loginLink).toHaveAttribute('href', '/profile');
    });

    it('llama a onNavigate cuando hago click en Favorites', () => {
        const onNavigate = vi.fn();
        renderWithStore(<SideBar onNavigate={onNavigate} />, { authState: AUTHED });

        const favLink = screen.getByRole('link', { name: /favorites/i });
        fireEvent.click(favLink);
        expect(onNavigate).toHaveBeenCalledTimes(1);
    });

    it('doble click en el aside colapsa (oculta títulos) y otro doble click los muestra', () => {
        renderWithStore(<SideBar />, { authState: AUTHED });

        const aside = screen.getByRole('complementary');
        // Inicialmente visible
        expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();

        // Colapsa (oculta títulos)
        fireEvent.doubleClick(aside);
        // En colapsado, SideBarButton recibe title="" y se renderiza sin texto
        expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument();

        // Expandir de nuevo
        fireEvent.doubleClick(aside);
        expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    });
});

describe('SideBar (compacto)', () => {
    it('muestra Menú y los títulos siguen visibles en compacto', () => {
        renderWithStore(<SideBar compact />, { authState: AUTHED });
        expect(screen.getByText(/menu/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    });

    it('en compacto el doble click NO colapsa', () => {
        renderWithStore(<SideBar compact />, { authState: AUTHED });
        const aside = screen.getByRole('complementary');

        // Intento colapsar
        fireEvent.doubleClick(aside);
        // Siguen los títulos
        expect(screen.getByRole('link', { name: 'Home'})).toBeInTheDocument();
    });
});


