import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateAvatar } from '../store/slices/authSlice';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { Camera, User, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AvatarUpload() {
    const dispatch = useDispatch();
    const { user, loading } = useSelector((state) => state.auth);
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload immediately
        handleUpload(file);
    };

    const handleUpload = async (file) => {
        try {
            setUploading(true);
            await dispatch(updateAvatar(file)).unwrap();
            setPreview(null);
        } catch (error) {
            console.error('Avatar upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleRemovePreview = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getAvatarUrl = () => {
        if (preview) return preview;
        if (user?.avatar) return user.avatar;
        return null;
    };

    const getInitials = () => {
        if (!user) return '';
        return `${user.firstname?.[0] || ''}${user.lastname?.[0] || ''}`.toUpperCase();
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                {/* Avatar Display */}
                <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-gray-200 bg-gray-100">
                    {getAvatarUrl() ? (
                        <img
                            src={getAvatarUrl()}
                            alt="Profile"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                            <span className="text-4xl font-bold text-white">
                                {getInitials()}
                            </span>
                        </div>
                    )}

                    {/* Loading Overlay */}
                    {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <Spinner className="h-8 w-8 text-white" />
                        </div>
                    )}
                </div>

                {/* Camera Button */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || loading}
                    className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-2 text-white shadow-lg transition-colors hover:bg-blue-700 disabled:bg-gray-400"
                    title="Change profile picture"
                >
                    <Camera className="h-5 w-5" />
                </button>

                {/* Remove Preview Button */}
                {preview && !uploading && (
                    <button
                        onClick={handleRemovePreview}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-colors hover:bg-red-600"
                        title="Cancel"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading || loading}
            />

            {/* User Info */}
            <div className="text-center">
                <h3 className="text-xl font-semibold">
                    {user?.firstname} {user?.lastname}
                </h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
                <p className="mt-1 text-xs capitalize text-gray-500">
                    {user?.role} Account
                </p>
            </div>

            {/* Upload Instructions */}
            <p className="text-center text-xs text-gray-500">
                Click the camera icon to upload a new profile picture
                <br />
                (Max size: 5MB)
            </p>
        </div>
    );
}
