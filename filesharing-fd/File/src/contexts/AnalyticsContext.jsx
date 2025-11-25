import { createContext, useContext, useReducer, useEffect } from 'react';
import { filesApi, foldersApi } from '../services/api';
import { useAuth } from './AuthContext';

const AnalyticsContext = createContext();

const initialState = {
  totalFiles: 0,
  totalFolders: 0,
  totalStorage: 0,
  totalDownloads: 0,
  totalShares: 0,
  totalUploads: 0,
  storageBreakdown: {
    images: { size: 0, count: 0 },
    documents: { size: 0, count: 0 },
    videos: { size: 0, count: 0 },
    audio: { size: 0, count: 0 },
    other: { size: 0, count: 0 }
  },
  recentActivity: [],
  topFiles: [],
  dailyActivity: []
};

const analyticsReducer = (state, action) => {
  switch (action.type) {
    case 'INITIALIZE_DATA':
      return {
        ...state,
        ...action.payload
      };

    case 'FILE_UPLOADED':
      const newFile = action.payload;
      const fileType = getFileType(newFile.type);
      const newStorageBreakdown = { ...state.storageBreakdown };
      
      newStorageBreakdown[fileType] = {
        size: newStorageBreakdown[fileType].size + newFile.size,
        count: newStorageBreakdown[fileType].count + 1
      };

      return {
        ...state,
        totalFiles: state.totalFiles + 1,
        totalStorage: state.totalStorage + newFile.size,
        totalUploads: state.totalUploads + 1,
        storageBreakdown: newStorageBreakdown,
        recentActivity: [
          {
            type: 'upload',
            user: action.user || 'Current User',
            file: newFile.name,
            time: new Date(),
            size: newFile.size
          },
          ...state.recentActivity.slice(0, 9) // Keep only last 10 activities
        ],
        topFiles: updateTopFiles([...state.topFiles], newFile)
      };

    case 'FILE_DOWNLOADED':
      const downloadedFile = action.payload;
      return {
        ...state,
        totalDownloads: state.totalDownloads + 1,
        recentActivity: [
          {
            type: 'download',
            user: action.user || 'Current User',
            file: downloadedFile.name,
            time: new Date(),
            size: downloadedFile.size
          },
          ...state.recentActivity.slice(0, 9)
        ],
        topFiles: updateTopFiles([...state.topFiles], downloadedFile, 'download')
      };

    case 'FILE_SHARED':
      const sharedFile = action.payload;
      return {
        ...state,
        totalShares: state.totalShares + 1,
        recentActivity: [
          {
            type: 'share',
            user: action.user || 'Current User',
            file: sharedFile.name,
            time: new Date(),
            size: sharedFile.size
          },
          ...state.recentActivity.slice(0, 9)
        ],
        topFiles: updateTopFiles([...state.topFiles], sharedFile, 'share')
      };

    case 'FILE_DELETED':
      const deletedFile = action.payload;
      const deletedFileType = getFileType(deletedFile.type);
      const updatedStorageBreakdown = { ...state.storageBreakdown };
      
      updatedStorageBreakdown[deletedFileType] = {
        size: Math.max(0, updatedStorageBreakdown[deletedFileType].size - deletedFile.size),
        count: Math.max(0, updatedStorageBreakdown[deletedFileType].count - 1)
      };

      return {
        ...state,
        totalFiles: Math.max(0, state.totalFiles - 1),
        totalStorage: Math.max(0, state.totalStorage - deletedFile.size),
        storageBreakdown: updatedStorageBreakdown,
        recentActivity: [
          {
            type: 'delete',
            user: action.user || 'Current User',
            file: deletedFile.name,
            time: new Date(),
            size: deletedFile.size
          },
          ...state.recentActivity.slice(0, 9)
        ]
      };

    case 'FOLDER_CREATED':
      return {
        ...state,
        totalFolders: state.totalFolders + 1,
        recentActivity: [
          {
            type: 'folder_created',
            user: action.user || 'Current User',
            file: action.payload.name,
            time: new Date(),
            size: 0
          },
          ...state.recentActivity.slice(0, 9)
        ]
      };

    case 'FOLDER_DELETED':
      return {
        ...state,
        totalFolders: Math.max(0, state.totalFolders - 1),
        recentActivity: [
          {
            type: 'folder_deleted',
            user: action.user || 'Current User',
            file: action.payload.name,
            time: new Date(),
            size: 0
          },
          ...state.recentActivity.slice(0, 9)
        ]
      };

    case 'UPDATE_DAILY_ACTIVITY':
      return {
        ...state,
        dailyActivity: action.payload
      };

    default:
      return state;
  }
};

const getFileType = (mimeType) => {
  if (!mimeType) return 'other';
  
  const type = mimeType.split('/')[0];
  switch (type) {
    case 'image':
      return 'images';
    case 'video':
      return 'videos';
    case 'audio':
      return 'audio';
    case 'application':
      if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
        return 'documents';
      }
      return 'other';
    case 'text':
      return 'documents';
    default:
      return 'other';
  }
};

