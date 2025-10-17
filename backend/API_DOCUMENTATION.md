# Agriather API Documentation

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

Most endpoints require authentication. Include the JWT token in the request:

- Cookie: `token=<jwt_token>`
- Header: `Authorization: Bearer <jwt_token>`

## User Roles

- **Admin**: Platform administrator
- **Supplier**: Product supplier (requires admin approval)
- **Customer**: End customer

---

## Authentication Endpoints

### Register

`POST /auth/register`

**Body:**

```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "role": "customer", // or "supplier"
  // Supplier specific (required if role is supplier):
  "businessName": "ABC Suppliers",
  "businessAddress": "123 Business St",
  "gstNumber": "GST123456789"
}
```

### Login

`POST /auth/login`

**Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Logout

`POST /auth/logout`

- Requires: Authentication

### Get Current User

`GET /auth/me`

- Requires: Authentication

### Update Profile

`PUT /auth/profile`

- Requires: Authentication

**Body:**

```json
{
  "firstname": "John",
  "lastname": "Doe",
  "phone": "1234567890"
}
```

### Change Password

`PUT /auth/change-password`

- Requires: Authentication

**Body:**

```json
{
  "oldPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

### Shipping Address Management (Customer)

- `POST /auth/shipping-address` - Add address
- `PUT /auth/shipping-address/:addressId` - Update address
- `DELETE /auth/shipping-address/:addressId` - Delete address

---

## Product Endpoints

### Get All Products

`GET /products`

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 12)
- `category` - Filter by category ID
- `search` - Search in name, description, tags
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `sortBy` (default: createdAt) - Field to sort by
- `order` (default: desc) - Sort order (asc/desc)
- `supplierId` - Filter by supplier

### Get Product by ID

`GET /products/:productId`

### Get Product Reviews

`GET /products/:productId/reviews`

### Get All Categories

`GET /products/categories`

### Get Category by ID

`GET /products/categories/:categoryId`

### Create Product (Supplier)

`POST /products`

- Requires: Supplier authentication

**Body:**

```json
{
  "name": "Organic Fertilizer",
  "description": "High quality organic fertilizer",
  "category": "category_id",
  "price": 500,
  "discountPrice": 450,
  "stock": 100,
  "unit": "kg",
  "images": ["url1", "url2"],
  "specifications": {
    "weight": "50kg",
    "type": "organic"
  },
  "tags": ["organic", "fertilizer"]
}
```

### Update Product (Supplier)

`PUT /products/:productId`

- Requires: Supplier authentication (own products only)

### Delete Product (Supplier)

`DELETE /products/:productId`

- Requires: Supplier authentication (own products only)

### Get Supplier's Products

`GET /products/supplier/my-products`

- Requires: Supplier authentication

---

## Cart Endpoints (Customer)

### Get Cart

`GET /cart`

- Requires: Customer authentication

### Add to Cart

`POST /cart/items`

- Requires: Customer authentication

**Body:**

```json
{
  "productId": "product_id",
  "quantity": 2
}
```

### Update Cart Item

`PUT /cart/items/:itemId`

- Requires: Customer authentication

**Body:**

```json
{
  "quantity": 3
}
```

### Remove from Cart

`DELETE /cart/items/:itemId`

- Requires: Customer authentication

### Clear Cart

`DELETE /cart`

- Requires: Customer authentication

---

## Order Endpoints

### Create Order (Customer)

`POST /orders`

- Requires: Customer authentication

**Body:**

```json
{
  "shippingAddressId": "address_id",
  "paymentMethod": "card", // or "upi", "net_banking", "cash_on_delivery"
  "notes": "Please deliver between 9-5"
}
```

### Get Customer Orders

`GET /orders/customer/my-orders`

- Requires: Customer authentication

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 10)
- `status` - Filter by status

### Get Supplier Orders

`GET /orders/supplier/my-orders`

- Requires: Supplier authentication

### Get Order by ID

`GET /orders/:orderId`

- Requires: Authentication (customer, supplier, or admin)

### Track Order (Customer)

`GET /orders/:orderId/track`

- Requires: Customer authentication

### Cancel Order (Customer)

`PUT /orders/:orderId/cancel`

- Requires: Customer authentication

**Body:**

```json
{
  "cancellationReason": "Changed my mind"
}
```

### Update Order Status (Supplier/Admin)

`PUT /orders/:orderId/status`

- Requires: Supplier or Admin authentication

**Body:**

```json
{
  "status": "shipped", // pending, confirmed, processing, shipped, delivered, cancelled
  "note": "Order shipped via FedEx"
}
```

---

## Payment Endpoints

### Process Payment (Customer)

`POST /payments/process`

- Requires: Customer authentication

**Body:**

```json
{
  "paymentId": "payment_id",
  "paymentDetails": {
    "cardNumber": "****1234",
    "method": "card"
  }
}
```

### Get Payment by ID

`GET /payments/:paymentId`

- Requires: Authentication

### Get Customer Payment History

`GET /payments/customer/history`

- Requires: Customer authentication

### Get Supplier Payment History

`GET /payments/supplier/history`

- Requires: Supplier authentication

### Get Payment Invoice

`GET /payments/:paymentId/invoice`

- Requires: Authentication

---

## Review Endpoints

### Create Review (Customer)

`POST /reviews`

- Requires: Customer authentication (delivered orders only)

**Body:**

```json
{
  "productId": "product_id",
  "orderId": "order_id",
  "rating": 5,
  "title": "Great product",
  "comment": "Very satisfied with this product",
  "images": ["url1", "url2"]
}
```

### Update Review (Customer)

`PUT /reviews/:reviewId`

- Requires: Customer authentication (own reviews only)

### Delete Review (Customer)

`DELETE /reviews/:reviewId`

- Requires: Customer authentication (own reviews only)

### Get Product Reviews

`GET /reviews/product/:productId`

### Get Customer Reviews

`GET /reviews/customer/my-reviews`

- Requires: Customer authentication

### Get Supplier Product Reviews

`GET /reviews/supplier/product-reviews`

- Requires: Supplier authentication

---

## Report Endpoints

### Supplier Sales Report

`GET /reports/supplier/sales`

- Requires: Supplier authentication

**Query Parameters:**

- `startDate` - Start date (YYYY-MM-DD)
- `endDate` - End date (YYYY-MM-DD)
- `period` - daily, weekly, monthly (default: daily)

### Supplier Product Performance

`GET /reports/supplier/products`

- Requires: Supplier authentication

### Customer Order Report

`GET /reports/customer/orders`

- Requires: Customer authentication

**Query Parameters:**

- `startDate` - Start date (YYYY-MM-DD)
- `endDate` - End date (YYYY-MM-DD)

### Admin Platform Report

`GET /reports/admin/platform`

- Requires: Admin authentication

**Query Parameters:**

- `startDate` - Start date (YYYY-MM-DD)
- `endDate` - End date (YYYY-MM-DD)

---

## Admin Endpoints

### Get Pending Suppliers

`GET /admin/suppliers/pending`

- Requires: Admin authentication

### Get All Suppliers

`GET /admin/suppliers`

- Requires: Admin authentication

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 10)
- `search` - Search by name, email, business name
- `isApproved` - Filter by approval status (true/false)

### Approve Supplier

`PUT /admin/suppliers/:supplierId/approve`

- Requires: Admin authentication

### Deactivate Supplier

`PUT /admin/suppliers/:supplierId/deactivate`

- Requires: Admin authentication

### Get All Customers

`GET /admin/customers`

- Requires: Admin authentication

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 10)
- `search` - Search by name, email

### Get Platform Stats

`GET /admin/stats`

- Requires: Admin authentication

### Get All Orders (Admin view)

`GET /admin/orders`

- Requires: Admin authentication

**Query Parameters:**

- `page`, `limit`, `status`, `customerId`, `supplierId`

### Get All Payments (Admin view)

`GET /admin/payments`

- Requires: Admin authentication

### Get All Reviews (Admin view)

`GET /admin/reviews`

- Requires: Admin authentication

### Generate Sales Report

`GET /admin/reports/sales`

- Requires: Admin authentication

**Query Parameters:**

- `startDate`, `endDate`, `supplierId`

### Category Management

#### Create Category

`POST /admin/categories`

- Requires: Admin authentication

**Body:**

```json
{
  "name": "Fertilizers",
  "description": "All types of fertilizers",
  "image": "url"
}
```

#### Update Category

`PUT /admin/categories/:categoryId`

- Requires: Admin authentication

#### Delete Category

`DELETE /admin/categories/:categoryId`

- Requires: Admin authentication

---

## Response Format

### Success Response

```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Success message",
  "success": true
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Error message",
  "errors": [],
  "success": false
}
```

---

## Order Status Flow

1. `pending` - Order created, payment pending
2. `confirmed` - Payment completed
3. `processing` - Order being prepared
4. `shipped` - Order shipped
5. `delivered` - Order delivered
6. `cancelled` - Order cancelled

## Payment Status

- `pending` - Payment initiated
- `completed` - Payment successful
- `failed` - Payment failed
- `refunded` - Payment refunded

---

## Notes

1. **Supplier Approval**: New supplier accounts require admin approval before they can list products.
2. **Stock Management**: Stock is automatically reduced when orders are placed and restored when orders are cancelled.
3. **Product Reviews**: Only customers who have purchased and received the product can write reviews.
4. **Order Cancellation**: Orders can only be cancelled before they are shipped.
5. **Payment Integration**: Current implementation includes mock payment processing. Integrate with actual payment gateways (Razorpay, Stripe, etc.) in production.
