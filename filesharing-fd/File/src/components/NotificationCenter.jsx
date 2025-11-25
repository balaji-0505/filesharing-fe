import { useState } from 'react';
import { Bell, X, Check, Trash2, ExternalLink } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotifications();

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    // In a real app, you would navigate to the relevant page or perform an action
    console.log('Notification clicked:', notification);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'file_shared':
        return '🔗';
      case 'file_updated':
        return '📝';
      case 'file_deleted':
        return '🗑️';
      case 'folder_shared':
        return '📁';
      case 'permission_changed':
        return '🔐';
      case 'storage_warning':
        return '⚠️';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'storage_warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'file_deleted':
        return 'border-l-red-500 bg-red-50';
      case 'file_shared':
      case 'folder_shared':
        return 'border-l-blue-500 bg-blue-50';
      case 'file_updated':
        return 'border-l-green-500 bg-green-50';
      case 'permission_changed':
        return 'border-l-purple-500 bg-purple-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark all read</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${getNotificationColor(notification.type)} ${
                        !notification.isRead ? 'bg-white' : 'bg-gray-50'
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <span className="text-lg">
                            {getNotificationIcon(notification.type)}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                            </p>
                            
                            <div className="flex items-center space-x-2">
                              {notification.action && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationClick(notification);
                                  }}
                                  className="text-xs text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>{notification.action}</span>
                                </button>
                              )}
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="text-xs text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t bg-gray-50">
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-500 hover:text-gray-700 w-full text-center"
                >
                  Clear all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
