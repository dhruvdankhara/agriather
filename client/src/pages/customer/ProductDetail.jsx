import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { Textarea } from '../../components/ui/Textarea';
import { formatCurrency } from '../../lib/utils';
import {
  Package,
  ShoppingCart,
  Star,
  Minus,
  Plus,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedProduct: product, loading } = useSelector(
    (state) => state.product
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  const handleAddToCart = async () => {
    try {
      await dispatch(addToCart({ productId: id, quantity })).unwrap();
      toast.success(`Added ${quantity} item(s) to cart!`);
    } catch (error) {
      toast.error(error?.message || error || 'Failed to add to cart');
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
        <h2 className="mb-2 text-2xl font-bold">Product not found</h2>
        <p className="mb-4 text-gray-600">
          The product you're looking for doesn't exist
        </p>
        <Button asChild>
          <Link to="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-600">
        <Link to="/" className="hover:text-blue-600">
          Home
        </Link>
        {' / '}
        <Link to="/products" className="hover:text-blue-600">
          Products
        </Link>
        {' / '}
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="mb-12 grid gap-8 md:grid-cols-2">
        {/* Product Images */}
        <div>
          <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-gray-200">
            {product.images?.[selectedImage] ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 bg-gray-200 ${
                    selectedImage === index
                      ? 'border-blue-600'
                      : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="mb-4 text-3xl font-bold">{product.name}</h1>

          {/* Rating */}
          <div className="mb-4 flex items-center gap-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.averageRating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.averageRating?.toFixed(1) || '0.0'} (
              {product.totalReviews || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(product.discountPrice || product.price)}
              </p>
              {product.discountPrice && (
                <>
                  <p className="text-xl text-gray-400 line-through">
                    {formatCurrency(product.price)}
                  </p>
                  <Badge variant="destructive">
                    {Math.round(
                      ((product.price - product.discountPrice) /
                        product.price) *
                        100
                    )}
                    % OFF
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <Badge
                variant="outline"
                className="border-green-600 text-green-600"
              >
                In Stock: {product.stock} units
              </Badge>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="mb-2 font-semibold">Description</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>

          {/* Category */}
          {product.category && (
            <div className="mb-6">
              <span className="text-sm text-gray-600">Category: </span>
              <Badge variant="secondary">{product.category.name}</Badge>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">Quantity</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.min(Math.max(1, val), product.stock));
                }}
                className="w-20 text-center"
                min="1"
                max={product.stock}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={increaseQuantity}
                disabled={quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            size="lg"
            className="mb-4 w-full"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>

          {/* Supplier Info */}
          {product.supplier && (
            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <h3 className="mb-3 font-semibold">Supplier Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">
                      {product.supplier.fullName}
                    </span>
                  </div>
                  {product.supplier.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {product.supplier.email}
                      </span>
                    </div>
                  )}
                  {product.supplier.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {product.supplier.phone}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold">Customer Reviews</h2>
        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <Card key={review._id}>
                <CardContent className="pt-6">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <p className="font-semibold">
                        {review.customer?.fullName || 'Anonymous'}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
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
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600">{review.review}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">
            No reviews yet. Be the first to review this product!
          </p>
        )}
      </div>
    </div>
  );
}
