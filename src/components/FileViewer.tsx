'use client';

import { File } from '../types/canvas';
import { useState, useEffect } from 'react';

interface FileViewerProps {
  file: File;
  onClose: () => void;
}

export default function FileViewer({ file, onClose }: FileViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use backend file serving URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  const backendFileUrl = `${API_URL}/api/files/serve/${file.id}`;
  const fallbackUrl = file.url || file.preview_url;
  
  // Check if file is available
  useEffect(() => {
    const checkFile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(backendFileUrl, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`File not available: ${response.status}`);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error checking file:', err);
        setError('File not available for viewing');
        setIsLoading(false);
      }
    };

    checkFile();
  }, [file.id, backendFileUrl]);

  const getFileInfo = () => {
    const fileName = file.display_name || file.filename || '';
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
    const contentType = file.content_type || '';
    const fileSize = file.size || 0;
    
    return { fileName, fileExtension, contentType, fileSize };
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isPDF = () => {
    const { fileExtension, contentType } = getFileInfo();
    return contentType.includes('pdf') || fileExtension === 'pdf';
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading file...</h3>
            <p className="text-sm text-gray-600">Please wait...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Cannot load file</h3>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open in Canvas
            </a>
          </div>
        </div>
      );
    }

    // Show PDFs inline with PDF.js CDN viewer (like working test)
    if (isPDF()) {
      // Use PDF.js viewer with the file URL (same as working test)
      const pdfViewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(backendFileUrl)}`;
      
              return (
          <div className="w-full h-full bg-gray-100">
            <iframe
              src={pdfViewerUrl}
              className="w-full h-full border-0"
              title={file.display_name}
              onLoad={() => console.log('PDF.js viewer loaded successfully')}
              onError={() => console.error('PDF.js viewer failed to load')}
            />
          </div>
        );
    }

    // For all other file types, show download button only
    const { fileName, fileExtension, fileSize } = getFileInfo();
    const getFileIcon = () => {
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileExtension)) return '🖼️';
      if (['doc', 'docx'].includes(fileExtension)) return '📝';
      if (['xls', 'xlsx'].includes(fileExtension)) return '📊';
      if (['ppt', 'pptx'].includes(fileExtension)) return '📽️';
      if (['zip', 'rar', '7z'].includes(fileExtension)) return '🗜️';
      if (['txt', 'md'].includes(fileExtension)) return '📄';
      if (['html', 'htm'].includes(fileExtension)) return '🌐';
      return '📄';
    };

    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">{getFileIcon()}</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{fileName}</h3>
          <p className="text-sm text-gray-600 mb-4">
            {fileExtension.toUpperCase()} file • {formatFileSize(fileSize)}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            This file type is available for download only
          </p>
          <div className="space-y-3">
            <a
              href={backendFileUrl}
              download={file.display_name}
              className="block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              📥 Download File
            </a>
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              🔗 Open in Canvas
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* File Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-800 truncate" title={file.display_name}>
            {file.display_name}
          </h3>
          <p className="text-xs text-gray-600">
            {formatFileSize(file.size)} • {file.content_type}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isPDF() && (
            <a
              href={backendFileUrl}
              download={file.display_name}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
            >
              Download
            </a>
          )}
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            title="Close file"
          >
            ×
          </button>
        </div>
      </div>

      {/* File Content */}
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
} 