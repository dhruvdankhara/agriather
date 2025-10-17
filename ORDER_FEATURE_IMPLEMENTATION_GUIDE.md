# Place Order Feature - Implementation Guide

## ✅ What's Already Done

### 1. Backend (100% Complete)

- ✅ Order model with all fields
- ✅ Order controller with all endpoints
- ✅ Order routes registered
- ✅ Payment integration ready
- ✅ Stock management on order
- ✅ Order status tracking
- ✅ Cancel order functionality

### 2. Frontend (Partial)

- ✅ Order Redux slice created (`orderSlice.js`)
- ✅ Order slice added to store
- ✅ Order API services ready
- ❌ Need to create/fix Checkout page
- ❌ Need to create/fix Orders page
- ❌ Need to create/fix OrderDetail page

---

## 📋 Implementation Steps for Customer Order Flow

### Step 1: Create Checkout Page (`/client/src/pages/customer/Checkout.jsx`)

**Key Features:**

1. Display cart items summary
2. Select/Add shipping address
3. Choose payment method
4. Add order notes (optional)
5. Show order total (subtotal + tax + shipping)
6. Place order button

**Backend Requirements:**

```javascript
// Order creation requires:
{
  shippingAddressId: "address._id", // From user.shippingAddresses
  paymentMethod: "cash_on_delivery" | "card" | "upi" | "net_banking",
  notes: "optional string"
}
```

**Tax & Shipping Logic (Must Match Backend):**

```javascript
const tax = totalAmount * 0.18; // 18% GST
const shippingCharges = totalAmount > 500 ? 0 : 50; // Free above ₹500
const finalTotal = totalAmount + tax + shippingCharges;
```

**Redux Dispatch:**

```javascript
import { createOrder } from "../../store/slices/orderSlice";

const handlePlaceOrder = async () => {
  const orderData = {
    shippingAddressId: selectedAddressId,
    paymentMethod,
    notes,
  };

  const result = await dispatch(createOrder(orderData)).unwrap();
  // Navigate to order detail: /customer/orders/{result.order._id}
};
```

---

### Step 2: Create Orders List Page (`/client/src/pages/customer/Orders.jsx`)

**Key Features:**

1. Fetch and display all customer orders
2. Show order number, date, status, total
3. Show order items with images
4. Cancel button (only for pending orders)
5. View details button
6. Filter by status (optional)
7. Pagination (optional)

**Redux Integration:**

```javascript
import {
  fetchCustomerOrders,
  cancelOrder,
} from "../../store/slices/orderSlice";

useEffect(() => {
  dispatch(fetchCustomerOrders());
}, []);

const { orders, loading } = useSelector((state) => state.order);
```

**Cancel Order:**

```javascript
const handleCancel = async (orderId) => {
  await dispatch(
    cancelOrder({
      orderId,
      cancellationReason: "Customer request",
    })
  ).unwrap();
  toast.success("Order cancelled successfully");
};
```

**Status Badge Colors:**

```javascript
const getStatusColor = (status) => {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};
```

---

### Step 3: Create Order Detail Page (`/client/src/pages/customer/OrderDetail.jsx`)

**Key Features:**

1. Order summary (number, date, status)
2. Items list with images and prices
3. Shipping address
4. Payment information
5. Order status timeline
6. Cancel button (if pending)
7. Track order button
8. Download invoice button (future)

**Redux Integration:**

```javascript
import {
  fetchOrderById,
  trackOrder,
  cancelOrder,
} from "../../store/slices/orderSlice";

const { orderId } = useParams();

useEffect(() => {
  dispatch(fetchOrderById(orderId));
}, [orderId]);

const { currentOrder, loading } = useSelector((state) => state.order);
```

**Order Timeline:**

```javascript
// Display statusHistory array
{
  currentOrder?.statusHistory?.map((history) => (
    <div key={history._id}>
      <span>{history.status}</span>
      <span>{new Date(history.timestamp).toLocaleString()}</span>
      {history.note && <p>{history.note}</p>}
    </div>
  ));
}
```

---

## 📁 File Structure

```
client/src/
├── store/
│   ├── slices/
│   │   └── orderSlice.js ✅ (Created)
│   └── index.js ✅ (Updated with orderReducer)
├── pages/
│   └── customer/
│       ├── Checkout.jsx ❌ (Need to create)
│       ├── Orders.jsx ❌ (Need to create)
│       └── OrderDetail.jsx ❌ (Need to create)
└── services/
    └── index.js ✅ (orderAPI already exists)
```

---

## 🔗 Routes Configuration

Make sure your routes include:

```javascript
// In routes/index.jsx or customer routes
{
  path: '/customer/checkout',
  element: <Checkout />
},
{
  path: '/customer/orders',
  element: <Orders />
},
{
  path: '/customer/orders/:orderId',
  element: <OrderDetail />
}
```

---

## 🎯 Complete Flow

### User Journey:

1. **Browse Products** → Add to cart
2. **View Cart** → Update quantities → Proceed to checkout
3. **Checkout Page**:
   - Select/add shipping address
   - Choose payment method
   - Review order
   - Place order
4. **Order Confirmation** → Redirect to order detail
5. **My Orders** → View all orders
6. **Order Details** → Track status, cancel if needed

### Data Flow:

