import api from './api';

export const purchasesService = {
  create: (payload) => api.post('/purchases/create/', payload),
  getMy:  ()        => api.get('/purchases/my/'),
  getAll: ()        => api.get('/purchases/all/'),
};