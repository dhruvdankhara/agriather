import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../../store/slices/authSlice';
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../../store/slices/addressSlice';
import { Button } from '../../components/ui/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Textarea } from '../../components/ui/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import {
  User,
  Mail,
  Phone,
  Edit,
  MapPin,
  Plus,
  Trash2,
  Star,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const { addresses, loading: addressLoading } = useSelector(
    (state) => state.address
  );

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    type: 'shipping',
    label: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    phone: '',
    isDefault: false,
  });

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile(formData)).unwrap();
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error(error || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold">My Profile</h1>

      <div className="grid gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? <Spinner className="h-4 w-4" /> : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium">{user?.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-medium">
                      {user?.phone || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5" />
                  <div>
                    <p className="text-sm text-gray-600">Account Type</p>
                    <p className="font-medium capitalize">{user?.role}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Address Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                My Addresses
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddressForm(true);
                  setEditingAddressId(null);
                  setAddressForm({
                    type: 'shipping',
                    label: '',
                    addressLine1: '',
                    addressLine2: '',
                    landmark: '',
                    city: '',
                    state: '',
                    pincode: '',
                    country: 'India',
                    phone: '',
                    isDefault: false,
                  });
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Address
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {addressLoading ? (
              <div className="flex justify-center py-4">
                <Spinner className="h-6 w-6" />
              </div>
            ) : addresses && addresses.length > 0 ? (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    className="rounded-lg border p-4 hover:border-gray-300"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        {address.label && (
                          <p className="font-semibold text-gray-900">
                            {address.label}
                          </p>
                        )}
                        <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 capitalize">
                          {address.type}
                        </span>
                        {address.isDefault && (
                          <span className="ml-2 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!address.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try {
                                await dispatch(
                                  setDefaultAddress(address._id)
                                ).unwrap();
                                toast.success('Default address updated');
                              } catch (err) {
                                toast.error(err || 'Failed to set default');
                              }
                            }}
                            title="Set as default"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingAddressId(address._id);
                            setAddressForm({
                              type: address.type || 'shipping',
                              label: address.label || '',
                              addressLine1: address.addressLine1 || '',
                              addressLine2: address.addressLine2 || '',
                              landmark: address.landmark || '',
                              city: address.city || '',
                              state: address.state || '',
                              pincode: address.pincode || '',
                              country: address.country || 'India',
                              phone: address.phone || '',
                              isDefault: address.isDefault || false,
                            });
                            setShowAddressForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            if (
                              window.confirm(
                                'Are you sure you want to delete this address?'
                              )
                            ) {
                              try {
                                await dispatch(
                                  deleteAddress(address._id)
                                ).unwrap();
                                toast.success('Address deleted');
                              } catch (err) {
                                toast.error(err || 'Failed to delete address');
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{address.addressLine1}</p>
                      {address.addressLine2 && <p>{address.addressLine2}</p>}
                      {address.landmark && (
                        <p className="text-xs">Landmark: {address.landmark}</p>
                      )}
                      <p>
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p>{address.country}</p>
                      {address.phone && <p>Phone: {address.phone}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-gray-600">
                No addresses saved. Add your first address to get started.
              </p>
            )}

            {/* Address Form Modal/Inline */}
            {showAddressForm && (
              <div className="space-y-4 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    {editingAddressId ? 'Edit Address' : 'Add New Address'}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddressId(null);
                    }}
                  >
                    ✕
                  </Button>
                </div>
                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="type">Address Type *</Label>
                      <Select
                        value={addressForm.type}
                        onValueChange={(value) =>
                          setAddressForm({ ...addressForm, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="shipping">Shipping</SelectItem>
                          <SelectItem value="billing">Billing</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="label">Label</Label>
                      <Input
                        id="label"
                        value={addressForm.label}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            label: e.target.value,
                          })
                        }
                        placeholder="Home, Office, etc."
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="addressLine1">Address Line 1 *</Label>
                    <Input
                      id="addressLine1"
                      value={addressForm.addressLine1}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          addressLine1: e.target.value,
                        })
                      }
                      placeholder="House No., Building Name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      value={addressForm.addressLine2}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          addressLine2: e.target.value,
                        })
                      }
                      placeholder="Street, Area"
                    />
                  </div>
                  <div>
                    <Label htmlFor="landmark">Landmark</Label>
                    <Input
                      id="landmark"
                      value={addressForm.landmark}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          landmark: e.target.value,
                        })
                      }
                      placeholder="Near park, Behind mall, etc."
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={addressForm.city}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            city: e.target.value,
                          })
                        }
                        placeholder="City"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={addressForm.state}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            state: e.target.value,
                          })
                        }
                        placeholder="State"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        value={addressForm.pincode}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            pincode: e.target.value,
                          })
                        }
                        placeholder="123456"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={addressForm.country}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            country: e.target.value,
                          })
                        }
                        placeholder="India"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={addressForm.phone}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            phone: e.target.value,
                          })
                        }
                        placeholder="1234567890"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={addressForm.isDefault}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          isDefault: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="isDefault" className="text-sm font-normal">
                      Set as default address
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={async () => {
                        try {
                          if (
                            !addressForm.addressLine1 ||
                            !addressForm.city ||
                            !addressForm.state ||
                            !addressForm.pincode
                          ) {
                            toast.error('Please fill all required fields');
                            return;
                          }
                          if (editingAddressId) {
                            await dispatch(
                              updateAddress({
                                addressId: editingAddressId,
                                data: addressForm,
                              })
                            ).unwrap();
                            toast.success('Address updated successfully');
                          } else {
                            await dispatch(createAddress(addressForm)).unwrap();
                            toast.success('Address added successfully');
                          }
                          setShowAddressForm(false);
                          setEditingAddressId(null);
                        } catch (err) {
                          toast.error(err || 'Failed to save address');
                        }
                      }}
                      disabled={addressLoading}
                    >
                      {addressLoading ? (
                        <Spinner className="h-4 w-4" />
                      ) : editingAddressId ? (
                        'Update Address'
                      ) : (
                        'Save Address'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddressId(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
