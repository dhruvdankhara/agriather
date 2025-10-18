import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCart, clearCart } from '../../store/slices/cartSlice';
import { fetchAddresses, createAddress } from '../../store/slices/addressSlice';
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
import { formatCurrency } from '../../lib/utils';
import { displayRazorpay } from '../../lib/razorpay';
import { Package, MapPin, CreditCard } from 'lucide-react';
import { orderAPI, paymentAPI } from '../../services';
import toast from 'react-hot-toast';

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    items,
    totalAmount,
    loading: cartLoading,
  } = useSelector((state) => state.cart);
  const { addresses, loading: addressLoading } = useSelector(
    (state) => state.address
  );

  const [loading, setLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
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
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchAddresses({ type: 'shipping' }));
  }, [dispatch]);

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddress =
        addresses.find((addr) => addr.isDefault) || addresses[0];
      if (defaultAddress && defaultAddress._id) {
        setSelectedAddressId(defaultAddress._id);
      }
    }
  }, [addresses]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!items || items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!selectedAddressId) {
      toast.error('Please select a shipping address');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        shippingAddressId: selectedAddressId,
        paymentMethod,
        notes,
      };

      console.log(
        '🚀 ~ Checkout.jsx ~ handlePlaceOrder ~ orderData:',
        orderData
      );

      // Create order
      const orderResponse = await orderAPI.create(orderData);

      const order = orderResponse.data.data.order;

      // If Cash on Delivery, navigate directly to orders
      if (paymentMethod === 'cash_on_delivery') {
        toast.success('Order placed successfully!');
        await dispatch(clearCart());
        navigate(`/orders/${order._id}`);
        return;
      }

      // For online payment, create Razorpay order
      const paymentResponse = await paymentAPI.createOrder({
        orderId: order._id,
      });

      const paymentData = paymentResponse.data.data;

      if (!paymentData.requiresPayment) {
        // COD or already paid
        toast.success('Order placed successfully!');
        await dispatch(clearCart());
        navigate(`/orders/${order._id}`);
        return;
      }

      // Display Razorpay payment modal
      const razorpayOptions = {
        key: paymentData.razorpayKeyId,
        amount: paymentData.razorpayOrder.amount,
        currency: paymentData.razorpayOrder.currency,
        name: 'Agriather',
        description: `Order ${order.orderNumber}`,
        order_id: paymentData.razorpayOrder.id,
        prefill: {
          email: order.customer?.email || '',
          contact: order.shippingAddress?.phone || '',
        },
        theme: {
          color: '#16a34a', // Green color
        },
      };

      await displayRazorpay(
        razorpayOptions,
        // Success callback
        async (response) => {
          try {
            // Verify payment
            await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: paymentData.payment._id,
            });

            toast.success('Payment successful! Order confirmed.');
            await dispatch(clearCart());
            navigate(`/orders/${order._id}`);
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
            navigate(`/orders/${order._id}`);
          }
        },
        // Failure callback
        async (error) => {
          try {
            await paymentAPI.handleFailure({
              paymentId: paymentData.payment._id,
              error: error.error,
            });
          } catch (err) {
            console.error('Error recording payment failure:', err);
          }

          toast.error(
            error.error?.description || 'Payment failed. Please try again.'
          );
          navigate(`/orders/${order._id}`);
        }
      );
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
        <h2 className="mb-2 text-2xl font-bold">Your cart is empty</h2>
        <p className="mb-6 text-gray-600">
          Add some products before checking out
        </p>
        <Button onClick={() => navigate('/products')}>Browse Products</Button>
      </div>
    );
  }

  const shippingCost = totalAmount > 1000 ? 0 : 50;
  const tax = totalAmount * 0.1;
  const finalTotal = totalAmount + shippingCost + tax;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addressLoading ? (
                  <div className="flex justify-center py-4">
                    <Spinner className="h-6 w-6" />
                  </div>
                ) : addresses && addresses.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <div
                          key={address._id}
                          onClick={() => setSelectedAddressId(address._id)}
                          className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                            selectedAddressId === address._id
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {address.label && (
                                <p className="mb-1 font-semibold text-gray-700">
                                  {address.label}
                                </p>
                              )}
                              <p className="font-medium">
                                {address.addressLine1}
                              </p>
                              {address.addressLine2 && (
                                <p className="text-sm text-gray-600">
                                  {address.addressLine2}
                                </p>
                              )}
                              {address.landmark && (
                                <p className="text-sm text-gray-600">
                                  Landmark: {address.landmark}
                                </p>
                              )}
                              <p className="text-sm text-gray-600">
                                {address.city}, {address.state}{' '}
                                {address.pincode}
                              </p>
                              <p className="text-sm text-gray-600">
                                {address.country}
                              </p>
                              {address.phone && (
                                <p className="text-sm text-gray-600">
                                  Phone: {address.phone}
                                </p>
                              )}
                            </div>
                            {selectedAddressId === address._id && (
                              <div className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                                ✓
                              </div>
                            )}
                          </div>
                          {address.isDefault && (
                            <span className="mt-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                              Default
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="w-full"
                    >
                      {showAddressForm ? 'Cancel' : '+ Add New Address'}
                    </Button>
                    {showAddressForm && (
                      <div className="space-y-4 rounded-lg border p-4">
                        <div>
                          <Label htmlFor="label">Address Label</Label>
                          <Input
                            id="label"
                            value={newAddress.label}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                label: e.target.value,
                              })
                            }
                            placeholder="Home, Office, etc."
                          />
                        </div>
                        <div>
                          <Label htmlFor="addressLine1">Address Line 1 *</Label>
                          <Input
                            id="addressLine1"
                            value={newAddress.addressLine1}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                addressLine1: e.target.value,
                              })
                            }
                            placeholder="House No., Building Name"
                            required={showAddressForm}
                          />
                        </div>
                        <div>
                          <Label htmlFor="addressLine2">Address Line 2</Label>
                          <Input
                            id="addressLine2"
                            value={newAddress.addressLine2}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
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
                            value={newAddress.landmark}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                landmark: e.target.value,
                              })
                            }
                            placeholder="Near park, Behind mall, etc."
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor="city">City *</Label>
                            <Input
                              id="city"
                              value={newAddress.city}
                              onChange={(e) =>
                                setNewAddress({
                                  ...newAddress,
                                  city: e.target.value,
                                })
                              }
                              placeholder="City"
                              required={showAddressForm}
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">State *</Label>
                            <Input
                              id="state"
                              value={newAddress.state}
                              onChange={(e) =>
                                setNewAddress({
                                  ...newAddress,
                                  state: e.target.value,
                                })
                              }
                              placeholder="State"
                              required={showAddressForm}
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor="pincode">Pincode *</Label>
                            <Input
                              id="pincode"
                              value={newAddress.pincode}
                              onChange={(e) =>
                                setNewAddress({
                                  ...newAddress,
                                  pincode: e.target.value,
                                })
                              }
                              placeholder="123456"
                              required={showAddressForm}
                            />
                          </div>
                          <div>
                            <Label htmlFor="country">Country</Label>
                            <Input
                              id="country"
                              value={newAddress.country}
                              onChange={(e) =>
                                setNewAddress({
                                  ...newAddress,
                                  country: e.target.value,
                                })
                              }
                              placeholder="India"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={newAddress.phone}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                phone: e.target.value,
                              })
                            }
                            placeholder="1234567890"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isDefault"
                            checked={newAddress.isDefault}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                isDefault: e.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <Label
                            htmlFor="isDefault"
                            className="text-sm font-normal"
                          >
                            Set as default address
                          </Label>
                        </div>
                        <Button
                          type="button"
                          onClick={async () => {
                            try {
                              if (
                                !newAddress.addressLine1 ||
                                !newAddress.city ||
                                !newAddress.state ||
                                !newAddress.pincode
                              ) {
                                toast.error('Please fill all required fields');
                                return;
                              }
                              await dispatch(
                                createAddress(newAddress)
                              ).unwrap();
                              toast.success('Address added successfully');
                              setShowAddressForm(false);
                              setNewAddress({
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
                            } catch (err) {
                              console.error('Error adding address:', err);
                              toast.error(err || 'Failed to add address');
                            }
                          }}
                          className="w-full"
                        >
                          Save Address
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-4 text-center">
                    <p className="mb-4 text-gray-600">No saved addresses</p>
                    <Button
                      type="button"
                      onClick={() => navigate('/profile')}
                      variant="outline"
                    >
                      Add Address in Profile
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash_on_delivery">
                      Cash on Delivery
                    </SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="net_banking">Net Banking</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions for your order..."
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-60 space-y-3 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product._id} className="flex gap-3">
                      <div className="h-16 w-16 flex-shrink-0 rounded bg-gray-200">
                        {item.product.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="h-full w-full rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-semibold">
                          {formatCurrency(
                            (item.product.discountPrice || item.product.price) *
                              item.quantity
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span>
                      {shippingCost === 0
                        ? 'Free'
                        : formatCurrency(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">
                      {formatCurrency(finalTotal)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? <Spinner className="h-5 w-5" /> : 'Place Order'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
