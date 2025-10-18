import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/Select';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { adminAPI } from '../../services';
import toast from 'react-hot-toast';
import { formatDate } from '../../lib/utils';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filter]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
      };

      if (filter !== 'all') {
        params.isApproved = filter === 'approved';
      }

      if (search) {
        params.search = search;
      }

      const response = await adminAPI.getAllSuppliers(params);
      setSuppliers(response.data.data.suppliers);
      setTotalPages(response.data.data.totalPages);
    } catch {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchSuppliers();
  };

  const handleApprove = async (supplierId) => {
    try {
      setActionLoading(supplierId);
      await adminAPI.approveSupplier(supplierId);
      toast.success('Supplier approved successfully');
      fetchSuppliers();
    } catch {
      toast.error('Failed to approve supplier');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (supplierId) => {
    if (!window.confirm('Are you sure you want to deactivate this supplier?')) {
      return;
    }
    try {
      setActionLoading(supplierId);
      await adminAPI.deactivateSupplier(supplierId);
      toast.success('Supplier deactivated successfully');
      fetchSuppliers();
    } catch {
      toast.error('Failed to deactivate supplier');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Suppliers Management</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex flex-1 gap-2">
              <Input
                placeholder="Search by name, email, or business..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers List */}
      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : suppliers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">No suppliers found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {suppliers.map((supplier) => (
            <Card key={supplier._id}>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* Supplier Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {supplier.firstname} {supplier.lastname}
                        </h3>
                        {supplier.businessName && (
                          <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="h-4 w-4" />
                            {supplier.businessName}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {supplier.isApproved ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            <CheckCircle className="h-3 w-3" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                        {!supplier.isActive && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        {supplier.email}
                      </div>
                      {supplier.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          {supplier.phone}
                        </div>
                      )}
                      {supplier.businessAddress && (
                        <div className="flex items-center gap-2 text-gray-600 md:col-span-2">
                          <MapPin className="h-4 w-4" />
                          {supplier.businessAddress}
                        </div>
                      )}
                    </div>

                    {supplier.gstNumber && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">GST:</span>{' '}
                        {supplier.gstNumber}
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Joined: {formatDate(supplier.createdAt)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 lg:flex-col">
                    {!supplier.isApproved && supplier.isActive && (
                      <Button
                        onClick={() => handleApprove(supplier._id)}
                        disabled={actionLoading === supplier._id}
                        size="sm"
                        className="flex-1 lg:flex-none"
                      >
                        {actionLoading === supplier._id ? (
                          <Spinner className="h-4 w-4" />
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </>
                        )}
                      </Button>
                    )}
                    {supplier.isActive && (
                      <Button
                        onClick={() => handleDeactivate(supplier._id)}
                        disabled={actionLoading === supplier._id}
                        variant="outline"
                        size="sm"
                        className="flex-1 lg:flex-none"
                      >
                        {actionLoading === supplier._id ? (
                          <Spinner className="h-4 w-4" />
                        ) : (
                          <>
                            <XCircle className="mr-2 h-4 w-4" />
                            Deactivate
                          </>
                        )}
                      </Button>
                    )}
                  </div>
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
