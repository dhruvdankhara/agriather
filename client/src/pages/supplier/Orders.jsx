import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { formatCurrency } from '../../lib/utils';
import { Package, ArrowLeft } from 'lucide-react';
import { orderAPI } from '../../services';
import toast from 'react-hot-toast';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getSupplierOrders();
      const data = response.data.data;
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch {
      toast.error('Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateOrderStatus(orderId, {
        status: newStatus,
      });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-cyan-100 text-cyan-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[statusLower] || 'bg-gray-100 text-gray-800';
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Button variant="outline" asChild>
          <Link to="/supplier/products">
            <Package className="mr-2 h-4 w-4" />
            View Products
          </Link>
        </Button>
      </div>

      {!Array.isArray(orders) || orders.length === 0 ? (
        <div className="py-16 text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold">No orders yet</h3>
          <p className="mb-4 text-gray-600">
            Orders from customers will appear here
          </p>
          <Button asChild>
            <Link to="/supplier/products">
              <Package className="mr-2 h-4 w-4" />
              Manage Products
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Order #
                      {order.orderNumber || order._id.slice(-8).toUpperCase()}
                    </CardTitle>
                    <p className="mt-1 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()} at{' '}
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status?.charAt(0).toUpperCase() +
                        order.status?.slice(1).toLowerCase()}
                    </Badge>
                    {order.status?.toLowerCase() !== 'delivered' &&
                      order.status?.toLowerCase() !== 'cancelled' && (
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            handleUpdateStatus(order._id, value)
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 space-y-3">
                  {Array.isArray(order.items) &&
                    order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <Link
                          to="/supplier/products"
                          className="h-16 w-16 flex-shrink-0 rounded bg-gray-200 transition-opacity hover:opacity-75"
                        >
                          {item.product?.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="h-full w-full rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </Link>
                        <div className="flex-1">
                          <Link
                            to="/supplier/products"
                            className="font-medium hover:text-blue-600 hover:underline"
                          >
                            {item.product?.name || 'Product'}
                          </Link>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} ×{' '}
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-medium">
                      {order.customer
                        ? `${order.customer.firstname || ''} ${order.customer.lastname || ''}`.trim() ||
                          order.customer.email
                        : 'N/A'}
                    </p>
                    {order.customer?.phone && (
                      <p className="text-sm text-gray-500">
                        {order.customer.phone}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                  <p className="mb-2 font-semibold">Shipping Address:</p>
                  {order.shippingAddress ? (
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress.addressLine1}
                      {order.shippingAddress.addressLine2 &&
                        `, ${order.shippingAddress.addressLine2}`}
                      {order.shippingAddress.landmark &&
                        ` (Near ${order.shippingAddress.landmark})`}
                      <br />
                      {order.shippingAddress.city},{' '}
                      {order.shippingAddress.state} -{' '}
                      {order.shippingAddress.pincode}
                      <br />
                      {order.shippingAddress.country}
                      {order.shippingAddress.phone && (
                        <>
                          <br />
                          Phone: {order.shippingAddress.phone}
                        </>
                      )}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">No address provided</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
