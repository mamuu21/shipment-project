import axios from 'axios';
import { refreshToken } from './auth';


let baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  // If you're running the frontend from localhost, use local backend
  if (window && window.location && window.location.hostname === 'localhost') {
    baseURL = 'http://127.0.0.1:8000/api';
  } else {
    // final fallback to production URL (safe)
    baseURL = 'https://cargopro.amkatech.co.tz/api';
  }
}

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Add access token to every request
api.interceptors.request.use((config) => {
  let token = localStorage.getItem('access_token');
  if (!token) {
    token = sessionStorage.getItem('access_token');
  }
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// ✅ Refresh token if expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshToken(); // <- We’ll fix this next
        if (newAccessToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed', refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
