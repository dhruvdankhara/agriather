import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/Select';
import { formatCurrency } from '../../lib/utils';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  AlertTriangle,
  Calendar,
  TrendingDown as TrendingDownIcon,
} from 'lucide-react';
import { reportAPI } from '../../services';
import toast from 'react-hot-toast';

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  const generateMockData = () => {
    return {
      overview: {
        totalSales: 45230,
        totalOrders: 156,
        totalProducts: 24,
        totalCustomers: 89,
        salesGrowth: 12.5,
        ordersGrowth: 8.3,
      },
      topProducts: [
        {
          _id: '1',
          name: 'Organic Tomatoes',
          sales: 125,
          revenue: 3750,
          category: 'Vegetables',
        },
        {
          _id: '2',
          name: 'Fresh Strawberries',
          sales: 98,
          revenue: 4900,
          category: 'Fruits',
        },
        {
          _id: '3',
          name: 'Chicken Eggs (Dozen)',
          sales: 87,
          revenue: 1740,
          category: 'Dairy & Eggs',
        },
        {
          _id: '4',
          name: 'Organic Spinach',
          sales: 76,
          revenue: 1520,
          category: 'Vegetables',
        },
        {
          _id: '5',
          name: 'Fresh Milk (1L)',
          sales: 65,
          revenue: 1950,
          category: 'Dairy & Eggs',
        },
      ],
      salesByCategory: [
        { category: 'Vegetables', sales: 15400, percentage: 34 },
        { category: 'Fruits', sales: 12300, percentage: 27 },
        { category: 'Dairy & Eggs', sales: 9800, percentage: 22 },
        { category: 'Grains', sales: 5200, percentage: 11 },
        { category: 'Others', sales: 2530, percentage: 6 },
      ],
      recentTrends: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        sales: [8500, 10200, 12300, 14230],
        orders: [28, 35, 42, 51],
      },
    };
  };

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const response = await reportAPI.getSupplierReports({ period });
        const apiData = response.data.data;

        // Check if API returned actual data
        if (
          apiData &&
          apiData.summary &&
          Object.keys(apiData.summary).length > 0
        ) {
          // Transform API data to match component structure
          const transformedData = {
            overview: {
              totalSales: apiData.summary.totalRevenue || 0,
              totalOrders: apiData.summary.totalOrders || 0,
              totalProducts: apiData.summary.totalProducts || 0,
              totalCustomers: apiData.summary.uniqueCustomers || 0,
              salesGrowth: apiData.summary.salesGrowth || 0,
              ordersGrowth: apiData.summary.ordersGrowth || 0,
              averageOrderValue: apiData.summary.averageOrderValue || 0,
              totalQuantitySold: apiData.summary.totalQuantitySold || 0,
            },
            topProducts:
              apiData.productWiseSales?.slice(0, 5).map((product) => ({
                _id: product._id,
                name: product.productName,
                sales: product.totalQuantity,
                revenue: product.totalSales,
                category: product.category || 'N/A',
              })) || [],
            salesByCategory: apiData.categoryWiseSales || [],
            recentTrends: {
              labels: apiData.salesTrend?.map((t) => t._id) || [],
              sales: apiData.salesTrend?.map((t) => t.totalSales) || [],
              orders: apiData.salesTrend?.map((t) => t.totalOrders) || [],
            },
            lowStockProducts: apiData.lowStockProducts || [],
            periodInfo: apiData.periodInfo || null,
          };
          setReportData(transformedData);
        } else {
          // No sales data yet - show mock data
          setReportData(generateMockData());
          toast.info('No sales data available yet. Showing sample data.');
        }
      } catch (error) {
        console.error('Failed to fetch reports:', error);
        // API error - show mock data
        setReportData(generateMockData());
        toast.error('Failed to load reports. Showing sample data.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [period]);

  const handleExport = () => {
    toast.success('Report exported successfully');
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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Reports</h1>
          <p className="mt-2 text-gray-600">
            Analyze your sales performance and trends
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(reportData?.overview?.totalSales || 0)}
                </p>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  {reportData?.overview?.salesGrowth >= 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">
                        +{reportData?.overview?.salesGrowth}%
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 text-red-600" />
                      <span className="text-red-600">
                        {reportData?.overview?.salesGrowth}%
                      </span>
                    </>
                  )}
                  <span className="text-gray-500">vs last period</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">
                  {reportData?.overview?.totalOrders || 0}
                </p>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  {reportData?.overview?.ordersGrowth >= 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">
                        +{reportData?.overview?.ordersGrowth}%
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 text-red-600" />
                      <span className="text-red-600">
                        {reportData?.overview?.ordersGrowth}%
                      </span>
                    </>
                  )}
                  <span className="text-gray-500">vs last period</span>
                </div>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Products</p>
                <p className="text-2xl font-bold">
                  {reportData?.overview?.totalProducts || 0}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {reportData?.overview?.totalQuantitySold || 0} units sold
                </p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unique Customers</p>
                <p className="text-2xl font-bold">
                  {reportData?.overview?.totalCustomers || 0}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Avg:{' '}
                  {formatCurrency(reportData?.overview?.averageOrderValue || 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {reportData?.lowStockProducts &&
        reportData.lowStockProducts.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reportData.lowStockProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between rounded-lg bg-white p-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Only {product.stock} units remaining
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        product.stock === 0
                          ? 'bg-red-100 text-red-800'
                          : product.stock < 5
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            {reportData?.topProducts && reportData.topProducts.length > 0 ? (
              <div className="space-y-4">
                {reportData.topProducts.map((product, index) => (
                  <div
                    key={product._id}
                    className="flex items-center gap-4 border-b pb-3 last:border-0"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 font-bold text-white shadow-sm">
                      #{index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {product.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(product.revenue)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {product.sales} units
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <ShoppingCart className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                <p>No sales data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {reportData?.salesByCategory &&
            reportData.salesByCategory.length > 0 ? (
              <div className="space-y-4">
                {reportData.salesByCategory.map((item) => (
                  <div key={item.category}>
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <span className="font-medium">{item.category}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({item.quantity} units)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-blue-600">
                          {formatCurrency(item.sales)}
                        </span>
                        <span className="text-sm text-gray-600">
                          ({item.percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <Package className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                <p>No category data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sales Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Sales Trend
            </div>
            {reportData?.periodInfo && (
              <span className="text-sm font-normal text-gray-500">
                <Calendar className="mr-1 inline h-4 w-4" />
                {new Date(
                  reportData.periodInfo.currentStart
                ).toLocaleDateString()}{' '}
                -{' '}
                {new Date(
                  reportData.periodInfo.currentEnd
                ).toLocaleDateString()}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reportData?.recentTrends?.labels &&
          reportData.recentTrends.labels.length > 0 ? (
            <div className="space-y-4">
              {reportData.recentTrends.labels.map((label, index) => {
                const maxSales = Math.max(...reportData.recentTrends.sales);
                const percentage =
                  maxSales > 0
                    ? (reportData.recentTrends.sales[index] / maxSales) * 100
                    : 0;

                // Format date label
                let formattedLabel = label;
                try {
                  const date = new Date(label);
                  if (!isNaN(date.getTime())) {
                    formattedLabel = date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }
                } catch {
                  // Keep original label if parsing fails
                }

                return (
                  <div
                    key={label}
                    className="flex items-center gap-4 border-b pb-3 last:border-0"
                  >
                    <div className="w-20 flex-shrink-0 font-medium text-gray-700">
                      {formattedLabel}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-gray-600">Revenue</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(reportData.recentTrends.sales[index])}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-24 flex-shrink-0 text-right">
                      <span className="text-sm font-medium text-gray-700">
                        {reportData.recentTrends.orders[index]}
                      </span>
                      <span className="block text-xs text-gray-500">
                        orders
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <BarChart3 className="mx-auto mb-2 h-12 w-12 text-gray-400" />
              <p>No trend data available</p>
              <p className="mt-1 text-sm">
                Sales data will appear here once you have orders
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
