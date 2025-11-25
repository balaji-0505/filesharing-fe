// User types
export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
};

// File types
export const FileType = {
  IMAGE: 'image',
  DOCUMENT: 'document',
  VIDEO: 'video',
  AUDIO: 'audio',
  ARCHIVE: 'archive',
  OTHER: 'other'
};

// Permission types
export const Permission = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  SHARE: 'share'
};

// Sharing types
export const ShareType = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  RESTRICTED: 'restricted'
};

// Notification types
export const NotificationType = {
  FILE_SHARED: 'file_shared',
  FILE_UPDATED: 'file_updated',
  FILE_DELETED: 'file_deleted',
  FOLDER_SHARED: 'folder_shared',
  PERMISSION_CHANGED: 'permission_changed',
  STORAGE_WARNING: 'storage_warning'
};

// File status
export const FileStatus = {
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  READY: 'ready',
  ERROR: 'error'
};
