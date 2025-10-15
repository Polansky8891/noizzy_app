import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./../store/authSlice";
import favoritesReducer from "./../store/favoritesSlice";

// Permite inyectar preloadedState o un store a medida
export function renderWithProviders(ui, { 
  store = configureStore({ reducer: { auth: authReducer, favorites: favoritesReducer } }),
  route = "/",
  ...renderOptions
} = {}) {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </Provider>
  );
  return { store, Wrapper };
}
