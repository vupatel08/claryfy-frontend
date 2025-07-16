'use client';

import { File } from '../types/canvas';
import { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, X, FileImage, FileArchive, FileCode, FileSpreadsheet, Presentation, FileVideo, FileAudio } from 'lucide-react';

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

  const isOfficeDocument = () => {
    const { fileExtension, contentType } = getFileInfo();
    const officeExtensions = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
    return officeExtensions.includes(fileExtension) || 
           contentType.includes('officedocument') ||
           contentType.includes('application/vnd.openxmlformats');
  };

  const getFileIcon = () => {
    const { fileExtension } = getFileInfo();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileExtension)) return <FileImage className="w-8 h-8 text-gray-600" />;
    if (['doc', 'docx'].includes(fileExtension)) return <FileText className="w-8 h-8 text-gray-600" />;
    if (['xls', 'xlsx'].includes(fileExtension)) return <FileSpreadsheet className="w-8 h-8 text-gray-600" />;
    if (['ppt', 'pptx'].includes(fileExtension)) return <Presentation className="w-8 h-8 text-gray-600" />;
    if (['zip', 'rar', '7z'].includes(fileExtension)) return <FileArchive className="w-8 h-8 text-gray-600" />;
    if (['txt', 'md'].includes(fileExtension)) return <FileText className="w-8 h-8 text-gray-600" />;
    if (['html', 'htm'].includes(fileExtension)) return <FileCode className="w-8 h-8 text-gray-600" />;
    if (['mp4', 'avi', 'mov', 'wmv'].includes(fileExtension)) return <FileVideo className="w-8 h-8 text-gray-600" />;
    if (['mp3', 'wav', 'aac'].includes(fileExtension)) return <FileAudio className="w-8 h-8 text-gray-600" />;
    return <FileText className="w-8 h-8 text-gray-600" />;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading file...</h3>
            <p className="text-sm text-gray-600">Please wait...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Cannot load file</h3>
            <p className="text-sm text-gray-600 mb-6">{error}</p>
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Open in Canvas
            </a>
          </div>
        </div>
      );
    }

    // Show PDFs inline with PDF.js CDN viewer
    if (isPDF()) {
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

    // Show Office documents with Microsoft Office Online viewer
    if (isOfficeDocument()) {
      const { fileExtension } = getFileInfo();
      const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(backendFileUrl)}`;
      
      return (
        <div className="w-full h-full bg-gray-100">
          <iframe
            src={officeViewerUrl}
            className="w-full h-full border-0"
            title={file.display_name}
            onLoad={() => console.log('Office Online viewer loaded successfully')}
            onError={() => console.error('Office Online viewer failed to load')}
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      );
    }

    // For all other file types, show download button only
    const { fileName, fileExtension, fileSize } = getFileInfo();

    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            {getFileIcon()}
          </div>
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
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Download File
            </a>
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Open in Canvas
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col bg-white border-r border-gray-200">
      {/* File Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
            {getFileIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-800 truncate" title={file.display_name}>
              {file.display_name}
            </h3>
            <p className="text-xs text-gray-600">
              {formatFileSize(file.size)} • {file.content_type}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(isPDF() || isOfficeDocument()) && (
            <a
              href={backendFileUrl}
              download={file.display_name}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs font-medium"
            >
              <Download className="w-3 h-3" />
              Download
            </a>
          )}
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            title="Close file"
          >
            <X className="w-5 h-5" />
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