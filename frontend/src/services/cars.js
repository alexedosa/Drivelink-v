import api from './api';

export const getCars = async (params = {}) => {
  const response = await api.get('/cars/', { params });
  return response.data;
};

export const getCar = async (id) => {
  const response = await api.get(`/cars/${id}/`);
  return response.data;
};

export const createCar = async (formData) => {
  const response = await api.post('/cars/admin/create/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateCar = async (id, formData) => {
  const response = await api.patch(`/cars/admin/update/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteCar = async (id) => {
  const response = await api.delete(`/cars/admin/delete/${id}/`);
  return response.data;
};