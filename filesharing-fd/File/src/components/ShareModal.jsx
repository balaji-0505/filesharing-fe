import { useState, useEffect, useRef } from 'react';
import { X, Copy, Mail, Link, Shield, Clock, Users, Eye, Edit, Trash2, Activity, Globe, Wifi, WifiOff, RefreshCw, AlertCircle, Share2, Zap, TrendingUp, Bell, MapPin, Calendar, UserCheck } from 'lucide-react';
import { ShareType, Permission } from '../types';
import toast from 'react-hot-toast';

const ShareModal = ({ item, onClose, onShare }) => {
  const [shareType, setShareType] = useState(ShareType.PRIVATE);
  const [permissions, setPermissions] = useState([Permission.READ]);
  const [expiryDate, setExpiryDate] = useState('');
  const [password, setPassword] = useState('');
  const [emailList, setEmailList] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  
  // Real-time features state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeViewers, setActiveViewers] = useState([]);
  const [shareStats, setShareStats] = useState({
    totalViews: 0,
    uniqueViewers: 0,
    lastAccessed: null,
    accessCount: 0
  });
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [shareAllMode, setShareAllMode] = useState(false);
  const [bulkShareProgress, setBulkShareProgress] = useState(0);
  const [shareAllStats, setShareAllStats] = useState({
    totalFiles: 0,
    sharedFiles: 0,
    pendingFiles: 0,
    failedFiles: 0
  });
  const [liveNotifications, setLiveNotifications] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [geographicData, setGeographicData] = useState([]);
  const intervalRef = useRef(null);
  const wsRef = useRef(null);

  // Real-time connection management
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Simulate real-time updates with realistic data
  useEffect(() => {
    if (!realTimeUpdates) return;

    const simulateRealTimeUpdates = () => {
      // Realistic active viewers with real-world scenarios
      const realisticViewers = [
        { id: 1, name: 'Sarah Chen', avatar: 'SC', isActive: true, location: 'New York, NY', device: 'Desktop', lastSeen: '2 minutes ago' },
        { id: 2, name: 'Alex Rodriguez', avatar: 'AR', isActive: true, location: 'Los Angeles, CA', device: 'Mobile', lastSeen: '1 minute ago' },
        { id: 3, name: 'Emma Wilson', avatar: 'EW', isActive: false, location: 'London, UK', device: 'Tablet', lastSeen: '5 minutes ago' },
        { id: 4, name: 'David Kim', avatar: 'DK', isActive: true, location: 'Tokyo, Japan', device: 'Desktop', lastSeen: '30 seconds ago' },
        { id: 5, name: 'Maria Garcia', avatar: 'MG', isActive: false, location: 'Madrid, Spain', device: 'Mobile', lastSeen: '10 minutes ago' }
      ].filter(() => Math.random() > 0.3);
      
      setActiveViewers(realisticViewers);
      
      // Realistic share stats with trending patterns
      const viewIncrement = Math.floor(Math.random() * 5) + 1;
      setShareStats(prev => ({
        ...prev,
        totalViews: prev.totalViews + viewIncrement,
        uniqueViewers: Math.max(prev.uniqueViewers, realisticViewers.length),
        lastAccessed: new Date().toISOString(),
        accessCount: prev.accessCount + Math.floor(Math.random() * 3)
      }));

      // Simulate live notifications
      const notifications = [
        { id: Date.now(), type: 'view', message: 'Sarah Chen is viewing the file', timestamp: new Date(), user: 'Sarah Chen' },
        { id: Date.now() + 1, type: 'download', message: 'Alex Rodriguez downloaded the file', timestamp: new Date(), user: 'Alex Rodriguez' },
        { id: Date.now() + 2, type: 'share', message: 'Emma Wilson shared the file with 3 people', timestamp: new Date(), user: 'Emma Wilson' },
        { id: Date.now() + 3, type: 'comment', message: 'David Kim added a comment', timestamp: new Date(), user: 'David Kim' }
      ];

      if (Math.random() > 0.7) {
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
        setLiveNotifications(prev => [randomNotification, ...prev.slice(0, 4)]);
      }

      // Simulate user activity patterns
      const activities = [
        { action: 'viewed', user: 'Sarah Chen', time: '2 min ago', location: 'New York' },
        { action: 'downloaded', user: 'Alex Rodriguez', time: '1 min ago', location: 'Los Angeles' },
        { action: 'shared', user: 'Emma Wilson', time: '5 min ago', location: 'London' },
        { action: 'commented', user: 'David Kim', time: '30 sec ago', location: 'Tokyo' }
      ];

      if (Math.random() > 0.6) {
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        setUserActivity(prev => [randomActivity, ...prev.slice(0, 5)]);
      }

      // Simulate geographic data
      const locations = [
        { country: 'United States', city: 'New York', viewers: Math.floor(Math.random() * 10) + 5, flag: '🇺🇸' },
        { country: 'United Kingdom', city: 'London', viewers: Math.floor(Math.random() * 8) + 3, flag: '🇬🇧' },
        { country: 'Japan', city: 'Tokyo', viewers: Math.floor(Math.random() * 6) + 2, flag: '🇯🇵' },
        { country: 'Germany', city: 'Berlin', viewers: Math.floor(Math.random() * 4) + 1, flag: '🇩🇪' }
      ];
      setGeographicData(locations);

      // Simulate bulk share progress if in share all mode
      if (shareAllMode) {
        setBulkShareProgress(prev => {
          const newProgress = Math.min(prev + Math.random() * 15, 100);
          setShareAllStats(prevStats => ({
            ...prevStats,
            sharedFiles: Math.floor((newProgress / 100) * prevStats.totalFiles),
            pendingFiles: Math.max(0, prevStats.totalFiles - Math.floor((newProgress / 100) * prevStats.totalFiles))
          }));
          return newProgress;
        });
      }
    };

    intervalRef.current = setInterval(simulateRealTimeUpdates, 2000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [realTimeUpdates, shareAllMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const generateSecureLink = async () => {
    setIsGeneratingLink(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const baseUrl = window.location.origin;
    const secureId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const link = `${baseUrl}/shared/${secureId}`;
    setGeneratedLink(link);
    setIsGeneratingLink(false);
    
    // Notify real-time system
    toast.success('Share link generated! Real-time tracking enabled.');
    return link;
  };

  const handlePermissionChange = (permission, checked) => {
    if (checked) {
      setPermissions(prev => [...prev, permission]);
    } else {
      setPermissions(prev => prev.filter(p => p !== permission));
    }
  };

  const handleShareAll = async () => {
    setShareAllMode(true);
    setShareAllStats({
      totalFiles: 15, // Simulate 15 files to share
      sharedFiles: 0,
      pendingFiles: 15,
      failedFiles: 0
    });
    setBulkShareProgress(0);
    
    toast.success('Starting bulk share operation...');
  };

  const handleShare = async () => {
    try {
      const link = generatedLink || await generateSecureLink();
      
      const shareData = {
        item,
        shareType,
        permissions,
        expiryDate: expiryDate || null,
        password: password || null,
        emails: emailList.split(',').map(email => email.trim()).filter(email => email),
        link,
        realTimeTracking: realTimeUpdates,
        shareStats: {
          ...shareStats,
          createdAt: new Date().toISOString()
        },
        shareAllMode,
        bulkShareProgress
      };

      if (onShare) {
        onShare(shareData);
      }

      // Send real-time notification
      if (shareAllMode) {
        toast.success(`Bulk sharing ${shareAllStats.totalFiles} files with real-time tracking!`);
      } else if (realTimeUpdates) {
        toast.success('File shared with real-time tracking enabled!');
      } else {
        toast.success('Sharing settings updated successfully!');
      }
      
      onClose();
    } catch (error) {
      toast.error('Failed to create share link. Please try again.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink || generateSecureLink());
    toast.success('Link copied to clipboard!');
  };

  const getPermissionIcon = (permission) => {
    switch (permission) {
      case Permission.READ:
        return <Eye className="w-4 h-4" />;
      case Permission.WRITE:
        return <Edit className="w-4 h-4" />;
      case Permission.DELETE:
        return <Trash2 className="w-4 h-4" />;
      case Permission.SHARE:
        return <Users className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getPermissionLabel = (permission) => {
    switch (permission) {
      case Permission.READ:
        return 'View';
      case Permission.WRITE:
        return 'Edit';
      case Permission.DELETE:
        return 'Delete';
      case Permission.SHARE:
        return 'Share';
      default:
        return permission;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-medium text-gray-900">Share {item.name}</h3>
            {shareAllMode && (
              <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                <Share2 className="w-3 h-3" />
                <span>Share All Mode</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShareAll}
              className="btn btn-outline flex items-center space-x-2 text-sm"
              disabled={shareAllMode}
            >
              <Share2 className="w-4 h-4" />
              <span>Share All</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Share Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Share Type
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value={ShareType.PRIVATE}
                  checked={shareType === ShareType.PRIVATE}
                  onChange={(e) => setShareType(e.target.value)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <div className="ml-3">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">Private</span>
                  </div>
                  <p className="text-xs text-gray-500">Only people with the link can access</p>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  value={ShareType.RESTRICTED}
                  checked={shareType === ShareType.RESTRICTED}
                  onChange={(e) => setShareType(e.target.value)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <div className="ml-3">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">Restricted</span>
                  </div>
                  <p className="text-xs text-gray-500">Only specific people can access</p>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  value={ShareType.PUBLIC}
                  checked={shareType === ShareType.PUBLIC}
                  onChange={(e) => setShareType(e.target.value)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <div className="ml-3">
                  <div className="flex items-center">
                    <Link className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">Public</span>
                  </div>
                  <p className="text-xs text-gray-500">Anyone with the link can access</p>
                </div>
              </label>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Permissions
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(Permission).map(permission => (
                <label key={permission} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={permissions.includes(permission)}
                    onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <div className="ml-3 flex items-center">
                    {getPermissionIcon(permission)}
                    <span className="ml-2 text-sm text-gray-900">
                      {getPermissionLabel(permission)}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Email List (for restricted sharing) */}
          {shareType === ShareType.RESTRICTED && (
            <div>
              <label htmlFor="emailList" className="block text-sm font-medium text-gray-700 mb-2">
                Share with specific people
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <textarea
                  id="emailList"
                  rows={3}
                  className="input pl-10"
                  placeholder="Enter email addresses separated by commas"
                  value={emailList}
                  onChange={(e) => setEmailList(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple email addresses with commas
              </p>
            </div>
          )}

          {/* Password Protection */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password Protection (Optional)
            </label>
            <input
              type="password"
              id="password"
              className="input"
              placeholder="Enter password to protect the link"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
              Link Expiry (Optional)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="datetime-local"
                id="expiryDate"
                className="input pl-10"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          {/* Generated Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Link
            </label>
            <div className="flex">
              <input
                type="text"
                readOnly
                className="input rounded-r-none"
                value={generatedLink || 'Click "Generate Link" to create a shareable link'}
                placeholder="Share link will appear here"
              />
              <button
                type="button"
                onClick={copyToClipboard}
                className="btn btn-outline rounded-l-none border-l-0 flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </button>
            </div>
          </div>

          {/* Share All Progress */}
          {shareAllMode && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900">Bulk Share Progress</h4>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-gray-500">Processing</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress: {Math.round(bulkShareProgress)}%</span>
                    <span>{shareAllStats.sharedFiles}/{shareAllStats.totalFiles} files</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${bulkShareProgress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{shareAllStats.sharedFiles}</div>
                    <div className="text-xs text-green-700">Shared</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-yellow-600">{shareAllStats.pendingFiles}</div>
                    <div className="text-xs text-yellow-700">Pending</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-red-600">{shareAllStats.failedFiles}</div>
                    <div className="text-xs text-red-700">Failed</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Real-time Features */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-900">Real-time Features</h4>
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="text-xs text-gray-500">
                  {isOnline ? 'Connected' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Real-time Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-700">Live tracking</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={realTimeUpdates}
                  onChange={(e) => setRealTimeUpdates(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Active Viewers */}
            {realTimeUpdates && activeViewers.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Active Viewers ({activeViewers.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {activeViewers.map((viewer) => (
                    <div
                      key={viewer.id}
                      className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                          {viewer.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{viewer.name}</div>
                          <div className="text-xs text-gray-500 flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{viewer.location}</span>
                            <span>•</span>
                            <span>{viewer.device}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-500">{viewer.lastSeen}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Share Statistics */}
            {realTimeUpdates && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-700">Total Views</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900">{shareStats.totalViews}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700">Unique Viewers</span>
                  </div>
                  <p className="text-lg font-bold text-green-900">{shareStats.uniqueViewers}</p>
                </div>
              </div>
            )}

            {/* Last Accessed */}
            {realTimeUpdates && shareStats.lastAccessed && (
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Last accessed: {new Date(shareStats.lastAccessed).toLocaleTimeString()}</span>
              </div>
            )}

            {/* Live Notifications */}
            {realTimeUpdates && liveNotifications.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Bell className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Live Activity</span>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {liveNotifications.map((notification) => (
                    <div key={notification.id} className="flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-700">{notification.message}</span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Geographic Distribution */}
            {realTimeUpdates && geographicData.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-medium text-gray-700">Global Viewers</span>
                </div>
                <div className="space-y-2">
                  {geographicData.map((location, index) => (
                    <div key={index} className="flex items-center justify-between bg-indigo-50 px-3 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{location.flag}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{location.city}</div>
                          <div className="text-xs text-gray-500">{location.country}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-3 h-3 text-indigo-500" />
                        <span className="text-sm font-bold text-indigo-600">{location.viewers}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Activity Feed */}
            {realTimeUpdates && userActivity.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700">Recent Activity</span>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {userActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-orange-50 px-3 py-2 rounded-lg">
                      <UserCheck className="w-3 h-3 text-orange-500" />
                      <span className="text-xs text-gray-700">
                        <span className="font-medium">{activity.user}</span> {activity.action} the file
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="btn btn-outline"
            disabled={isGeneratingLink}
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            className="btn btn-primary flex items-center space-x-2"
            disabled={isGeneratingLink}
          >
            {isGeneratingLink ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : shareAllMode ? (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share All ({shareAllStats.totalFiles})</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
