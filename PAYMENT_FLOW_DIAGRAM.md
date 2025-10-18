# Razorpay Payment Flow - Visual Guide

## 🎯 Complete Payment Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CUSTOMER PAYMENT JOURNEY                         │
└─────────────────────────────────────────────────────────────────────────┘

1. SHOPPING PHASE
   ┌──────────┐
   │  Browse  │
   │ Products │
   └─────┬────┘
         │
         ▼
   ┌──────────┐
   │   Add    │
   │ to Cart  │
   └─────┬────┘
         │
         ▼
   ┌──────────┐
   │ Checkout │
   │   Page   │
   └─────┬────┘
         │
         ▼

2. CHECKOUT PHASE
   ┌─────────────────────────┐
   │ Select Shipping Address │
   └───────────┬─────────────┘
               │
               ▼
   ┌─────────────────────────┐
   │  Choose Payment Method  │
   └───────────┬─────────────┘
               │
               ├─────────────────────┬─────────────────────┐
               │                     │                     │
               ▼                     ▼                     ▼
   ┌───────────────────┐  ┌─────────────────┐  ┌─────────────────┐
   │  Cash on Delivery │  │ Credit/Debit    │  │  UPI / Net      │
   │       (COD)       │  │      Card       │  │    Banking      │
   └─────────┬─────────┘  └────────┬────────┘  └────────┬────────┘
             │                     │                     │
             │                     └──────────┬──────────┘
             │                                │
             ▼                                ▼
   ┌──────────────────┐        ┌──────────────────────────┐
   │  BACKEND FLOW    │        │    RAZORPAY FLOW         │
   │    (COD Path)    │        │   (Online Payment)       │
   └──────────────────┘        └──────────────────────────┘

═══════════════════════════════════════════════════════════════════════════

3A. COD FLOW (Simple Path)

   Frontend                Backend                 Database
      │                       │                        │
      │  POST /orders/create  │                        │
      ├──────────────────────>│                        │
      │                       │   Create Order         │
      │                       ├───────────────────────>│
      │                       │                        │
      │                       │   Create Payment       │
      │                       │   (status: pending)    │
      │                       ├───────────────────────>│
      │                       │                        │
      │   Order Created ✓     │                        │
      │<──────────────────────┤                        │
      │                       │                        │
      │  Navigate to Order    │                        │
      │  Details Page         │                        │
      │                       │                        │

═══════════════════════════════════════════════════════════════════════════

3B. ONLINE PAYMENT FLOW (Razorpay Path)

   Frontend              Backend              Razorpay           Database
      │                     │                     │                 │
      │                     │                     │                 │
   ┌──┴──────────────────────────────────────────────────────────────┐
   │ STEP 1: Create Order                                            │
   └──┬──────────────────────────────────────────────────────────────┘
      │                     │                     │                 │
      │ POST /orders/create │                     │                 │
      ├────────────────────>│                     │                 │
      │                     │  Save Order         │                 │
      │                     ├─────────────────────────────────────>│
      │                     │                     │                 │
      │  Order Created ✓    │                     │                 │
      │<────────────────────┤                     │                 │
      │                     │                     │                 │
   ┌──┴──────────────────────────────────────────────────────────────┐
   │ STEP 2: Create Payment Order                                    │
   └──┬──────────────────────────────────────────────────────────────┘
      │                     │                     │                 │
      │ POST /payments/     │                     │                 │
      │   create-order      │                     │                 │
      ├────────────────────>│                     │                 │
      │                     │  Save Payment       │                 │
      │                     │  (status: pending)  │                 │
      │                     ├─────────────────────────────────────>│
      │                     │                     │                 │
      │                     │ Create Razorpay     │                 │
      │                     │      Order          │                 │
      │                     ├────────────────────>│                 │
      │                     │                     │                 │
      │                     │  Order Created      │                 │
      │                     │  {order_id, amount} │                 │
      │                     │<────────────────────┤                 │
      │                     │                     │                 │
      │ Razorpay Details ✓  │                     │                 │
      │ {order_id, key_id}  │                     │                 │
      │<────────────────────┤                     │                 │
      │                     │                     │                 │
   ┌──┴──────────────────────────────────────────────────────────────┐
   │ STEP 3: Display Razorpay Modal                                  │
   └──┬──────────────────────────────────────────────────────────────┘
      │                     │                     │                 │
      │  Open Razorpay      │                     │                 │
      │  Checkout Modal     │                     │                 │
      ├─────────────────────────────────────────>│                 │
      │                     │                     │                 │
      │  ┌──────────────────────────────────┐    │                 │
      │  │   RAZORPAY PAYMENT MODAL         │    │                 │
      │  │                                  │    │                 │
      │  │  Enter Card / UPI / Net Banking │    │                 │
      │  │                                  │    │                 │
      │  │  [Pay ₹1500]                     │    │                 │
      │  │                                  │    │                 │
      │  └──────────────────────────────────┘    │                 │
      │                     │                     │                 │
      │                     │   Process Payment   │                 │
      │                     │<────────────────────┤                 │
      │                     │                     │                 │
   ┌──┴──────────────────────────────────────────────────────────────┐
   │ STEP 4: Payment Response                                        │
   └──┬──────────────────────────────────────────────────────────────┘
      │                     │                     │                 │
      │  Payment Success    │                     │                 │
      │  {payment_id,       │                     │                 │
      │   order_id,         │                     │                 │
      │   signature}        │                     │                 │
      │<────────────────────────────────────────┤                 │
      │                     │                     │                 │
   ┌──┴──────────────────────────────────────────────────────────────┐
   │ STEP 5: Verify Payment                                          │
   └──┬──────────────────────────────────────────────────────────────┘
      │                     │                     │                 │
      │ POST /payments/     │                     │                 │
      │      verify         │                     │                 │
      ├────────────────────>│                     │                 │
      │                     │                     │                 │
      │                     │ Verify Signature    │                 │
      │                     │ (HMAC SHA256)       │                 │
      │                     │                     │                 │
      │                     │  Fetch Payment      │                 │
      │                     │     Details         │                 │
      │                     ├────────────────────>│                 │
      │                     │                     │                 │
      │                     │  Payment Info ✓     │                 │
      │                     │<────────────────────┤                 │
      │                     │                     │                 │
      │                     │ Update Payment      │                 │
      │                     │ (status: completed) │                 │
      │                     ├─────────────────────────────────────>│
      │                     │                     │                 │
      │                     │ Update Order        │                 │
      │                     │ (status: confirmed) │                 │
      │                     ├─────────────────────────────────────>│
      │                     │                     │                 │
      │  Verification ✓     │                     │                 │
      │<────────────────────┤                     │                 │
      │                     │                     │                 │
   ┌──┴──────────────────────────────────────────────────────────────┐
   │ STEP 6: Complete Order                                          │
   └──┬──────────────────────────────────────────────────────────────┘
      │                     │                     │                 │
      │  Clear Cart         │                     │                 │
      │                     │                     │                 │
      │  Navigate to        │                     │                 │
      │  Order Details      │                     │                 │
      │                     │                     │                 │
      │  Show Success ✓     │                     │                 │
      │                     │                     │                 │

