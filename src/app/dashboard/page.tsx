'use client';

import { useState, useEffect } from 'react';
import { File } from '../../types/canvas';
import FileViewer from '../../components/FileViewer';
import Sidebar from '../../components/Sidebar';
import ChatGPTStyleInterface from '../../components/ChatGPTStyleInterface';
import { CanvasData } from '../../types/canvas';

export default function Dashboard() {
  const [canvasData, setCanvasData] = useState<CanvasData | null>(null);
  const [token, setToken] = useState('');
  const [domain, setDomain] = useState('umd.instructure.com');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [expandedItems, setExpandedItems] = useState<{[key: string]: boolean}>({});
  const [showTokenHelp, setShowTokenHelp] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('');
  const [collapsedSections, setCollapsedSections] = useState({
    assignments: true,
    announcements: true,
    files: true,
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'courses' | 'profile'>('courses');
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);
  const [closedRecentBoxes, setClosedRecentBoxes] = useState<Set<string>>(new Set());
  const [viewingFile, setViewingFile] = useState<File | null>(null);


  const API_URL = process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_API_URL 
    : 'http://localhost:3000';

  // Handle loading message timeout
  useEffect(() => {
    if (showLoadingMessage) {
      const timer = setTimeout(() => {
        setShowLoadingMessage(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showLoadingMessage]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setError('');
    setLoadingProgress(0);
    setLoadingStep('Validating credentials...');

    const startTime = Date.now();

    try {
      setLoadingProgress(20);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 1: Authenticate with Canvas
      const authResponse = await fetch(`${API_URL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, domain }),
      });

      const authData = await authResponse.json();

      if (!authResponse.ok) {
        throw new Error(authData.error || 'Failed to authenticate with Canvas');
      }

      setLoadingProgress(50);
      setLoadingStep('Fetching your Canvas data with parallel processing...');
      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 2: Fetch dashboard data
      const dashboardResponse = await fetch(`${API_URL}/api/dashboard`);
      
      if (!dashboardResponse.ok) {
        const errorData = await dashboardResponse.json();
        throw new Error(errorData.error || 'Failed to fetch Canvas data');
      }

      const dashboardData = await dashboardResponse.json();

      setLoadingProgress(80);
      setLoadingStep('Optimizing and organizing data...');
      await new Promise(resolve => setTimeout(resolve, 300));

      setLoadingProgress(100);
      setLoadingStep('Complete!');
      
      const totalTime = Date.now() - startTime;
      console.log(`🚀 Canvas data loaded in ${totalTime}ms with parallel processing!`);
      
      // Structure the data to match the expected format
      const canvasData = {
        profile: { id: '1', name: 'User' }, // Placeholder profile
        courses: dashboardData.courses || [],
        assignments: dashboardData.assignments || [],
        announcements: dashboardData.announcements || [],
        files: dashboardData.files || []
      };
      
      setCanvasData(canvasData);
      setIsConnected(true);
      setShowLoadingMessage(true);
      
      // Auto-redirect to courses tab after successful connection
      setTimeout(() => {
        setActiveTab('courses');
      }, 500);
      
      setTimeout(() => {
        setLoadingProgress(0);
        setLoadingStep('');
      }, 500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setLoadingProgress(0);
      setLoadingStep('');
    } finally {
      setIsConnecting(false);
    }
  };

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleExpanded = (type: string, id: number) => {
    const key = `${type}-${id}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'No date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays <= 7) return `${diffDays} days`;
      
      return date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const stripHtml = (html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  const closeRecentBox = (boxType: string) => {
    setClosedRecentBoxes(prev => new Set([...prev, boxType]));
  };

  const openFile = (file: File) => {
    setViewingFile(file);
  };

  const closeFile = () => {
    setViewingFile(null);
  };

  const getFileIcon = (file: File): string => {
    const contentType = file.content_type || '';
    const mimeClass = file.mime_class || '';
    
    if (contentType.includes('pdf')) return '📄';
    if (contentType.includes('word') || mimeClass === 'doc') return '📝';
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) return '📊';
    if (contentType.includes('powerpoint') || contentType.includes('presentation')) return '📈';
    if (contentType.includes('image') || mimeClass === 'image') return '🖼️';
    if (contentType.includes('video') || mimeClass === 'video') return '🎥';
    if (contentType.includes('audio') || mimeClass === 'audio') return '🎵';
    if (contentType.includes('zip') || contentType.includes('archive')) return '📦';
    if (contentType.includes('text') || mimeClass === 'text') return '📄';
    if (contentType.includes('html') || mimeClass === 'html') return '🌐';
    if (contentType.includes('javascript') || contentType.includes('json')) return '⚙️';
    return '📁';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Component */}
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        canvasData={canvasData}
        selectedCourseId={selectedCourseId}
        setSelectedCourseId={setSelectedCourseId}
        isConnected={isConnected}
        setIsConnected={setIsConnected}
        setCanvasData={setCanvasData}
        setToken={setToken}
        domain={domain}
        token={token}
        setDomain={setDomain}
        isConnecting={isConnecting}
        showTokenHelp={showTokenHelp}
        setShowTokenHelp={setShowTokenHelp}
        handleConnect={handleConnect}
        loadingProgress={loadingProgress}
        loadingStep={loadingStep}
        error={error}
        showLoadingMessage={showLoadingMessage}
        collapsedSections={collapsedSections}
        toggleSection={toggleSection}
        expandedItems={expandedItems}
        toggleExpanded={toggleExpanded}
        formatDate={formatDate}
        formatFileSize={formatFileSize}
        getFileIcon={getFileIcon}
        openFile={openFile}
      />

      {/* Main Content */}
      <div className="flex-1 bg-white min-w-0">
        {/* Mobile sidebar overlay */}
        {!sidebarCollapsed && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}

        {/* ChatGPT Style Interface */}
        <ChatGPTStyleInterface
          canvasData={canvasData}
          selectedCourseId={selectedCourseId}
          isConnected={isConnected}
          setActiveTab={setActiveTab}
          closedRecentBoxes={closedRecentBoxes}
          closeRecentBox={closeRecentBox}
          expandedItems={expandedItems}
          toggleExpanded={toggleExpanded}
          formatDate={formatDate}
          formatFileSize={formatFileSize}
          getFileIcon={getFileIcon}
          viewingFile={viewingFile}
          openFile={openFile}
          closeFile={closeFile}
        />
      </div>


    </div>
  );
} 