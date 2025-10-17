import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchCustomerOrders,
  cancelOrder,
} from '../../store/slices/orderSlice';
import { Button } from '../../components/ui/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { formatCurrency } from '../../lib/utils';
import { Package, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Orders() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchCustomerOrders());
  }, [dispatch]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      await dispatch(
        cancelOrder({ orderId, cancellationReason: 'Customer request' })
      ).unwrap();
      toast.success('Order cancelled successfully');
    } catch (error) {
      toast.error(error || 'Failed to cancel order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold">My Orders</h1>

      {!orders || orders.length === 0 ? (
        <div className="py-16 text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold">No orders yet</h3>
          <p className="mb-6 text-gray-600">
            Start shopping to create your first order
          </p>
          <Button asChild>
            <Link to="/customer/products">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
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
                      Placed on{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 space-y-3">
                  {order.items &&
                    order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="h-16 w-16 flex-shrink-0 rounded bg-gray-200">
                          {item.product?.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name || 'Product'}
                              className="h-full w-full rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <Link
                            to={`/customer/products/${item.product?._id}`}
                            className="font-medium hover:text-blue-600"
                          >
                            {item.product?.name || 'Product'}
                          </Link>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} ×{' '}
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency(
                              item.subtotal || item.price * item.quantity
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="ml-auto max-w-xs space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                  {order.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span>{formatCurrency(order.tax)}</span>
                    </div>
                  )}
                  {order.shippingCharges !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping:</span>
                      <span>
                        {order.shippingCharges === 0
                          ? 'Free'
                          : formatCurrency(order.shippingCharges)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2 text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">
                      {formatCurrency(order.finalAmount || order.totalAmount)}
                    </span>
                  </div>
                </div>

                {order.shippingAddress && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-4">
                    <p className="mb-2 font-semibold">Shipping Address:</p>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress.addressLine1}
                      {order.shippingAddress.addressLine2 &&
                        `, ${order.shippingAddress.addressLine2}`}
                      <br />
                      {order.shippingAddress.city},{' '}
                      {order.shippingAddress.state} -{' '}
                      {order.shippingAddress.pincode}
                      <br />
                      {order.shippingAddress.country}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/customer/orders/${order._id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </Button>
                  {order.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelOrder(order._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel Order
                    </Button>
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
