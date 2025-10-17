# Quick Start Guide - Agriather Backend

## Prerequisites Check

Before starting, ensure you have:

- [ ] Node.js installed (v14+)
- [ ] MongoDB installed and running
- [ ] Code editor (VS Code recommended)
- [ ] API testing tool (Postman/Thunder Client)

## Step-by-Step Setup

### 1. Navigate to Server Directory

```bash
cd d:\agriather\server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

The `.env` file should already exist. Verify it contains:

```env
PORT=8000
MONGODB_URL=mongodb://localhost:27017
JWT_SECRET=agriather_jwt_secret_key_2024_change_this_in_production
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows (if installed as service, it should auto-start)
# Otherwise:
mongod
```

### 5. Seed Database (Create Test Users)

```bash
npm run seed
```

This will create:

- **Admin**: admin@agriather.com / admin123
- **Supplier**: supplier@test.com / supplier123
- **Customer**: customer@test.com / customer123
- Sample categories (Fertilizers, Pesticides, Machinery, etc.)

### 6. Start Development Server

```bash
npm run dev
```

You should see:

```
🤝MongoDB connected!! DB HOST: localhost
🚀Server is running on port 8000
```

### 7. Test the API

#### Health Check

```bash
GET http://localhost:8000/api/v1/health
```

Should return:

```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "2024-..."
}
```

#### Test Login (Admin)

```bash
POST http://localhost:8000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@agriather.com",
  "password": "admin123"
}
```

Should return user data with JWT token.

## Common Issues & Solutions

### Issue: MongoDB Connection Error

**Solution:** Make sure MongoDB is running

```bash
# Windows
net start MongoDB

# Or start mongod manually
mongod --dbpath="C:\data\db"
```

### Issue: Port Already in Use

**Solution:** Change PORT in `.env` file to another port (e.g., 8001)

### Issue: Module Not Found

**Solution:** Reinstall dependencies

```bash
rm -rf node_modules package-lock.json
npm install
```

## API Testing Workflow

### 1. Register a New Customer

```bash
POST /api/v1/auth/register
{
  "firstname": "Test",
  "lastname": "User",
  "email": "test@example.com",
  "password": "test123",
  "phone": "1234567890",
  "role": "customer"
}
```

### 2. Login

```bash
POST /api/v1/auth/login
{
  "email": "customer@test.com",
  "password": "customer123"
}
```

Copy the `token` from response.

### 3. Get All Products (No Auth Required)

```bash
GET /api/v1/products
```

### 4. Add to Cart (Requires Customer Login)

```bash
POST /api/v1/cart/items
Authorization: Bearer <your-token>
{
  "productId": "<product-id>",
  "quantity": 2
}
```

### 5. Create Order

```bash
POST /api/v1/orders
Authorization: Bearer <your-token>
{
  "shippingAddressId": "<address-id>",
  "paymentMethod": "card",
  "notes": "Test order"
}
```

## File Structure Quick Reference

```
server/
├── src/
│   ├── controllers/     # Business logic
│   ├── models/         # Database schemas
│   ├── routes/         # API endpoints
│   ├── middlewares/    # Auth, validation, error handling
│   ├── validators/     # Input validation schemas
│   ├── utils/          # Helper functions
│   ├── DB/            # Database connection
│   ├── app.js         # Express app
│   └── server.js      # Entry point
├── .env               # Environment variables
└── package.json       # Dependencies
```

## Next Steps

1. **Explore API Documentation:** Check `API_DOCUMENTATION.md` for all endpoints
2. **Test All Features:** Try different user roles (admin, supplier, customer)
3. **Integrate Frontend:** Connect with React frontend
4. **Add Real Payment Gateway:** Integrate Razorpay/Stripe
5. **Add Image Upload:** Configure Cloudinary

## Useful Commands

```bash
# Start development server
npm run dev

# Start production server
npm start

# Seed database with test data
npm run seed

# Check logs
# Server logs will appear in terminal
```

## Testing Different Roles

### As Admin

- Login as admin@agriather.com
- Access admin dashboard endpoints
- Approve pending suppliers
- Manage categories
- View platform statistics

### As Supplier

- Login as supplier@test.com
- Create products
- View orders for your products
- Check payment history
- Generate sales reports

### As Customer

- Login as customer@test.com
- Browse products
- Add to cart
- Place orders
- Track orders
- Write reviews

## Support

If you encounter any issues:

1. Check console logs for errors
2. Verify MongoDB is running
3. Check .env configuration
4. Ensure all dependencies are installed
5. Review API_DOCUMENTATION.md

Happy coding! 🚀
