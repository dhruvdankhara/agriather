export const DB_NAME = "agriather";

export const USER_ROLES = {
  ADMIN: "admin",
  SUPPLIER: "supplier",
  CUSTOMER: "customer",
};

export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
};

export const PAYMENT_METHOD = {
  CARD: "card",
  UPI: "upi",
  NET_BANKING: "net_banking",
  COD: "cash_on_delivery",
};

export const PRODUCT_CATEGORIES = {
  FERTILIZER: "fertilizer",
  PESTICIDE: "pesticide",
  MACHINERY: "machinery",
};

export const cookieOption = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
};

export const ROLE = {
  ADMIN: "admin",
  USER: "user",
};
