# 🎯 Razorpay Payment Integration - User Guide

## For Developers

### Quick Setup (5 Minutes)

#### Step 1: Get Your Razorpay Keys

```
1. Visit https://dashboard.razorpay.com/signup
2. Sign up for free account
3. Go to Settings → API Keys
4. Click "Generate Test Key"
5. Copy your Key ID and Key Secret
```

#### Step 2: Configure Environment

```bash
# Open backend/.env and add these lines:
RAZORPAY_KEY_ID="rzp_test_YOUR_KEY_ID_HERE"
RAZORPAY_KEY_SECRET="YOUR_KEY_SECRET_HERE"
```

#### Step 3: Install & Run

```bash
# Backend is already configured!
# Just restart the server:
cd backend
npm run dev
```

#### Step 4: Test

```
1. Go to http://localhost:5173
2. Add products to cart
3. Proceed to checkout
4. Select payment method
5. Complete test payment
```

---

## For End Users (Customers)

### How to Make a Payment

#### Option 1: Cash on Delivery (COD)

```
1. 🛒 Add products to cart
2. 🏠 Go to checkout
3. 📍 Select shipping address
4. 💵 Choose "Cash on Delivery"
5. 📝 Click "Place Order"
6. ✅ Done! Pay when you receive the product
```

#### Option 2: Online Payment (Card/UPI/Net Banking)

```
1. 🛒 Add products to cart
2. 🏠 Go to checkout
3. 📍 Select shipping address
4. 💳 Choose payment method:
   - Credit/Debit Card
   - UPI
   - Net Banking
5. 📝 Click "Place Order"
6. 💰 Razorpay payment window opens
7. 💳 Enter payment details
8. ✅ Complete payment
9. 🎉 Order confirmed!
```

---

## Payment Methods Guide

### 💳 Credit/Debit Card

```
What you need:
- Card number (16 digits)
- Expiry date (MM/YY)
- CVV (3 digits on back)
- Cardholder name

Supported cards:
✅ Visa
✅ Mastercard
✅ American Express
✅ Rupay

Processing time: Instant
```

### 📱 UPI (Unified Payments Interface)

```
What you need:
- UPI ID (yourname@bank)
  OR
- Use UPI app (GPay, PhonePe, Paytm, etc.)

How it works:
1. Enter your UPI ID or scan QR code
2. Open your UPI app
3. Approve the payment request
4. Done!

Processing time: Instant
```

### 🏦 Net Banking

```
What you need:
- Online banking credentials
- Bank account with internet banking enabled

How it works:
1. Select your bank from the list
2. Enter your banking credentials
3. Complete payment on bank's website
4. Redirected back to our site

Processing time: Instant to 5 minutes
```

### 💵 Cash on Delivery (COD)

```
What you need:
- Cash ready when delivery arrives

How it works:
1. Place order without paying online
2. Wait for delivery
3. Pay cash to delivery person
4. Receive your product

Processing time: No online payment needed
```

---

## Test Payment Credentials

### 🧪 For Testing Only

#### Test Card Details

```
Card Number:  4111 1111 1111 1111
CVV:          123 (any 3 digits)
Expiry:       12/25 (any future date)
Name:         Test User (any name)

Result: Payment will succeed
```

#### Test UPI

```
UPI ID: success@razorpay

Result: Payment will succeed
```

#### Test Net Banking

```
1. Select any bank
2. You'll see a test page
3. Click "Success" button

Result: Payment will succeed
```

#### Test Failure

```
Use card: 4000 0000 0000 0002
Result: Payment will fail (for testing error handling)
```

---

## Visual Payment Flow

### 🛍️ Shopping to Payment

```
                    START HERE
                        │
                        ▼
        ┌───────────────────────────────┐
        │   Browse Products & Add to    │
        │          Cart 🛒               │
        └──────────────┬────────────────┘
                       │
                       ▼
        ┌───────────────────────────────┐
        │      Go to Checkout 🏠         │
        │  - View cart summary           │
        │  - See total amount            │
        └──────────────┬────────────────┘
                       │
                       ▼
        ┌───────────────────────────────┐
        │   Select Shipping Address 📍   │
        │  - Choose existing address     │
        │  - Or add new address          │
        └──────────────┬────────────────┘
                       │
                       ▼
        ┌───────────────────────────────┐
        │   Choose Payment Method 💳     │
        └──────────────┬────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌───────────────┐           ┌────────────────────┐
│  💵 Cash on   │           │  💳 Online Payment │
│   Delivery    │           │  (Card/UPI/Bank)   │
└───────┬───────┘           └─────────┬──────────┘
        │                             │
        ▼                             ▼
┌───────────────┐           ┌────────────────────┐
│ Order Placed! │           │ Razorpay Window    │
│ No payment    │           │ Opens 💰           │
│ needed now    │           └─────────┬──────────┘
└───────┬───────┘                     │
        │                             ▼
        │                   ┌────────────────────┐
        │                   │ Enter Payment      │
        │                   │ Details 💳         │
        │                   └─────────┬──────────┘
        │                             │
        │                             ▼
        │                   ┌────────────────────┐
        │                   │ Payment Processing │
        │                   │ ⏳ Please wait...  │
        │                   └─────────┬──────────┘
        │                             │
        │                   ┌─────────┴─────────┐
        │                   │                   │
        │                   ▼                   ▼
        │         ┌────────────────┐   ┌──────────────┐
        │         │ ✅ Success!    │   │ ❌ Failed    │
        │         └───────┬────────┘   └──────┬───────┘
        │                 │                    │
        │                 ▼                    ▼
        │         ┌────────────────┐   ┌──────────────┐
        │         │ Order          │   │ Try Again or │
        │         │ Confirmed! 🎉  │   │ Use COD      │
        │         └───────┬────────┘   └──────────────┘
        │                 │
        │                 ▼
        └───────────────► ┌────────────────────┐
                          │ View Order Details │
                          │ Track Shipment 📦  │
                          └────────────────────┘
                                    │
                                    ▼
                          ┌────────────────────┐
                          │   ORDER COMPLETE   │
                          │        🎊          │
                          └────────────────────┘
```

