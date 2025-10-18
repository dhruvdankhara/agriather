import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { formatCurrency } from '../../lib/utils';
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { productAPI, orderAPI } from '../../services';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        productAPI.getSupplierProducts(),
        orderAPI.getSupplierOrders({ limit: 5 }),
      ]);

      console.log('🚀 ~ Dashboard.jsx:35 ~ fetchDashboardData ~ e:', ordersRes);

      const products = productsRes.data.data.products || [];
      const orders = ordersRes.data.data.orders || [];

      const totalRevenue = orders.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
      );
      const pendingOrders = orders.filter((o) => o.status === 'pending').length;

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
      });

      setRecentOrders(orders.slice(0, 5));
      setTopProducts(products.slice(0, 5));
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Supplier Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold">
                  {stats?.totalProducts || 0}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-600" />
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
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold">
                  {stats?.pendingOrders || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link to="/supplier/orders">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="py-4 text-center text-gray-600">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <div>
                      <p className="font-medium">
                        #
                        {order.orderNumber || order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.items?.length || 0} items
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <span
                        className={`rounded px-2 py-1 text-xs capitalize ${
                          order.status?.toLowerCase() === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status?.toLowerCase() === 'confirmed'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status?.toLowerCase() === 'shipped'
                                ? 'bg-purple-100 text-purple-800'
                                : order.status?.toLowerCase() === 'delivered'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Products</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link to="/supplier/products">Manage</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="py-4 text-center text-gray-600">No products yet</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center gap-3 border-b pb-3"
                  >
                    <div className="h-12 w-12 flex-shrink-0 rounded bg-gray-200">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        Stock: {product.stock}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
