import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, Image, Video, Music, FileText, Archive, File } from 'lucide-react';
import toast from 'react-hot-toast';

const FileUpload = ({ onUpload, onClose, maxFiles = 10, maxSize = 100 * 1024 * 1024 }) => {
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadStatus, setUploadStatus] = useState({}); // 'uploading' | 'success' | 'error'

  // Generate appropriate icon for file type
  const getFileIcon = (file) => {
    const type = file.type.split('/')[0];
    switch (type) {
      case 'image':
        return <Image className="w-5 h-5 text-blue-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-500" />;
      case 'audio':
        return <Music className="w-5 h-5 text-green-500" />;
      case 'application':
        if (/pdf|document|text/.test(file.type)) return <FileText className="w-5 h-5 text-red-500" />;
        if (/zip|rar|7z/.test(file.type)) return <Archive className="w-5 h-5 text-orange-500" />;
        return <File className="w-5 h-5 text-gray-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Simulate file upload progress
  const simulateUpload = (file) => {
    return new Promise((resolve) => {
      const totalSize = file.size;
      let uploadedSize = 0;

      setUploadStatus(prev => ({ ...prev, [file.name]: 'uploading' }));

      const interval = setInterval(() => {
        uploadedSize += Math.random() * (totalSize / 20);
        const progress = Math.min((uploadedSize / totalSize) * 100, 100);

        setUploadProgress(prev => ({ ...prev, [file.name]: progress }));

        if (progress >= 100) {
          clearInterval(interval);
          const fileUrl = URL.createObjectURL(file);

          resolve({
            id: Date.now().toString() + file.name,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date(),
            file,
            url: fileUrl,
            lastModified: file.lastModified,
          });

          setUploadStatus(prev => ({ ...prev, [file.name]: 'success' }));
        }
      }, 100);
    });
  };

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach(error => {
        const msg =
          error.code === 'file-too-large'
            ? `${file.name} is too large. Max ${formatFileSize(maxSize)}`
            : error.code === 'too-many-files'
            ? `Too many files. Max ${maxFiles}`
            : `${file.name}: ${error.message}`;
        toast.error(msg);
      });
    });

    if (acceptedFiles.length > 0) {
      setUploadingFiles(prev => [...prev, ...acceptedFiles]);

      try {
        const uploadedFiles = await Promise.all(acceptedFiles.map(file => simulateUpload(file)));
        await onUpload(uploadedFiles);

        toast.success(`${uploadedFiles.length} file(s) uploaded successfully!`);
        setUploadingFiles([]);
        setUploadProgress({});
        setUploadStatus({});
        onClose?.();
      } catch (error) {
        toast.error('Upload failed. Please try again.');
        setUploadingFiles([]);
        setUploadProgress({});
        setUploadStatus({});
      }
    }
  }, [maxFiles, maxSize, onUpload, onClose]);

  const removeFile = (fileName) => {
    setUploadingFiles(prev => prev.filter(file => file.name !== fileName));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
    setUploadStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[fileName];
      return newStatus;
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
      'audio/*': ['.mp3', '.wav', '.flac', '.aac', '.ogg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      'application/x-7z-compressed': ['.7z']
    }
  });

  // Cleanup URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      uploadingFiles.forEach(file => file.url && URL.revokeObjectURL(file.url));
    };
  }, [uploadingFiles]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h3 className="text-xl font-semibold text-white">Upload Files</h3>
          <button 
            onClick={onClose} 
            className="text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dropzone */}
        <div className="p-6">
          <div
            {...getRootProps()}
            className={`upload-area transition-all duration-300 ${
              isDragActive ? 'dragover' : ''
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-16 h-16 text-white/60 mx-auto mb-4 transition-all duration-300" />
            {isDragActive ? (
              <div className="text-center">
                <p className="text-white font-semibold text-lg mb-2">Drop the files here...</p>
                <p className="text-white/80">Release to upload</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-white font-medium mb-2">Drag & drop files here, or click to select files</p>
                <p className="text-white/60 text-sm">
                  Maximum {maxFiles} files, up to {formatFileSize(maxSize)} each
                </p>
              </div>
            )}
          </div>

          {/* File List */}
          {uploadingFiles.length > 0 && (
            <div className="mt-6 slide-in-right">
              <h4 className="text-lg font-semibold text-white mb-4">Uploading Files</h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {uploadingFiles.map((file, index) => (
                  <div 
                    key={file.name} 
                    className="glass-card p-4 hover-lift transition-all duration-200"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">{getFileIcon(file)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                        <p className="text-xs text-white/60">{formatFileSize(file.size)}</p>
                        {/* Enhanced Progress Bar */}
                        <div className="mt-3">
                          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ease-out ${
                                uploadStatus[file.name] === 'success' 
                                  ? 'bg-gradient-to-r from-green-400 to-green-500' 
                                  : 'bg-gradient-to-r from-blue-400 to-blue-500'
                              }`}
                              style={{ width: `${uploadProgress[file.name] || 0}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-white/60">
                              {uploadStatus[file.name] === 'success' ? 'Uploaded successfully!' : `${Math.round(uploadProgress[file.name] || 0)}% uploaded`}
                            </p>
                            {uploadStatus[file.name] === 'success' && (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {uploadStatus[file.name] !== 'success' && (
                          <button 
                            onClick={() => removeFile(file.name)} 
                            className="text-white/60 hover:text-red-400 hover:bg-red-500/20 p-2 rounded-lg transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supported File Types */}
          <div className="mt-6 fade-in-up">
            <h4 className="text-lg font-semibold text-white mb-4">Supported File Types</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-white/80">
              <div className="flex items-center space-x-2 glass-card p-3 rounded-lg">
                <Image className="w-4 h-4 text-blue-400" />
                <span>Images (PNG, JPG, GIF)</span>
              </div>
              <div className="flex items-center space-x-2 glass-card p-3 rounded-lg">
                <Video className="w-4 h-4 text-purple-400" />
                <span>Videos (MP4, AVI, MOV)</span>
              </div>
              <div className="flex items-center space-x-2 glass-card p-3 rounded-lg">
                <Music className="w-4 h-4 text-green-400" />
                <span>Audio (MP3, WAV, FLAC)</span>
              </div>
              <div className="flex items-center space-x-2 glass-card p-3 rounded-lg">
                <FileText className="w-4 h-4 text-red-400" />
                <span>Documents (PDF, DOC, XLS)</span>
              </div>
              <div className="flex items-center space-x-2 glass-card p-3 rounded-lg">
                <Archive className="w-4 h-4 text-orange-400" />
                <span>Archives (ZIP, RAR, 7Z)</span>
              </div>
              <div className="flex items-center space-x-2 glass-card p-3 rounded-lg">
                <File className="w-4 h-4 text-gray-400" />
                <span>Text Files (TXT)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-white/20 bg-white/5">
          <button 
            onClick={onClose} 
            className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={uploadingFiles.length > 0}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
