import axios from "axios";
import { store } from "../store/store";
import { logout } from "../store/auth/authSlice";
import { createBrowserHistory } from "history";

const history = createBrowserHistory();


export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:4000/api'
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if ( token ) {
        config.headers['x-token'] = token;
    }
    return config;
}, (error) => Promise.reject(error)
);


axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-token'] = token;
        }

        if (config.url?.includes('/me/favorites')) {
            console.log('[axiosInstance][request]', config.method?.toUpperCase(), config.url, 'x-token?', !!token);
        }
        return config;
    },
    (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const url = error?.config?.url || "";
        const isAuthEndpoint = url.includes('/auth/');

        if (status === 401 && !isAuthEndpoint && !error.config?.meta?.skipAuthRedirect) {
            store.dispatch(logout());
            history.push('/login');
        }

        return Promise.reject(error);
    }
        
);




