import axios from 'axios';
import { getToken, setToken, removeToken } from '../utils/tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Creates a centralized API client so you don't have to repeat the Base URL or JSON headers in every file.
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// The "Security Guard": Automatically injects your JWT access token into every outgoing request's headers.
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// The "Auto-Logout": Instantly wipes local session data and kicks the user to login if the server says their token is dead (401).
// Skip redirect for auth endpoints (wrong pass gives 401 too)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url = error.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
