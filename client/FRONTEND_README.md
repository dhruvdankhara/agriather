# Agriather Frontend

React-based frontend for the Agriather agricultural e-commerce platform.

## Tech Stack

- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS v4
- **State Management**: Redux Toolkit
- **Routing**: React Router Dom v7
- **UI Components**: Radix UI primitives
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Project Structure

```
src/
├── components/
│   └── ui/              # Reusable UI components
│       ├── Button.jsx
│       ├── Input.jsx
│       ├── Card.jsx
│       ├── Dialog.jsx
│       ├── Select.jsx
│       ├── Table.jsx
│       ├── Badge.jsx
│       ├── Label.jsx
│       ├── Textarea.jsx
│       └── Spinner.jsx
├── layouts/             # Layout components
│   ├── CustomerLayout.jsx
│   ├── SupplierLayout.jsx
│   └── AdminLayout.jsx
├── pages/               # Page components
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── customer/        # Customer pages
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Orders.jsx
│   │   ├── OrderDetail.jsx
│   │   ├── Profile.jsx
│   │   └── Reviews.jsx
│   ├── supplier/        # Supplier pages
│   │   ├── Dashboard.jsx
│   │   ├── Products.jsx
│   │   ├── Orders.jsx
│   │   ├── Payments.jsx
│   │   ├── Reviews.jsx
│   │   └── Reports.jsx
│   └── admin/           # Admin pages
│       ├── Dashboard.jsx
│       ├── Suppliers.jsx
│       ├── Customers.jsx
│       ├── Categories.jsx
│       ├── Orders.jsx
│       ├── Payments.jsx
│       ├── Reviews.jsx
│       └── Reports.jsx
├── store/               # Redux store
│   ├── index.js
│   └── slices/
│       ├── authSlice.js
│       ├── cartSlice.js
│       └── productSlice.js
├── services/            # API services
│   ├── api.js           # Axios configuration
│   └── index.js         # API methods
├── routes/              # Route configuration
│   └── index.jsx
├── lib/                 # Utilities
│   └── utils.js
├── constants/           # Constants
│   └── index.js
├── App.jsx              # Root component
└── main.jsx             # Entry point
```

## Available Scripts

### `npm run dev`

Starts the development server at http://localhost:5173

### `npm run build`

Builds the app for production

### `npm run preview`

Preview the production build locally

### `npm run lint`

Run ESLint to check code quality

## Features

### Customer Features

- Browse and search products
- Product details and reviews
- Shopping cart management
- Checkout and payment
- Order tracking
- Order history
- Profile management
- Write product reviews

### Supplier Features

- Dashboard with sales analytics
- Product management (CRUD)
- Order management
- Payment history
- View product reviews
- Sales reports

### Admin Features

- Platform overview dashboard
- Supplier approval/management
- Customer management
- Category management
- Order monitoring
- Payment monitoring
- Review moderation
- Platform reports and analytics

## User Roles

- **Customer**: Can browse products, make purchases, track orders, and write reviews
- **Supplier**: Can manage products, view orders, track payments, and generate reports
- **Admin**: Full platform management capabilities

## API Integration

The frontend connects to the backend API at `http://localhost:8000/api/v1`

API service methods are organized by feature:

- `authAPI` - Authentication and profile
- `productAPI` - Product management
- `categoryAPI` - Category management
- `cartAPI` - Shopping cart
- `orderAPI` - Order management
- `paymentAPI` - Payments
- `reviewAPI` - Reviews
- `reportAPI` - Reports
- `adminAPI` - Admin operations

## Authentication

JWT tokens are stored in:

- `localStorage` for persistence
- Axios headers for API requests
- Cookies (set by backend)

Protected routes redirect unauthenticated users to login.
Role-based routes ensure users can only access authorized pages.

## State Management

Redux Toolkit slices:

- **authSlice**: User authentication, profile, and session
- **cartSlice**: Shopping cart state
- **productSlice**: Products, filters, and pagination

## Styling

Using Tailwind CSS v4 with a simple, clean design:

- No gradients (as per requirements)
- Consistent color scheme (blue primary, gray neutrals)
- Responsive design
- Accessible components

## Development

1. Ensure backend is running at http://localhost:8000
2. Start the frontend: `npm run dev`
3. Open http://localhost:5173 in your browser

## Test Credentials

Use these credentials from the backend seed data:

**Admin:**

- Email: admin@agriather.com
- Password: admin123

**Supplier:**

- Email: supplier@test.com
- Password: supplier123

**Customer:**

- Email: customer@test.com
- Password: customer123

## Next Steps

Most pages currently show placeholder content. Priority development areas:

1. **Products Page**: Implement product listing with filters, search, and pagination
2. **Product Detail**: Show product info, images, reviews, and add to cart
3. **Cart Page**: Display cart items with quantity controls and totals
4. **Checkout**: Multi-step checkout with address and payment
5. **Supplier Dashboard**: Show sales stats, recent orders, and quick actions
6. **Admin Dashboard**: Platform analytics and pending approvals

## Notes

- The backend server needs to be fixed (MongoDB module corruption issue) before full API integration can be tested
- Some lint warnings about fast refresh are cosmetic and don't affect functionality
- All routes and API methods are set up and ready to use
