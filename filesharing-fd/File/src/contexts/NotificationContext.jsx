import { createContext, useContext, useReducer, useEffect } from 'react';
import { NotificationType } from '../types';

const NotificationContext = createContext();

const initialState = {
  notifications: [],
  unreadCount: 0,
  isConnected: false
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      const newNotification = {
        id: Date.now().toString(),
        ...action.payload,
        timestamp: new Date(),
        isRead: false
      };
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };

    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };

    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true
        })),
        unreadCount: 0
      };

    case 'DELETE_NOTIFICATION':
      const notification = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        unreadCount: notification && !notification.isRead 
          ? Math.max(0, state.unreadCount - 1) 
          : state.unreadCount
      };

    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };

    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        isConnected: action.payload
      };

    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random notifications
      const notificationTypes = Object.values(NotificationType);
      const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      
      const mockNotifications = {
        [NotificationType.FILE_SHARED]: {
          type: NotificationType.FILE_SHARED,
          title: 'File Shared',
          message: 'project-proposal.pdf has been shared with john@example.com',
          icon: '🔗',
          action: 'View File'
        },
        [NotificationType.FILE_UPDATED]: {
          type: NotificationType.FILE_UPDATED,
          title: 'File Updated',
          message: 'presentation.pptx has been updated by jane@example.com',
          icon: '📝',
          action: 'View Changes'
        },
        [NotificationType.FILE_DELETED]: {
          type: NotificationType.FILE_DELETED,
          title: 'File Deleted',
          message: 'old-document.pdf has been deleted',
          icon: '🗑️',
          action: 'Restore'
        },
        [NotificationType.FOLDER_SHARED]: {
          type: NotificationType.FOLDER_SHARED,
          title: 'Folder Shared',
          message: 'Work Documents folder has been shared with your team',
          icon: '📁',
          action: 'View Folder'
        },
        [NotificationType.PERMISSION_CHANGED]: {
          type: NotificationType.PERMISSION_CHANGED,
          title: 'Permissions Updated',
          message: 'Your access to project-files folder has been updated',
          icon: '🔐',
          action: 'View Permissions'
        },
        [NotificationType.STORAGE_WARNING]: {
          type: NotificationType.STORAGE_WARNING,
          title: 'Storage Warning',
          message: 'You are using 85% of your storage quota',
          icon: '⚠️',
          action: 'Upgrade Plan'
        }
      };

      // Only add notification occasionally (10% chance every 30 seconds)
      if (Math.random() < 0.1) {
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: mockNotifications[randomType]
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const addNotification = (notification) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: notification
    });
  };

  const markAsRead = (notificationId) => {
    dispatch({
      type: 'MARK_AS_READ',
      payload: notificationId
    });
  };

  const markAllAsRead = () => {
    dispatch({
      type: 'MARK_ALL_AS_READ'
    });
  };

  const deleteNotification = (notificationId) => {
    dispatch({
      type: 'DELETE_NOTIFICATION',
      payload: notificationId
    });
  };

  const clearAll = () => {
    dispatch({
      type: 'CLEAR_ALL'
    });
  };

  const value = {
    ...state,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
