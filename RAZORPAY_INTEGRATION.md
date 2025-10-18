# Razorpay Payment Integration - Complete Guide

## Overview

Complete Razorpay payment gateway integration for Agriather e-commerce platform with support for multiple payment methods (UPI, Cards, Net Banking) and Cash on Delivery (COD).

## Table of Contents

1. [Setup & Configuration](#setup--configuration)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Payment Flow](#payment-flow)
5. [Testing](#testing)
6. [Security](#security)

---

## Setup & Configuration

### 1. Get Razorpay Credentials

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to **Settings** → **API Keys**
3. Generate Test/Live API keys
4. Copy `Key ID` and `Key Secret`

### 2. Update Environment Variables

**File**: `backend/.env`

```env
# Razorpay config
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
```

**Important**:

- Use **Test Keys** for development
- Use **Live Keys** for production
- Never commit `.env` file to version control

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install razorpay

# Frontend - No installation needed (script loaded dynamically)
```

---

## Backend Implementation

### File Structure

```
backend/src/
├── utils/
│   └── razorpay.js           # Razorpay utility functions
├── controllers/
│   └── payment.controller.js  # Payment handlers
├── routes/
│   └── payment.routes.js      # Payment API routes
└── models/
    └── payment.model.js       # Payment schema
```

### 1. Razorpay Utility (`utils/razorpay.js`)

**Functions**:

- `createRazorpayOrder(amount, currency, receipt)` - Create Razorpay order
- `verifyPaymentSignature(orderId, paymentId, signature)` - Verify payment authenticity
- `fetchPaymentDetails(paymentId)` - Get payment info from Razorpay
- `initiateRefund(paymentId, amount)` - Process refunds
- `fetchRefundDetails(refundId)` - Get refund status

### 2. Payment Controller (`controllers/payment.controller.js`)

#### API Endpoints

**a) Create Payment Order**

```
POST /api/payments/create-order
```

- Creates order in database and Razorpay
- Returns Razorpay order details for frontend
- Handles COD orders (no Razorpay order needed)

**Request Body**:

```json
{
  "orderId": "mongodb_order_id"
}
```

**Response**:

```json
{
  "statusCode": 200,
  "message": "Payment order created successfully",
  "data": {
    "payment": {
      "_id": "payment_id",
      "order": "order_id",
      "amount": 1500,
      "status": "pending"
    },
    "razorpayOrder": {
      "id": "order_razorpay_id",
      "amount": 150000,
      "currency": "INR"
    },
    "razorpayKeyId": "rzp_test_xxx",
    "requiresPayment": true
  }
}
```

**b) Verify Payment**

```
POST /api/payments/verify
```

- Verifies Razorpay signature
- Updates payment and order status
- Marks order as confirmed

**Request Body**:

```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx",
  "paymentId": "mongodb_payment_id"
}
```

**Response**:

```json
{
  "statusCode": 200,
  "message": "Payment verified successfully",
  "data": {
    "payment": {
      /* payment object */
    },
    "order": {
      /* updated order */
    }
  }
}
```

**c) Handle Payment Failure**

```
POST /api/payments/failure
```

- Records payment failure
- Stores error details

**Request Body**:

```json
{
  "paymentId": "payment_id",
  "error": {
    "code": "BAD_REQUEST_ERROR",
    "description": "Payment failed"
  }
}
```

### 3. Payment Routes (`routes/payment.routes.js`)

```javascript
// Customer routes
router.post("/create-order", verifyJWT, requireCustomer, createPaymentOrder);
router.post("/verify", verifyJWT, requireCustomer, verifyPayment);
router.post("/failure", verifyJWT, requireCustomer, handlePaymentFailure);
router.get(
  "/customer/history",
  verifyJWT,
  requireCustomer,
  getCustomerPayments
);
router.get("/:paymentId/invoice", verifyJWT, getPaymentInvoice);

// Supplier routes
router.get(
  "/supplier/history",
  verifyJWT,
  requireSupplier,
  getSupplierPayments
);

// Common routes
router.get("/:paymentId", verifyJWT, getPaymentById);
```

---

## Frontend Implementation

### File Structure

```
client/src/
├── lib/
│   └── razorpay.js              # Razorpay SDK loader
├── pages/
│   └── customer/
│       └── Checkout.jsx          # Checkout page with payment
└── services/
    └── index.js                  # API service functions
```

### 1. Razorpay Utility (`lib/razorpay.js`)

**Functions**:

- `loadRazorpayScript()` - Dynamically loads Razorpay SDK
- `displayRazorpay(options, onSuccess, onFailure)` - Opens payment modal

### 2. Payment Services (`services/index.js`)

```javascript
export const paymentAPI = {
  createOrder: (data) => api.post("/payments/create-order", data),
  verifyPayment: (data) => api.post("/payments/verify", data),
  handleFailure: (data) => api.post("/payments/failure", data),
  getById: (id) => api.get(`/payments/${id}`),
  getCustomerHistory: (params) =>
    api.get("/payments/customer/history", { params }),
  getInvoice: (id) => api.get(`/payments/${id}/invoice`),
};
```

### 3. Checkout Integration (`pages/customer/Checkout.jsx`)

**Key Features**:

- Payment method selection (COD, Card, UPI, Net Banking)
- Razorpay modal integration
- Payment verification
- Error handling
- Cart clearing after successful payment

**Payment Flow in Code**:

```javascript
const handlePlaceOrder = async (e) => {
  e.preventDefault();

  // 1. Create order
  const orderResponse = await orderAPI.create(orderData);
  const order = orderResponse.data.data;

  // 2. Handle COD separately
  if (paymentMethod === "cash_on_delivery") {
    navigate(`/orders/${order._id}`);
    return;
  }

  // 3. Create payment order
  const paymentResponse = await paymentAPI.createOrder({ orderId: order._id });
  const paymentData = paymentResponse.data.data;

  // 4. Display Razorpay
  await displayRazorpay(
    razorpayOptions,
    async (response) => {
      // Success: Verify payment
      await paymentAPI.verifyPayment({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        paymentId: paymentData.payment._id,
      });
      navigate(`/orders/${order._id}`);
    },
    async (error) => {
      // Failure: Record error
      await paymentAPI.handleFailure({
        paymentId: paymentData.payment._id,
        error: error.error,
      });
    }
  );
};
```

---

## Payment Flow

### Complete User Journey

```
1. User adds items to cart
   ↓
2. Goes to checkout page
   ↓
3. Selects shipping address
   ↓
4. Chooses payment method
   - Cash on Delivery → Order created → Navigate to order page
   - Online Payment → Continue below
   ↓
5. Places order
   ↓
6. Backend creates:
   - Order in database
   - Payment record
   - Razorpay order
   ↓
7. Frontend receives Razorpay details
   ↓
8. Opens Razorpay payment modal
   ↓
9. User completes payment on Razorpay
   ↓
10. Razorpay returns response
    ↓
11. Frontend sends verification request
    ↓
12. Backend verifies signature
    ↓
13. Updates payment status → "completed"
    ↓
14. Updates order status → "confirmed"
    ↓
15. Clears cart
    ↓
16. Navigates to order details page
```

### Error Handling Flow

```
Payment Failed/Cancelled
   ↓
Frontend receives error
   ↓
Sends failure notification to backend
   ↓
Backend records failure reason
   ↓
Payment status → "failed"
   ↓
User sees error message
   ↓
Can retry from order page (future feature)
```

---

## Testing

### Test Mode Setup

1. Use Razorpay Test API Keys
2. Test payment methods available:
   - **Test Card**: `4111 1111 1111 1111`
   - **Test CVV**: Any 3 digits
   - **Test Expiry**: Any future date
   - **Test UPI**: `success@razorpay`
   - **Test Net Banking**: Select any bank

### Test Scenarios

#### ✅ Successful Payment

1. Add products to cart
2. Go to checkout
3. Select "Credit/Debit Card" or "UPI"
4. Complete payment with test credentials
5. Verify:
   - Payment status: "completed"
   - Order status: "confirmed"
   - Cart cleared
   - Redirected to order page

#### ❌ Failed Payment

1. Add products to cart
2. Go to checkout
3. Select online payment
4. Cancel Razorpay modal
5. Verify:
   - Payment status: "failed"
   - Order status: "pending"
   - Error message displayed
   - Cart not cleared

#### 💰 Cash on Delivery

1. Add products to cart
2. Go to checkout
3. Select "Cash on Delivery"
4. Place order
5. Verify:
   - Order created immediately
   - No Razorpay modal
   - Redirected to order page

### API Testing with Postman

**1. Create Payment Order**

```
POST http://localhost:8000/api/payments/create-order
Headers: Authorization: Bearer {jwt_token}
Body: { "orderId": "order_id_here" }
```

**2. Verify Payment**

```
POST http://localhost:8000/api/payments/verify
Headers: Authorization: Bearer {jwt_token}
Body: {
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx",
  "paymentId": "payment_id"
}
```

---

## Security

### Backend Security Measures

1. **Signature Verification**

   - Every payment verified using HMAC SHA256
   - Prevents payment tampering

2. **JWT Authentication**

   - All payment APIs require valid JWT token
   - User can only access their own payments

3. **Environment Variables**

   - API secrets stored securely
   - Never exposed to frontend

4. **Amount Validation**
   - Backend calculates amount independently
   - Frontend amount not trusted

### Frontend Security Measures

1. **Dynamic Script Loading**

   - Razorpay SDK loaded only when needed
   - Reduces initial bundle size

2. **HTTPS Only**

   - Payment page must use HTTPS in production
   - Enforced by Razorpay

3. **No Sensitive Data Storage**
   - Payment details not stored locally
   - Only transaction IDs stored

### Best Practices

✅ **DO**:

- Use HTTPS in production
- Validate all inputs
- Log all payment transactions
- Implement webhook for payment notifications (optional)
- Test with Razorpay test mode first
- Handle all error cases gracefully
- Clear cart only after successful payment verification

❌ **DON'T**:

- Store Razorpay key secret in frontend
- Trust amount from frontend
- Skip signature verification
- Expose payment credentials
- Ignore payment failures

---

## Troubleshooting

### Common Issues

**1. Razorpay Script Not Loading**

```javascript
// Check browser console for CORS errors
// Ensure internet connection is active
// Try loading script manually in browser console:
const script = document.createElement("script");
script.src = "https://checkout.razorpay.com/v1/checkout.js";
document.body.appendChild(script);
```

**2. Payment Verification Failing**

- Check if Razorpay key secret is correct
- Verify signature generation logic
- Ensure order ID and payment ID are correct
- Check backend logs for detailed error

**3. Payment Modal Not Opening**

- Check if Razorpay script loaded successfully
- Verify Razorpay key ID is correct
- Check browser console for JavaScript errors

**4. Order Created but Payment Not Processing**

- Check network tab for API errors
- Verify payment endpoint is accessible
- Check if user is authenticated
- Review backend logs

---

## Production Checklist

Before going live:

- [ ] Replace test API keys with live keys
- [ ] Enable HTTPS on frontend and backend
- [ ] Set up Razorpay webhooks for payment notifications
- [ ] Test with real payment methods (small amounts)
- [ ] Implement refund functionality
- [ ] Set up payment failure alerts
- [ ] Configure email notifications for payments
- [ ] Test payment flow on mobile devices
- [ ] Review security measures
- [ ] Set up monitoring and logging
- [ ] Configure Razorpay payment methods (disable if needed)
- [ ] Set business details in Razorpay dashboard
- [ ] Complete KYC verification on Razorpay
- [ ] Configure settlement schedule

---

## API Reference

### Payment Model Schema

```javascript
{
  transactionId: String (unique, auto-generated),
  order: ObjectId (ref: Order),
  customer: ObjectId (ref: User),
  amount: Number,
  paymentMethod: String (card|upi|net_banking|cash_on_delivery),
  status: String (pending|completed|failed|refunded),
  paymentGatewayResponse: Mixed,
  paidAt: Date,
  failureReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Status Lifecycle

```
pending → completed (successful payment)
pending → failed (payment error)
completed → refunded (refund processed)
```

---

## Support & Resources

- **Razorpay Documentation**: https://razorpay.com/docs/
- **Razorpay Integration Guide**: https://razorpay.com/docs/payments/payment-gateway/web-integration/
- **Razorpay Test Cards**: https://razorpay.com/docs/payments/payments/test-card-details/
- **Razorpay Support**: https://razorpay.com/support/

---

## Future Enhancements

1. **Webhook Integration**

   - Real-time payment status updates
   - Automatic order confirmation

2. **Retry Payment**

   - Allow users to retry failed payments
   - Resume pending orders

3. **Saved Cards**

   - Store customer card details (via Razorpay)
   - Quick checkout for returning customers

4. **Payment Analytics**

   - Dashboard for payment statistics
   - Success/failure rate tracking

5. **Refund Management**

   - Admin panel for processing refunds
   - Partial refund support

6. **International Payments**

   - Multi-currency support
   - Regional payment methods

7. **EMI Options**
   - No-cost EMI
   - Card EMI options

---

## Version History

- **v1.0.0** (Current) - Initial Razorpay integration
  - Basic payment processing
  - COD support
  - Payment verification
  - Error handling

---

## License

This integration is part of the Agriather platform. All rights reserved.
