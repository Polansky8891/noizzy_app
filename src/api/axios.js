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
    console.log('[API] add Authorization len=', idToken?.length, 'head=', idToken?.slice(0,6), 'tail=', idToken?.slice(-6));
  } else {
    console.log('[API] NO currentUser -> no Authorization header');
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error?.response?.status === 401 && !original.__isRetry) {
      original.__isRetry = true;
      try {
        const user = FirebaseAuth.currentUser;
        if (!user) throw new Error('no-user');
        const freshToken = await user.getIdToken(true); // fuerza refresh
        store.dispatch(setToken(freshToken));
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${freshToken}`;
        return api(original);
      } catch (e) {
        store.dispatch(logout());
      }
    }
    return Promise.reject(error);
  }
);


export default api;