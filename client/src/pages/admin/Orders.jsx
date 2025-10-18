import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/Select';
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { adminAPI } from '../../services';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../../lib/utils';
import { ORDER_STATUS } from '../../constants';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
      };

      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await adminAPI.getAllOrders(params);
      setOrders(response.data.data.orders);
      setTotalPages(response.data.data.totalPages);
      setTotalOrders(response.data.data.totalOrders);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return <Clock className="h-4 w-4" />;
      case ORDER_STATUS.CONFIRMED:
        return <Package className="h-4 w-4" />;
      case ORDER_STATUS.SHIPPED:
        return <Truck className="h-4 w-4" />;
      case ORDER_STATUS.DELIVERED:
        return <CheckCircle className="h-4 w-4" />;
      case ORDER_STATUS.CANCELLED:
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-700';
      case ORDER_STATUS.CONFIRMED:
        return 'bg-blue-100 text-blue-700';
      case ORDER_STATUS.SHIPPED:
        return 'bg-purple-100 text-purple-700';
      case ORDER_STATUS.DELIVERED:
        return 'bg-green-100 text-green-700';
      case ORDER_STATUS.CANCELLED:
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Total: {totalOrders} orders
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Filter by Status:</label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order.orderNumber}
                    </CardTitle>
                    <p className="mt-1 text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Customer Info */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Customer
                      </p>
                      <p className="mt-1 text-sm">
                        {order.customer?.firstname} {order.customer?.lastname}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.customer?.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Payment Method
                      </p>
                      <p className="mt-1 text-sm capitalize">
                        {order.paymentMethod?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Items ({order.items?.length})
                    </p>
                    <div className="space-y-2">
                      {order.items?.slice(0, 3).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg bg-gray-50 p-2 text-sm"
                        >
                          <span className="truncate">
                            {item.product?.name || 'Product'}
                          </span>
                          <span className="ml-2 whitespace-nowrap text-gray-600">
                            {item.quantity} × {formatCurrency(item.price)}
                          </span>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Shipping Address
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {order.shippingAddress.addressLine1}
                        {order.shippingAddress.addressLine2 &&
                          `, ${order.shippingAddress.addressLine2}`}
                        <br />
                        {order.shippingAddress.city},{' '}
                        {order.shippingAddress.state} -{' '}
                        {order.shippingAddress.pincode}
                      </p>
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{formatCurrency(order.totalAmount || 0)}</span>
                    </div>
                    {order.shippingCharges > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span>
                          {formatCurrency(order.shippingCharges || 0)}
                        </span>
                      </div>
                    )}
                    {order.tax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span>{formatCurrency(order.tax || 0)}</span>
                      </div>
                    )}
                    <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
                      <span>Total</span>
                      <span className="text-green-600">
                        {formatCurrency(order.finalAmount || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
