# Agriather - AI Coding Agent Instructions

## Project Overview
Agriather is an agricultural e-commerce platform with a **Node.js/Express backend** (ES6 modules) and **React/Redux frontend** (Vite). The platform connects three user roles: **Admin**, **Supplier**, and **Customer** for buying/selling fertilizers, pesticides, and machinery.

## Architecture

### Backend Structure (`backend/src/`)
- **Models** (`models/`) - Mongoose schemas (User, Product, Cart, Order, Payment, Review, Category, Address)
- **Controllers** (`controllers/`) - Business logic handlers using `asyncHandler` wrapper
- **Routes** (`routes/`) - Express route definitions with middleware chains
- **Validators** (`validators/`) - Yup schemas for request validation
- **Middlewares** (`middlewares/`) - Auth (JWT), validation, error handling, multer (file uploads)
- **Utils** (`utils/`) - ApiResponse, ApiError classes, asyncHandler, Cloudinary helpers

### Frontend Structure (`client/src/`)
- **Redux Store** (`store/`) - Centralized state management with RTK slices (auth, cart, product, order, address)
- **Services** (`services/api.js`) - Axios instance with interceptors for auth tokens
- **Routes** (`routes/`) - Role-based routing with ProtectedRoute wrappers
- **Layouts** (`layouts/`) - Role-specific layouts (CustomerLayout, SupplierLayout, AdminLayout)
- **Pages** (`pages/`) - Organized by role: `customer/`, `supplier/`, `admin/`, `auth/`

## Critical Conventions

### 1. Response Pattern (Backend)
**ALL** controller responses must use the `ApiResponse` class:
```javascript
return res.status(200).json(
  new ApiResponse(200, "Success message", { data })
);
```
**Error handling** uses `ApiError` class, caught by centralized error middleware.

### 2. Controller Pattern
Wrap ALL async controllers with `asyncHandler`:
```javascript
export const someController = asyncHandler(async (req, res) => {
  // Logic here - any thrown ApiError is automatically caught
  if (!data) throw new ApiError(404, "Not found");
  res.status(200).json(new ApiResponse(200, "Success", data));
});
```

### 3. Authentication Flow
- JWT tokens stored in **both** `httpOnly` cookies AND `localStorage` (for axios interceptors)
- Auth middleware: `verifyJWT` → attaches `req.user` object
- Role guards: `requireAdmin`, `requireSupplier`, `requireCustomer`, `requireSupplierOrAdmin`, etc.
- Suppliers require `isApproved: true` to access protected routes

### 4. Validation Pattern
Use Yup schemas in `validators/` folder with `validate` middleware:
```javascript
router.post('/endpoint', verifyJWT, validate(createSchema), controller);
```

### 5. File Uploads
- Multer middleware (`multer.middlewares.js`) handles multipart/form-data
- Cloudinary integration in `utils/cloudinary.js` with `uploadMultipleImages`/`deleteMultipleImages`
- Images uploaded to Cloudinary folders: `agriather/products`, `agriather/users`, etc.

### 6. Frontend API Calls
- Use Redux Toolkit async thunks (see `store/slices/`)
- API base config: `services/api.js` handles token injection and 401 redirects
- Always dispatch actions from components, never direct axios calls

### 7. Constants Management
- Backend constants in `backend/src/constants.js`: `USER_ROLES`, `ORDER_STATUS`, `PAYMENT_STATUS`, `PAYMENT_METHOD`
- Frontend constants in `client/src/constants/index.js`
- Always import and use these enums instead of hardcoding strings

## Development Workflows

### Running the Project
```bash
# Backend (from /backend)
npm run dev     # Nodemon on port 8000

# Frontend (from /client)  
npm run dev     # Vite on port 5173

# Seed test data
cd backend && npm run seed
```

### Test Accounts (after seeding)
- Admin: `admin@agriather.com` / `admin123`
- Supplier: `supplier@test.com` / `supplier123`  
- Customer: `customer@test.com` / `customer123`

### Adding New API Endpoints
1. Define Yup schema in `validators/{resource}.schema.js`
2. Create controller in `controllers/{resource}.controller.js` using `asyncHandler`
3. Add route in `routes/{resource}.routes.js` with auth middleware
4. Register route in `app.js` with `/api/v1/{resource}` prefix
5. Frontend: Create async thunk in `store/slices/{resource}Slice.js`

### Database Queries
- Use Mongoose aggregation pipelines for complex queries (see `order.controller.js` for examples)
- Always populate references with `.populate()` for related data
- Use `.lean()` for read-only queries to improve performance

## Role-Specific Logic

### Supplier Workflows
- Must be approved by admin (`isApproved: true`) before creating products
- Can only access/modify their own products (check `supplier: req.user._id`)
- Order notifications filtered to orders containing their products

### Customer Workflows
- Cart is user-specific, cleared after successful checkout
- Can only cancel orders before "shipped" status
- Reviews require completed/delivered orders for the product

### Admin Workflows
- Full CRUD on categories (`/api/v1/admin/categories`)
- Approve/deactivate suppliers (`/api/v1/admin/suppliers/:id/approve`)
- Access platform-wide reports and statistics

## Payment Integration
- Current: Mock payment processing in `payment.controller.js`
- Razorpay integration prepared but not configured
- Payment flow: Create order → Process payment → Update payment status → Update order status

## Common Pitfalls
1. **Don't forget `asyncHandler`** - Without it, rejected promises won't be caught by error middleware
2. **Always validate ObjectIds** - Use `mongoose.Types.ObjectId.isValid()` before queries
3. **Stock management** - Decrement on order creation, restore on cancellation (atomic operations in `order.controller.js`)
4. **Image cleanup** - Delete old Cloudinary images when updating products
5. **CORS** - Backend allows `credentials: true`, frontend axios must use `withCredentials: true`

## Key Files to Reference
- **Auth logic**: `backend/src/middlewares/auth.middleware.js`
- **Error handling**: `backend/src/middlewares/error.middleware.js`
- **API patterns**: Any controller in `backend/src/controllers/`
- **Redux patterns**: `client/src/store/slices/authSlice.js` (best example)
- **Route protection**: `client/src/routes/index.jsx`

## Environment Variables
Backend requires (`.env`):
```env
PORT=8000
MONGODB_URL=mongodb://localhost:27017
JWT_SECRET=<your-secret>
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=<optional>
CLOUDINARY_API_KEY=<optional>
CLOUDINARY_API_SECRET=<optional>
```

## API Versioning
All API routes are prefixed with `/api/v1/` - maintain this convention for consistency.
