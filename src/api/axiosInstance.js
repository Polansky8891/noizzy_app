import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: 'http://localhost:4000/api'
});

axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if ( token ) {
        config.headers['x-token'] = token;
    }
    return config;
}, error => {
    return Promise.reject(error);
});


axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('uid');
            localStorage.removeItem('name');

            window.location.href = '/login';

        }

        return Promise.reject(error);
        }
);



