import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchProducts,
  fetchCategories,
} from '../../store/slices/productSlice';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { formatCurrency } from '../../lib/utils';
import { ShoppingCart, TrendingUp, Users, Package } from 'lucide-react';

export default function Home() {
  const dispatch = useDispatch();
  const {
    products: rawProducts,
    categories: rawCategories,
    loading,
  } = useSelector((state) => state.product);

  // Safe array access
  const products = Array.isArray(rawProducts) ? rawProducts : [];
  const categories = Array.isArray(rawCategories) ? rawCategories : [];

  useEffect(() => {
    dispatch(fetchProducts({ limit: 8, sort: '-createdAt' }));
    dispatch(fetchCategories());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-blue-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h1 className="mb-4 text-4xl font-bold md:text-5xl">
                Welcome to Agriather
              </h1>
              <p className="mb-6 text-xl text-blue-100">
                Your trusted marketplace for quality agricultural products.
                Connect with verified suppliers and get the best deals on
                fertilizers, pesticides, and farming equipment.
              </p>
              <div className="flex gap-4">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/products">Browse Products</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-blue-700"
                >
                  <Link to="/register">Become a Supplier</Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-white/20 bg-white/10 text-white">
                <CardContent className="pt-6">
                  <Package className="mb-2 h-8 w-8" />
                  <p className="text-2xl font-bold">1000+</p>
                  <p className="text-sm text-blue-100">Products</p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 text-white">
                <CardContent className="pt-6">
                  <Users className="mb-2 h-8 w-8" />
                  <p className="text-2xl font-bold">500+</p>
                  <p className="text-sm text-blue-100">Suppliers</p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 text-white">
                <CardContent className="pt-6">
                  <ShoppingCart className="mb-2 h-8 w-8" />
                  <p className="text-2xl font-bold">5000+</p>
                  <p className="text-sm text-blue-100">Orders</p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 text-white">
                <CardContent className="pt-6">
                  <TrendingUp className="mb-2 h-8 w-8" />
                  <p className="text-2xl font-bold">98%</p>
                  <p className="text-sm text-blue-100">Satisfaction</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-3xl font-bold">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.slice(0, 8).map((category) => (
            <Link
              key={category._id}
              to={`/products?category=${category._id}`}
              className="rounded-lg border border-gray-200 p-6 text-center transition-all hover:border-blue-600 hover:shadow-md"
            >
              <div className="mb-2 text-4xl">🌾</div>
              <h3 className="font-semibold">{category.name}</h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Latest Products</h2>
            <Button asChild variant="outline">
              <Link to="/products">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 8).map((product) => (
              <Card
                key={product._id}
                className="transition-shadow hover:shadow-lg"
              >
                <CardContent className="p-4">
                  <div className="mb-4 flex aspect-square items-center justify-center rounded-lg bg-gray-200">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ) : (
                      <Package className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                  <h3 className="mb-2 line-clamp-2 font-semibold">
                    {product.name}
                  </h3>
                  <p className="mb-2 line-clamp-2 text-sm text-gray-500">
                    {product.description}
                  </p>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(product.discountPrice || product.price)}
                      </p>
                      {product.discountPrice && (
                        <p className="text-sm text-gray-400 line-through">
                          {formatCurrency(product.price)}
                        </p>
                      )}
                    </div>
                    {product.discountPrice && (
                      <Badge variant="destructive">
                        {Math.round(
                          ((product.price - product.discountPrice) /
                            product.price) *
                            100
                        )}
                        % OFF
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button asChild className="w-full">
                    <Link to={`/products/${product._id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-3xl font-bold">
          Why Choose Agriather?
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Quality Products</h3>
            <p className="text-gray-600">
              All products from verified suppliers with quality assurance
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Best Prices</h3>
            <p className="text-gray-600">
              Competitive pricing with special discounts and offers
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Fast Delivery</h3>
            <p className="text-gray-600">
              Quick and reliable delivery to your doorstep
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
