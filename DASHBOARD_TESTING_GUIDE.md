# Dashboard Testing Guide

## Quick Start

This guide will help you test the enhanced admin dashboard with comprehensive analytics.

## Prerequisites

1. **Backend running** on port 5000 (or your configured port)
2. **Frontend running** on port 5173 (or your configured port)
3. **Admin account** with proper credentials
4. **Sample data** in database (users, products, orders, reviews, categories)

## Step-by-Step Testing

### 1. Login as Admin

```bash
# Navigate to admin login
http://localhost:5173/admin/login

# Use admin credentials
Email: admin@agriather.com
Password: [your admin password]
```

### 2. Access Dashboard

After login, you should be automatically redirected to the dashboard at:

```
http://localhost:5173/admin/dashboard
```

### 3. Verify Main Statistics

Check that the following 4 main cards display correctly:

#### Total Users Card

- [ ] Shows total user count (customers + suppliers)
- [ ] Shows breakdown: "X Customers • Y Suppliers"
- [ ] Shows "New this week: Z" count
- [ ] Displays blue Users icon

#### Total Products Card

- [ ] Shows total product count
- [ ] Shows breakdown: "X Active • Y Inactive"
- [ ] Shows "New this week: Z" count
- [ ] Displays green Package icon

#### Total Orders Card

- [ ] Shows total order count
- [ ] Shows breakdown: "X Pending • Y Completed"
- [ ] Shows growth percentage with trend arrow (up/down)
- [ ] Displays purple ShoppingCart icon

#### Total Revenue Card

- [ ] Shows total revenue formatted as currency
- [ ] Shows "Month: $X.XX"
- [ ] Shows growth percentage with trend arrow (up/down)
- [ ] Displays orange DollarSign icon

### 4. Verify Today's Activity Section

Check the 4 smaller cards:

- [ ] **Today's Orders**: Shows count with purple Activity icon
- [ ] **Today's Revenue**: Shows currency amount with green DollarSign icon
- [ ] **New Users Today**: Shows count with blue UserPlus icon
- [ ] **New Reviews**: Shows weekly count with yellow MessageSquare icon

### 5. Verify Pending Actions Card

Check all pending items:

- [ ] Pending Suppliers (yellow badge)
- [ ] Pending Orders (yellow badge)
- [ ] Low Stock Products (red badge)
- [ ] Out of Stock (red badge)
- [ ] Failed Payments (red badge)

### 6. Verify Platform Health Card

Check platform metrics:

- [ ] Active Suppliers (green badge)
- [ ] Total Categories
- [ ] Average Rating with star icon
- [ ] Total Reviews
- [ ] Completed Payments (green badge)

### 7. Verify Top Categories Card

- [ ] Shows top 5 categories
- [ ] Each category shows: "1. Category Name" | "X products"
- [ ] If no categories, shows "No categories available"

### 8. Verify Recent Orders Section

Check last 5 orders:

