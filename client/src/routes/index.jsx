import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { USER_ROLES } from '../constants';

// Auth pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Customer pages
import CustomerLayout from '../layouts/CustomerLayout';
import Home from '../pages/customer/Home';
import Products from '../pages/customer/Products';
import ProductDetail from '../pages/customer/ProductDetail';
import Cart from '../pages/customer/Cart';
import Checkout from '../pages/customer/Checkout';
import Orders from '../pages/customer/Orders';
import OrderDetail from '../pages/customer/OrderDetail';
import Profile from '../pages/customer/Profile';
import Reviews from '../pages/customer/Reviews';

// Supplier pages
import SupplierLayout from '../layouts/SupplierLayout';
import SupplierDashboard from '../pages/supplier/Dashboard';
import SupplierProducts from '../pages/supplier/Products';
import SupplierOrders from '../pages/supplier/Orders';
import SupplierPayments from '../pages/supplier/Payments';
import SupplierReviews from '../pages/supplier/Reviews';
import SupplierReports from '../pages/supplier/Reports';
import SupplierProfile from '../pages/supplier/Profile';

// Admin pages
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminSuppliers from '../pages/admin/Suppliers';
import AdminCustomers from '../pages/admin/Customers';
import AdminCategories from '../pages/admin/Categories';
import AdminOrders from '../pages/admin/Orders';
import AdminPayments from '../pages/admin/Payments';
import AdminReviews from '../pages/admin/Reviews';
import AdminReports from '../pages/admin/Reports';
import AdminProfile from '../pages/admin/Profile';

// Protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public route wrapper (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    if (user?.role === USER_ROLES.ADMIN) {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === USER_ROLES.SUPPLIER) {
      return <Navigate to="/supplier" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Customer routes */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route
          path="cart"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders/:id"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
              <OrderDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="reviews"
          element={
            <ProtectedRoute>
              <Reviews />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Supplier routes */}
      <Route
        path="/supplier"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.SUPPLIER]}>
            <SupplierLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SupplierDashboard />} />
        <Route path="products" element={<SupplierProducts />} />
        <Route path="orders" element={<SupplierOrders />} />
        <Route path="payments" element={<SupplierPayments />} />
        <Route path="reviews" element={<SupplierReviews />} />
        <Route path="reports" element={<SupplierReports />} />
        <Route path="profile" element={<SupplierProfile />} />
      </Route>

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="suppliers" element={<AdminSuppliers />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
