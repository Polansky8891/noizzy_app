import axios from "axios";
import { FirebaseAuth } from "../firebase/config";
import { API_BASE } from "./base";
import { store } from "../store/store";
import { logout, setToken } from "../store/auth/authSlice";


const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const user = FirebaseAuth.currentUser;
  if (user) {
    const idToken = await user.getIdToken(); // NO fuerza refresh salvo que haga falta
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${idToken}`;
  }
  return config;
});

let refreshing = null;
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error || {};
    if (!response || response.status !== 401 || config?._retry) {
      return Promise.reject(error);
    }

    config._retry = true;
    try {
      if (!refreshing) {
        const u = FirebaseAuth.currentUser;
        if (!u) throw new Error('no-user');
        refreshing = u.getIdToken(true); // fuerza refresh
      }
      const newToken = await refreshing;
      refreshing = null;

      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${newToken}`;
      return api(config); // reintenta
    } catch (e) {
      refreshing = null;
      return Promise.reject(error);
    }
  }
);

export default api;