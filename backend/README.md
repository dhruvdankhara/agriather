# Agriather - Agricultural E-Commerce Platform Backend

A comprehensive Node.js and Express.js backend API for an agricultural e-commerce platform that connects suppliers with customers for fertilizers, pesticides, and machinery.

## Features

### Admin Features

- Monitor platform activity (orders, payments, reviews)
- Generate various reports (sales, platform statistics)
- View customer feedback
- Manage product categories
- Approve/reject supplier accounts

### Supplier Features

- Secure login with credentials
- List and manage products (fertilizers, pesticides, machinery)
- Manage pricing and stock
- View orders for their products
- View payment history for products sold
- View customer feedback
- Generate sales and product performance reports

### Customer Features

- Secure login
- Search, filter, and browse products
- Shopping cart functionality
- Place and track orders
- Make payments (multiple payment methods)
- Cancel orders
- View order history and download invoices
- Submit product ratings and reviews

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Yup** - Validation
- **Multer** - File upload
- **Cloudinary** - Image storage (optional)
- **Morgan** - Request logging

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Navigate to server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the server directory:

```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:

```env
PORT=8000
NODE_ENV=development
MONGODB_URL=mongodb://localhost:27017
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
```

5. Start MongoDB (if running locally):

```bash
mongod
```

6. Run the development server:

```bash
npm run dev
```

The server will start on `http://localhost:8000`

## Project Structure

```
server/
├── src/
│   ├── controllers/        # Route controllers
│   │   ├── auth.controller.js
│   │   ├── admin.controller.js
│   │   ├── product.controller.js
│   │   ├── cart.controller.js
│   │   ├── order.controller.js
│   │   ├── payment.controller.js
│   │   ├── review.controller.js
│   │   └── report.controller.js
│   ├── models/            # Database models
│   │   ├── user.model.js
│   │   ├── product.model.js
│   │   ├── category.model.js
│   │   ├── cart.model.js
│   │   ├── order.model.js
│   │   ├── payment.model.js
│   │   └── review.model.js
│   ├── routes/            # API routes
│   │   ├── auth.routes.js
│   │   ├── admin.routes.js
│   │   ├── product.routes.js
│   │   ├── cart.routes.js
│   │   ├── order.routes.js
│   │   ├── payment.routes.js
│   │   ├── review.routes.js
│   │   └── report.routes.js
│   ├── middlewares/       # Custom middlewares
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── validate.middleware.js
│   │   └── multer.middlewares.js
│   ├── validators/        # Input validation schemas
│   │   ├── auth.schema.js
│   │   ├── product.schema.js
│   │   ├── cart.schema.js
│   │   ├── order.schema.js
│   │   ├── payment.schema.js
│   │   └── review.schema.js
│   ├── utils/            # Utility functions
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   ├── cloudinary.js
│   │   └── helper.js
│   ├── DB/               # Database connection
│   │   └── index.js
│   ├── constants.js      # Constants and enums
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── public/              # Static files
├── .env.example         # Environment variables template
├── package.json
└── README.md
```

## API Endpoints

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API documentation.

### Quick Overview

#### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

#### Products

- `GET /api/v1/products` - Get all products
- `POST /api/v1/products` - Create product (Supplier)
- `PUT /api/v1/products/:id` - Update product (Supplier)
- `DELETE /api/v1/products/:id` - Delete product (Supplier)

#### Cart

- `GET /api/v1/cart` - Get cart (Customer)
- `POST /api/v1/cart/items` - Add to cart (Customer)
- `PUT /api/v1/cart/items/:id` - Update cart item (Customer)
- `DELETE /api/v1/cart/items/:id` - Remove from cart (Customer)

#### Orders

- `POST /api/v1/orders` - Create order (Customer)
- `GET /api/v1/orders/customer/my-orders` - Get customer orders
- `GET /api/v1/orders/supplier/my-orders` - Get supplier orders
- `PUT /api/v1/orders/:id/cancel` - Cancel order (Customer)
- `PUT /api/v1/orders/:id/status` - Update order status (Supplier/Admin)

#### Payments

- `POST /api/v1/payments/process` - Process payment (Customer)
- `GET /api/v1/payments/customer/history` - Payment history (Customer)
- `GET /api/v1/payments/supplier/history` - Payment history (Supplier)

#### Reviews

- `POST /api/v1/reviews` - Create review (Customer)
- `GET /api/v1/reviews/product/:id` - Get product reviews
- `GET /api/v1/reviews/customer/my-reviews` - Get customer reviews

#### Admin

- `GET /api/v1/admin/stats` - Platform statistics
- `GET /api/v1/admin/suppliers/pending` - Pending suppliers
- `PUT /api/v1/admin/suppliers/:id/approve` - Approve supplier
- `POST /api/v1/admin/categories` - Create category
- `PUT /api/v1/admin/categories/:id` - Update category

#### Reports

- `GET /api/v1/reports/supplier/sales` - Supplier sales report
- `GET /api/v1/reports/customer/orders` - Customer order report
- `GET /api/v1/reports/admin/platform` - Admin platform report

## User Roles

1. **Admin**: Full platform control and monitoring
2. **Supplier**: Product management and order fulfillment (requires admin approval)
3. **Customer**: Shopping and order management

## Scripts

```bash
# Start development server with nodemon
npm run dev

# Start production server
npm start
```

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- Input validation with Yup
- CORS configuration
- HTTP-only cookies for token storage

## Development Notes

1. **Payment Integration**: Currently uses mock payment processing. Integrate with actual payment gateways (Razorpay, Stripe) for production.

2. **Image Upload**: Cloudinary integration is prepared but needs configuration. Update credentials in `.env` file.

3. **Email Notifications**: Email configuration is prepared for order confirmations and status updates.

4. **Testing**: Add unit and integration tests before production deployment.

## License

This project is licensed under the ISC License.
