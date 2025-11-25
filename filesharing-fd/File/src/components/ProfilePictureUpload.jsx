import { useState, useRef } from 'react';
import { Camera, Upload, X, Check, Trash2, RotateCw } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePictureUpload = ({ currentAvatar, onUpload, onCancel }) => {
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [rotation, setRotation] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files[0]) {
      toast.error('Please select an image first');
      return;
    }

    setIsUploading(true);
    try {
      const result = await onUpload(fileInputRef.current.files[0]);
      if (result.success) {
        toast.success('Profile picture updated successfully!');
        setPreview(null);
        setRotation(0);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(result.error || 'Failed to update profile picture');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setRotation(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onCancel();
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleRemovePicture = () => {
    if (window.confirm('Are you sure you want to remove your profile picture?')) {
      // Call onUpload with null to remove the picture
      onUpload(null);
      toast.success('Profile picture removed successfully!');
    }
  };

  return (
    <div className="relative">
      {/* Profile Picture Display */}
      <div className="relative group">
        <img
          src={preview || currentAvatar}
          alt="Profile"
          className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-700 shadow-lg object-cover"
          style={{
            transform: preview ? `rotate(${rotation}deg)` : 'none',
            transition: 'transform 0.3s ease'
          }}
        />
        
        {/* Camera Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
             onClick={handleCameraClick}>
          <Camera className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Controls */}
      {preview && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 p-2 flex items-center space-x-1">
          <button
            onClick={handleRotate}
            className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            title="Rotate image"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="p-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            title="Confirm upload"
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Check className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleCancel}
            className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action Buttons */}
      {!preview && (
        <div className="absolute -bottom-1 -right-1 flex space-x-1">
          <button
            onClick={handleCameraClick}
            className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors shadow-lg"
            title="Change profile picture"
          >
            <Camera className="w-4 h-4" />
          </button>
          {currentAvatar && !currentAvatar.includes('ui-avatars.com') && (
            <button
              onClick={handleRemovePicture}
              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
              title="Remove profile picture"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Upload Instructions */}
      {!preview && (
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Click camera to upload
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Max 5MB, JPG/PNG
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfilePictureUpload;
