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
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h1 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                Quality Agricultural Products
              </h1>
              <p className="mb-6 text-base text-green-50 sm:text-lg">
                Your trusted marketplace for farming supplies. Connect with
                verified suppliers and get the best deals.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  <Link to="/products">Shop Now</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full border-white bg-transparent text-white hover:bg-green-800 sm:w-auto"
                >
                  <Link to="/register">Become a Supplier</Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Card className="border-white/20 bg-white/10 text-white backdrop-blur-sm">
                <CardContent className="p-4 sm:pt-6">
                  <Package className="mb-2 h-6 w-6 sm:h-8 sm:w-8" />
                  <p className="text-xl font-bold sm:text-2xl">1000+</p>
                  <p className="text-xs text-green-50 sm:text-sm">Products</p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 text-white backdrop-blur-sm">
                <CardContent className="p-4 sm:pt-6">
                  <Users className="mb-2 h-6 w-6 sm:h-8 sm:w-8" />
                  <p className="text-xl font-bold sm:text-2xl">500+</p>
                  <p className="text-xs text-green-50 sm:text-sm">Suppliers</p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 text-white backdrop-blur-sm">
                <CardContent className="p-4 sm:pt-6">
                  <ShoppingCart className="mb-2 h-6 w-6 sm:h-8 sm:w-8" />
                  <p className="text-xl font-bold sm:text-2xl">5000+</p>
                  <p className="text-xs text-green-50 sm:text-sm">Orders</p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 text-white backdrop-blur-sm">
                <CardContent className="p-4 sm:pt-6">
                  <TrendingUp className="mb-2 h-6 w-6 sm:h-8 sm:w-8" />
                  <p className="text-xl font-bold sm:text-2xl">98%</p>
                  <p className="text-xs text-green-50 sm:text-sm">
                    Satisfaction
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold sm:text-3xl">
          Browse Categories
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {categories.slice(0, 8).map((category) => (
            <Link
              key={category._id}
              to={`/products?category=${category._id}`}
              className="group rounded-lg border-2 border-gray-200 p-4 text-center transition-all hover:border-green-600 hover:shadow-md sm:p-6"
            >
              <div className="mb-2 text-3xl sm:text-4xl">🌾</div>
              <h3 className="text-sm font-semibold group-hover:text-green-600 sm:text-base">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="bg-gray-50 py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold sm:text-3xl">Latest Products</h2>
            <Button asChild variant="outline" size="sm">
              <Link to="/products">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {products.slice(0, 8).map((product) => (
              <Card
                key={product._id}
                className="group overflow-hidden transition-shadow hover:shadow-lg"
              >
                <CardContent className="p-3 sm:p-4">
                  <Link to={`/products/${product._id}`}>
                    <div className="mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <Package className="h-12 w-12 text-gray-400 sm:h-16 sm:w-16" />
                      )}
                    </div>
                  </Link>
                  <Link to={`/products/${product._id}`}>
                    <h3 className="mb-2 line-clamp-2 text-sm font-semibold group-hover:text-green-600 sm:text-base">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="mb-3 line-clamp-2 text-xs text-gray-600 sm:text-sm">
                    {product.description}
                  </p>
                  <div className="mb-3 flex items-baseline justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-base font-bold text-green-600 sm:text-lg">
                        {formatCurrency(product.discountPrice || product.price)}
                      </p>
                      {product.discountPrice && (
                        <p className="text-xs text-gray-400 line-through sm:text-sm">
                          {formatCurrency(product.price)}
                        </p>
                      )}
                    </div>
                    {product.discountPrice && (
                      <Badge variant="destructive" className="text-xs">
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
                <CardFooter className="p-3 pt-0 sm:p-4 sm:pt-0">
                  <Button asChild className="w-full" size="sm">
                    <Link to={`/products/${product._id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">
          Why Choose Us?
        </h2>
        <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 sm:h-16 sm:w-16">
              <Package className="h-7 w-7 text-green-600 sm:h-8 sm:w-8" />
            </div>
            <h3 className="mb-2 text-lg font-semibold sm:text-xl">
              Quality Products
            </h3>
            <p className="text-sm text-gray-600 sm:text-base">
              All products from verified suppliers with quality assurance
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 sm:h-16 sm:w-16">
              <TrendingUp className="h-7 w-7 text-green-600 sm:h-8 sm:w-8" />
            </div>
            <h3 className="mb-2 text-lg font-semibold sm:text-xl">
              Best Prices
            </h3>
            <p className="text-sm text-gray-600 sm:text-base">
              Competitive pricing with special discounts and offers
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 sm:h-16 sm:w-16">
              <ShoppingCart className="h-7 w-7 text-green-600 sm:h-8 sm:w-8" />
            </div>
            <h3 className="mb-2 text-lg font-semibold sm:text-xl">
              Fast Delivery
            </h3>
            <p className="text-sm text-gray-600 sm:text-base">
              Quick and reliable delivery to your doorstep
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
