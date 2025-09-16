import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status: 'not-authenticated',
    uid: null,
    email: null,
    displayName: null,
    photoURL: null,
    token: null,
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
            state.token = payload.token ?? state.token;
            state.errorMessage = null;
        },
        setToken: (state, { payload }) => {
            state.token = payload || null;
        },
        logout: () => initialState,
        checkingCredentials: (state) => {
            state.status = 'checking';
            state.errorMessage = undefined;
        }

    }
});

export const { login, logout, checkingCredentials, setToken } = authSlice.actions;
export default authSlice.reducer;

export const selectAuthState = (s) => s?.auth ?? initialState;
export const selectIsAuthenticated = (s) => selectAuthState(s).status === "authenticated";
export const selectToken = (s) => selectAuthState(s).token;
export const selectAuth = (s) => selectAuthState(s);