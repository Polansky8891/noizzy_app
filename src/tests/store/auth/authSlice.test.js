import { expect, describe } from "vitest";
import reducer, { login, logout, setToken, checkingCredentials, setHydrated } from "../../../store/auth/authSlice";

describe('authSlice', () => {
    it('login guarda credenciales básicas y status', () => {
        const payload = {
            uid: 'u1',
            email: 'pol@google.com',
            displayName: 'Pol',
            photoURL: 'http://img/pol.png',
        };

        const state = reducer(undefined, login(payload));

        expect(state.status).toBe('authenticated');
        expect(state.uid).toBe('u1');
        expect(state.email).toBe('pol@google.com');
        expect(state.displayName).toBe('Pol');
        expect(state.photoURL).toBe('http://img/pol.png');
        expect(state.errorMessage).toBeNull();
    });

    it('logout resetea al estado inicial (y hydrated=true)', () => {
        const pre = {
            status: 'authenticated',
            uid: 'u1',
            email: 'pol@google.com',
            displayName: 'Pol',
            photoURL: 'http://img/pol.png',
            token: 'abc',
            errorMessage: 'x',
            hydrated: false,
        };

        const state = reducer(pre, logout());

        expect(state.status).toBe('not-authenticated');
        expect(state.uid).toBeNull();
        expect(state.email).toBeNull();
        expect(state.displayName).toBeNull();
        expect(state.photoURL).toBeNull();
        expect(state.token).toBeNull();
        expect(state.errorMessage).toBeNull();
        expect(state.hydrated).toBe(true);
    });

    it('setToken establece y limpia el token', () => {
        const withToken = reducer(undefined, setToken('ID_TOKEN'));
        expect(withToken.token).toBe('ID_TOKEN');
        
        const cleared = reducer(withToken, setToken());
        expect(cleared.token).toBeNull();
    });

    it('checkingCredentials pone status=checking y errorMessage=undefined', () => {
        const state = reducer(undefined, checkingCredentials());
        expect(state.status).toBe('checking');
        expect(state.errorMessage).toBeUndefined();
    });

    it('setHydrated(true|false) funciona', () => {
        const s1 = reducer(undefined, setHydrated(true));
        expect(s1.hydrated).toBe(true);

        const s2 = reducer(s1, setHydrated(false));
        expect(s2.hydrated).toBe(false);
    });
});