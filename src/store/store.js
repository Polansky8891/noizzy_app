import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./auth/authSlice";
import favorites from './favoritesSlice';


export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        favorites,
    }
})