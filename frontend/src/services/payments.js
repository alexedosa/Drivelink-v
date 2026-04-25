import api from './api';

// 1. Export the function individually (for Checkout.jsx)
export const initializePayment = async (data) => {
  const response = await api.post('/payments/initialize/', data);
  return response.data;
};

// 2. Export the other function individually (for PaymentCallback.jsx)
export const verifyPayment = async (reference) => {
  const response = await api.get(`/payments/verify/?reference=${reference}`);
  return response.data;
};

// 3. Keep the object export as well (Just in case other files need it)
export const paymentsService = {
  initialize: initializePayment,
  verify: verifyPayment
};
