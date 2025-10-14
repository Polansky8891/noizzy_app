import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status: 'not-authenticated',
    uid: null,
    email: null,
    displayName: null,
    photoURL: null,
    token: null,
    errorMessage: null,
    hydrated: false,
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setToken: (state, { payload }) => {
            state.token = payload || null;
        },
        login: ( state, { payload } ) => {
            state.status = 'authenticated';
            state.uid = payload.uid || null;
            state.email = payload.email || null;
            state.displayName = payload.displayName || null;
            state.photoURL = payload.photoURL || null;
            state.errorMessage = null;
        },
        logout: () => ({
            ...initialState,
            status: 'not-authenticated',
            token: null,
            hydrated: true,
        }),
        checkingCredentials: (state) => {
            state.status = 'checking';
            state.errorMessage = undefined;
        },
        setHydrated: (state, { payload }) => {
            state.hydrated = !!payload;
        },

    },
});

export const { setToken,login, logout, checkingCredentials, setHydrated } = authSlice.actions;
export default authSlice.reducer;

export const selectIsAuthenticated = (s) => s.auth.status === 'authenticated';
export const selectAuth = (s) => s.auth;
export const selectIdToken = (s) => s.auth.token;
export const selectHydrated = (s) => s.auth.hydrated === true;