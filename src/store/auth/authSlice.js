import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status: 'not-authenticated',
    uid: null,
    email: null,
    displayName: null,
    photoURL: null,
    errorMessage: null,
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: ( state, { payload } ) => {
            state.status = 'authenticated';
            state.uid = payload.uid || null;
            state.email = payload.email || null;
            state.displayName = payload.displayName || null;
            state.photoURL = payload.photoURL || null;
            state.errorMessage = null;
        },
        logout: () => initialState,
        checkingCredentials: (state) => {
            state.status = 'checking';
            state.errorMessage = undefined;
        }

    }
});

export const { login, logout, checkingCredentials } = authSlice.actions;
export default authSlice.reducer;

export const selectIsAuthenticated = (s) => s.auth.status === 'authenticated';
export const selectAuth = (s) => s.auth;