const updateTopFiles = (topFiles, file, action = 'upload') => {
  const existingFileIndex = topFiles.findIndex(f => f.name === file.name);
  
  if (existingFileIndex >= 0) {
    const existingFile = topFiles[existingFileIndex];
    if (action === 'download') {
      existingFile.downloads = (existingFile.downloads || 0) + 1;
    } else if (action === 'share') {
      existingFile.shares = (existingFile.shares || 0) + 1;
    }
    topFiles[existingFileIndex] = existingFile;
  } else {
    topFiles.push({
      name: file.name,
      size: file.size,
      downloads: action === 'download' ? 1 : 0,
      shares: action === 'share' ? 1 : 0,
      type: file.type
    });
  }
  
  // Sort by downloads + shares and keep top 10
  return topFiles
    .sort((a, b) => (b.downloads + b.shares) - (a.downloads + a.shares))
    .slice(0, 10);
};

export const AnalyticsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(analyticsReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Load analytics data from localStorage on mount
  useEffect(() => {
    const savedAnalytics = localStorage.getItem('fileShareAnalytics');
    if (savedAnalytics) {
      try {
        const parsedData = JSON.parse(savedAnalytics);
        dispatch({ type: 'INITIALIZE_DATA', payload: parsedData });
      } catch (error) {
        console.error('Failed to load analytics data:', error);
      }
    }
  }, []);

  // Save analytics data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('fileShareAnalytics', JSON.stringify(state));
  }, [state]);

  // Initialize snapshot from backend only when authenticated
  useEffect(() => {
    const loadBackendSnapshot = async () => {
      try {
        const [files, folders] = await Promise.all([
          filesApi.list(),
          foldersApi.list()
        ]);

        const totalFiles = files.length;
        const totalFolders = folders.length;
        const totalStorage = files.reduce((sum, f) => sum + (f.size || 0), 0);
        const totalDownloads = files.reduce((sum, f) => sum + (f.downloadCount || 0), 0);

        const storageBreakdown = {
          images: { size: 0, count: 0 },
          documents: { size: 0, count: 0 },
          videos: { size: 0, count: 0 },
          audio: { size: 0, count: 0 },
          other: { size: 0, count: 0 }
        };

        files.forEach((f) => {
          const bucket = getFileType(f.mimeType || f.type);
          storageBreakdown[bucket].size += f.size || 0;
          storageBreakdown[bucket].count += 1;
        });

        dispatch({
          type: 'INITIALIZE_DATA',
          payload: {
            totalFiles,
            totalFolders,
            totalStorage,
            totalDownloads,
            storageBreakdown
          }
        });
      } catch (err) {
        // If backend snapshot fails, keep whatever we already have
        // eslint-disable-next-line no-console
        console.warn('Failed to load analytics snapshot:', err);
      }
    };

    if (isAuthenticated) {
      loadBackendSnapshot();
    }
  }, [isAuthenticated]);

  // Generate daily activity data
  useEffect(() => {
    const generateDailyActivity = () => {
      const days = 7; // Last 7 days
      const dailyData = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Count activities for this day
        const dayActivities = state.recentActivity.filter(activity => {
          const activityDate = new Date(activity.time);
          return activityDate.toDateString() === date.toDateString();
        });
        
        dailyData.push({
          date: date.toISOString().split('T')[0],
          uploads: dayActivities.filter(a => a.type === 'upload').length,
          downloads: dayActivities.filter(a => a.type === 'download').length,
          shares: dayActivities.filter(a => a.type === 'share').length
        });
      }
      
      dispatch({ type: 'UPDATE_DAILY_ACTIVITY', payload: dailyData });
    };

    generateDailyActivity();
  }, [state.recentActivity]);

  const trackFileUpload = (file, user) => {
    dispatch({ type: 'FILE_UPLOADED', payload: file, user });
  };

  const trackFileDownload = (file, user) => {
    dispatch({ type: 'FILE_DOWNLOADED', payload: file, user });
  };

  const trackFileShare = (file, user) => {
    dispatch({ type: 'FILE_SHARED', payload: file, user });
  };

  const trackFileDelete = (file, user) => {
    dispatch({ type: 'FILE_DELETED', payload: file, user });
  };

  const trackFolderCreate = (folder, user) => {
    dispatch({ type: 'FOLDER_CREATED', payload: folder, user });
  };

  const trackFolderDelete = (folder, user) => {
    dispatch({ type: 'FOLDER_DELETED', payload: folder, user });
  };

  const value = {
    ...state,
    trackFileUpload,
    trackFileDownload,
    trackFileShare,
    trackFileDelete,
    trackFolderCreate,
    trackFolderDelete
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
