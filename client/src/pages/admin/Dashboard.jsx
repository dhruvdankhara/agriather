import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { formatCurrency } from '../../lib/utils';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  UserPlus,
  PackagePlus,
  MessageSquare,
  Layers,
  Activity,
  RefreshCw,
  Star,
  Box,
  CheckCircle,
} from 'lucide-react';
import { adminAPI } from '../../services';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      const response = await adminAPI.getPlatformStats();
      const data = response.data.data;

      setStats({
        // User stats
        totalUsers:
          (data.users?.totalCustomers || 0) + (data.users?.totalSuppliers || 0),
        totalCustomers: data.users?.totalCustomers || 0,
        totalSuppliers: data.users?.totalSuppliers || 0,
        activeSuppliers: data.users?.activeSuppliers || 0,
        pendingSuppliers: data.users?.pendingSuppliers || 0,
        todayNewUsers: data.users?.todayNewUsers || 0,
        weekNewUsers: data.users?.weekNewUsers || 0,
        monthNewUsers: data.users?.monthNewUsers || 0,

        // Product stats
        totalProducts: data.products?.totalProducts || 0,
        activeProducts: data.products?.activeProducts || 0,
        inactiveProducts: data.products?.inactiveProducts || 0,
        lowStockProducts: data.products?.lowStockProducts || 0,
        outOfStockProducts: data.products?.outOfStockProducts || 0,
        weekNewProducts: data.products?.weekNewProducts || 0,

        // Order stats
        totalOrders: data.orders?.totalOrders || 0,
        pendingOrders: data.orders?.pendingOrders || 0,
        confirmedOrders: data.orders?.confirmedOrders || 0,
        shippedOrders: data.orders?.shippedOrders || 0,
        completedOrders: data.orders?.completedOrders || 0,
        cancelledOrders: data.orders?.cancelledOrders || 0,
        todayOrders: data.orders?.todayOrders || 0,
        weekOrders: data.orders?.weekOrders || 0,
        monthOrders: data.orders?.monthOrders || 0,
        orderGrowth: data.orders?.orderGrowth || 0,

        // Revenue stats
        totalRevenue: data.revenue?.total || 0,
        todayRevenue: data.revenue?.today || 0,
        weekRevenue: data.revenue?.week || 0,
        monthRevenue: data.revenue?.month || 0,
        revenueGrowth: data.revenue?.revenueGrowth || 0,

        // Category stats
        totalCategories: data.categories?.totalCategories || 0,
        topCategories: data.categories?.topCategories || [],

        // Review stats
        totalReviews: data.reviews?.totalReviews || 0,
        weekNewReviews: data.reviews?.weekNewReviews || 0,
        averageRating: data.reviews?.averageRating || 0,

        // Payment stats
        totalPayments: data.payments?.totalPayments || 0,
        completedPayments: data.payments?.completedPayments || 0,
        pendingPayments: data.payments?.pendingPayments || 0,
        failedPayments: data.payments?.failedPayments || 0,

        // Recent activity
        recentOrders: data.recentActivity?.orders || [],
        recentReviews: data.recentActivity?.reviews || [],
      });

      if (showToast) toast.success('Dashboard refreshed successfully');
    } catch {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const GrowthIndicator = ({ value }) => {
    if (value === 0)
      return <span className="text-xs text-gray-500">No change</span>;
    const isPositive = value > 0;
    return (
      <span
        className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}
      >
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {stats?.totalCustomers || 0} Customers •{' '}
                  {stats?.totalSuppliers || 0} Suppliers
                </p>
                <div className="mt-2">
                  <span className="text-xs text-gray-600">New this week: </span>
                  <span className="text-xs font-semibold text-blue-600">
                    {stats?.weekNewUsers || 0}
                  </span>
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold">
                  {stats?.totalProducts || 0}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {stats?.activeProducts || 0} Active •{' '}
                  {stats?.inactiveProducts || 0} Inactive
                </p>
                <div className="mt-2">
                  <span className="text-xs text-gray-600">New this week: </span>
                  <span className="text-xs font-semibold text-green-600">
                    {stats?.weekNewProducts || 0}
                  </span>
                </div>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {stats?.pendingOrders || 0} Pending •{' '}
                  {stats?.completedOrders || 0} Completed
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-600">Growth: </span>
                  <GrowthIndicator value={stats?.orderGrowth || 0} />
                </div>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Month: {formatCurrency(stats?.monthRevenue || 0)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-600">Growth: </span>
                  <GrowthIndicator value={stats?.revenueGrowth || 0} />
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Activity */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Orders</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats?.todayOrders || 0}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats?.todayRevenue || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Users Today</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats?.todayNewUsers || 0}
                </p>
              </div>
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Reviews</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats?.weekNewReviews || 0}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending Suppliers</span>
                <span className="font-semibold text-yellow-600">
                  {stats?.pendingSuppliers || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending Orders</span>
                <span className="font-semibold text-yellow-600">
                  {stats?.pendingOrders || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Low Stock Products
                </span>
                <span className="font-semibold text-red-600">
                  {stats?.lowStockProducts || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Out of Stock</span>
                <span className="font-semibold text-red-600">
                  {stats?.outOfStockProducts || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Failed Payments</span>
                <span className="font-semibold text-red-600">
                  {stats?.failedPayments || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Platform Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Suppliers</span>
                <span className="font-semibold text-green-600">
                  {stats?.activeSuppliers || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Categories</span>
                <span className="font-semibold">
                  {stats?.totalCategories || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average Rating</span>
                <span className="flex items-center gap-1 font-semibold">
                  {stats?.averageRating?.toFixed(1) || '0.0'}
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Reviews</span>
                <span className="font-semibold">
                  {stats?.totalReviews || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Completed Payments
                </span>
                <span className="font-semibold text-green-600">
                  {stats?.completedPayments || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.topCategories && stats.topCategories.length > 0 ? (
                stats.topCategories.map((category, index) => (
                  <div key={category._id} className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      {index + 1}. {category.name}
                    </span>
                    <span className="font-semibold">
                      {category.productCount} products
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No categories available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        #{order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.customer?.firstname} {order.customer?.lastname}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(order.finalAmount)}
                      </p>
                      <span
                        className={`text-xs ${
                          order.status === 'delivered'
                            ? 'text-green-600'
                            : order.status === 'pending'
                              ? 'text-yellow-600'
                              : 'text-blue-600'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent orders</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentReviews && stats.recentReviews.length > 0 ? (
                stats.recentReviews.map((review) => (
                  <div key={review._id} className="border-b pb-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {review.customer?.firstname} {review.customer?.lastname}
                      </p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {review.product?.name}
                    </p>
                    {review.comment && (
                      <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent reviews</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            Order Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {stats?.pendingOrders || 0}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {stats?.confirmedOrders || 0}
              </p>
              <p className="text-sm text-gray-600">Confirmed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {stats?.shippedOrders || 0}
              </p>
              <p className="text-sm text-gray-600">Shipped</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {stats?.completedOrders || 0}
              </p>
              <p className="text-sm text-gray-600">Delivered</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {stats?.cancelledOrders || 0}
              </p>
              <p className="text-sm text-gray-600">Cancelled</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
