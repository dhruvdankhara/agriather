import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import {
  fetchProducts,
  fetchCategories,
} from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { formatCurrency } from '../../lib/utils';
import { Package, Search, ShoppingCart, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Products() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    products: rawProducts,
    categories: rawCategories,
    loading,
    totalProducts,
    currentPage,
    totalPages,
  } = useSelector((state) => state.product);

  // Safe array access
  const products = Array.isArray(rawProducts) ? rawProducts : [];
  const categories = Array.isArray(rawCategories) ? rawCategories : [];

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || ''
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || ''
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get('sort') || '-createdAt'
  );
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('minPrice') || '',
    max: searchParams.get('maxPrice') || '',
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const params = {
      page: searchParams.get('page') || 1,
      limit: 12,
      sort: sortBy,
    };

    if (searchTerm) params.search = searchTerm;
    if (selectedCategory) params.category = selectedCategory;
    if (priceRange.min) params.minPrice = priceRange.min;
    if (priceRange.max) params.maxPrice = priceRange.max;

    dispatch(fetchProducts(params));
  }, [
    dispatch,
    searchParams,
    searchTerm,
    selectedCategory,
    sortBy,
    priceRange,
  ]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    const params = new URLSearchParams(searchParams);
    if (value) {
      if (value == 'all') {
        params.set('category', '');
      } else {
        params.set('category', value);
      }
    } else {
      params.delete('category');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    const params = new URLSearchParams(searchParams);
    params.set('sort', value);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePriceFilter = () => {
    const params = new URLSearchParams(searchParams);
    if (priceRange.min) {
      params.set('minPrice', priceRange.min);
    } else {
      params.delete('minPrice');
    }
    if (priceRange.max) {
      params.set('maxPrice', priceRange.max);
    } else {
      params.delete('maxPrice');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = async (productId) => {
    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error?.message || error || 'Failed to add to cart');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('-createdAt');
    setPriceRange({ min: '', max: '' });
    setSearchParams({});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Products</h1>
        <p className="text-sm text-gray-600 sm:text-base">
          Discover quality agricultural products from verified suppliers
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4 rounded-lg bg-white p-4 shadow-sm sm:mb-8 sm:p-6">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" size="sm" className="sm:px-6">
            Search
          </Button>
        </form>

        {/* Filters - Responsive Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-createdAt">Newest First</SelectItem>
              <SelectItem value="createdAt">Oldest First</SelectItem>
              <SelectItem value="price">Price: Low to High</SelectItem>
              <SelectItem value="-price">Price: High to Low</SelectItem>
              <SelectItem value="-averageRating">Top Rated</SelectItem>
              <SelectItem value="name">Name: A to Z</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Min Price"
            value={priceRange.min}
            onChange={(e) =>
              setPriceRange({ ...priceRange, min: e.target.value })
            }
            onBlur={handlePriceFilter}
          />

          <Input
            type="number"
            placeholder="Max Price"
            value={priceRange.max}
            onChange={(e) =>
              setPriceRange({ ...priceRange, max: e.target.value })
            }
            onBlur={handlePriceFilter}
          />
        </div>

        {(searchTerm ||
          selectedCategory ||
          priceRange.min ||
          priceRange.max) && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <Filter className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {products.length} of {totalProducts || 0} products
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold">No products found</h3>
          <p className="mb-4 text-gray-600">Try adjusting your filters</p>
          <Button onClick={clearFilters}>Clear Filters</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
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
                  {product.stock > 0 ? (
                    <Badge variant="outline" className="mb-3 text-xs">
                      In Stock: {product.stock}
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="mb-3 text-xs">
                      Out of Stock
                    </Badge>
                  )}
                </CardContent>
                <CardFooter className="flex gap-2 p-3 pt-0 sm:p-4 sm:pt-0">
                  <Button
                    asChild
                    className="flex-1"
                    variant="outline"
                    size="sm"
                  >
                    <Link to={`/products/${product._id}`}>View</Link>
                  </Button>
                  <Button
                    onClick={() => handleAddToCart(product._id)}
                    disabled={product.stock === 0}
                    className="flex-1"
                    size="sm"
                  >
                    <ShoppingCart className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Add</span>
                    <span className="sm:hidden">+</span>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                size="sm"
              >
                Previous
              </Button>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      onClick={() => handlePageChange(page)}
                      size="sm"
                      className="min-w-[40px]"
                    >
                      {page}
                    </Button>
                  )
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                size="sm"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
