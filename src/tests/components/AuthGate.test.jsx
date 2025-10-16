import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

vi.mock('../../firebase/config', () => ({
    FirebaseAuth: { currentUser: null },
}));
import { FirebaseAuth } from "../../firebase/config";

import AuthGate from "../../components/AuthGate";

// helper: render con store + router
const renderWith = ({ authState, route = '/'} = {}) => {
    const store = configureStore({
        reducer: { auth: (state = authState) => state },
        preloadedState: { auth: authState },
    });

    return render(
        <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
            <AuthGate />
            <Routes>
            <Route path="/" element={<div>Home</div>} />
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/profile" element={<div>Profile Page</div>} />
            </Routes>
        </MemoryRouter>
        </Provider>
    );
};

const BASE = {
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
    vi.clearAllMocks();
    FirebaseAuth.currentUser = null;
    document.body.style.overflow = '';
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('AuthGate', () => {
    it('muestra el overlay si no hay sesión y ruta ≠ /login|/profile', async () => {
        renderWith({ authState: BASE, route: '/' });
        const dialog = await screen.findByRole('dialog'); // espera a que monte el portal
        expect(dialog).toBeInTheDocument();
        expect(screen.getByText(/welcome to noizzy/i)).toBeInTheDocument();
    });

    it('no muestra overlay si está autenticado (fbUser +. token + status)', () => {
        const authed = { ...BASE, status: 'authenticated', token: 'tkn' };
        FirebaseAuth.currentUser = { uid: 'u1' };

        renderWith({ authState: authed, route: '/' });
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('no muestra overlay en /login', () => {
        renderWith({ authState: BASE, route: '/login'});
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(screen.getByText(/login page/i)).toBeInTheDocument();
    });

    it('no muestra overlay en /profile', () => {
        renderWith({ authState: BASE, route: '/profile'});
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(screen.getByText(/profile page/i)).toBeInTheDocument();
    });

    it('bloqueda el scroll mientras está visible y lo restaura al desmontar', async () => {
        const { unmount } = renderWith({ authState: BASE, route: '/'});
        await screen.findByRole('dialog');
        expect(document.body.style.overflow).toBe('hidden');
        unmount();
        expect(document.body.style.overflow === '' || document.body.style.overflow === 'visible').toBe(true);
    });

    it('CTA Log in navega a /login', async () => {
        renderWith({ authState: BASE, route: '/'});
        await screen.findByRole('dialog');
        fireEvent.click(screen.getByRole('button', { name: /log in/i}));
        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('CTA Create Account navega a /profile', async () => {
        renderWith({ authState: BASE, route: '/'});
        await screen.findByRole('dialog');
        fireEvent.click(screen.getByRole('button', { name: /create account/i}));
        expect(screen.getByText('Profile Page')).toBeInTheDocument();
    });
});

