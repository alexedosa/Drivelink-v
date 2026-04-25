import api from './api';

export const createRental = async (data) => {
  const response = await api.post('/rentals/create/', data);
  return response.data;
};

export const getMyRentals = async () => {
  const response = await api.get('/rentals/my/');
  return response.data;
};

export const getAllRentals = async () => {
  const response = await api.get('/rentals/all/');
  return response.data;
};

export const cancelRental = async (id) => {
  const response = await api.patch(`/rentals/${id}/cancel/`);
  return response.data;
};

export const getRentalDetail = async (id) => {
  const response = await api.get(`/rentals/${id}/`);
  return response.data;
};