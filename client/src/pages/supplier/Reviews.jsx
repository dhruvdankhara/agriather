import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Star, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { reviewAPI } from '../../services';
import toast from 'react-hot-toast';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getSupplierReviews();
      const reviewData = Array.isArray(response.data.data.reviews)
        ? response.data.data.reviews
        : Array.isArray(response.data.data)
          ? response.data.data
          : [];
      setReviews(reviewData);

      // Calculate stats
      const totalReviews = reviewData.length;
      const averageRating = totalReviews
        ? reviewData.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;
      const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
        rating,
        count: reviewData.filter((r) => r.rating === rating).length,
        percentage: totalReviews
          ? (reviewData.filter((r) => r.rating === rating).length /
              totalReviews) *
            100
          : 0,
      }));

      setStats({
        totalReviews,
        averageRating: averageRating.toFixed(1),
        ratingDistribution,
      });
    } catch {
      toast.error('Failed to fetch reviews');
      setReviews([]);
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
      <div>
        <h1 className="text-3xl font-bold">Product Reviews</h1>
        <p className="mt-2 text-gray-600">
          View and manage customer reviews for your products
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold">{stats?.totalReviews || 0}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">
                    {stats?.averageRating || '0.0'}
                  </p>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(parseFloat(stats?.averageRating || 0))
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {parseFloat(stats?.averageRating || 0) >= 4 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="mb-3 text-sm font-medium text-gray-600">
                Rating Distribution
              </p>
              <div className="space-y-2">
                {stats?.ratingDistribution?.map((item) => (
                  <div key={item.rating} className="flex items-center gap-2">
                    <div className="flex w-12 items-center gap-1 text-xs">
                      <span>{item.rating}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-yellow-400"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-8 text-xs text-gray-600">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="py-16 text-center">
          <Star className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold">No reviews yet</h3>
          <p className="text-gray-600">
            Customer reviews will appear here once your products are purchased
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review._id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Link
                    to={`/products/${review.product?._id}`}
                    className="h-20 w-20 flex-shrink-0 rounded bg-gray-200"
                  >
                    {review.product?.images?.[0] ? (
                      <img
                        src={review.product.images[0]}
                        alt={review.product.name}
                        className="h-full w-full rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <Link
                          to={`/products/${review.product?._id}`}
                          className="font-semibold hover:text-blue-600"
                        >
                          {review.product?.name || 'Product'}
                        </Link>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            by{' '}
                            {review.customer
                              ? `${review.customer.firstname || ''} ${review.customer.lastname || ''}`.trim() ||
                                review.customer.email ||
                                'Anonymous'
                              : 'Anonymous'}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
