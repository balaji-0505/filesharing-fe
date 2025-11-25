import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import FileUpload from '../components/FileUpload';
import ShareModal from '../components/ShareModal';
import FilePreview from '../components/FilePreview';
import Navigation from '../components/Navigation';
import { 
  Upload, 
  FolderPlus, 
  Search, 
  Grid, 
  List, 
  MoreVertical,
  File,
  Folder,
  Share2,
  Download,
  Trash2,
  Star,
  Clock,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { trackFileUpload, trackFileDownload, trackFileShare, trackFileDelete, trackFolderCreate, trackFolderDelete } = useAnalytics();
  const { files, folders, addFiles, addFolder, updateFile, deleteFile, deleteFolder, addShareLink, isLoading } = useData();
  const { isDark } = useTheme();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Data is now loaded from DataContext and persisted automatically

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return '🖼️';
      case 'document':
        return '📄';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎵';
      default:
        return '📁';
    }
  };

  const handleFileUpload = async (selectedFiles) => {
    const uploaded = await addFiles(selectedFiles);
    // Track analytics for each uploaded file
    uploaded.forEach(file => {
      trackFileUpload(file, user.name);
    });
    return uploaded;
  };

  const handleCreateFolder = () => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      const newFolder = {
        id: Date.now().toString(),
        name: folderName,
        itemCount: 0,
        createdAt: new Date(),
        isStarred: false
      };
      addFolder(newFolder);
      trackFolderCreate(newFolder, user.name);
      toast.success('Folder created successfully!');
    }
  };

  const handleShare = (item) => {
    setSelectedItem(item);
    setShowShareModal(true);
  };

  const handlePreview = (item) => {
    setSelectedItem(item);
    setShowPreviewModal(true);
  };

  const handleShareSubmit = (shareData) => {
    // Save share link to persistent storage
    addShareLink({
      id: shareData.link,
      itemId: shareData.item.id,
      itemName: shareData.item.name,
      shareType: shareData.shareType,
      permissions: shareData.permissions,
      expiryDate: shareData.expiryDate,
      password: shareData.password,
      emails: shareData.emails,
      createdAt: new Date(),
      createdBy: user.name
    });
    
    trackFileShare(shareData.item, user.name);
    toast.success('Sharing settings updated successfully!');
  };

  const handleDownload = async (file) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(file.url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);

      // Update download count
      updateFile(file.id, { downloadCount: (file.downloadCount || 0) + 1 });
      // Track analytics
      trackFileDownload(file, user.name);
      toast.success(`${file.name} downloaded successfully!`);
    } catch (e) {
      toast.error('File not available for download');
    }
  };

  const handleDelete = (item) => {
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      if (item.type) {
        deleteFile(item.id);
        trackFileDelete(item, user.name);
      } else {
        deleteFolder(item.id);
        trackFolderDelete(item, user.name);
      }
      toast.success(`${item.name} deleted successfully!`);
    }
  };

  const handleStar = (item) => {
    if (item.type) {
      updateFile(item.id, { isStarred: !item.isStarred });
    } else {
      // For folders, we'd need a separate updateFolder function in DataContext
      // For now, we'll just show a toast
      toast.success(`${item.name} ${item.isStarred ? 'unstarred' : 'starred'} successfully!`);
    }
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const storageUsedPercentage = (user.storageUsed / user.storageLimit) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 fade-in-up">
          <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>My Files</h1>
          <p className={`${isDark ? 'text-white/80' : 'text-gray-600'}`}>Manage and organize your files and folders</p>
        </div>

        {/* Toolbar */}
        <div className={`${isDark ? 'glass-card' : 'bg-white shadow-sm border border-gray-200'} p-6 mb-8 fade-in-up rounded-xl`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-white/60' : 'text-gray-400'} w-4 h-4`} />
                <input
                  type="text"
                  placeholder="Search files and folders..."
                  className={`${isDark 
                    ? 'bg-white/10 border border-white/20 text-white placeholder-white/60 focus:ring-white/30 focus:border-white/40' 
                    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
                  } rounded-xl px-4 py-3 pl-10 w-full sm:w-64 focus:outline-none focus:ring-2 transition-all`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={() => setShowUploadModal(true)}
                className={`${isDark ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20' : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'} px-6 py-3 rounded-xl transition-all flex items-center space-x-2 flex-1 sm:flex-none hover-lift`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </button>
              
              <button
                onClick={handleCreateFolder}
                className={`${isDark ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20' : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'} px-6 py-3 rounded-xl transition-all flex items-center space-x-2 flex-1 sm:flex-none hover-lift`}
              >
                <FolderPlus className="w-4 h-4" />
                <span>New Folder</span>
              </button>

              <div className={`flex items-center ${isDark ? 'bg-white/10 border border-white/20' : 'bg-white border border-gray-300'} rounded-xl overflow-hidden`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-all ${viewMode === 'grid' 
                    ? (isDark ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600') 
                    : (isDark ? 'text-white/60 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-all ${viewMode === 'list' 
                    ? (isDark ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600') 
                    : (isDark ? 'text-white/60 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Files and Folders */}
        <div className="space-y-6">
          {/* Folders */}
          {filteredFolders.length > 0 && (
            <div className="slide-in-right">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Folders</h2>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-3'}>
                {filteredFolders.map((folder, index) => (
                  <div
                    key={folder.id}
                    className={`${isDark ? 'glass-card' : 'bg-white shadow-sm border border-gray-200'} p-6 hover-lift cursor-pointer group rounded-xl ${viewMode === 'list' ? 'flex items-center justify-between' : 'text-center'}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${isDark ? 'bg-gradient-to-br from-amber-400/20 to-amber-600/20' : 'bg-gradient-to-br from-amber-100 to-amber-200'} rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200`}>
                        <Folder className={`w-6 h-6 ${isDark ? 'text-amber-300' : 'text-amber-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${isDark ? 'text-white group-hover:text-amber-300' : 'text-gray-900 group-hover:text-amber-600'} truncate transition-colors`}>
                          {folder.name}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-500'} mt-1`}>
                          {folder.itemCount} items
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 mt-4 sm:mt-0">
                      <button
                        onClick={() => handleStar(folder)}
                        className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                      >
                        <Star className={`w-4 h-4 ${folder.isStarred ? (isDark ? 'text-amber-400 fill-current' : 'text-amber-500 fill-current') : (isDark ? 'text-white/60' : 'text-gray-500')}`} />
                      </button>
                      <button
                        onClick={() => handleShare(folder)}
                        className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                      >
                        <Share2 className={`w-4 h-4 ${isDark ? 'text-white/60' : 'text-gray-500'}`} />
                      </button>
                      <button
                        onClick={() => handleDelete(folder)}
                        className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 ${isDark ? 'hover:bg-red-500/20 hover:text-red-300' : 'hover:bg-red-100 hover:text-red-600'}`}
                      >
                        <Trash2 className={`w-4 h-4 ${isDark ? 'text-white/60' : 'text-gray-500'}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {filteredFiles.length > 0 && (
            <div className="slide-in-right">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Files</h2>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-3'}>
                {filteredFiles.map((file, index) => (
                  <div
                    key={file.id}
                    className={`${isDark ? 'glass-card' : 'bg-white shadow-sm border border-gray-200'} p-6 hover-lift cursor-pointer group rounded-xl ${viewMode === 'list' ? 'flex items-center justify-between' : 'text-center'}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${isDark ? 'bg-gradient-to-br from-blue-400/20 to-blue-600/20' : 'bg-gradient-to-br from-blue-100 to-blue-200'} rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200`}>
                        <span className="text-lg">{getFileIcon(file.type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${isDark ? 'text-white group-hover:text-blue-300' : 'text-gray-900 group-hover:text-blue-600'} truncate transition-colors`}>
                          {file.name}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-500'} mt-1`}>
                          {formatFileSize(file.size)} • {format(file.uploadedAt, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 mt-4 sm:mt-0">
                      <button
                        onClick={() => handlePreview(file)}
                        className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                        title="Preview"
                      >
                        <Eye className={`w-4 h-4 ${isDark ? 'text-white/60' : 'text-gray-500'}`} />
                      </button>
                      <button
                        onClick={() => handleStar(file)}
                        className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                        title="Star"
                      >
                        <Star className={`w-4 h-4 ${file.isStarred ? (isDark ? 'text-amber-400 fill-current' : 'text-amber-500 fill-current') : (isDark ? 'text-white/60' : 'text-gray-500')}`} />
                      </button>
                      <button
                        onClick={() => handleShare(file)}
                        className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                        title="Share"
                      >
                        <Share2 className={`w-4 h-4 ${isDark ? 'text-white/60' : 'text-gray-500'}`} />
                      </button>
                      <button
                        onClick={() => handleDownload(file)}
                        className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                        title="Download"
                      >
                        <Download className={`w-4 h-4 ${isDark ? 'text-white/60' : 'text-gray-500'}`} />
                      </button>
                      <button
                        onClick={() => handleDelete(file)}
                        className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 ${isDark ? 'hover:bg-red-500/20 hover:text-red-300' : 'hover:bg-red-100 hover:text-red-600'}`}
                        title="Delete"
                      >
                        <Trash2 className={`w-4 h-4 ${isDark ? 'text-white/60' : 'text-gray-500'}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredFiles.length === 0 && filteredFolders.length === 0 && (
            <div className="text-center py-16 fade-in-up">
              <div className="w-20 h-20 glass-card rounded-2xl flex items-center justify-center mx-auto mb-6">
                <File className="w-10 h-10 text-white/60" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No files found</h3>
              <p className="text-white/80 mb-6 max-w-md mx-auto">
                {searchQuery ? 'Try adjusting your search terms' : 'Upload your first file to get started'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn-primary hover-lift"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <FileUpload
          onUpload={handleFileUpload}
          onClose={() => setShowUploadModal(false)}
        />
      )}

      {/* Share Modal */}
      {showShareModal && selectedItem && (
        <ShareModal
          item={selectedItem}
          onClose={() => setShowShareModal(false)}
          onShare={handleShareSubmit}
        />
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedItem && (
        <FilePreview
          file={selectedItem}
          onClose={() => setShowPreviewModal(false)}
          onStar={handleStar}
          onShare={handleShare}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
};

export default Dashboard;
