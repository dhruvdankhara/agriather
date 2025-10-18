import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, changePassword } from '../../store/slices/authSlice';
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
import { Spinner } from '../../components/ui/Spinner';
import AvatarUpload from '../../components/AvatarUpload';
import {
    User,
    Mail,
    Phone,
    Edit,
    Building2,
    MapPin,
    FileText,
    Lock,
    Save,
    X,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SupplierProfile() {
    const dispatch = useDispatch();
    const { user, loading } = useSelector((state) => state.auth);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstname: user?.firstname || '',
        lastname: user?.lastname || '',
        email: user?.email || '',
        phone: user?.phone || '',
        businessName: user?.businessName || '',
        businessAddress: user?.businessAddress || '',
    });

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(updateProfile(formData)).unwrap();
            setIsEditing(false);
        } catch (error) {
            // Error handled by Redux
        }
    };

    const handleCancel = () => {
        setFormData({
            firstname: user?.firstname || '',
            lastname: user?.lastname || '',
            email: user?.email || '',
            phone: user?.phone || '',
            businessName: user?.businessName || '',
            businessAddress: user?.businessAddress || '',
        });
        setIsEditing(false);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setPasswordLoading(true);
        try {
            await dispatch(
                changePassword({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                })
            ).unwrap();
            setShowPasswordForm(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error) {
            // Error handled by Redux
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <h1 className="text-3xl font-bold">Supplier Profile</h1>

            {/* Avatar Section */}
            <Card>
                <CardContent className="pt-6">
                    <AvatarUpload />
                </CardContent>
            </Card>

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
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="firstname">First Name</Label>
                                    <Input
                                        id="firstname"
                                        value={formData.firstname}
                                        onChange={(e) =>
                                            setFormData({ ...formData, firstname: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="lastname">Last Name</Label>
                                    <Input
                                        id="lastname"
                                        value={formData.lastname}
                                        onChange={(e) =>
                                            setFormData({ ...formData, lastname: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="bg-gray-50"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Email cannot be changed
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phone: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="businessName">Business Name</Label>
                                <Input
                                    id="businessName"
                                    value={formData.businessName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, businessName: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="businessAddress">Business Address</Label>
                                <Textarea
                                    id="businessAddress"
                                    value={formData.businessAddress}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            businessAddress: e.target.value,
                                        })
                                    }
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={loading}>
                                    {loading ? (
                                        <Spinner className="mr-2 h-4 w-4" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Save Changes
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-gray-600">First Name</p>
                                    <p className="font-medium">{user?.firstname}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Last Name</p>
                                    <p className="font-medium">{user?.lastname}</p>
                                </div>
                            </div>

                            <div>
                                <p className="flex items-center gap-2 text-sm text-gray-600">
                                    <Mail className="h-4 w-4" />
                                    Email
                                </p>
                                <p className="font-medium">{user?.email}</p>
                            </div>

                            <div>
                                <p className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="h-4 w-4" />
                                    Phone
                                </p>
                                <p className="font-medium">{user?.phone || 'Not provided'}</p>
                            </div>

                            <div>
                                <p className="flex items-center gap-2 text-sm text-gray-600">
                                    <Building2 className="h-4 w-4" />
                                    Business Name
                                </p>
                                <p className="font-medium">
                                    {user?.businessName || 'Not provided'}
                                </p>
                            </div>

                            <div>
                                <p className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="h-4 w-4" />
                                    Business Address
                                </p>
                                <p className="font-medium">
                                    {user?.businessAddress || 'Not provided'}
                                </p>
                            </div>

                            {user?.gstNumber && (
                                <div>
                                    <p className="flex items-center gap-2 text-sm text-gray-600">
                                        <FileText className="h-4 w-4" />
                                        GST Number
                                    </p>
                                    <p className="font-medium">{user.gstNumber}</p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Change Password
                        </CardTitle>
                        {!showPasswordForm && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPasswordForm(true)}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Change
                            </Button>
                        )}
                    </div>
                </CardHeader>
                {showPasswordForm && (
                    <CardContent>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) =>
                                        setPasswordData({
                                            ...passwordData,
                                            currentPassword: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) =>
                                        setPasswordData({
                                            ...passwordData,
                                            newPassword: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) =>
                                        setPasswordData({
                                            ...passwordData,
                                            confirmPassword: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={passwordLoading}>
                                    {passwordLoading ? (
                                        <Spinner className="mr-2 h-4 w-4" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Update Password
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowPasswordForm(false);
                                        setPasswordData({
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: '',
                                        });
                                    }}
                                    disabled={passwordLoading}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
