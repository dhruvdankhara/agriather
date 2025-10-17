import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchOrderById, cancelOrder } from '../../store/slices/orderSlice';
import { Button } from '../../components/ui/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Textarea } from '../../components/ui/Textarea';
import { formatCurrency } from '../../lib/utils';
import {
  Package,
  MapPin,
  CreditCard,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Star,
  Edit,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewAPI } from '../../services';

export default function OrderDetail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: orderId } = useParams();
  const { currentOrder: order, loading } = useSelector((state) => state.order);

  const [reviewableProducts, setReviewableProducts] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    if (order && order.status === 'delivered') {
      fetchReviewableProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const fetchReviewableProducts = async () => {
    try {
      const response = await reviewAPI.getOrderReviewableProducts(orderId);
      setReviewableProducts(response.data.data.products);
    } catch (error) {
      console.error('Error fetching reviewable products:', error);
    }
  };

  const handleCancelOrder = async () => {
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

  const handleOpenReviewForm = (productItem) => {
    setSelectedProduct(productItem);
    if (productItem.existingReview) {
      setEditingReview(productItem.existingReview);
      setReviewForm({
        rating: productItem.existingReview.rating,
        title: productItem.existingReview.title || '',
        comment: productItem.existingReview.comment,
      });
    } else {
      setEditingReview(null);
      setReviewForm({ rating: 5, title: '', comment: '' });
    }
    setShowReviewForm(true);
  };

  const handleCloseReviewForm = () => {
    setShowReviewForm(false);
    setSelectedProduct(null);
    setEditingReview(null);
    setReviewForm({ rating: 5, title: '', comment: '' });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!reviewForm.comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    setSubmittingReview(true);
    try {
      if (editingReview) {
        await reviewAPI.update(editingReview._id, reviewForm);
        toast.success('Review updated successfully');
      } else {
        await reviewAPI.create({
          productId: selectedProduct.product._id,
          orderId: order._id,
          ...reviewForm,
        });
        toast.success('Review submitted successfully');
      }
      handleCloseReviewForm();
      fetchReviewableProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await reviewAPI.delete(reviewId);
      toast.success('Review deleted successfully');
      fetchReviewableProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete review');
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

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="h-5 w-5" />,
      confirmed: <CheckCircle className="h-5 w-5" />,
      processing: <Package className="h-5 w-5" />,
      shipped: <Truck className="h-5 w-5" />,
      delivered: <CheckCircle className="h-5 w-5" />,
      cancelled: <XCircle className="h-5 w-5" />,
    };
    return icons[status] || <Clock className="h-5 w-5" />;
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash_on_delivery: 'Cash on Delivery',
      card: 'Credit/Debit Card',
      upi: 'UPI',
      net_banking: 'Net Banking',
    };
    return labels[method] || method;
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
        <h2 className="mb-2 text-2xl font-bold">Order not found</h2>
        <p className="mb-6 text-gray-600">
          The order you're looking for doesn't exist or has been removed
        </p>
        <Button onClick={() => navigate('/orders')}>View All Orders</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/orders')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Button>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order Details</h1>
          <p className="mt-2 text-lg text-gray-600">
            Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
          </p>
          <p className="text-sm text-gray-500">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <Badge className={getStatusColor(order.status)}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items &&
                  order.items.map((item, index) => {
                    const reviewableItem = reviewableProducts.find(
                      (p) => p.product._id === item.product?._id
                    );

                    return (
                      <div
                        key={index}
                        className="border-b pb-4 last:border-b-0 last:pb-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-20 w-20 flex-shrink-0 rounded bg-gray-200">
                            {item.product?.images?.[0] ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name || 'Product'}
                                className="h-full w-full rounded object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Package className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <Link
                              to={`/customer/products/${item.product?._id}`}
                              className="text-lg font-medium hover:text-blue-600"
                            >
                              {item.product?.name || 'Product'}
                            </Link>
                            <p className="text-sm text-gray-600">
                              Price: {formatCurrency(item.price)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </p>
                            {item.supplier && (
                              <p className="text-sm text-gray-500">
                                Supplier:{' '}
                                {item.supplier.businessName ||
                                  `${item.supplier.firstname} ${item.supplier.lastname}`}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">
                              {formatCurrency(
                                item.subtotal || item.price * item.quantity
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Review Section for Delivered Orders */}
                        {order.status === 'delivered' && reviewableItem && (
                          <div className="mt-3 flex items-center gap-2">
                            {reviewableItem.existingReview ? (
                              <>
                                <div className="flex-1 rounded-lg bg-green-50 p-3">
                                  <div className="mb-1 flex items-center gap-2">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-4 w-4 ${
                                            i <
                                            reviewableItem.existingReview.rating
                                              ? 'fill-yellow-400 text-yellow-400'
                                              : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    {reviewableItem.existingReview.title && (
                                      <span className="text-sm font-medium">
                                        {reviewableItem.existingReview.title}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-700">
                                    {reviewableItem.existingReview.comment}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleOpenReviewForm(reviewableItem)
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    handleDeleteReview(
                                      reviewableItem.existingReview._id
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            ) : reviewableItem.canReview ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleOpenReviewForm(reviewableItem)
                                }
                                className="gap-2"
                              >
                                <Star className="h-4 w-4" />
                                Write a Review
                              </Button>
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {order.statusHistory && order.statusHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.statusHistory.map((history, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${getStatusColor(history.status)}`}
                        >
                          {getStatusIcon(history.status)}
                        </div>
                        {index < order.statusHistory.length - 1 && (
                          <div className="h-full w-0.5 bg-gray-300"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-semibold">
                          {history.status.charAt(0).toUpperCase() +
                            history.status.slice(1)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(history.timestamp).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {history.note && (
                          <p className="mt-1 text-sm text-gray-500">
                            {history.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (18% GST):</span>
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
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-3 text-lg font-bold">
                <span>Total:</span>
                <span className="text-blue-600">
                  {formatCurrency(order.finalAmount || order.totalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>

          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p className="text-sm">
                    {order.shippingAddress.addressLine2}
                  </p>
                )}
                <p className="text-sm">
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                  {order.shippingAddress.pincode}
                </p>
                <p className="text-sm">{order.shippingAddress.country}</p>
              </CardContent>
            </Card>
          )}

          {order.paymentId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Method:</span>
                  <span>
                    {getPaymentMethodLabel(order.paymentId.paymentMethod)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <Badge
                    className={
                      order.paymentId.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {order.paymentId.status.charAt(0).toUpperCase() +
                      order.paymentId.status.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {order.status === 'pending' && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleCancelOrder}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && selectedProduct && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{editingReview ? 'Edit Review' : 'Write a Review'}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseReviewForm}
                >
                  ✕
                </Button>
              </CardTitle>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-16 w-16 flex-shrink-0 rounded bg-gray-200">
                  {selectedProduct.product.images?.[0] ? (
                    <img
                      src={selectedProduct.product.images[0]}
                      alt={selectedProduct.product.name}
                      className="h-full w-full rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">
                    {selectedProduct.product.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(selectedProduct.price)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <Label htmlFor="rating">Rating *</Label>
                  <div className="mt-2 flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setReviewForm({ ...reviewForm, rating: star })
                        }
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 cursor-pointer transition-colors ${
                            star <= reviewForm.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 hover:text-yellow-200'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-lg font-medium">
                      {reviewForm.rating} / 5
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Review Title (Optional)</Label>
                  <Input
                    id="title"
                    value={reviewForm.title}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, title: e.target.value })
                    }
                    placeholder="Give your review a title"
                    maxLength={100}
                  />
                </div>

                <div>
                  <Label htmlFor="comment">Review Comment *</Label>
                  <Textarea
                    id="comment"
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, comment: e.target.value })
                    }
                    placeholder="Share your experience with this product..."
                    rows={5}
                    required
                    maxLength={1000}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {reviewForm.comment.length} / 1000 characters
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseReviewForm}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingReview}
                    className="flex-1"
                  >
                    {submittingReview ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Submitting...
                      </>
                    ) : editingReview ? (
                      'Update Review'
                    ) : (
                      'Submit Review'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
