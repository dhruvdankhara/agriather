import api from './api';

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Address APIs
export const addressAPI = {
  getAll: (params) => api.get('/addresses', { params }),
  getById: (id) => api.get(`/addresses/${id}`),
  create: (data) => api.post('/addresses', data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  delete: (id) => api.delete(`/addresses/${id}`),
  setDefault: (id) => api.patch(`/addresses/${id}/set-default`),
};

// Product APIs
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getSupplierProducts: (params) =>
    api.get('/products/supplier/my-products', { params }),
  getReviews: (id, params) => api.get(`/products/${id}/reviews`, { params }),
};

// Category APIs
export const categoryAPI = {
  getAll: () => api.get('/products/categories'),
  getById: (id) => api.get(`/products/categories/${id}`),
  create: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  delete: (id) => api.delete(`/admin/categories/${id}`),
};

// Cart APIs
export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/items', data),
  updateItem: (id, data) => api.put(`/cart/items/${id}`, data),
  removeItem: (id) => api.delete(`/cart/items/${id}`),
  clear: () => api.delete('/cart'),
};

// Order APIs
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getCustomerOrders: (params) =>
    api.get('/orders/customer/my-orders', { params }),
  getSupplierOrders: (params) =>
    api.get('/orders/supplier/my-orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  track: (id) => api.get(`/orders/${id}/track`),
  cancel: (id, data) => api.put(`/orders/${id}/cancel`, data),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

// Payment APIs
export const paymentAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
  handleFailure: (data) => api.post('/payments/failure', data),
  getById: (id) => api.get(`/payments/${id}`),
  getCustomerHistory: (params) =>
    api.get('/payments/customer/history', { params }),
  getSupplierHistory: (params) =>
    api.get('/payments/supplier/history', { params }),
  getSupplierPayments: (params) =>
    api.get('/payments/supplier/history', { params }),
  getInvoice: (id) => api.get(`/payments/${id}/invoice`),
};

// Review APIs
export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  getProductReviews: (id, params) =>
    api.get(`/reviews/product/${id}`, { params }),
  getCustomerReviews: (params) =>
    api.get('/reviews/customer/my-reviews', { params }),
  getSupplierReviews: (params) =>
    api.get('/reviews/supplier/product-reviews', { params }),
  getOrderReviewableProducts: (orderId) =>
    api.get(`/reviews/order/${orderId}/reviewable`),
};

// Report APIs
export const reportAPI = {
  supplierSales: (params) => api.get('/reports/supplier/sales', { params }),
  supplierProducts: () => api.get('/reports/supplier/products'),
  getSupplierReports: (params) =>
    api.get('/reports/supplier/sales', { params }),
  customerOrders: (params) => api.get('/reports/customer/orders', { params }),
  adminPlatform: (params) => api.get('/reports/admin/platform', { params }),
};

// Admin APIs
export const adminAPI = {
  getPendingSuppliers: () => api.get('/admin/suppliers/pending'),
  getAllSuppliers: (params) => api.get('/admin/suppliers', { params }),
  approveSupplier: (id) => api.put(`/admin/suppliers/${id}/approve`),
  deactivateSupplier: (id) => api.put(`/admin/suppliers/${id}/deactivate`),
  getAllCustomers: (params) => api.get('/admin/customers', { params }),
  getPlatformStats: () => api.get('/admin/stats'),
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  getAllPayments: (params) => api.get('/admin/payments', { params }),
  getAllReviews: (params) => api.get('/admin/reviews', { params }),
  generateSalesReport: (params) => api.get('/admin/reports/sales', { params }),
};
