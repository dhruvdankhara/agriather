import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Star, MessageSquare, User, Package } from 'lucide-react';
import { adminAPI } from '../../services';
import toast from 'react-hot-toast';
import { formatDate } from '../../lib/utils';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
      };

      const response = await adminAPI.getAllReviews(params);
      setReviews(response.data.data.reviews);
      setTotalPages(response.data.data.totalPages);
      setTotalReviews(response.data.data.totalReviews);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reviews Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Total: {totalReviews} reviews
          </p>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">No reviews found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {review.customer?.avatar ? (
                        <img
                          src={review.customer.avatar}
                          alt={review.customer.firstname}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-base">
                          {review.customer?.firstname}{' '}
                          {review.customer?.lastname}
                        </CardTitle>
                        <p className="text-xs text-gray-500">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Product Info */}
                  {review.product && (
                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                      {review.product.images?.[0] ? (
                        <img
                          src={review.product.images[0]}
                          alt={review.product.name}
                          className="h-12 w-12 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-200">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{review.product.name}</p>
                        <p className="text-sm text-gray-600">Product Review</p>
                      </div>
                    </div>
                  )}

                  {/* Review Comment */}
                  {review.comment && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Review:
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {review.comment}
                      </p>
                    </div>
                  )}

                  {/* Verified Purchase Badge */}
                  {review.verified && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      ✓ Verified Purchase
                    </span>
                  )}
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
