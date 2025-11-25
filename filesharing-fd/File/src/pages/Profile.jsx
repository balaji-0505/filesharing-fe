import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import Navigation from '../components/Navigation';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import { 
  User, 
  Mail, 
  Calendar, 
  HardDrive, 
  Download, 
  Upload, 
  Share2, 
  Settings, 
  Edit3, 
  Save, 
  X, 
  Camera,
  Bell,
  Shield,
  Globe,
  Moon,
  Sun
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser, updateProfilePicture } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();
  const analytics = useAnalytics();
  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privacyLevel, setPrivacyLevel] = useState('public');
  const [notificationCount, setNotificationCount] = useState(4);
  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email,
    bio: user.bio || '',
    location: user.location || '',
    website: user.website || ''
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditForm({
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || ''
    });
    setIsEditing(false);
  };

  const handleSave = () => {
    updateUser(editForm);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfilePictureUpload = async (file) => {
    return await updateProfilePicture(file);
  };

  const handleProfilePictureCancel = () => {
    // Handle cancel if needed
  };

  // Real-time notification simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setNotificationCount(prev => {
        const newCount = prev + Math.floor(Math.random() * 3);
        return Math.min(newCount, 99); // Cap at 99
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast.success(`Notifications ${!notificationsEnabled ? 'enabled' : 'disabled'}`);
  };

  const handlePrivacyChange = () => {
    const levels = ['public', 'friends', 'private'];
    const currentIndex = levels.indexOf(privacyLevel);
    const nextLevel = levels[(currentIndex + 1) % levels.length];
    setPrivacyLevel(nextLevel);
    toast.success(`Privacy level changed to ${nextLevel}`);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const storageUsed = Number(user.storageUsed ?? 0);
  const storageLimit = Number(user.storageLimit ?? 5 * 1024 * 1024 * 1024); // default 5GB
  const storageUsedPercentageRaw = storageLimit > 0 ? (storageUsed / storageLimit) * 100 : 0;
  const storageUsedPercentage = Number.isFinite(storageUsedPercentageRaw) ? storageUsedPercentageRaw : 0;
  const storageUsedPercentageDisplay = Math.max(0, Math.min(100, Math.round(storageUsedPercentage)));

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className={`${isDark ? 'glass-card' : 'bg-white shadow-sm border border-gray-200'} p-6 mb-8 rounded-xl fade-in-up`}>
          <div className="flex items-center space-x-6">
            <ProfilePictureUpload
              currentAvatar={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=3b82f6&color=fff&size=120`}
              onUpload={handleProfilePictureUpload}
              onCancel={handleProfilePictureCancel}
            />
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`bg-transparent border-b ${isDark ? 'border-white/30 focus:border-blue-400' : 'border-gray-300 focus:border-blue-500'} focus:outline-none transition-colors`}
                      />
                    ) : (
                      user.name
                    )}
                  </h1>
                  <p className={`${isDark ? 'text-white/80' : 'text-gray-600'} mt-1`}>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`bg-transparent border-b ${isDark ? 'border-white/30 focus:border-blue-400' : 'border-gray-300 focus:border-blue-500'} focus:outline-none transition-colors`}
                      />
                    ) : (
                      user.email
                    )}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'} mt-1`}>
                    Member since {user.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'recently'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="btn-primary flex items-center space-x-2 hover-lift"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        className={`${isDark ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20' : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'} px-4 py-2 rounded-xl transition-all flex items-center space-x-2`}
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEdit}
                      className={`${isDark ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20' : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'} px-4 py-2 rounded-xl transition-all flex items-center space-x-2 hover-lift`}
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className={`${isDark ? 'glass-card' : 'bg-white shadow-sm border border-gray-200'} p-6 slide-in-right rounded-xl`}>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>About</h3>
              {isEditing ? (
                <textarea
                  value={editForm.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  className={`w-full h-24 p-3 border ${isDark ? 'border-white/20 bg-white/5 text-white placeholder-white/60 focus:ring-blue-400 focus:border-blue-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'} rounded-xl focus:outline-none focus:ring-2 transition-all`}
                />
              ) : (
                <p className={`${isDark ? 'text-white/80' : 'text-gray-600'}`}>
                  {user.bio || 'No bio available'}
                </p>
              )}
            </div>

            {/* Contact Information */}
            <div className={`${isDark ? 'glass-card' : 'bg-white shadow-sm border border-gray-200'} p-6 slide-in-right rounded-xl`}>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Location</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Enter your location"
                        className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user.location || 'Not specified'}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Website</p>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editForm.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://yourwebsite.com"
                        className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user.website ? (
                          <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                            {user.website}
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Statistics */}
            <div className="card dark:bg-gray-800 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">{analytics.totalFiles}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Files</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">{analytics.totalFolders}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Folders</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">{analytics.totalDownloads}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Downloads</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">{analytics.totalShares}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Shares</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Storage Usage */}
            <div className="card dark:bg-gray-800 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Storage Usage</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Used</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatFileSize(storageUsed)} / {formatFileSize(storageLimit)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${storageUsedPercentageDisplay}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {storageUsedPercentageDisplay}% used
                  </p>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className={`${isDark ? 'glass-card' : 'bg-white shadow-sm border border-gray-200'} p-6 slide-in-right rounded-xl`}>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {theme === 'dark' ? (
                      <Moon className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Sun className="w-5 h-5 text-amber-500" />
                    )}
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Theme</span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`${isDark ? 'bg-blue-500/20 border border-blue-400/50 text-blue-300 hover:bg-blue-500/30' : 'bg-blue-100 border border-blue-200 text-blue-700 hover:bg-blue-200'} px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-lift`}
                  >
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Bell className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                      {notificationCount > 0 && (
                        <span className={`absolute -top-2 -right-2 ${isDark ? 'bg-red-500' : 'bg-red-500'} text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold`}>
                          {notificationCount > 99 ? '99+' : notificationCount}
                        </span>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifications</span>
                  </div>
                  <button 
                    onClick={handleNotificationToggle}
                    className={`${notificationsEnabled 
                      ? (isDark ? 'bg-green-500/20 border border-green-400/50 text-green-300 hover:bg-green-500/30' : 'bg-green-100 border border-green-200 text-green-700 hover:bg-green-200')
                      : (isDark ? 'bg-gray-500/20 border border-gray-400/50 text-gray-300 hover:bg-gray-500/30' : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200')
                    } px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-lift`}
                  >
                    {notificationsEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Privacy</span>
                  </div>
                  <button 
                    onClick={handlePrivacyChange}
                    className={`${privacyLevel === 'public' 
                      ? (isDark ? 'bg-green-500/20 border border-green-400/50 text-green-300 hover:bg-green-500/30' : 'bg-green-100 border border-green-200 text-green-700 hover:bg-green-200')
                      : privacyLevel === 'friends'
                      ? (isDark ? 'bg-yellow-500/20 border border-yellow-400/50 text-yellow-300 hover:bg-yellow-500/30' : 'bg-yellow-100 border border-yellow-200 text-yellow-700 hover:bg-yellow-200')
                      : (isDark ? 'bg-red-500/20 border border-red-400/50 text-red-300 hover:bg-red-500/30' : 'bg-red-100 border border-red-200 text-red-700 hover:bg-red-200')
                    } px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-lift capitalize`}
                  >
                    {privacyLevel}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`${isDark ? 'glass-card' : 'bg-white shadow-sm border border-gray-200'} p-6 slide-in-right rounded-xl`}>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  className={`w-full ${isDark ? 'bg-green-500/20 border border-green-400/50 text-green-300 hover:bg-green-500/30' : 'bg-green-100 border border-green-200 text-green-700 hover:bg-green-200'} px-4 py-3 rounded-xl text-left justify-start transition-all duration-200 hover-lift flex items-center space-x-3`} 
                  onClick={() => navigate('/dashboard?upload=1')}
                >
                  <Upload className="w-5 h-5" />
                  <span className="font-medium">Upload Files</span>
                </button>
                <button 
                  className={`w-full ${isDark ? 'bg-blue-500/20 border border-blue-400/50 text-blue-300 hover:bg-blue-500/30' : 'bg-blue-100 border border-blue-200 text-blue-700 hover:bg-blue-200'} px-4 py-3 rounded-xl text-left justify-start transition-all duration-200 hover-lift flex items-center space-x-3`} 
                  onClick={() => window.location.assign('/dashboard')}
                >
                  <Download className="w-5 h-5" />
                  <span className="font-medium">Download All</span>
                </button>
                <button 
                  className={`w-full ${isDark ? 'bg-purple-500/20 border border-purple-400/50 text-purple-300 hover:bg-purple-500/30' : 'bg-purple-100 border border-purple-200 text-purple-700 hover:bg-purple-200'} px-4 py-3 rounded-xl text-left justify-start transition-all duration-200 hover-lift flex items-center space-x-3`} 
                  onClick={() => navigator.clipboard.writeText(window.location.origin + '/profile')}
                >
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium">Share Profile</span>
                </button>
                <button 
                  className={`w-full ${isDark ? 'bg-gray-500/20 border border-gray-400/50 text-gray-300 hover:bg-gray-500/30' : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200'} px-4 py-3 rounded-xl text-left justify-start transition-all duration-200 hover-lift flex items-center space-x-3`} 
                  onClick={() => setIsEditing(true)}
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Account Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;  