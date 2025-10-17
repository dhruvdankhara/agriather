# Address Model Migration Documentation

## Overview

This document outlines the migration from embedded address subdocuments in the User model to a separate Address collection.

## Changes Made

### Backend Changes

#### 1. New Address Model (`backend/src/models/address.model.js`)

- **Purpose**: Separate address management with enhanced features
- **Key Features**:
  - Multiple address types: `shipping`, `billing`, `business`
  - Custom labels (e.g., "Home", "Office")
  - Additional fields: `landmark`, `phone`
  - Soft delete with `isActive` flag
  - Auto-default management via pre-save hook
  - Indexes for performance optimization

**Schema Fields**:

```javascript
{
  user: ObjectId (ref: 'User'),
  type: enum ['shipping', 'billing', 'business'],
  label: String,
  addressLine1: String (required),
  addressLine2: String,
  landmark: String,
  city: String (required),
  state: String (required),
  pincode: String (required),
  country: String (default: 'India'),
  phone: String,
  isDefault: Boolean (default: false),
  isActive: Boolean (default: true)
}
```

#### 2. Address Controller (`backend/src/controllers/address.controller.js`)

- **Functions**:
  - `getUserAddresses(req, res)` - GET all addresses with optional type filter
  - `getAddressById(req, res)` - GET single address with ownership check
  - `createAddress(req, res)` - POST new address (auto-default if first)
  - `updateAddress(req, res)` - PUT update with ownership verification
  - `deleteAddress(req, res)` - Soft delete with auto-promotion of new default
  - `setDefaultAddress(req, res)` - PATCH to set specific address as default

#### 3. Address Routes (`backend/src/routes/address.routes.js`)

- **Endpoints**:
  - `GET /api/v1/addresses` - List all user addresses
  - `GET /api/v1/addresses/:addressId` - Get specific address
  - `POST /api/v1/addresses` - Create new address
  - `PUT /api/v1/addresses/:addressId` - Update address
  - `DELETE /api/v1/addresses/:addressId` - Delete address
  - `PATCH /api/v1/addresses/:addressId/set-default` - Set as default
- **Middleware**: All routes require `verifyJWT` authentication

#### 4. Updated Files

- **`backend/src/app.js`**: Registered address routes
- **`backend/src/controllers/order.controller.js`**: Updated to query Address model instead of embedded subdocuments

**OLD CODE**:

```javascript
const shippingAddress = req.user.shippingAddresses.id(shippingAddressId);
```

**NEW CODE**:

```javascript
const shippingAddress = await Address.findOne({
  _id: shippingAddressId,
  user: req.user._id,
  isActive: true,
});
```

### Frontend Changes

#### 1. Redux Address Slice (`client/src/store/slices/addressSlice.js`)

- **State Management**: Complete state management for addresses
- **Async Thunks**:
  - `fetchAddresses` - Load all addresses
  - `fetchAddressById` - Load single address
  - `createAddress` - Create new address
  - `updateAddress` - Update existing address
  - `deleteAddress` - Delete address
  - `setDefaultAddress` - Set default address
- **State Structure**:

```javascript
{
  addresses: [],
  selectedAddress: null,
  loading: false,
  error: null
}
```

#### 2. API Services (`client/src/services/index.js`)

- **Removed**: Old auth-based address methods
  - `authAPI.addShippingAddress()`
  - `authAPI.updateShippingAddress()`
  - `authAPI.deleteShippingAddress()`
- **Added**: New addressAPI object

```javascript
addressAPI: {
  getAll: (params) => api.get('/addresses', { params }),
  getById: (id) => api.get(`/addresses/${id}`),
  create: (data) => api.post('/addresses', data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  delete: (id) => api.delete(`/addresses/${id}`),
  setDefault: (id) => api.patch(`/addresses/${id}/set-default`)
}
```

#### 3. Updated Components

**A. Checkout Page (`client/src/pages/customer/Checkout.jsx`)**

- **Changes**:
  - Fetches addresses from `addressAPI.getAll({ type: 'shipping' })`
  - Uses Redux `address` slice instead of `user.shippingAddresses`
  - Enhanced address form with new fields (label, landmark, phone)
  - Integrated `createAddress` thunk for adding addresses
- **Features**:
  - Display all shipping addresses
  - Select address for order
  - Add new address inline during checkout
  - Shows address label, landmark, and phone

**B. Profile Page (`client/src/pages/customer/Profile.jsx`)**

- **Changes**:
  - Complete address management UI
  - Fetches all addresses (not just shipping)
  - Full CRUD operations: Create, Read, Update, Delete
  - Set default address functionality
