import api from './api';
import { setToken, removeToken } from '../utils/tokenStorage';

export const register = async (userData) => {
  const response = await api.post('register/', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('login/', credentials);
  if (response.data.access) {
    setToken(response.data.access);
  }
  return response.data;
};

export const adminLogin = async (credentials) => {
  const response = await api.post('login/', credentials);
  if (response.data.access) {
    setToken(response.data.access);
  }
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me/');
  return response.data;
};

export const logout = () => {
  removeToken();
  window.location.href = '/login';
};