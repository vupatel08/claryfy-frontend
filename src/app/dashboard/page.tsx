'use client';

import { useState, useEffect, useRef } from 'react';
import { File } from '../../types/canvas';
import FileViewer from '../../components/FileViewer';
import RecordingViewer from '../../components/RecordingViewer';
import Sidebar from '../../components/Sidebar';
import ChatGPTStyleInterface, { ChatGPTStyleInterfaceRef } from '../../components/ChatGPTStyleInterface';
import { CanvasData } from '../../types/canvas';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfileService } from '../../services/supabase';

export default function Dashboard() {
  const [canvasData, setCanvasData] = useState<CanvasData | null>(null);
  const [recordings, setRecordings] = useState<any[]>([]);
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
  const [selectedRecording, setSelectedRecording] = useState<any | null>(null);
  const { user, isAuthenticated } = useAuth();
  
  // Chat interface ref for communication from sidebar
  const chatInterfaceRef = useRef<ChatGPTStyleInterfaceRef>(null);

  const API_URL = process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_API_URL 
    : 'http://localhost:3000';

  // Fetch recordings for authenticated user
  const fetchRecordings = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      // If a course is selected, filter recordings by course
      const url = selectedCourseId 
        ? `${API_URL}/api/recordings?userId=${user.id}&courseId=${selectedCourseId}`
        : `${API_URL}/api/recordings?userId=${user.id}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const recordingsData = await response.json();
        setRecordings(recordingsData);
        const selectedCourse = canvasData?.courses.find(course => course.id === selectedCourseId);
        console.log(`📚 Loaded ${recordingsData.length} recordings${selectedCourse ? ` for course ${selectedCourse.name}` : ''}`);
      }
    } catch (error) {
      console.error('Failed to fetch recordings:', error);
    }
  };

  // Handle loading message timeout
  useEffect(() => {
    if (showLoadingMessage) {
      const timer = setTimeout(() => {
        setShowLoadingMessage(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showLoadingMessage]);

  // Refetch recordings when course selection changes
  useEffect(() => {
    if (isConnected) {
      fetchRecordings();
    }
  }, [selectedCourseId, isConnected]);

  // Auto-fetch Canvas credentials and connect if available
  useEffect(() => {
    const tryAutoConnect = async () => {
      if (isAuthenticated && user && !isConnected) {
        try {
          const profile = await UserProfileService.getUserProfile(user.id);
          if (profile?.canvas_token && profile?.canvas_domain) {
            // Set state first
            setToken(profile.canvas_token);
            setDomain(profile.canvas_domain);
            
            // Debug log: show what will be sent
            console.log('Auto-connect with:', { token: profile.canvas_token, domain: profile.canvas_domain });
            
            setIsConnecting(true);
            setLoadingStep('Loading up your content...');
            
            try {
              // Fetch both dashboard and profile data in parallel
              const [dashboardResponse, profileResponse] = await Promise.all([
                fetch(`${API_URL}/api/dashboard?token=${encodeURIComponent(profile.canvas_token)}&domain=${encodeURIComponent(profile.canvas_domain)}`),
                fetch(`${API_URL}/api/profile?token=${encodeURIComponent(profile.canvas_token)}&domain=${encodeURIComponent(profile.canvas_domain)}`)
              ]);
              
              if (!dashboardResponse.ok) {
                const errorData = await dashboardResponse.json();
                throw new Error(errorData.error || 'Failed to fetch Canvas data');
              }

              const dashboardData = await dashboardResponse.json();
              
              // Get profile data if available, otherwise use fallback
              let profileData = { id: '1', name: 'User' }; // Fallback
              if (profileResponse.ok) {
                try {
                  const canvasProfile = await profileResponse.json();
                  profileData = {
                    id: canvasProfile.id?.toString() || '1',
                    name: canvasProfile.name || canvasProfile.short_name || 'User'
                  };
                } catch (err) {
                  console.log('Profile data not available, using fallback');
                }
              }
              
              // Structure the data to match the expected format
              const canvasData = {
                profile: profileData,
                courses: dashboardData.courses || [],
                assignments: dashboardData.assignments || [],
                announcements: dashboardData.announcements || [],
                files: dashboardData.files || []
              };
              
              setCanvasData(canvasData);
              setIsConnected(true);
              setShowLoadingMessage(true);
              
              // Fetch recordings after successful connection
              await fetchRecordings();
              
              // Auto-redirect to courses tab after successful connection
              setTimeout(() => {
                setActiveTab('courses');
              }, 500);
              
            } catch (err: unknown) {
              const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
              setError(errorMessage);
              console.error('Auto-connect failed:', errorMessage);
            } finally {
              setIsConnecting(false);
              setLoadingStep('');
            }
          }
        } catch (err) {
          // Fail silently, user can still connect manually
          console.error('Failed to fetch user profile for auto-connect:', err);
        }
      }
    };
    tryAutoConnect();
    // Only run when user or isAuthenticated changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setError('');
    setLoadingProgress(0);
    setLoadingStep('Loading up your content...');

    const startTime = Date.now();

    try {
      setLoadingProgress(20);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Debug log: show what is being sent
      console.log('Sending to dashboard:', { token, domain });

      setLoadingProgress(50);
      setLoadingStep('Gathering your courses and assignments...');
      await new Promise(resolve => setTimeout(resolve, 300));

      // Fetch both dashboard and profile data in parallel
      const [dashboardResponse, profileResponse] = await Promise.all([
        fetch(`${API_URL}/api/dashboard?token=${encodeURIComponent(token)}&domain=${encodeURIComponent(domain)}`),
        fetch(`${API_URL}/api/profile?token=${encodeURIComponent(token)}&domain=${encodeURIComponent(domain)}`)
      ]);
      
      if (!dashboardResponse.ok) {
        const errorData = await dashboardResponse.json();
        throw new Error(errorData.error || 'Failed to fetch Canvas data');
      }

      const dashboardData = await dashboardResponse.json();
      
      // Get profile data if available, otherwise use fallback
      let profileData = { id: '1', name: 'User' }; // Fallback
      if (profileResponse.ok) {
        try {
          const canvasProfile = await profileResponse.json();
          profileData = {
            id: canvasProfile.id?.toString() || '1',
            name: canvasProfile.name || canvasProfile.short_name || 'User'
          };
        } catch (err) {
          console.log('Profile data not available, using fallback');
        }
      }

      setLoadingProgress(80);
      setLoadingStep('Organizing your content...');
      await new Promise(resolve => setTimeout(resolve, 300));

      // PHASE 4: Vectorize Canvas data after successful fetch
      if (isAuthenticated && user) {
        setLoadingStep('Preparing AI assistant...');
        try {
          const vectorizeResponse = await fetch(`${API_URL}/api/weaviate/sync/canvas`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              token: token,
              domain: domain
            })
          });

          if (vectorizeResponse.ok) {
            console.log('✅ Canvas data vectorized successfully');
          } else {
            console.warn('⚠️ Vectorization failed, but continuing with normal functionality');
          }
        } catch (vectorError) {
          console.warn('⚠️ Vectorization error:', vectorError);
          // Don't fail the connection if vectorization fails
        }
      }

      setLoadingProgress(100);
      setLoadingStep('All set! Welcome to Claryfy!');
      
      const totalTime = Date.now() - startTime;
      console.log(`🚀 Canvas data loaded in ${totalTime}ms with streamlined process!`);
      
      // Structure the data to match the expected format
      const canvasData = {
        profile: profileData,
        courses: dashboardData.courses || [],
        assignments: dashboardData.assignments || [],
        announcements: dashboardData.announcements || [],
        files: dashboardData.files || []
      };
      
      setCanvasData(canvasData);
      setIsConnected(true);
      setShowLoadingMessage(true);
      
      // Fetch recordings after successful connection
      await fetchRecordings();
      
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

  // PHASE 4: Refresh Canvas data and re-vectorize
  const handleRefresh = async () => {
    if (!isAuthenticated || !user || !token || !domain) {
      setError('User authentication or Canvas credentials not available');
      return;
    }

    setIsConnecting(true);
    setError('');
    setLoadingProgress(0);
    setLoadingStep('Refreshing your content...');

    try {
      const refreshResponse = await fetch(`${API_URL}/api/refresh-canvas-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          token: token,
          domain: domain
        })
      });

      if (!refreshResponse.ok) {
        const errorData = await refreshResponse.json();
        throw new Error(errorData.error || 'Failed to refresh Canvas data');
      }

      const refreshResult = await refreshResponse.json();

      setLoadingProgress(50);
      setLoadingStep('Getting latest updates...');

      // Re-fetch dashboard and profile data
      const [dashboardResponse, profileResponse] = await Promise.all([
        fetch(`${API_URL}/api/dashboard?token=${encodeURIComponent(token)}&domain=${encodeURIComponent(domain)}`),
        fetch(`${API_URL}/api/profile?token=${encodeURIComponent(token)}&domain=${encodeURIComponent(domain)}`)
      ]);
      
      if (!dashboardResponse.ok) {
        const errorData = await dashboardResponse.json();
        throw new Error(errorData.error || 'Failed to fetch updated Canvas data');
      }

      const dashboardData = await dashboardResponse.json();
      
      // Get profile data if available, otherwise use fallback
      let profileData = { id: '1', name: 'User' }; // Fallback
      if (profileResponse.ok) {
        try {
          const canvasProfile = await profileResponse.json();
          profileData = {
            id: canvasProfile.id?.toString() || '1',
            name: canvasProfile.name || canvasProfile.short_name || 'User'
          };
        } catch (err) {
          console.log('Profile data not available, using fallback');
        }
      }

      setLoadingProgress(100);
      setLoadingStep('Content updated successfully!');

      // Update Canvas data
      const updatedCanvasData = {
        profile: profileData,
        courses: dashboardData.courses || [],
        assignments: dashboardData.assignments || [],
        announcements: dashboardData.announcements || [],
        files: dashboardData.files || []
      };
      
      setCanvasData(updatedCanvasData);
      setShowLoadingMessage(true);

      console.log('🔄 Canvas data refreshed and vectorized:', refreshResult);

      setTimeout(() => {
        setLoadingProgress(0);
        setLoadingStep('');
      }, 1000);

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
    setSelectedRecording(null); // Close recording if viewing file
  };

  const closeFile = () => {
    setViewingFile(null);
  };

  const openRecording = (recording: any) => {
    setSelectedRecording(recording);
    setViewingFile(null); // Close file if viewing recording
  };

  const closeRecording = () => {
    setSelectedRecording(null);
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

  // Chat handlers for sidebar
  const handleNewChat = () => {
    if (chatInterfaceRef.current) {
      chatInterfaceRef.current.startNewChat();
    }
  };

  const handleLoadConversation = (conversationId: string) => {
    if (chatInterfaceRef.current) {
      chatInterfaceRef.current.loadConversationMessages(conversationId);
    }
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
        handleRefresh={handleRefresh}
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
            recordings={recordings}
            openRecording={openRecording}
        onNewChat={handleNewChat}
        onLoadConversation={handleLoadConversation}
      />

      {/* Main Content */}
      <div className="flex-1 bg-white min-w-0 flex">
        {/* Mobile sidebar overlay */}
        {!sidebarCollapsed && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}

        {/* Recording Viewer - Left Side */}
        {selectedRecording && (
          <div className="w-1/2 h-screen">
            <RecordingViewer
              recording={selectedRecording}
              onClose={closeRecording}
            />
          </div>
        )}

        {/* ChatGPT Style Interface - Right Side */}
        <div className={selectedRecording ? "w-1/2" : "w-full"}>
          <ChatGPTStyleInterface
            ref={chatInterfaceRef}
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


    </div>
  );
} 