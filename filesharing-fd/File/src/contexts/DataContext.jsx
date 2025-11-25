import { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { filesApi, foldersApi, sharesApi } from '../services/api';

const DataContext = createContext();

const initialState = {
  files: [],
  folders: [],
  shareLinks: {},
  isLoading: true
};

const dataReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_DATA':
      return {
        ...state,
        files: action.payload.files || [],
        folders: action.payload.folders || [],
        shareLinks: action.payload.shareLinks || {},
        isLoading: false
      };

    case 'ADD_FILES':
      return {
        ...state,
        files: [...state.files, ...action.payload]
      };

    case 'ADD_FOLDER':
      return {
        ...state,
        folders: [...state.folders, action.payload]
      };

    case 'UPDATE_FILE':
      return {
        ...state,
        files: state.files.map(file => 
          file.id === action.payload.id ? { ...file, ...action.payload.updates } : file
        )
      };

    case 'DELETE_FILE':
      return {
        ...state,
        files: state.files.filter(file => file.id !== action.payload)
      };

    case 'DELETE_FOLDER':
      return {
        ...state,
        folders: state.folders.filter(folder => folder.id !== action.payload)
      };

    case 'ADD_SHARE_LINK':
      return {
        ...state,
        shareLinks: {
          ...state.shareLinks,
          [action.payload.id]: action.payload
        }
      };

    case 'UPDATE_SHARE_LINK':
      return {
        ...state,
        shareLinks: {
          ...state.shareLinks,
          [action.payload.id]: {
            ...state.shareLinks[action.payload.id],
            ...action.payload.updates
          }
        }
      };

    case 'DELETE_SHARE_LINK':
      const newShareLinks = { ...state.shareLinks };
      delete newShareLinks[action.payload];
      return {
        ...state,
        shareLinks: newShareLinks
      };

    default:
      return state;
  }
};

export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const { isAuthenticated, user, updateUser } = useAuth();

  // Load data from backend when authenticated
  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: 'LOAD_DATA', payload: { files: [], folders: [], shareLinks: {} } });
        const [files, folders, shares] = await Promise.all([
          filesApi.list(),
          foldersApi.list(),
          sharesApi.list().catch(() => [])
        ]);
        const shareLinks = {};
        (shares || []).forEach(s => {
          shareLinks[s.id] = s;
        });
        // attach download url to files for UI compatibility
        const filesWithUrl = files.map(f => ({ ...f, url: filesApi.downloadUrl(f.id), type: f.mimeType }));
        dispatch({
          type: 'LOAD_DATA',
          payload: { files: filesWithUrl, folders, shareLinks }
        });
      } catch (error) {
        console.error('Failed to load data:', error);
        dispatch({ type: 'LOAD_DATA', payload: { files: [], folders: [], shareLinks: {} } });
      }
    };

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const addFiles = async (localFiles) => {
    // localFiles are File objects from input/dropzone
    const tasks = localFiles.map(async (lf) => {
      const fileObj = lf && lf.file instanceof File ? lf.file : lf;
      const res = await filesApi.upload(fileObj);
      return { ...res, url: filesApi.downloadUrl(res.id), type: res.mimeType };
    });
    const results = await Promise.allSettled(tasks);
    const uploaded = results.filter(r => r.status === 'fulfilled').map(r => r.value);
    const failures = results.filter(r => r.status === 'rejected');
    if (uploaded.length) {
      dispatch({ type: 'ADD_FILES', payload: uploaded });
      // Update storage usage in auth state
      const addedBytes = uploaded.reduce((sum, f) => sum + (Number(f.size) || 0), 0);
      if (addedBytes) {
        const currentUsed = Number(user?.storageUsed ?? 0);
        updateUser({ storageUsed: currentUsed + addedBytes });
      }
    }
    if (failures.length && !uploaded.length) {
      // If all failed, throw to trigger UI error toast
      throw failures[0].reason || new Error('Upload failed');
    }
    return uploaded;
  };

  const addFolder = async (folder) => {
    // folder may contain just name; create via API
    const created = await foldersApi.create(folder.name, folder.parentId);
    dispatch({ type: 'ADD_FOLDER', payload: created });
    return created;
  };

  const updateFile = async (id, updates) => {
    await filesApi.update(id, { name: updates.name, isStarred: updates.isStarred });
    dispatch({ type: 'UPDATE_FILE', payload: { id, updates } });
  };

  const deleteFile = async (id) => {
    // Get size before deletion for storage adjustments
    const target = state.files.find(f => f.id === id);
    const targetSize = Number(target?.size || 0);
    await filesApi.remove(id);
    dispatch({ type: 'DELETE_FILE', payload: id });
    if (targetSize) {
      const currentUsed = Number(user?.storageUsed ?? 0);
      updateUser({ storageUsed: Math.max(0, currentUsed - targetSize) });
    }
  };

  const deleteFolder = async (id) => {
    await foldersApi.remove(id);
    dispatch({ type: 'DELETE_FOLDER', payload: id });
  };

  const addShareLink = async (shareData) => {
    const created = await sharesApi.create({
      fileId: shareData.item.id,
      shareType: shareData.shareType,
      permissions: shareData.permissions,
      expiryEpochMs: shareData.expiryDate ? new Date(shareData.expiryDate).getTime() : undefined,
      password: shareData.password,
      createdBy: shareData.createdBy
    });
    dispatch({ type: 'ADD_SHARE_LINK', payload: created });
    return created;
  };

  const updateShareLink = async (id, updates) => {
    const updated = await sharesApi.update(id, {
      shareType: updates.shareType,
      permissions: updates.permissions,
      expiryEpochMs: updates.expiryDate ? new Date(updates.expiryDate).getTime() : undefined,
      password: updates.password
    });
    dispatch({ type: 'UPDATE_SHARE_LINK', payload: { id, updates: updated } });
    return updated;
  };

  const deleteShareLink = async (id) => {
    await sharesApi.remove(id);
    dispatch({ type: 'DELETE_SHARE_LINK', payload: id });
  };

  const value = {
    ...state,
    addFiles,
    addFolder,
    updateFile,
    deleteFile,
    deleteFolder,
    addShareLink,
    updateShareLink,
    deleteShareLink
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
