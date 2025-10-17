import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingCart,
  User,
  Package,
  LogOut,
  Menu,
  Search,
  Heart,
  X,
  ChevronDown,
  Bell,
  MapPin,
  Truck,
  Leaf,
  Home,
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { Button } from '../components/ui/Button';
import { useState, useEffect } from 'react';

export default function CustomerLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { totalQuantity } = useSelector((state) => state.cart);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  // Categories data
  const categories = [
    { name: 'Seeds', icon: '🌱', path: '/products?category=seeds' },
    { name: 'Fertilizers', icon: '🧪', path: '/products?category=fertilizers' },
    { name: 'Tools', icon: '🔧', path: '/products?category=tools' },
    { name: 'Equipment', icon: '🚜', path: '/products?category=equipment' },
    { name: 'Pesticides', icon: '🛡️', path: '/products?category=pesticides' },
    { name: 'Irrigation', icon: '💧', path: '/products?category=irrigation' },
  ];

  // Handle scroll for navbar shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if link is active
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className={`sticky top-0 z-40 bg-white transition-shadow duration-200 ${
          scrolled ? 'shadow-md' : 'border-b border-gray-200'
        }`}
      >
        {/* Top Bar */}
        <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-10 items-center justify-between text-sm">
              <div className="flex items-center space-x-4 text-gray-600">
                <span className="hidden items-center space-x-1 sm:flex">
                  <Truck className="h-4 w-4" />
                  <span>Free Delivery on Orders Above ₹500</span>
                </span>
                <span className="hidden items-center space-x-1 md:flex">
                  <Leaf className="h-4 w-4 text-green-600" />
                  <span>100% Organic & Verified Products</span>
                </span>
              </div>
              <div className="flex items-center space-x-4 text-gray-600">
                <span className="hidden items-center space-x-1 sm:flex">
                  <MapPin className="h-4 w-4" />
                  <span>Delivering across India</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-2 transition-transform hover:scale-105"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-green-600">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="hidden bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-2xl font-bold text-transparent sm:block">
                Agriather
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <form
              onSubmit={handleSearch}
              className="hidden max-w-xl flex-1 md:block"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for seeds, fertilizers, tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
            </form>

            {/* Desktop Navigation */}
            <nav className="hidden items-center space-x-1 lg:flex">
              <Link
                to="/"
                className={`flex items-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActiveLink('/')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>

              {/* Categories Dropdown */}
              <div className="group relative">
                <button
                  className={`flex items-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    location.pathname === '/products'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                  }`}
                >
                  <Package className="h-4 w-4" />
                  <span>Products</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {/* Dropdown Menu */}
                <div className="ring-opacity-5 absolute left-0 mt-2 hidden w-64 rounded-lg bg-white py-2 shadow-xl ring-1 ring-black group-hover:block">
                  <Link
                    to="/products"
                    className="block px-4 py-2 text-sm font-medium text-gray-900 hover:bg-blue-50"
                  >
                    All Products
                  </Link>
                  <div className="my-2 border-t border-gray-100"></div>
                  <div className="px-3 py-1 text-xs font-semibold text-gray-500">
                    CATEGORIES
                  </div>
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      to={category.path}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span>{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {isAuthenticated && (
                <>
                  <Link
                    to="/orders"
                    className={`flex items-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActiveLink('/orders')
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                    }`}
                  >
                    <Package className="h-4 w-4" />
                    <span>Orders</span>
                  </Link>
                </>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {/* Search Icon - Mobile */}
              <button
                onClick={() => navigate('/products')}
                className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 md:hidden"
              >
                <Search className="h-5 w-5" />
              </button>

              {isAuthenticated ? (
                <>
                  {/* Wishlist */}
                  <button className="relative rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-red-500">
                    <Heart className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      0
                    </span>
                  </button>

                  {/* Cart */}
                  <Link
                    to="/cart"
                    className="relative rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-blue-600"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {totalQuantity > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                        {totalQuantity}
                      </span>
                    )}
                  </Link>

                  {/* Notifications */}
                  <button className="relative rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-blue-600">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
                  </button>

                  {/* User Menu */}
                  <div className="group relative hidden lg:block">
                    <button className="flex items-center space-x-2 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-blue-600">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-green-600 text-sm font-medium text-white">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{user?.name}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <div className="ring-opacity-5 absolute right-0 mt-2 hidden w-56 rounded-lg bg-white py-2 shadow-xl ring-1 ring-black group-hover:block">
                      <div className="border-b border-gray-100 px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.name}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <User className="h-4 w-4" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Package className="h-4 w-4" />
                        <span>My Orders</span>
                      </Link>
                      <Link
                        to="/reviews"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Heart className="h-4 w-4" />
                        <span>My Reviews</span>
                      </Link>
                      <div className="my-1 border-t border-gray-100"></div>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="hidden items-center space-x-2 lg:flex">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate('/register')}
                    className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  >
                    Register
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white lg:hidden">
            {/* Mobile Search */}
            <div className="border-b border-gray-100 p-4 md:hidden">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                  <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                </div>
              </form>
            </div>

            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
              <div className="space-y-1 px-3 py-3">
                <Link
                  to="/"
                  className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActiveLink('/')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </Link>

                <Link
                  to="/products"
                  className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActiveLink('/products')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package className="h-5 w-5" />
                  <span>All Products</span>
                </Link>

                {/* Mobile Categories */}
                <div className="py-2">
                  <div className="px-3 py-1 text-xs font-semibold text-gray-500">
                    CATEGORIES
                  </div>
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      to={category.path}
                      className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span>{category.name}</span>
                    </Link>
                  ))}
                </div>

                {isAuthenticated && (
                  <>
                    <Link
                      to="/orders"
                      className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                        isActiveLink('/orders')
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Package className="h-5 w-5" />
                      <span>My Orders</span>
                    </Link>
                    <Link
                      to="/reviews"
                      className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                        isActiveLink('/reviews')
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Heart className="h-5 w-5" />
                      <span>My Reviews</span>
                    </Link>
                    <Link
                      to="/profile"
                      className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                        isActiveLink('/profile')
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                    <div className="my-2 border-t border-gray-100"></div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </>
                )}

                {!isAuthenticated && (
                  <div className="space-y-2 pt-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate('/login');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      className="w-full justify-start bg-gradient-to-r from-blue-600 to-green-600"
                      onClick={() => {
                        navigate('/register');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Register
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-semibold">Agriather</h3>
              <p className="text-sm text-gray-600">
                Your trusted platform for agricultural products and supplies.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/products"
                    className="text-gray-600 hover:text-blue-600"
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-gray-600 hover:text-blue-600"
                  >
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/contact"
                    className="text-gray-600 hover:text-blue-600"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-gray-600 hover:text-blue-600">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Contact</h4>
              <p className="text-sm text-gray-600">support@agriather.com</p>
              <p className="text-sm text-gray-600">+1 234 567 8900</p>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            © 2024 Agriather. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
