import { useState, useEffect, useRef } from 'react';
import { X, Download, Share2, Star, Trash2, RotateCw, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const FilePreview = ({ file, onClose, onStar, onShare, onDelete, onDownload }) => {
  const [previewContent, setPreviewContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const objectUrlRef = useRef(null);

  useEffect(() => {
    loadPreview();
  }, [file]);

  const getAuthenticatedBlobUrl = async (url) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Unauthorized');
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch (e) {
      throw e;
    }
  };

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const loadPreview = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate loading different file types
      await new Promise(resolve => setTimeout(resolve, 500));

      const fileType = file.type.split('/')[0];
      const fileExtension = file.name.split('.').pop().toLowerCase();

      // Use the actual file URL if available, otherwise fall back to mock data
      const fileUrl = file.url || file.file;

      switch (fileType) {
        case 'image':
          if (fileUrl) {
            try {
              const blobUrl = typeof fileUrl === 'string' ? await getAuthenticatedBlobUrl(fileUrl) : URL.createObjectURL(fileUrl);
              if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
              objectUrlRef.current = blobUrl;
              setPreviewContent({
                type: 'image',
                url: blobUrl
              });
            } catch (e) {
              setError('Failed to load preview');
            }
          } else {
            setPreviewContent({
              type: 'image',
              url: `https://picsum.photos/800/600?random=${file.id}` // Fallback mock image
            });
          }
          break;

        case 'text':
          if (file.file) {
            // Read the actual text file content
            const text = await file.file.text();
            setPreviewContent({
              type: 'text',
              content: text
            });
          } else {
            setPreviewContent({
              type: 'text',
              content: `This is a preview of the text file: ${file.name}\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`
            });
          }
          break;

        case 'application':
          if (fileExtension === 'pdf') {
            if (fileUrl) {
              try {
                const blobUrl = typeof fileUrl === 'string' ? await getAuthenticatedBlobUrl(fileUrl) : URL.createObjectURL(fileUrl);
                if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = blobUrl;
                setPreviewContent({
                  type: 'pdf',
                  url: blobUrl
                });
              } catch (e) {
                setError('Failed to load preview');
              }
            } else {
              setPreviewContent({
                type: 'pdf',
                url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' // Fallback mock PDF
              });
            }
          } else {
            setPreviewContent({
              type: 'unsupported',
              message: 'Preview not available for this file type'
            });
          }
          break;

        default:
          setPreviewContent({
            type: 'unsupported',
            message: 'Preview not available for this file type'
          });
      }
    } catch (err) {
      setError('Failed to load preview');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    // Prefer parent-provided authenticated download
    if (onDownload) {
      onDownload(file);
      return;
    }
    if (file.url) {
      const token = localStorage.getItem('authToken');
      fetch(file.url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        .then(res => {
          if (!res.ok) throw new Error('Download failed');
          return res.blob();
        })
        .then(blob => {
          const objectUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = objectUrl;
          link.download = file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(objectUrl);
        })
        .catch(() => toast.error('File not available for download'));
    } else {
      toast.error('File not available for download');
    }
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading preview...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      );
    }

    if (!previewContent) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No preview available</p>
        </div>
      );
    }

    switch (previewContent.type) {
      case 'image':
        return (
          <div className="h-full flex items-center justify-center bg-gray-100">
            <img
              src={previewContent.url}
              alt={file.name}
              className="max-w-full max-h-full object-contain"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease'
              }}
            />
          </div>
        );

      case 'text':
        return (
          <div className="h-full bg-white p-6 overflow-auto">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
              {previewContent.content}
            </pre>
          </div>
        );

      case 'pdf':
        return (
          <div className="h-full">
            <iframe
              src={previewContent.url}
              className="w-full h-full border-0"
              title={file.name}
            />
          </div>
        );

      case 'unsupported':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">{previewContent.message}</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Preview not available</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-sm">📄</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{file.name}</h3>
              <p className="text-sm text-gray-500">
                {formatFileSize(file.size)} • {format(file.uploadedAt, 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Image controls */}
            {previewContent?.type === 'image' && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-500">{zoom}%</span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Rotate"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={() => onStar && onStar(file)}
              className="p-2 hover:bg-gray-100 rounded"
              title="Star"
            >
              <Star className={`w-4 h-4 ${file.isStarred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
            </button>

            <button
              onClick={() => onShare && onShare(file)}
              className="p-2 hover:bg-gray-100 rounded"
              title="Share"
            >
              <Share2 className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => handleDownload()}
              className="p-2 hover:bg-gray-100 rounded"
              title="Download"
            >
              <Download className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => onDelete && onDelete(file)}
              className="p-2 hover:bg-gray-100 rounded"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded"
              title="Close"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden">
          {renderPreview()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Downloads: {file.downloadCount || 0}</span>
              <span>Shared with: {file.sharedWith?.length || 0} people</span>
            </div>
            <div>
              Uploaded {format(file.uploadedAt, 'MMM d, yyyy \'at\' h:mm a')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