---

## Common Questions

### ❓ Is it safe to pay online?

✅ Yes! All payments are processed through Razorpay, a certified payment gateway.
✅ Your card details are never stored on our servers.
✅ All transactions are encrypted with SSL/TLS.
✅ Razorpay is PCI-DSS compliant.

### ❓ What if my payment fails?

- Don't worry! Your money won't be deducted.
- If money is deducted, it will be auto-refunded in 5-7 business days.
- You can try again or choose a different payment method.
- Contact support if issues persist.

### ❓ When will my payment be confirmed?

- Card/UPI/Net Banking: Instant (within seconds)
- COD: Confirmed when you place order

### ❓ Can I cancel after payment?

- Contact support immediately
- If order not shipped, we can process refund
- Refunds take 5-7 business days

### ❓ Will I get a receipt?

✅ Yes! You'll receive:

- Email confirmation
- Payment receipt
- Order invoice
- All available in your account

### ❓ Can I use multiple payment methods?

- Currently, one payment method per order
- Choose the most convenient option for you

### ❓ What about Cash on Delivery?

✅ Available for orders
✅ Pay when you receive the product
✅ Keep exact cash ready
✅ No online payment needed

---

## Troubleshooting

### 🔧 Payment not going through?

**Check these:**

1. ✅ Internet connection stable?
2. ✅ Sufficient balance in account?
3. ✅ Card details entered correctly?
4. ✅ Card not expired?
5. ✅ International transactions enabled (if applicable)?
6. ✅ Try different browser or device?

**Still not working?**

- Try a different payment method
- Use COD as alternative
- Contact your bank
- Contact our support

### 🔧 Razorpay window not opening?

**Try:**

1. ✅ Disable popup blocker
2. ✅ Clear browser cache
3. ✅ Try different browser
4. ✅ Check internet connection
5. ✅ Disable browser extensions

### 🔧 Payment deducted but order not confirmed?

**Don't panic!**

1. Check your email for confirmation
2. Check "My Orders" section
3. Wait 10 minutes and refresh
4. Contact support with transaction details
5. Money will be refunded if order not placed

---

## Contact Support

### Need Help?

**Email:** support@agriather.com  
**Phone:** 1800-XXX-XXXX  
**Working Hours:** 9 AM - 6 PM (Mon-Sat)

**What to provide:**

- Order number (if applicable)
- Transaction ID
- Payment method used
- Screenshot of error (if any)
- Your registered email

---

## Security Tips

### 🔒 Keep Your Payment Safe

✅ **DO:**

- Use secure internet connection
- Verify website URL (https://)
- Keep passwords confidential
- Use strong passwords
- Enable 2FA on banking apps
- Check transaction SMS/email
- Save payment receipts

❌ **DON'T:**

- Share OTP with anyone
- Save card details on public computers
- Use public WiFi for payments
- Share banking passwords
- Click suspicious payment links
- Share CVV number

---

## Benefits of Online Payment

### 🎁 Why Pay Online?

✅ **Instant Confirmation**

- Order confirmed immediately
- Faster processing

✅ **Cashless**

- No need to keep cash ready
- Safe and convenient

✅ **Multiple Options**

- Choose your preferred method
- Card, UPI, Net Banking

✅ **Secure**

- Encrypted transactions
- PCI-DSS compliant
- Protected by Razorpay

✅ **Track Everything**

- Complete payment history
- Digital receipts
- Easy refunds if needed

✅ **Rewards**

- Bank cashbacks (if applicable)
- Card rewards points
- Special offers

---

## Quick Reference

### Payment Method Comparison

| Method         | Speed          | Convenience | Best For          |
| -------------- | -------------- | ----------- | ----------------- |
| 💳 Card        | ⚡ Instant     | ⭐⭐⭐⭐⭐  | Quick checkout    |
| 📱 UPI         | ⚡ Instant     | ⭐⭐⭐⭐⭐  | Mobile users      |
| 🏦 Net Banking | ⚡ Fast        | ⭐⭐⭐      | Large amounts     |
| 💵 COD         | ⏰ On delivery | ⭐⭐⭐      | No online payment |

---

## Success! 🎉

You're all set to make secure payments on Agriather!

**Happy Shopping! 🛒**

---

_Last Updated: October 18, 2025_  
_Version: 1.0_
