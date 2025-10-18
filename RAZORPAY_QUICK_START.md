# Razorpay Payment Integration - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Razorpay Credentials

1. **Sign up** at [Razorpay](https://dashboard.razorpay.com/signup)
2. Go to **Settings** → **API Keys**
3. Click **Generate Test Keys** (or Live Keys for production)
4. Copy your `Key ID` and `Key Secret`

### Step 2: Configure Environment Variables

Open `backend/.env` and add your Razorpay credentials:

```env
RAZORPAY_KEY_ID="rzp_test_your_key_id_here"
RAZORPAY_KEY_SECRET="your_key_secret_here"
```

⚠️ **Important**:

- Use **Test Keys** for development/testing
- Use **Live Keys** only for production
- Never commit the `.env` file to Git

### Step 3: Restart Backend Server

```bash
cd backend
npm run dev
```

### Step 4: Test Payment Flow

1. **Test with COD** (No Razorpay needed):

   - Add products to cart
   - Go to checkout
   - Select "Cash on Delivery"
   - Place order ✅

2. **Test with Online Payment**:
   - Add products to cart
   - Go to checkout
   - Select "Credit/Debit Card", "UPI", or "Net Banking"
   - Place order
   - Use Razorpay test credentials:

#### Razorpay Test Credentials

**Test Card**:

- Card Number: `4111 1111 1111 1111`
- CVV: `123` (any 3 digits)
- Expiry: `12/25` (any future date)
- Name: Any name

**Test UPI**:

- UPI ID: `success@razorpay`

**Test Net Banking**:

- Select any bank
- Click "Success" on the test page

---

## 🎯 What's Included

### ✅ Backend Features

- ✅ Razorpay order creation
- ✅ Payment signature verification
- ✅ Payment status tracking
- ✅ COD support
- ✅ Payment history
- ✅ Secure API endpoints
- ✅ Error handling

### ✅ Frontend Features

- ✅ Dynamic Razorpay SDK loading
- ✅ Payment method selection
- ✅ Razorpay payment modal
- ✅ Payment verification
- ✅ Cart clearing after payment
- ✅ Error handling & user feedback
- ✅ Order confirmation flow

---

## 📊 Payment Flow

```
Customer Journey:
1. Browse Products → 2. Add to Cart → 3. Checkout
                                          ↓
                              4. Select Payment Method
                                    ↙          ↘
                              COD          Online Payment
                               ↓                 ↓
                      5. Order Created   5. Razorpay Modal
                               ↓                 ↓
                      6. Order Page     6. Complete Payment
                                                ↓
                                       7. Verify Payment
                                                ↓
                                       8. Update Order
                                                ↓
                                       9. Clear Cart
                                                ↓
                                       10. Order Page
```

---

## 🔧 API Endpoints

| Method | Endpoint                           | Description              |
| ------ | ---------------------------------- | ------------------------ |
| POST   | `/api/payments/create-order`       | Create Razorpay order    |
| POST   | `/api/payments/verify`             | Verify payment signature |
| POST   | `/api/payments/failure`            | Record payment failure   |
| GET    | `/api/payments/customer/history`   | Get payment history      |
| GET    | `/api/payments/:paymentId`         | Get payment details      |
| GET    | `/api/payments/:paymentId/invoice` | Get payment invoice      |

---

## 🧪 Testing Scenarios

### ✅ Test Case 1: Successful Card Payment

1. Add product to cart
2. Go to checkout
3. Select "Credit/Debit Card"
4. Enter test card: `4111 1111 1111 1111`
5. Complete payment
6. **Expected**: Order confirmed, cart cleared, redirected to order page

### ✅ Test Case 2: Successful UPI Payment

1. Add product to cart
2. Go to checkout
3. Select "UPI"
4. Enter UPI: `success@razorpay`
5. **Expected**: Order confirmed, payment successful

### ✅ Test Case 3: Payment Cancellation

1. Add product to cart
2. Go to checkout
3. Select any online payment
4. Click "Close" on Razorpay modal
5. **Expected**: Error message, order remains pending

### ✅ Test Case 4: Cash on Delivery

1. Add product to cart
2. Go to checkout
3. Select "Cash on Delivery"
4. **Expected**: Order created immediately, no payment modal

---

## 🛡️ Security Features

✅ **Signature Verification**: Every payment verified using HMAC SHA256  
✅ **JWT Authentication**: All APIs protected with authentication  
✅ **Environment Variables**: Secrets never exposed to frontend  
✅ **Amount Validation**: Server-side validation prevents tampering  
✅ **HTTPS Only**: Enforced in production

---

## 🐛 Troubleshooting

### Issue: "Razorpay script failed to load"

**Solution**: Check internet connection and browser console for CORS errors

### Issue: "Payment verification failed"

**Solution**: Ensure `RAZORPAY_KEY_SECRET` is correct in `.env` file

### Issue: "Payment modal not opening"

**Solution**: Check if `RAZORPAY_KEY_ID` is correct and script loaded successfully

### Issue: "Order created but payment not processing"

**Solution**: Check backend logs, ensure payment endpoint is accessible

---

## 📱 Mobile Testing

Test on various devices:

- ✅ Desktop browsers (Chrome, Firefox, Safari)
- ✅ Mobile browsers (iOS Safari, Android Chrome)
- ✅ Tablet browsers
- ✅ Different screen sizes (responsive design)

---

## 🚀 Going to Production

### Pre-Launch Checklist

- [ ] Replace test keys with **live Razorpay keys**
- [ ] Enable **HTTPS** on frontend and backend
- [ ] Test with **real payment methods** (small amounts)
- [ ] Complete **KYC verification** on Razorpay dashboard
- [ ] Configure **payment methods** (enable/disable)
- [ ] Set up **business details** in Razorpay
- [ ] Configure **settlement schedule**
- [ ] Test on **mobile devices**
- [ ] Set up **email notifications**
- [ ] Configure **webhooks** (optional but recommended)
- [ ] Review all **security measures**
- [ ] Set up **monitoring and alerts**

---

## 📚 Additional Resources

- **Full Documentation**: See `RAZORPAY_INTEGRATION.md`
- **Razorpay Docs**: https://razorpay.com/docs/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-details/
- **Support**: https://razorpay.com/support/

---

## 💡 Tips

1. **Always test in Test Mode** before going live
2. **Monitor payment failures** and investigate patterns
3. **Clear cart only after successful verification**
4. **Log all payment transactions** for audit trail
5. **Handle network errors** gracefully with retries
6. **Show clear error messages** to users
7. **Send email confirmations** for successful payments

---

## 🎉 Success!

Your Razorpay payment integration is complete!

**Next Steps**:

1. Test all payment scenarios
2. Review the full documentation
3. Configure your Razorpay dashboard settings
4. Go live when ready!

**Need Help?** Check `RAZORPAY_INTEGRATION.md` for detailed documentation.

---

**Made with ❤️ for Agriather Platform**