═══════════════════════════════════════════════════════════════════════════

4. ERROR HANDLING FLOW

   ┌─────────────────────────────────────────────┐
   │  Payment Failed / Cancelled                 │
   └───────────────┬─────────────────────────────┘
                   │
                   ▼
   ┌──────────────────────────────────────────────┐
   │ POST /payments/failure                       │
   │ - Record failure reason                      │
   │ - Update payment status to "failed"          │
   └───────────────┬──────────────────────────────┘
                   │
                   ▼
   ┌──────────────────────────────────────────────┐
   │ Show Error Message to User                   │
   │ - Keep order in "pending" state              │
   │ - Don't clear cart                           │
   │ - Allow retry (future feature)               │
   └──────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════

5. DATABASE STATE CHANGES

   Order Status Flow:
   ┌─────────┐    Payment Success    ┌───────────┐
   │ Pending ├──────────────────────>│ Confirmed │
   └─────────┘                       └───────────┘
                                           │
                                           ▼
                                     ┌────────────┐
                                     │ Processing │
                                     └─────┬──────┘
                                           │
                                           ▼
                                     ┌─────────┐
                                     │ Shipped │
                                     └────┬────┘
                                          │
                                          ▼
                                     ┌───────────┐
                                     │ Delivered │
                                     └───────────┘

   Payment Status Flow:
   ┌─────────┐    Razorpay Success    ┌───────────┐
   │ Pending ├───────────────────────>│ Completed │
   └────┬────┘                        └───────────┘
        │
        │ Razorpay Failed
        ▼
   ┌────────┐
   │ Failed │
   └────────┘
        │
        │ Refund Processed
        ▼
   ┌──────────┐
   │ Refunded │
   └──────────┘

═══════════════════════════════════════════════════════════════════════════

6. SECURITY CHECKS

   ┌─────────────────────────────────────────────────────┐
   │            Payment Verification Process             │
   └─────────────────────────────────────────────────────┘

   1. Frontend receives:
      - razorpay_order_id
      - razorpay_payment_id
      - razorpay_signature

   2. Backend creates signature:
      text = razorpay_order_id + "|" + razorpay_payment_id
      expected_signature = HMAC_SHA256(text, key_secret)

   3. Compare:
      if (expected_signature === razorpay_signature) {
         ✓ Payment Valid
      } else {
         ✗ Payment Invalid - Reject
      }

═══════════════════════════════════════════════════════════════════════════

7. KEY COMPONENTS

   Frontend:
   ├── Checkout.jsx           (Main checkout page)
   ├── lib/razorpay.js       (Razorpay SDK loader)
   └── services/index.js      (Payment API calls)

   Backend:
   ├── controllers/payment.controller.js  (Payment logic)
   ├── routes/payment.routes.js          (Payment routes)
   ├── utils/razorpay.js                 (Razorpay utilities)
   └── models/payment.model.js           (Payment schema)

═══════════════════════════════════════════════════════════════════════════

8. API ENDPOINTS SUMMARY

   ┌────────┬─────────────────────────────┬─────────────────────────┐
   │ Method │         Endpoint            │      Description        │
   ├────────┼─────────────────────────────┼─────────────────────────┤
   │ POST   │ /api/orders/create          │ Create new order        │
   │ POST   │ /api/payments/create-order  │ Create Razorpay order   │
   │ POST   │ /api/payments/verify        │ Verify payment          │
   │ POST   │ /api/payments/failure       │ Record failure          │
   │ GET    │ /api/payments/:id           │ Get payment details     │
   │ GET    │ /api/payments/customer/...  │ Payment history         │
   └────────┴─────────────────────────────┴─────────────────────────┘

═══════════════════════════════════════════════════════════════════════════
```
