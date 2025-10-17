import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../lib/utils';
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  Download,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { paymentAPI } from '../../services';
import toast from 'react-hot-toast';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentAPI.getSupplierPayments();
      const paymentData = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setPayments(paymentData);

      // Calculate stats
      const totalEarnings = paymentData
        .filter((p) => p.status === 'Completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const pendingPayments = paymentData
        .filter((p) => p.status === 'Pending')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const thisMonthEarnings = paymentData
        .filter((p) => {
          const paymentDate = new Date(p.createdAt);
          const now = new Date();
          return (
            p.status === 'Completed' &&
            paymentDate.getMonth() === now.getMonth() &&
            paymentDate.getFullYear() === now.getFullYear()
          );
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      setStats({
        totalEarnings,
        pendingPayments,
        thisMonthEarnings,
        totalTransactions: paymentData.length,
      });
    } catch {
      toast.error('Failed to fetch payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Completed: 'bg-green-100 text-green-800',
      Pending: 'bg-yellow-100 text-yellow-800',
      Failed: 'bg-red-100 text-red-800',
      Processing: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'Pending':
        return <Clock className="h-4 w-4" />;
      case 'Failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="mt-2 text-gray-600">
            Track your earnings and payment history
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats?.totalEarnings || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(stats?.pendingPayments || 0)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats?.thisMonthEarnings || 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-2xl font-bold">
                  {stats?.totalTransactions || 0}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="py-12 text-center">
              <CreditCard className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-xl font-semibold">No payments yet</h3>
              <p className="text-gray-600">
                Your payment history will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left text-sm font-semibold text-gray-900">
                      Transaction ID
                    </th>
                    <th className="pb-3 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="pb-3 text-left text-sm font-semibold text-gray-900">
                      Order
                    </th>
                    <th className="pb-3 text-left text-sm font-semibold text-gray-900">
                      Amount
                    </th>
                    <th className="pb-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="pb-3 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="py-4 text-sm font-medium">
                        #{payment._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="py-4 text-sm text-gray-600">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-sm text-gray-600">
                        {payment.order
                          ? `#${payment.order.slice(-8).toUpperCase()}`
                          : 'N/A'}
                      </td>
                      <td className="py-4 text-sm font-semibold">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="py-4">
                        <Badge
                          className={`flex w-fit items-center gap-1 ${getStatusColor(payment.status)}`}
                        >
                          {getStatusIcon(payment.status)}
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
