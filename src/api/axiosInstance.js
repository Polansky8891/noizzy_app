import axios from "axios";
import { store } from "../store/store";
import { logout, setToken, selectToken } from "../store/auth/authSlice";
import { createBrowserHistory } from "history";
import { API_BASE } from "./base";
import { FirebaseAuth } from "../firebase/config";

const history = createBrowserHistory();


export const axiosInstance = axios.create({ baseURL: API_BASE });

axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = selectToken(state);
    if (token) {
      config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// —— Response: retry único con refresh de Firebase + cola anti-tormenta
let isRefreshing = false;
/** @type {Array<{resolve: (t:string)=>void, reject: (e:any)=>void}>} */
let pending = [];

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const original = error.config || {};
    const url = original?.url || "";
    const isAuthEndpoint = url.includes("/auth/");

    if (status === 401 && !isAuthEndpoint && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        // Espera a que termine el refresh en curso
        return new Promise((resolve, reject) => {
          pending.push({ resolve, reject });
        })
          .then((token) => {
            original.headers = { ...(original.headers || {}), Authorization: `Bearer ${token}` };
            return axiosInstance(original);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        const user = FirebaseAuth.currentUser;
        if (!user) throw new Error("No Firebase user");

        // Fuerza refresh del ID token
        const newToken = await user.getIdToken(true);
        store.dispatch(setToken(newToken));

        // Despierta a los que esperaban
        pending.forEach((p) => p.resolve(newToken));
        pending = [];

        original.headers = { ...(original.headers || {}), Authorization: `Bearer ${newToken}` };
        return axiosInstance(original);
      } catch (err) {
        // Falló el refresh: logout y redirección
        const skipRedirect = !!original?.meta?.skipAuthRedirect;

        store.dispatch(logout());
        if (!skipRedirect) {
            history.push("/login");
        }

        pending.forEach((p) => p.reject(err));
        pending = [];
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);