export const API_BASE_URL = 'http://localhost:8000/api/v1';

export const USER_ROLES = {
  ADMIN: 'admin',
  SUPPLIER: 'supplier',
  CUSTOMER: 'customer',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const PAYMENT_METHOD = {
  CARD: 'card',
  UPI: 'upi',
  NET_BANKING: 'net_banking',
  COD: 'cash_on_delivery',
};

export const PAYMENT_METHOD_LABELS = {
  card: 'Credit/Debit Card',
  upi: 'UPI',
  net_banking: 'Net Banking',
  cash_on_delivery: 'Cash on Delivery',
};
