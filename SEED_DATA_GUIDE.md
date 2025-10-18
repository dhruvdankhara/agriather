# 🌱 Database Seed Data Guide

## Overview

This guide explains how to seed the Agriather database with initial data for development and testing purposes.

## What's Included in Seed Data

### 👥 Users (3 accounts)

1. **Admin Account**

   - Email: `admin@agriather.com`
   - Password: `admin123`
   - Role: Admin
   - Features: Full system access, manage users, categories, approve suppliers

2. **Supplier Account**

   - Email: `supplier@test.com`
   - Password: `supplier123`
   - Role: Supplier
   - Business: Green Farm Supplies
   - Features: Add/manage products, view orders, manage inventory

3. **Customer Account**
   - Email: `customer@test.com`
   - Password: `customer123`
   - Role: Customer
   - Features: Browse products, place orders, write reviews

### 📦 Categories (5 categories)

1. Fertilizers - All types of fertilizers for crop nutrition
2. Pesticides - Pest control solutions for healthy crops
3. Machinery - Agricultural machinery and equipment
4. Seeds - High-quality seeds for various crops
5. Irrigation Equipment - Water management and irrigation systems

### 🛍️ Products (8 sample products)

1. **Organic NPK Fertilizer** - ₹750 (₹850) - 500 kg stock
2. **Hybrid Tomato Seeds** - ₹950 (₹1200) - 200 packets stock
3. **Bio Pesticide Spray** - ₹380 (₹450) - 350 liters stock
4. **Wheat Seeds PBW 725** - ₹2500 - 800 kg stock
5. **Drip Irrigation Kit** - ₹22,500 (₹25,000) - 50 sets stock
6. **Power Tiller 7HP** - ₹42,000 (₹45,000) - 15 pieces stock
7. **Vermicompost Organic Fertilizer** - ₹500 (₹600) - 600 kg stock
8. **Rice Seeds Basmati 1121** - ₹3,200 (₹3,500) - 400 kg stock

Each product includes:

- Name, description, and category
- Price and discount price (where applicable)
- Stock quantity and unit
- Product images
- Detailed specifications
- Tags for better searchability
- Average rating and review count

### 📍 Addresses (2 addresses)

1. **Customer Address** - Shipping address in Farm City, Maharashtra
2. **Supplier Address** - Business address in Agriculture City, Gujarat

## How to Run Seed Script

### Prerequisites

- MongoDB connection configured in `.env` file
- All dependencies installed (`npm install`)

### Commands

#### Option 1: Using NPM Script (Recommended)

```bash
cd backend
npm run seed
```

#### Option 2: Direct Node Execution

```bash
cd backend
node src/utils/seed.js
```

### Expected Output

```
✅ Connected to MongoDB
✅ Admin user created: admin@agriather.com
✅ Category created: Fertilizers
✅ Category created: Pesticides
✅ Category created: Machinery
✅ Category created: Seeds
✅ Category created: Irrigation Equipment
✅ Sample supplier created: supplier@test.com
✅ Sample business address created for supplier
✅ Sample customer created: customer@test.com
✅ Sample address created for customer
✅ Product created: Organic NPK Fertilizer
✅ Product created: Hybrid Tomato Seeds
✅ Product created: Bio Pesticide Spray
✅ Product created: Wheat Seeds - PBW 725
✅ Product created: Drip Irrigation Kit
✅ Product created: Power Tiller - 7HP
✅ Product created: Vermicompost Organic Fertilizer
✅ Product created: Rice Seeds - Basmati 1121

🎉 Database seeding completed successfully!

📝 Test Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Admin:
  Email: admin@agriather.com
  Password: admin123

Supplier:
  Email: supplier@test.com
  Password: supplier123

Customer:
  Email: customer@test.com
  Password: customer123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Important Notes

### 🔄 Re-running Seed Script

- The script is **idempotent** - it checks if data already exists before creating
- If data already exists, it will skip creation and show info messages
- Safe to run multiple times without duplicating data

### 🗑️ Clearing Existing Data

If you want to start fresh, uncomment these lines in `seed.js`:

```javascript
await User.deleteMany({});
await Category.deleteMany({});
await Product.deleteMany({});
await Address.deleteMany({});
console.log("🗑️  Cleared existing data");
```

**⚠️ WARNING:** This will delete ALL data in the database!

### 📊 Data Structure Changes

The seed script now reflects the updated database models:

- ✅ Separate `Address` model (not embedded in User)
- ✅ Complete `Product` model with all fields
- ✅ Updated `User` model fields
- ✅ Category images field (optional)
- ✅ Product specifications as Map
- ✅ Product tags array
- ✅ Rating and review counts

## Database Models Used

### User Model Fields

- firstname, lastname, email, password
- phone, avatar, role
- businessName, businessAddress, gstNumber (supplier)
- isApproved, verified, isActive
- forgotPasswordToken, verifyToken (with expiry)

### Category Model Fields

- name, description, image
- isActive
- timestamps

### Product Model Fields

- name, description, category, supplier
- price, discountPrice, stock, unit
- images[], specifications (Map), tags[]
- averageRating, totalReviews
- isActive
- timestamps

### Address Model Fields

- user, type, label
- addressLine1, addressLine2, landmark
- city, state, pincode, country
- phone, isDefault, isActive
- timestamps

## Testing the Seeded Data

### Test Login

1. Start the backend: `npm run dev`
2. Start the frontend: `cd ../client && npm run dev`
3. Visit `http://localhost:5173`
4. Try logging in with any of the test accounts

### Test Features

- **As Admin**: Access admin dashboard, manage categories, approve suppliers
- **As Supplier**: Add new products, manage inventory, view analytics
- **As Customer**: Browse products, add to cart, place orders, write reviews

## Troubleshooting

### Error: "MongooseError: Operation failed"

- Check MongoDB connection string in `.env`
- Ensure MongoDB service is running
- Verify network connectivity

### Error: "User already exists"

- This is normal - data already exists
- To recreate, uncomment the deleteMany lines in seed.js

### Error: "Category not found"

- Categories must be created before products
- Seed script handles this automatically
- If manual changes made, run seed script again

## Next Steps

After seeding:

1. ✅ Verify all users can login
2. ✅ Check products are visible on frontend
3. ✅ Test supplier can add new products
4. ✅ Test customer can place orders
5. ✅ Test admin can manage system

## Additional Resources

- Models: `backend/src/models/`
- Seed Script: `backend/src/utils/seed.js`
- API Documentation: Coming soon...

---

**Last Updated**: October 18, 2025
**Version**: 1.0.0
