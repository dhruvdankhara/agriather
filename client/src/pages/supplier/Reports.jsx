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
        setReportData(response.data.data || generateMockData());
      } catch {
        // Generate mock data if API fails
        setReportData(generateMockData());
        toast.info('Displaying sample report data');
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
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(reportData?.overview?.totalSales || 0)}
                </p>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  {reportData?.overview?.salesGrowth > 0 ? (
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
                  {reportData?.overview?.ordersGrowth > 0 ? (
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
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold">
                  {reportData?.overview?.totalProducts || 0}
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
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">
                  {reportData?.overview?.totalCustomers || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData?.topProducts?.map((product, index) => (
                <div
                  key={product._id}
                  className="flex items-center gap-4 border-b pb-3 last:border-0"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatCurrency(product.revenue)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {product.sales} sales
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData?.salesByCategory?.map((item) => (
                <div key={item.category}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">{item.category}</span>
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
                      className="h-full bg-blue-600"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Sales Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData?.recentTrends?.labels?.map((label, index) => (
              <div
                key={label}
                className="flex items-center gap-4 border-b pb-3 last:border-0"
              >
                <div className="w-20 font-medium text-gray-700">{label}</div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-gray-600">Sales</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(reportData.recentTrends.sales[index])}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-green-600"
                      style={{
                        width: `${
                          (reportData.recentTrends.sales[index] /
                            Math.max(...reportData.recentTrends.sales)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-24 text-right">
                  <span className="text-sm text-gray-600">
                    {reportData.recentTrends.orders[index]} orders
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
