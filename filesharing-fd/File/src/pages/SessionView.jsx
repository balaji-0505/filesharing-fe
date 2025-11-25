import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { passhareApi, filesApi } from '../services/api';
import { Upload, Download, X, Share2, File, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Navigation from '../components/Navigation';
import { format } from 'date-fns';

const SessionView = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { files } = useData();
  const [session, setSession] = useState(null);
  const [sessionFiles, setSessionFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [showFileSelector, setShowFileSelector] = useState(false);

  useEffect(() => {
    loadSessionData();
    const interval = setInterval(loadSessionData, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      const [sessionData, filesData] = await Promise.all([
        passhareApi.getSession(sessionId),
        passhareApi.getSessionFiles(sessionId)
      ]);
      setSession(sessionData);
      setSessionFiles(filesData);
      // Debug: log files data to check downloadCount
      console.log('Session files data:', filesData);
      setIsLoading(false);
    } catch (error) {
      toast.error(error.message || 'Failed to load session');
      setIsLoading(false);
    }
  };

  const handleShareFile = async (fileId) => {
    setIsSharing(true);
    try {
      await passhareApi.shareFile(sessionId, fileId);
      toast.success('File shared successfully!');
      loadSessionData();
      setShowFileSelector(false);
    } catch (error) {
      toast.error(error.message || 'Failed to share file');
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = async (sessionFile) => {
    try {
      const token = localStorage.getItem('authToken');
      const fileName = sessionFile.fileName || sessionFile.fileItem?.name;
      
      if (!sessionFile.id) {
        toast.error('File ID not found');
        return;
      }
      
      // Use passhare download endpoint - this allows any session participant to download
      const url = `/api/passhare/sessions/${sessionId}/files/${sessionFile.id}/download`;
      const res = await fetch(url, { 
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Download failed');
      }
      
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
      toast.success(`${fileName} downloaded successfully!`);
      
      // Refresh to update download count
      loadSessionData();
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error.message || 'File not available for download');
    }
  };

  const handleRemoveSharedFile = async (sessionFile) => {
    if (!window.confirm(`Are you sure you want to remove "${sessionFile.fileName || sessionFile.fileItem?.name}" from this session?`)) {
      return;
    }

    try {
      if (!sessionFile.id) {
        toast.error('File ID not found. Cannot remove file.');
        console.error('SessionFile object:', sessionFile);
        return;
      }
      await passhareApi.removeSharedFile(sessionId, sessionFile.id);
      toast.success('File removed from session successfully');
      loadSessionData(); // Refresh the file list
    } catch (error) {
      console.error('Remove file error:', error);
      toast.error(error.message || 'Failed to remove file');
    }
  };

  const handleLeaveSession = async () => {
    // Prevent creator from leaving
    if (isCreator) {
      toast.error('You are the session creator. Please use "End Session" instead.');
      return;
    }
    
    if (window.confirm('Are you sure you want to leave this session?')) {
      try {
        await passhareApi.leaveSession(sessionId);
        toast.success('Left session successfully');
        navigate('/passhare');
      } catch (error) {
        toast.error(error.message || 'Failed to leave session');
      }
    }
  };

  const handleEndSession = async () => {
    if (window.confirm('Are you sure you want to end this session? All participants will be disconnected.')) {
      try {
        await passhareApi.endSession(sessionId);
        toast.success('Session ended successfully');
        navigate('/passhare');
      } catch (error) {
        toast.error(error.message || 'Failed to end session');
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isCreator = session && session.creatorId && user.id && Number(session.creatorId) === Number(user.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-white/80' : 'text-gray-600'}`}>Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Session not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 fade-in-up">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Passhare Session
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <p className={`text-lg font-mono ${isDark ? 'text-white/80' : 'text-gray-600'}`}>
                    Code: <span className="font-bold">{session.code}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {isCreator ? (
                  <button
                    onClick={handleEndSession}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all hover-lift ${
                      isDark
                        ? 'bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30'
                        : 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    End Session
                  </button>
                ) : (
                  <button
                    onClick={handleLeaveSession}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all hover-lift ${
                      isDark
                        ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                        : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Leave Session
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Main Content - Files */}
            <div className="space-y-6">
              {/* Share File Section */}
              <div className={`${isDark ? 'glass-card' : 'bg-white shadow-sm border border-gray-200'} p-6 rounded-xl`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Share Files
                  </h2>
                  <button
                    onClick={() => setShowFileSelector(!showFileSelector)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all hover-lift flex items-center space-x-2 ${
                      isDark
                        ? 'bg-blue-500/20 border border-blue-500/50 text-blue-300 hover:bg-blue-500/30'
                        : 'bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Select File</span>
                  </button>
                </div>

                {showFileSelector && (
                  <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'} max-h-64 overflow-y-auto`}>
                    {files.length === 0 ? (
                      <p className={`text-center ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                        No files available to share
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {files.map((file) => (
                          <button
                            key={file.id}
                            onClick={() => handleShareFile(file.id)}
                            disabled={isSharing}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-all hover-lift flex items-center space-x-3 ${
                              isDark
                                ? 'bg-white/10 hover:bg-white/20 text-white'
                                : 'bg-white hover:bg-gray-100 text-gray-900'
                            } ${isSharing ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <File className="w-4 h-4" />
                            <span className="flex-1">{file.name}</span>
                            <span className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                              {formatFileSize(file.size)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Shared Files */}
              <div className={`${isDark ? 'glass-card' : 'bg-white shadow-sm border border-gray-200'} p-6 rounded-xl`}>
                <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Shared Files ({sessionFiles.length})
                </h2>
                {sessionFiles.length === 0 ? (
                  <div className="text-center py-12">
                    <File className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                    <p className={`${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                      No files shared yet. Share a file to get started!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessionFiles.map((sessionFile) => (
                      <div
                        key={sessionFile.id}
                        className={`${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'} p-4 rounded-lg flex items-center justify-between`}
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className={`w-10 h-10 ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
                            <File className={`w-5 h-5 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {sessionFile.fileName || sessionFile.fileItem?.name}
                            </p>
                            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                              {formatFileSize(sessionFile.fileSize || sessionFile.fileItem?.size || 0)} • Shared by User {sessionFile.sharedByUserId}
                              <span className="ml-2">• {sessionFile.downloadCount || 0} download{(sessionFile.downloadCount || 0) !== 1 ? 's' : ''}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDownload(sessionFile)}
                            className={`p-2 rounded-lg transition-all hover-lift ${
                              isDark
                                ? 'bg-white/10 hover:bg-white/20 text-white'
                                : 'bg-white hover:bg-gray-100 text-gray-900'
                            }`}
                            title="Download"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          {(isCreator || (sessionFile.sharedByUserId && Number(sessionFile.sharedByUserId) === Number(user.id))) && (
                            <button
                              onClick={() => handleRemoveSharedFile(sessionFile)}
                              className={`p-2 rounded-lg transition-all hover-lift ${
                                isDark
                                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                                  : 'bg-red-50 hover:bg-red-100 text-red-600'
                              }`}
                              title="Remove from session"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SessionView;

