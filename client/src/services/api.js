import axios from 'axios';

// Use environment variable or default to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  verify: () => api.post('/auth/verify'),
  register: (userData) => api.post('/auth/register', userData),
};

// Inventory API
export const inventoryAPI = {
  // Items
  getItems: (params) => api.get('/inventory/items', { params }),
  getItem: (id) => api.get(`/inventory/items/${id}`),
  createItem: (data) => api.post('/inventory/items', data),
  updateItem: (id, data) => api.patch(`/inventory/items/${id}`, data),
  updateStock: (id, data) => api.post(`/inventory/items/${id}/stock`, data),
  
  // Analytics
  getAnalytics: () => api.get('/inventory/analytics'),
  getLowStock: () => api.get('/inventory/low-stock'),
  
  // Transactions
  getTransactions: (params) => api.get('/inventory/transactions', { params })
};

// Purchase Orders API
export const purchaseOrderAPI = {
  getOrders: (params) => api.get('/purchase-orders', { params }),
  getOrder: (id) => api.get(`/purchase-orders/${id}`),
  createOrder: (data) => api.post('/purchase-orders', data),
  approveOrder: (id, data) => api.post(`/purchase-orders/${id}/approve`, data),
  receiveOrder: (id, data) => api.post(`/purchase-orders/${id}/receive`, data)
};

// Rooms API
export const roomsAPI = {
  getRooms: () => api.get('/rooms'),
  createRoom: (data) => api.post('/rooms', data),
  updateRoom: (id, data) => api.put(`/rooms/${id}`, data),
  deleteRoom: (id) => api.delete(`/rooms/${id}`),
};

// Reservations API
export const reservationsAPI = {
  getReservations: () => api.get('/reservations'),
  createReservation: (data) => api.post('/reservations', data),
  updateReservation: (id, data) => api.put(`/reservations/${id}`, data),
};

// Guests API
export const guestsAPI = {
  getGuests: () => api.get('/guests'),
  createGuest: (data) => api.post('/guests', data),
  updateGuest: (id, data) => api.put(`/guests/${id}`, data),
};

export default api;
