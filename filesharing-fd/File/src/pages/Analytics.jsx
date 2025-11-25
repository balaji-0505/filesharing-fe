import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Upload, 
  Users, 
  HardDrive, 
  Clock,
  File,
  Folder,
  Share2,
  Eye
} from 'lucide-react';
import { format, subDays, formatDistanceToNow } from 'date-fns';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useTheme } from '../contexts/ThemeContext';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const analyticsData = useAnalytics();
  const { theme, isDark } = useTheme();

  // Use real-time data from analytics context
  const analytics = {
    overview: {
      totalFiles: analyticsData.totalFiles,
      totalFolders: analyticsData.totalFolders,
      totalStorage: analyticsData.totalStorage,
      totalDownloads: analyticsData.totalDownloads,
      totalShares: analyticsData.totalShares,
      totalUploads: analyticsData.totalUploads,
      activeUsers: 1 // For demo, we'll show 1 active user
    },
    storageBreakdown: [
      { type: 'Images', size: analyticsData.storageBreakdown.images.size, count: analyticsData.storageBreakdown.images.count, color: 'bg-blue-500' },
      { type: 'Documents', size: analyticsData.storageBreakdown.documents.size, count: analyticsData.storageBreakdown.documents.count, color: 'bg-green-500' },
      { type: 'Videos', size: analyticsData.storageBreakdown.videos.size, count: analyticsData.storageBreakdown.videos.count, color: 'bg-purple-500' },
      { type: 'Audio', size: analyticsData.storageBreakdown.audio.size, count: analyticsData.storageBreakdown.audio.count, color: 'bg-yellow-500' },
      { type: 'Other', size: analyticsData.storageBreakdown.other.size, count: analyticsData.storageBreakdown.other.count, color: 'bg-gray-500' }
    ],
    activityData: analyticsData.dailyActivity || [],
    topFiles: analyticsData.topFiles || [],
    recentActivity: analyticsData.recentActivity || []
  };

  // No need for generateActivityData since we're using real data

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'upload':
        return <Upload className="w-4 h-4 text-green-500" />;
      case 'download':
        return <Download className="w-4 h-4 text-blue-500" />;
      case 'share':
        return <Share2 className="w-4 h-4 text-purple-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'upload':
        return 'bg-green-100 text-green-800';
      case 'download':
        return 'bg-blue-100 text-blue-800';
      case 'share':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // No loading state needed since we're using real-time data

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className={`${isDark ? 'glass-card border-b border-white/20' : 'bg-white/80 backdrop-blur-md border-b border-gray-200'}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center fade-in-up">
              <BarChart3 className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'} mr-3`} />
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Analytics Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={`${isDark 
                  ? 'bg-white/10 border border-white/20 text-white focus:ring-white/30 focus:border-white/40' 
                  : 'bg-white border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                } px-4 py-2 rounded-xl focus:outline-none focus:ring-2 transition-all`}
              >
                <option value="7d" className={isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}>Last 7 days</option>
                <option value="30d" className={isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}>Last 30 days</option>
                <option value="90d" className={isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}>Last 90 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`${isDark ? 'glass-card' : 'bg-white shadow-sm border border-gray-200'} p-6 hover-lift fade-in-up rounded-xl`} style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center">
              <div className={`p-3 ${isDark ? 'bg-gradient-to-br from-blue-400/20 to-blue-600/20' : 'bg-blue-100'} rounded-xl`}>
                <File className={`w-6 h-6 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDark ? 'text-white/80' : 'text-gray-600'}`}>Total Files</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{analytics.overview.totalFiles.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className={`${isDark ? 'glass-card' : 'bg-white shadow-sm border border-gray-200'} p-6 hover-lift fade-in-up rounded-xl`} style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center">
              <div className={`p-3 ${isDark ? 'bg-gradient-to-br from-green-400/20 to-green-600/20' : 'bg-green-100'} rounded-xl`}>
                <Folder className={`w-6 h-6 ${isDark ? 'text-green-300' : 'text-green-600'}`} />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDark ? 'text-white/80' : 'text-gray-600'}`}>Total Folders</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{analytics.overview.totalFolders}</p>
              </div>
            </div>
          </div>

          <div className={`${isDark ? 'glass-card' : 'bg-white shadow-sm border border-gray-200'} p-6 hover-lift fade-in-up rounded-xl`} style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center">
              <div className={`p-3 ${isDark ? 'bg-gradient-to-br from-purple-400/20 to-purple-600/20' : 'bg-purple-100'} rounded-xl`}>
                <HardDrive className={`w-6 h-6 ${isDark ? 'text-purple-300' : 'text-purple-600'}`} />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDark ? 'text-white/80' : 'text-gray-600'}`}>Storage Used</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatFileSize(analytics.overview.totalStorage)}</p>
              </div>
            </div>
          </div>

          <div className={`${isDark ? 'glass-card' : 'bg-white shadow-sm border border-gray-200'} p-6 hover-lift fade-in-up rounded-xl`} style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center">
              <div className={`p-3 ${isDark ? 'bg-gradient-to-br from-amber-400/20 to-amber-600/20' : 'bg-amber-100'} rounded-xl`}>
                <Download className={`w-6 h-6 ${isDark ? 'text-amber-300' : 'text-amber-600'}`} />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDark ? 'text-white/80' : 'text-gray-600'}`}>Total Downloads</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{analytics.overview.totalDownloads.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Storage Breakdown */}
          <div className={`${isDark ? 'glass-card' : 'bg-white shadow-sm border border-gray-200'} p-6 slide-in-right rounded-xl`}>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Storage by File Type</h3>
            <div className="space-y-4">
              {analytics.storageBreakdown.map((item, index) => (
                <div key={index} className={`flex items-center justify-between p-4 ${isDark ? 'glass-card' : 'bg-gray-50 border border-gray-200'} rounded-xl hover-lift transition-all duration-200`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${item.color.replace('bg-', 'bg-').replace('-500', isDark ? '-400' : '-500')}`}></div>
                    <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.type}</span>
                    <span className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-500'}`}>({item.count} files)</span>
                  </div>
                  <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatFileSize(item.size)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Files */}
          <div className={`${isDark ? 'glass-card' : 'bg-white shadow-sm border border-gray-200'} p-6 slide-in-right rounded-xl`}>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Most Downloaded Files</h3>
            <div className="space-y-3">
              {analytics.topFiles.map((file, index) => (
                <div key={index} className={`flex items-center justify-between p-4 ${isDark ? 'glass-card' : 'bg-gray-50 border border-gray-200'} rounded-xl hover-lift transition-all duration-200`}>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>{file.name}</p>
                    <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                      {file.downloads} downloads • {file.shares} shares
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatFileSize(file.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Chart */}
        <div className={`${isDark ? 'glass-card' : 'bg-white shadow-sm border border-gray-200'} p-6 mb-8 fade-in-up rounded-xl`}>
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Activity Over Time</h3>
          <div className="h-64 flex items-end space-x-2">
            {analytics.activityData.length > 0 ? (
              analytics.activityData.map((day, index) => {
                const maxValue = Math.max(day.uploads, day.downloads, day.shares, 1);
                return (
                  <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                    <div className="w-full flex flex-col space-y-1">
                      <div
                        className={`${isDark ? 'bg-gradient-to-t from-blue-500 to-blue-400' : 'bg-blue-500'} rounded-t`}
                        style={{ height: `${(day.uploads / maxValue) * 100}%` }}
                        title={`${day.uploads} uploads`}
                      ></div>
                      <div
                        className={`${isDark ? 'bg-gradient-to-t from-green-500 to-green-400' : 'bg-green-500'}`}
                        style={{ height: `${(day.downloads / maxValue) * 100}%` }}
                        title={`${day.downloads} downloads`}
                      ></div>
                      <div
                        className={`${isDark ? 'bg-gradient-to-t from-purple-500 to-purple-400' : 'bg-purple-500'} rounded-b`}
                        style={{ height: `${(day.shares / maxValue) * 100}%` }}
                        title={`${day.shares} shares`}
                      ></div>
                    </div>
                    <span className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-500'} transform -rotate-45 origin-left`}>
                      {format(new Date(day.date), 'MMM dd')}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className={`flex-1 flex items-center justify-center ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                <p>No activity data available</p>
              </div>
            )}
          </div>
          <div className="flex justify-center space-x-6 mt-6">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 ${isDark ? 'bg-blue-400' : 'bg-blue-500'} rounded-full`}></div>
              <span className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-600'}`}>Uploads</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 ${isDark ? 'bg-green-400' : 'bg-green-500'} rounded-full`}></div>
              <span className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-600'}`}>Downloads</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 ${isDark ? 'bg-purple-400' : 'bg-purple-500'} rounded-full`}></div>
              <span className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-600'}`}>Shares</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`${isDark ? 'glass-card' : 'bg-white shadow-sm border border-gray-200'} p-6 fade-in-up rounded-xl`}>
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Recent Activity</h3>
          <div className="space-y-3">
            {analytics.recentActivity.length > 0 ? (
              analytics.recentActivity.map((activity, index) => (
                <div key={index} className={`flex items-center space-x-3 p-4 ${isDark ? 'glass-card' : 'bg-gray-50 border border-gray-200'} rounded-xl hover-lift transition-all duration-200`}>
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <span className="font-semibold">{activity.user}</span> {activity.type}ed{' '}
                      <span className="font-semibold">{activity.file}</span>
                    </p>
                    <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                      {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      activity.type === 'upload' ? (isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-800') :
                      activity.type === 'download' ? (isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-800') :
                      activity.type === 'share' ? (isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-800') :
                      (isDark ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-800')
                    }`}>
                      {activity.type}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className={`text-center py-8 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
