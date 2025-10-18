# Admin Panel Documentation

## Overview

Complete admin panel implementation for the AgriAther e-commerce platform with full management capabilities for suppliers, customers, categories, orders, payments, reviews, and reports.

---

## Table of Contents

1. [Admin Layout](#admin-layout)
2. [Dashboard](#dashboard)
3. [Suppliers Management](#suppliers-management)
4. [Customers Management](#customers-management)
5. [Categories Management](#categories-management)
6. [Orders Management](#orders-management)
7. [Payments Management](#payments-management)
8. [Reviews Management](#reviews-management)
9. [Reports & Analytics](#reports--analytics)
10. [API Endpoints](#api-endpoints)
11. [Access Control](#access-control)

---

## Admin Layout

### Features

- **Responsive Sidebar Navigation**
  - Collapsible on mobile devices
  - Active state highlighting
  - Icon-based navigation
- **Navigation Items**

  - Dashboard
  - Suppliers
  - Customers
  - Categories
  - Orders
  - Payments
  - Reviews
  - Reports

- **User Profile Section**
  - User initials avatar
  - Name and email display
  - Logout functionality

### File Location

`client/src/layouts/AdminLayout.jsx`

---

## Dashboard

### Statistics Cards

1. **Total Users**

   - Combined count of customers and suppliers
   - Breakdown: Customers • Suppliers

2. **Total Products**

   - All products count
   - Active products count

3. **Total Orders**

   - All orders count
   - Pending orders count

4. **Total Revenue**
   - Lifetime platform revenue
   - Formatted in INR

### Activity Sections

- **Recent Activity**

  - Today's orders
  - Today's revenue
  - New users (7 days)

- **Pending Actions**

  - Pending supplier approvals
  - Pending orders
  - Low stock products

- **Platform Health**
  - Active suppliers
  - Total categories
  - Average rating

### API Endpoint

- `GET /api/v1/admin/stats`

### File Location

`client/src/pages/admin/Dashboard.jsx`

---

## Suppliers Management

### Features

- **List View**

  - Paginated supplier list
  - Search by name, email, or business name
  - Filter by approval status (all/approved/pending)

- **Supplier Information Display**

  - Full name
  - Business name
  - Email and phone
  - Business address
  - GST number
  - Join date
  - Approval status badge
  - Active/Inactive status

- **Actions**
  - **Approve Supplier**: Activate pending suppliers
  - **Deactivate Supplier**: Disable supplier accounts

### Status Badges

- ✅ **Approved** (Green)
- ⏱️ **Pending** (Yellow)
- ❌ **Inactive** (Red)

### API Endpoints

- `GET /api/v1/admin/suppliers` - List all suppliers
- `GET /api/v1/admin/suppliers/pending` - Get pending approvals
- `PUT /api/v1/admin/suppliers/:supplierId/approve` - Approve supplier
- `PUT /api/v1/admin/suppliers/:supplierId/deactivate` - Deactivate supplier

### File Location

`client/src/pages/admin/Suppliers.jsx`

---

## Customers Management

### Features

- **List View**

  - Paginated customer list
  - Search by name or email
  - 10 customers per page

- **Customer Information Display**

  - Full name
  - Email address
  - Phone number
  - Account status (Active/Inactive)
  - Verification status
  - Join date

- **Status Badges**
  - Active/Inactive
  - Verified/Unverified

### API Endpoint

- `GET /api/v1/admin/customers`

### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term

### File Location

`client/src/pages/admin/Customers.jsx`

---

## Categories Management

### Features

- **CRUD Operations**

  - ✅ Create new categories
  - ✅ Update existing categories
  - ✅ Delete categories (with validation)
  - ✅ View all categories

- **Category Form Fields**

  - **Name** (required): Category name
  - **Description** (optional): Brief description
  - **Image URL** (optional): Category image

- **Grid Display**
  - Responsive 3-column grid (desktop)
  - 2-column grid (tablet)
  - Single column (mobile)
  - Image preview or placeholder
  - Edit and Delete actions

### Validation

- Cannot delete categories with associated products
- Duplicate category names prevented

### API Endpoints

- `GET /api/v1/products/categories` - List all categories
- `POST /api/v1/admin/categories` - Create category
- `PUT /api/v1/admin/categories/:categoryId` - Update category
- `DELETE /api/v1/admin/categories/:categoryId` - Delete category

### File Location

`client/src/pages/admin/Categories.jsx`

---

## Orders Management

### Features

- **List View**

  - Paginated orders list
  - Filter by status
  - Detailed order cards

- **Order Information Display**
  - Order number
  - Order date
  - Status badge with icon
  - Customer details
  - Payment method
  - Order items (first 3, with "more" indicator)
  - Shipping address
  - Order summary (subtotal, shipping, tax, total)

### Order Status Types

- ⏱️ **Pending** (Yellow)
- 📦 **Confirmed** (Blue)
- 🚚 **Shipped** (Purple)
- ✅ **Delivered** (Green)
- ❌ **Cancelled** (Red)

### Filter Options

- All Orders
- Pending
- Confirmed
- Shipped
- Delivered
- Cancelled

### API Endpoint

- `GET /api/v1/admin/orders`

### Query Parameters

- `page`: Page number
- `limit`: Items per page
- `status`: Filter by order status
- `customerId`: Filter by customer
- `supplierId`: Filter by supplier

### File Location

`client/src/pages/admin/Orders.jsx`

---

## Payments Management

### Features

- **List View**

  - Paginated payments list
  - Filter by payment status
  - Detailed payment cards

- **Payment Information Display**
  - Transaction ID
  - Payment date
  - Status badge
  - Customer information
  - Order reference
  - Payment method
  - Amount (formatted in INR)

### Payment Status Types

- ✅ **Completed** (Green)
- ⏱️ **Pending** (Yellow)
- ❌ **Failed** (Red)

### Filter Options

- All Payments
- Completed
- Pending
- Failed

### API Endpoint

- `GET /api/v1/admin/payments`

### Query Parameters

- `page`: Page number
- `limit`: Items per page
- `status`: Filter by payment status

### File Location

`client/src/pages/admin/Payments.jsx`

---

## Reviews Management

### Features

- **List View**

  - Paginated reviews list
  - All product reviews across platform

- **Review Information Display**
  - Customer avatar and name
  - Review date
  - Star rating (1-5 stars)
  - Product information with image
  - Review comment
  - Verified purchase badge

### Display Elements

- 5-star rating visualization
- Customer profile picture or initials
- Product thumbnail
- Verification badge for confirmed purchases

### API Endpoint

- `GET /api/v1/admin/reviews`

### Query Parameters

- `page`: Page number
- `limit`: Items per page
- `productId`: Filter by specific product

### File Location

`client/src/pages/admin/Reviews.jsx`

---

## Reports & Analytics

### Features

- **Sales Report Generator**

  - Custom date range selection
  - Quick date range buttons
    - Last 7 Days
    - Last 30 Days
    - Last 90 Days
    - Last Year

- **Report Summary Metrics**

  1. **Total Orders**: Number of completed orders
  2. **Total Revenue**: Sum of all sales
  3. **Average Order Value**: Revenue / Orders
  4. **Total Tax**: Collected tax amount

- **Category-wise Sales Breakdown**
  - Sales per category
  - Quantity sold per category
  - Revenue contribution

### Quick Actions

- Generate custom reports
- Download report data
- View historical trends

### API Endpoint

- `GET /api/v1/admin/reports/sales`

### Query Parameters

- `startDate`: Report start date (YYYY-MM-DD)
- `endDate`: Report end date (YYYY-MM-DD)
- `supplierId`: Optional supplier filter

### File Location

`client/src/pages/admin/Reports.jsx`

---

## API Endpoints

### Complete API Reference

#### Authentication & Access

All admin endpoints require:

- Authentication: `verifyJWT` middleware
- Authorization: `requireAdmin` middleware

#### Supplier Management

```
GET    /api/v1/admin/suppliers/pending
GET    /api/v1/admin/suppliers
PUT    /api/v1/admin/suppliers/:supplierId/approve
PUT    /api/v1/admin/suppliers/:supplierId/deactivate
```

#### Customer Management

```
GET    /api/v1/admin/customers
```

#### Platform Monitoring

```
GET    /api/v1/admin/stats
GET    /api/v1/admin/orders
GET    /api/v1/admin/payments
GET    /api/v1/admin/reviews
```

#### Category Management

```
POST   /api/v1/admin/categories
PUT    /api/v1/admin/categories/:categoryId
DELETE /api/v1/admin/categories/:categoryId
```

#### Reports

```
GET    /api/v1/admin/reports/sales
```

### Backend Files

- **Routes**: `backend/src/routes/admin.routes.js`
- **Controller**: `backend/src/controllers/admin.controller.js`

---

## Access Control

### Role-Based Access

- Only users with `role: 'admin'` can access admin panel
- Protected by route guards in React Router
- Backend endpoints protected by `requireAdmin` middleware

### Authentication Flow

1. User logs in
2. JWT token issued with role information
3. Frontend checks user role
4. Admin routes only accessible to admin users
5. Backend validates JWT and role on each request

### Middleware Stack

```javascript
router.use(verifyJWT, requireAdmin);
```

### Frontend Protection

```javascript
<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
  <AdminLayout />
</ProtectedRoute>
```

---

## UI Components Used

### Cards

- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- Used for all data containers

### Forms

- `Input` - Text inputs
- `Textarea` - Multi-line text
- `Label` - Form labels
- `Select` - Dropdowns
- `Button` - Action buttons

### Icons (lucide-react)

- `LayoutDashboard` - Dashboard
- `Users` - Suppliers/Customers
- `Package` - Categories/Products
- `ShoppingBag` - Orders
- `CreditCard` - Payments
- `Star` - Reviews/Ratings
- `FileText` - Reports
- Status icons (CheckCircle, XCircle, Clock, etc.)

### Utilities

- `Spinner` - Loading states
- `formatCurrency()` - INR formatting
- `formatDate()` - Date formatting
- `formatDateTime()` - Date + time formatting

---

## Styling & Theme

### Color Scheme

- **Primary**: Green (#16a34a for branding)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)
- **Info**: Blue (#3b82f6)
- **Purple**: Purple (#a855f7)

### Status Colors

- Approved/Active/Completed: Green
- Pending/Warning: Yellow
- Cancelled/Failed/Inactive: Red
- Shipped/Processing: Purple/Blue

### Responsive Design

- Mobile-first approach
- Breakpoints:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
- Collapsible sidebar on mobile
- Grid layouts adapt to screen size

---

## Features Summary

### ✅ Implemented Features

1. **Admin Dashboard**

   - Platform statistics
   - Real-time metrics
   - Activity monitoring
   - Health indicators

2. **Supplier Management**

   - Approval workflow
   - Account activation/deactivation
   - Search and filter
   - Detailed supplier profiles

3. **Customer Management**

   - Customer listing
   - Search functionality
   - Account status tracking

4. **Category Management**

   - Full CRUD operations
   - Image support
   - Product association validation

5. **Orders Management**

   - Order tracking
   - Status filtering
   - Detailed order views
   - Customer and supplier information

6. **Payments Management**

   - Payment tracking
   - Status monitoring
   - Transaction details

7. **Reviews Management**

   - Review moderation
   - Rating visualization
   - Customer feedback tracking

8. **Reports & Analytics**
   - Sales reports
   - Date range selection
   - Category-wise analysis
   - Revenue tracking

### 🎨 User Experience

- **Responsive Design**: Works on all devices
- **Loading States**: Spinners for async operations
- **Error Handling**: Toast notifications
- **Pagination**: Efficient data loading
- **Search & Filter**: Easy data discovery
- **Confirmation Dialogs**: Prevent accidental deletions
- **Status Badges**: Clear visual indicators
- **Empty States**: Helpful messages when no data

---

## Testing Checklist

### Dashboard

- [ ] Stats load correctly
- [ ] All metrics display proper values
- [ ] Cards are responsive

### Suppliers

- [ ] List displays all suppliers
- [ ] Search works
- [ ] Filter by approval status works
- [ ] Approve action works
- [ ] Deactivate action works
- [ ] Pagination works

### Customers

- [ ] List displays all customers
- [ ] Search works
- [ ] Status badges display correctly
- [ ] Pagination works

### Categories

- [ ] Create category works
- [ ] Update category works
- [ ] Delete category works
- [ ] Validation prevents deletion with products
- [ ] Form validation works

### Orders

- [ ] List displays all orders
- [ ] Filter by status works
- [ ] Order details display correctly
- [ ] Pagination works

### Payments

- [ ] List displays all payments
- [ ] Filter by status works
- [ ] Payment details display correctly
- [ ] Pagination works

### Reviews

- [ ] List displays all reviews
- [ ] Star ratings display correctly
- [ ] Product info shows
- [ ] Pagination works

### Reports

- [ ] Date range selection works
- [ ] Quick date buttons work
- [ ] Report generates correctly
- [ ] Metrics calculate properly
- [ ] Category breakdown displays

---

## Future Enhancements

### Potential Features

1. **Export Functionality**

   - Export reports to PDF/Excel
   - Export customer/supplier lists

2. **Advanced Analytics**

   - Charts and graphs
   - Trend analysis
   - Predictive analytics

3. **Bulk Actions**

   - Bulk supplier approval
   - Bulk order status updates

4. **Email Notifications**

   - Notify suppliers of approval
   - Send reports via email

5. **Activity Logs**

   - Track admin actions
   - Audit trail

6. **Advanced Filters**

   - Multi-parameter search
   - Saved filter presets

7. **Product Management**

   - Approve/reject products
   - Inventory management

8. **Customer Support**
   - Ticket system integration
   - Direct messaging

---

## Troubleshooting

### Common Issues

**Issue**: Admin panel not accessible

- **Solution**: Ensure user has `role: 'admin'` in database

**Issue**: Stats not loading

- **Solution**: Check backend `/api/v1/admin/stats` endpoint

**Issue**: Pagination not working

- **Solution**: Verify page number is being passed correctly

**Issue**: Search not returning results

- **Solution**: Check search term formatting in backend

**Issue**: Category deletion fails

- **Solution**: Ensure no products are associated with category

---

## Support & Maintenance

### Code Locations

- **Frontend Admin Pages**: `client/src/pages/admin/`
- **Admin Layout**: `client/src/layouts/AdminLayout.jsx`
- **Backend Controllers**: `backend/src/controllers/admin.controller.js`
- **Backend Routes**: `backend/src/routes/admin.routes.js`
- **API Services**: `client/src/services/index.js`

### Dependencies

- React Router for navigation
- Redux for state management
- Lucide React for icons
- Tailwind CSS for styling
- React Hot Toast for notifications

---

## Conclusion

The admin panel is a complete, production-ready solution for managing the AgriAther e-commerce platform. It provides comprehensive tools for:

- User management (suppliers and customers)
- Content management (categories)
- Order and payment tracking
- Review moderation
- Business analytics and reporting

All features are fully responsive, user-friendly, and integrated with secure backend APIs.