- [ ] Shows order number (#ORDER123)
- [ ] Shows customer name
- [ ] Shows order amount formatted as currency
- [ ] Shows status with color coding:
  - Green for "delivered"
  - Yellow for "pending"
  - Blue for other statuses
- [ ] If no orders, shows "No recent orders"

### 9. Verify Recent Reviews Section

Check last 5 reviews:

- [ ] Shows customer name
- [ ] Shows product name
- [ ] Shows star rating (5 stars, filled based on rating)
- [ ] Shows comment preview (if available)
- [ ] If no reviews, shows "No recent reviews"

### 10. Verify Order Status Breakdown

Check all 5 status columns:

- [ ] Pending (yellow) - shows count
- [ ] Confirmed (blue) - shows count
- [ ] Shipped (purple) - shows count
- [ ] Delivered (green) - shows count
- [ ] Cancelled (red) - shows count

### 11. Test Refresh Functionality

- [ ] Click "Refresh" button in top-right corner
- [ ] Button shows spinning icon during refresh
- [ ] Success toast notification appears
- [ ] All statistics update correctly

### 12. Test Auto-Refresh

- [ ] Wait 5 minutes
- [ ] Dashboard should auto-refresh
- [ ] Check browser console for refresh log (if implemented)

### 13. Test Responsive Design

#### Desktop (1920px+)

- [ ] All cards display in proper grid layout
- [ ] Main stats: 4 columns
- [ ] Today's activity: 4 columns
- [ ] Secondary sections: 3 columns
- [ ] Recent activity: 2 columns

#### Tablet (768px - 1024px)

- [ ] Main stats: 2 columns
- [ ] Today's activity: 2 columns
- [ ] Secondary sections: 2 columns
- [ ] Recent activity: 1-2 columns

#### Mobile (< 768px)

- [ ] All cards stack vertically (1 column)
- [ ] All content remains readable
- [ ] No horizontal scroll
- [ ] Touch-friendly spacing

## API Testing

### Test the Backend Endpoint Directly

```bash
# Using curl (replace with your auth token)
curl -X GET http://localhost:5000/api/v1/admin/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Or using Postman/Thunder Client
GET http://localhost:5000/api/v1/admin/stats
Headers:
  Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Verify API Response

Check that the response includes all these fields:

```json
{
  "success": true,
  "message": "Platform stats fetched successfully",
  "data": {
    "users": {
      /* 7 fields */
    },
    "orders": {
      /* 10 fields */
    },
    "revenue": {
      /* 5 fields */
    },
    "products": {
      /* 6 fields */
    },
    "categories": {
      /* 2 fields */
    },
    "reviews": {
      /* 3 fields */
    },
    "payments": {
      /* 4 fields */
    },
    "recentActivity": {
      "orders": [
        /* array of 5 orders */
      ],
      "reviews": [
        /* array of 5 reviews */
      ]
    }
  }
}
```

## Test with Different Data States

### Empty Database

```bash
# Test with no data
1. Clear all collections (except admin user)
2. Verify dashboard shows zeros
3. Verify empty states for recent orders/reviews
4. Check "No categories available" message
```

### Minimal Data

```bash
# Test with minimal data
1. Add 1 user, 1 product, 1 order, 1 review
2. Verify all counts show "1"
3. Verify recent activity shows single items
4. Check growth percentages (should be 0)
```

### Large Dataset

```bash
# Test with large dataset
1. Add 1000+ users, 500+ products, 200+ orders
2. Verify dashboard loads quickly (< 2 seconds)
3. Check that recent activities still show only 5 items
4. Verify growth calculations are accurate
```

## Performance Testing

### Load Time

- [ ] Dashboard loads in < 2 seconds
- [ ] No lag when scrolling
- [ ] Smooth refresh animations

### Database Queries

```bash
# Check MongoDB query performance
# Run in MongoDB shell or Compass

// Test Users query speed
db.users.find({ role: "customer" }).explain("executionStats")

// Test Orders query speed
db.orders.find({ createdAt: { $gte: new Date() } }).explain("executionStats")

// Test aggregation pipelines
db.reviews.aggregate([
  { $group: { _id: null, average: { $avg: "$rating" } } }
]).explain("executionStats")
```

### Suggested Indexes (if not already created)

```javascript
// Run these in MongoDB shell
use agriather_db  // or your database name

// User indexes
db.users.createIndex({ createdAt: -1 })
db.users.createIndex({ role: 1, isApproved: 1 })

// Order indexes
db.orders.createIndex({ createdAt: -1 })
db.orders.createIndex({ status: 1 })

// Product indexes
db.products.createIndex({ stock: 1, isActive: 1 })
db.products.createIndex({ category: 1 })

// Payment indexes
db.payments.createIndex({ status: 1, createdAt: -1 })

// Review indexes
db.reviews.createIndex({ createdAt: -1 })
db.reviews.createIndex({ rating: 1 })
```

## Growth Percentage Testing

### Test Order Growth

```bash
# Setup:
1. Create 10 orders last month
2. Create 15 orders this month
3. Expected growth: +50%

# Verification:
- Order growth should show: +50.0% with green up arrow
```

### Test Revenue Growth

```bash
# Setup:
1. Create payments totaling $1000 last month
2. Create payments totaling $800 this month
3. Expected growth: -20%

# Verification:
- Revenue growth should show: -20.0% with red down arrow
```

### Test Zero Growth

```bash
# Setup:
1. Create same number of orders/revenue last month and this month

# Verification:
- Growth should show: "No change" in gray text
```

## Low Stock Testing

### Test Low Stock Alert

```bash
# Setup:
1. Create products with stock levels:
   - Product A: stock = 5
   - Product B: stock = 9
   - Product C: stock = 10
   - Product D: stock = 0

# Expected Results:
- Low Stock Products: 2 (Products A and B, stock < 10)
- Out of Stock: 1 (Product D, stock = 0)
- Product C should NOT be in low stock (stock = 10)
```

## Common Issues and Solutions

### Issue: Dashboard shows all zeros

**Solution:**

1. Check if backend is running
2. Verify admin is authenticated
3. Check browser console for API errors
4. Verify database has data

### Issue: Growth percentages show NaN

**Solution:**

1. Ensure there's data from last month for comparison
2. Check date calculations in backend
3. Verify parseFloat() conversion

### Issue: Recent orders/reviews not showing

**Solution:**

1. Check if orders/reviews exist in database
2. Verify populate() queries in backend
3. Check customer/product relationships
4. Verify order/review have createdAt timestamps

### Issue: Top categories not showing

**Solution:**

1. Ensure categories collection exists
2. Verify products have category references
3. Check aggregation pipeline in backend
4. Ensure Category model is imported

### Issue: Refresh button not working

**Solution:**

1. Check browser console for errors
2. Verify adminAPI.getPlatformStats() function
3. Check authentication token
4. Verify backend endpoint is accessible

## Test Data Generator (Optional)

Use this script to generate test data:

```javascript
// Run in MongoDB shell or Node.js script
// scripts/generateTestData.js

const generateTestData = async () => {
  // Generate 100 customers
  // Generate 50 suppliers
  // Generate 200 products across 10 categories
  // Generate 150 orders with various statuses
  // Generate 80 reviews with random ratings
  // Generate payments for completed orders

  console.log("Test data generated successfully!");
};

// Run the script
generateTestData();
```

## Browser Compatibility

Test dashboard on:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome (iOS/Android)
- [ ] Mobile Safari (iOS)

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Color contrast meets WCAG standards
- [ ] All icons have proper aria-labels
- [ ] Focus indicators visible

## Security Testing

- [ ] Requires admin authentication
- [ ] Non-admin users redirected
- [ ] No sensitive data exposed in console
- [ ] API endpoint requires admin token
- [ ] CORS properly configured

## Success Criteria

The dashboard enhancement is successful if:

✅ All 4 main stat cards display real data (no zeros unless empty database)  
✅ Today's activity section shows accurate daily metrics  
✅ Growth percentages calculate correctly with trend arrows  
✅ Low stock and out of stock counts are accurate  
✅ Recent orders and reviews display last 5 items  
✅ Top categories show correct product counts  
✅ Order status breakdown shows all 5 statuses  
✅ Refresh button works and shows loading state  
✅ Dashboard auto-refreshes every 5 minutes  
✅ Responsive design works on all screen sizes  
✅ No console errors  
✅ Page loads in < 2 seconds  
✅ Empty states display when no data

---

**Happy Testing!** 🎉

If you encounter any issues not covered in this guide, please check:

1. Browser console for errors
2. Network tab for API failures
3. Backend logs for database errors
4. MongoDB logs for query issues
