import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL || 'https://shopstream-5gkj.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shopstreamToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-clear a dead session on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('shopstreamToken');
      localStorage.removeItem('shopstreamUser');
    }
    return Promise.reject(err);
  }
);

/* ---------- Auth ---------- */
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);

/* ---------- Products ---------- */
export const getProducts = () => api.get('/products');
export const getProductById = (id) => api.get(`/products/${id}`);

// Admin: multipart/form-data because the backend expects an uploaded image file
export const createProduct = (formData) =>
  api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

// Admin: JSON body — the backend only persists name & price (see PDF spec)
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

/* ---------- Cart ---------- */
export const getCart = () => api.get('/cart');
export const addToCart = (productId, quantity) => api.post('/cart', { productId, quantity });
export const removeFromCart = (productId) => api.delete(`/cart/${productId}`);

export default api;