```
Cart Items
    ↓
Checkout Page (select address, payment)
    ↓
dispatch(createOrder({ shippingAddressId, paymentMethod, notes }))
    ↓
Backend Creates Order
    ↓
- Validates cart items
    - Checks stock availability
    - Reduces product stock
    - Calculates totals
    - Creates order record
    - Creates payment record
    - Clears cart
    ↓
Returns order + payment
    ↓
Frontend Navigates to Order Detail
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Shipping address not found"

**Solution:** Ensure `shippingAddressId` matches an `_id` from `user.shippingAddresses` array.

```javascript
// Get address ID correctly:
const addressId = user.shippingAddresses[0]._id; // NOT the index!
```

### Issue 2: "Cart is empty"

**Solution:** User must have items in cart before checkout.

```javascript
// In Checkout page:
if (!items || items.length === 0) {
  navigate("/customer/products");
  return;
}
```

### Issue 3: Orders not showing

**Solution:** Check Redux state and API response structure.

```javascript
// Backend returns:
{
  orders: [...],
  totalPages: 1,
  currentPage: 1,
  totalOrders: 5
}

// Access as:
const { orders } = useSelector((state) => state.order);
```

### Issue 4: Order total mismatch

**Solution:** Use same calculation logic as backend.

```javascript
// Frontend & Backend must match:
const tax = totalAmount * 0.18;
const shipping = totalAmount > 500 ? 0 : 50;
const final = totalAmount + tax + shipping;
```

---

## 📝 Backend API Endpoints Reference

### Customer Endpoints:

```javascript
// Create order
POST /api/v1/orders
Body: { shippingAddressId, paymentMethod, notes }
Returns: { order, payment }

// Get my orders
GET /api/v1/orders/customer/my-orders?page=1&limit=10&status=pending
Returns: { orders, totalPages, currentPage, totalOrders }

// Get order by ID
GET /api/v1/orders/:orderId
Returns: order object with populated fields

// Cancel order
PUT /api/v1/orders/:orderId/cancel
Body: { cancellationReason }
Returns: updated order

// Track order
GET /api/v1/orders/:orderId/track
Returns: { orderNumber, currentStatus, statusHistory, orderDate }
```

---

## 🎨 UI Components Needed

### From Existing UI Library:

- ✅ Button
- ✅ Card, CardHeader, CardTitle, CardContent
- ✅ Input, Label, Textarea
- ✅ Select, SelectTrigger, SelectValue, SelectContent, SelectItem
- ✅ Spinner (loading state)
- ✅ Badge (order status)

### Icons from lucide-react:

- Package (cart/order icon)
- MapPin (address icon)
- CreditCard (payment icon)
- Check (selected address checkmark)
- Plus (add new address)
- Eye (view details)
- X (cancel order)
- Truck (shipping status)
- Clock (pending status)

---

## ✅ Testing Checklist

### Checkout Page:

- [ ] Cart items display correctly
- [ ] Can select existing address
- [ ] Can add new address
- [ ] Address saves to user profile
- [ ] Payment method selection works
- [ ] Order notes are optional
- [ ] Tax & shipping calculate correctly
- [ ] "Place Order" button disabled when loading
- [ ] Success toast shows on order creation
- [ ] Redirects to order detail page
- [ ] Cart clears after order placed

### Orders Page:

- [ ] All orders load correctly
- [ ] Order status badges show correct colors
- [ ] Cancel button only shows for pending orders
- [ ] Cancel confirmation dialog works
- [ ] Order items display with images
- [ ] Clicking order navigates to detail page
- [ ] Empty state shows when no orders
- [ ] Loading spinner shows while fetching

### Order Detail Page:

- [ ] Order number displays
- [ ] Order date formatted correctly
- [ ] Status badge shows current status
- [ ] Items list with correct prices
- [ ] Shipping address displays
- [ ] Payment method shows
- [ ] Status timeline shows all history
- [ ] Subtotal, tax, shipping calculate correctly
- [ ] Final total matches
- [ ] Cancel button works (if pending)
- [ ] Back button returns to orders list

---

## 🚀 Next Steps

1. **Create the 3 page files manually** using the structures above
2. **Test the complete flow**: Cart → Checkout → Order → Orders List
3. **Handle edge cases**: Empty cart, no addresses, failed payment
4. **Add loading states** for all API calls
5. **Add error handling** with toast notifications
6. **Style consistently** with your existing design system

---

## 📞 Quick Reference

**orderSlice Actions:**

- `createOrder(orderData)` - Place new order
- `fetchCustomerOrders(params)` - Get all orders
- `fetchOrderById(orderId)` - Get single order
- `cancelOrder({ orderId, cancellationReason })` - Cancel order
- `trackOrder(orderId)` - Get tracking info

**orderSlice State:**

```javascript
{
  orders: [],
  currentOrder: null,
  tracking: null,
  totalPages: 1,
  currentPage: 1,
  totalOrders: 0,
  loading: false,
  error: null,
}
```

**Order Object Structure:**

```javascript
{
  _id: "orderId",
  orderNumber: "ORD17290012340001",
  customer: { _id, firstname, lastname, email },
  items: [
    {
      product: { _id, name, images },
      supplier: { _id, businessName },
      quantity: 2,
      price: 299,
      subtotal: 598
    }
  ],
  shippingAddress: { addressLine1, city, state, pincode, country },
  totalAmount: 598,
  tax: 107.64,
  shippingCharges: 50,
  finalAmount: 755.64,
  status: "pending",
  statusHistory: [...],
  paymentId: { ...paymentObject },
  notes: "Please deliver before 5 PM",
  createdAt: "2025-10-17T10:30:00.000Z"
}
```

---

**Status:** Ready for implementation
**Last Updated:** October 17, 2025
**Dependencies:** All backend & Redux ready ✅