- **Features**:
  - List all addresses with type badges
  - Edit any address inline
  - Delete confirmation dialog
  - Set/unset default addresses
  - Filter addresses by type
  - Visual indicators for default addresses
  - Address type selection (shipping/billing/business)

#### 4. Store Configuration (`client/src/store/index.js`)

- **Added**: `addressReducer` to store configuration

```javascript
{
  auth: authReducer,
  cart: cartReducer,
  product: productReducer,
  order: orderReducer,
  address: addressReducer, // NEW
}
```

## Backward Compatibility

### User Model

- The `shippingAddresses` array in User model is **retained** for backward compatibility
- New implementations should use the Address model
- Old data can be migrated gradually

### Order Model

- Orders continue to store address snapshots as embedded documents
- No changes required to existing orders
- Order creation now references Address model for validation

### Display-Only Components (NO CHANGES NEEDED)

- `client/src/pages/customer/Orders.jsx` - Displays `order.shippingAddress` (embedded copy)
- `client/src/pages/customer/OrderDetail.jsx` - Displays `order.shippingAddress` (embedded copy)
- Supplier pages displaying order addresses - Use embedded copies from orders

## Benefits of New Architecture

### 1. **Flexibility**

- Multiple address types (shipping, billing, business)
- Custom labels for easy identification
- Additional metadata (landmark, phone)

### 2. **Scalability**

- Addresses can be managed independently
- Easier to add new address-related features
- Better performance with proper indexing

### 3. **Better UX**

- Set different default addresses for different types
- Soft delete preserves history
- Dedicated address management UI in profile

### 4. **Data Integrity**

- Ownership verification in all operations
- Atomic default address updates
- Consistent validation across all endpoints

## Testing Checklist

### Backend Tests

- [ ] Create address with all fields
- [ ] Create address with minimal required fields
- [ ] Get all addresses for user
- [ ] Get addresses filtered by type
- [ ] Update address details
- [ ] Set address as default
- [ ] Delete address (soft delete)
- [ ] Verify only one default per type
- [ ] Test ownership verification (user can't access others' addresses)
- [ ] Create order with address from Address model

### Frontend Tests

- [ ] Load addresses in checkout page
- [ ] Select address during checkout
- [ ] Add new address during checkout
- [ ] Create order with selected address
- [ ] View all addresses in profile
- [ ] Add new address in profile
- [ ] Edit existing address
- [ ] Delete address with confirmation
- [ ] Set/unset default addresses
- [ ] Filter addresses by type

## Migration Strategy (Future)

### Phase 1: Dual Mode (Current)

- Both systems coexist
- New addresses created in Address model
- Old embedded addresses remain in User model

### Phase 2: Data Migration (To Do)

- Create migration script to move embedded addresses to Address collection
- Script location: `backend/src/migrations/migrate-addresses.js`
- Steps:
  1. Fetch all users with embedded addresses
  2. For each address, create Address document
  3. Mark migrated users (add `addressesMigrated: true` flag)
  4. Keep embedded data for rollback capability

### Phase 3: Deprecation (Future)

- Remove `shippingAddresses` from User model
- Update any remaining code references
- Remove migration flags

## API Documentation

### GET /api/v1/addresses

**Query Parameters**:

- `type` (optional): Filter by type (`shipping`, `billing`, `business`)

**Response**:

```json
{
  "success": true,
  "message": "Addresses fetched successfully",
  "data": [
    {
      "_id": "address_id",
      "user": "user_id",
      "type": "shipping",
      "label": "Home",
      "addressLine1": "123 Main St",
      "addressLine2": "Apt 4B",
      "landmark": "Near Central Park",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India",
      "phone": "1234567890",
      "isDefault": true,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/v1/addresses

**Request Body**:

```json
{
  "type": "shipping",
  "label": "Home",
  "addressLine1": "123 Main St",
  "addressLine2": "Apt 4B",
  "landmark": "Near Central Park",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "country": "India",
  "phone": "1234567890",
  "isDefault": true
}
```

### PUT /api/v1/addresses/:addressId

**Request Body**: Same as POST (all fields optional)

### DELETE /api/v1/addresses/:addressId

**Response**: Success message (soft deletes address)

### PATCH /api/v1/addresses/:addressId/set-default

**Response**: Updated address with `isDefault: true`

## Notes

- All address operations require authentication
- Soft delete preserves address history in orders
- Default address auto-promotion when default is deleted
- Pre-save hook ensures only one default per user per type
- Indexes optimize queries: `{user, isDefault}`, `{user, type}`

## Support

For issues or questions related to address management, check:

1. Backend logs for API errors
2. Redux DevTools for state management issues
3. Browser console for frontend errors
4. This documentation for API specifications
