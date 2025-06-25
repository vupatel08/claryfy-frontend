'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CanvasData, File } from '../types/canvas';
import { useAuth } from '../contexts/AuthContext';
import { UserProfileService, ConversationService, RecordingService } from '../services/supabase';

interface Conversation {
  id: string;
  title: string;
  course_id?: number;
  created_at: string;
  last_message_at: string;
}

interface SidebarProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  activeTab: 'courses' | 'profile';
  setActiveTab: (tab: 'courses' | 'profile') => void;
  canvasData: CanvasData | null;
  selectedCourseId: number | null;
  setSelectedCourseId: (id: number | null) => void;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  setCanvasData: (data: CanvasData | null) => void;
  setToken: (token: string) => void;
  domain: string;
  token: string;
  setDomain: (domain: string) => void;
  isConnecting: boolean;
  showTokenHelp: boolean;
  setShowTokenHelp: (show: boolean) => void;
  handleConnect: (e: React.FormEvent) => Promise<void>;
  handleRefresh: () => Promise<void>;
  loadingProgress: number;
  loadingStep: string;
  error: string;
  showLoadingMessage: boolean;
  collapsedSections: {
    assignments: boolean;
    announcements: boolean;
    files: boolean;
  };
  toggleSection: (section: 'assignments' | 'announcements' | 'files') => void;
  expandedItems: {[key: string]: boolean};
  toggleExpanded: (type: string, id: number) => void;
  formatDate: (dateString: string | null) => string;
  formatFileSize: (bytes: number) => string;
  getFileIcon: (file: File) => string;
  openFile: (file: File) => void;
  recordings: any[];
  openRecording: (recording: any) => void;
  // New chat props
  onNewChat?: () => void;
  onLoadConversation?: (conversationId: string) => void;
}

export default function Sidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
  activeTab,
  setActiveTab,
  canvasData,
  selectedCourseId,
  setSelectedCourseId,
  isConnected,
  setIsConnected,
  setCanvasData,
  setToken,
  domain,
  token,
  setDomain,
  isConnecting,
  showTokenHelp,
  setShowTokenHelp,
  handleConnect,
  handleRefresh,
  loadingProgress,
  loadingStep,
  error,
  showLoadingMessage,
  collapsedSections,
  toggleSection,
  expandedItems,
  toggleExpanded,
  formatDate,
  formatFileSize,
  getFileIcon,
  openFile,
  recordings,
  openRecording,
  // New chat props
  onNewChat,
  onLoadConversation,
}: SidebarProps) {
  const { user, isAuthenticated, signIn, signUp, signOut, loading: authLoading } = useAuth();
  
  // Authentication form state
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Enhanced recording state with Web Audio API
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0); // in seconds
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingError, setRecordingError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userRecordings, setUserRecordings] = useState<any[]>([]);
  const [loadingRecordings, setLoadingRecordings] = useState(false);
  
  // Recording constants
  const MAX_RECORDING_MINUTES = parseInt(process.env.NEXT_PUBLIC_MAX_RECORDING_MINUTES || '60');
  const MAX_RECORDING_SECONDS = MAX_RECORDING_MINUTES * 60;
  
  // Canvas signup fields
  const [signupCanvasToken, setSignupCanvasToken] = useState('');
  const [signupCanvasDomain, setSignupCanvasDomain] = useState('umd.instructure.com');
  const [showSignupTokenHelp, setShowSignupTokenHelp] = useState(false);
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);
  const [checkingCredentials, setCheckingCredentials] = useState(false);
  
  // Chat/Conversation state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [collapsedChatSections, setCollapsedChatSections] = useState<{[key: string]: boolean}>({});
  const [loadingConversations, setLoadingConversations] = useState(false);
  
  // Check for saved Canvas credentials when user is authenticated
  useEffect(() => {
    const checkSavedCredentials = async () => {
      if (isAuthenticated && user && !isConnected) {
        setCheckingCredentials(true);
        try {
          const profile = await UserProfileService.getUserProfile(user.id);
          if (profile?.canvas_token && profile?.canvas_domain) {
            setHasSavedCredentials(true);
          } else {
            setHasSavedCredentials(false);
          }
        } catch (err) {
          setHasSavedCredentials(false);
        } finally {
          setCheckingCredentials(false);
        }
      }
    };
    checkSavedCredentials();
  }, [isAuthenticated, user, isConnected]);

  // Load conversations when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadConversations();
    } else {
      setConversations([]);
    }
  }, [isAuthenticated, user, selectedCourseId]);

  // Load conversations function
  const loadConversations = async () => {
    if (!user) return;
    
    setLoadingConversations(true);
    try {
      const userConversations = await ConversationService.getUserConversations(user.id, selectedCourseId || undefined);
      setConversations(userConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Load user recordings when course is selected
  useEffect(() => {
    if (isAuthenticated && user && selectedCourseId) {
      loadUserRecordings();
    }
  }, [isAuthenticated, user, selectedCourseId]);

  // Duration tracking during recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          // Auto-stop at max duration
          if (newDuration >= MAX_RECORDING_SECONDS) {
            handleStopRecording();
            return MAX_RECORDING_SECONDS;
          }
          return newDuration;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused]);

  // Handle new chat
  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
    }
  };

  // Handle load conversation
  const handleLoadConversation = (conversationId: string) => {
    if (onLoadConversation) {
      onLoadConversation(conversationId);
    }
  };

  // Toggle chat section
  const toggleChatSection = (sectionKey: string) => {
    setCollapsedChatSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };
  
  const selectedCourse = canvasData?.courses.find(course => course.id === selectedCourseId);
  const courseAssignments = canvasData?.assignments.filter(assignment => assignment.course_id === selectedCourseId) || [];
  const courseAnnouncements = canvasData?.announcements.filter(announcement => announcement.course_id === selectedCourseId) || [];
  const courseFiles = canvasData?.files.filter(file => file.course_id === selectedCourseId) || [];

  const loadUserRecordings = async () => {
    if (!user || !selectedCourseId) return;
    
    setLoadingRecordings(true);
    try {
      const recordingsData = await RecordingService.getUserRecordings(user.id, selectedCourseId);
      setUserRecordings(recordingsData);
    } catch (error) {
      console.error('Error loading recordings:', error);
    } finally {
      setLoadingRecordings(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimeRemaining = (seconds: number): string => {
    const remaining = MAX_RECORDING_SECONDS - seconds;
    const minutes = Math.floor(remaining / 60);
    return `${minutes}m left`;
  };

  const handleStartRecording = async () => {
    if (!selectedCourseId) {
      setRecordingError('Please select a course first');
      return;
    }

    try {
      setRecordingError('');
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });

      // Create MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.onerror = (event) => {
        console.error('Recording error:', event);
        setRecordingError('Recording failed. Please try again.');
        setIsRecording(false);
        setIsPaused(false);
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording
      recorder.start(1000); // Collect data every second
      setMediaRecorder(recorder);
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      
      console.log('🎙️ Recording started');

    } catch (error) {
      console.error('Error starting recording:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setRecordingError('Microphone permission denied. Please allow microphone access and try again.');
        } else if (error.name === 'NotFoundError') {
          setRecordingError('No microphone found. Please connect a microphone and try again.');
        } else {
          setRecordingError('Failed to start recording. Please check your microphone settings.');
        }
      } else {
        setRecordingError('Failed to start recording. Please check your microphone and try again.');
      }
    }
  };

  const handlePauseRecording = () => {
    if (!mediaRecorder) return;

    if (isPaused) {
      // Resume recording
      mediaRecorder.resume();
      setIsPaused(false);
      console.log('🎙️ Recording resumed');
    } else {
      // Pause recording
      mediaRecorder.pause();
      setIsPaused(true);
      console.log('⏸️ Recording paused');
    }
  };

  const handleStopRecording = async () => {
    if (!mediaRecorder) return;

    try {
      setIsProcessing(true);
      
      // Stop recording
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      console.log('⏹️ Recording stopped');

      // Wait for audioBlob to be set (happens in onstop event)
      // We'll handle the upload in useEffect when audioBlob changes

    } catch (error) {
      console.error('Error stopping recording:', error);
      setRecordingError('Failed to stop recording properly');
      setIsProcessing(false);
    }
  };

  // Handle audio upload when audioBlob is available
  useEffect(() => {
    if (audioBlob && user && selectedCourseId) {
      uploadRecording();
    }
  }, [audioBlob]);

  const uploadRecording = async () => {
    if (!audioBlob || !user || !selectedCourseId) return;

    try {
      const selectedCourse = canvasData?.courses.find(c => c.id === selectedCourseId);
      const recordingTitle = `${selectedCourse?.courseCode || 'Course'} - ${new Date().toLocaleDateString()}`;

      // Create recording entry in database
      const recording = await RecordingService.createRecording(
        user.id,
        selectedCourseId,
        recordingTitle,
        duration
      );

      // Upload audio file to backend for processing
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('userId', user.id);
      formData.append('courseId', selectedCourseId.toString());
      formData.append('recordingId', recording.id);
      formData.append('title', recordingTitle);
      formData.append('duration', duration.toString());

      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/api/recordings/process`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload recording');
      }

      const result = await response.json();
      console.log('✅ Recording uploaded successfully:', result);

      // Refresh recordings list
      await loadUserRecordings();

      // Reset state
      setAudioBlob(null);
      setDuration(0);
      setMediaRecorder(null);

    } catch (error) {
      console.error('Error uploading recording:', error);
      setRecordingError('Failed to upload recording. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      if (authMode === 'signup') {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        const result = await signUp(email, password);
        // Save Canvas credentials if provided
        if (signupCanvasToken && signupCanvasDomain && result?.user?.id) {
          try {
            await UserProfileService.updateCanvasCredentials(result.user.id, signupCanvasToken, signupCanvasDomain);
          } catch (err) {
            // Fail silently, user can update later
          }
        }
        setAuthSuccess('Account created! Please check your email to verify.');
        setAuthMode('signin');
        setPassword('');
        setSignupCanvasToken('');
        setSignupCanvasDomain('umd.instructure.com');
      } else {
        await signIn(email, password);
        setAuthSuccess('Successfully signed in!');
        setEmail('');
        setPassword('');
      }
    } catch (error: any) {
      setAuthError(error.message || 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setEmail('');
      setPassword('');
      setAuthError('');
      setAuthSuccess('');
      // Also disconnect Canvas when signing out
      setIsConnected(false);
      setCanvasData(null);
      setToken('');
      setSelectedCourseId(null);
    } catch (error: any) {
      setAuthError(error.message || 'Sign out failed');
    }
  };

  return (
    <div className={`${sidebarCollapsed ? 'w-16' : 'w-full sm:w-80 md:w-96 lg:w-1/3 xl:w-96'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${!sidebarCollapsed ? 'max-w-sm md:max-w-md lg:max-w-lg' : ''} ${sidebarCollapsed ? '' : 'fixed md:relative z-50 h-full md:h-auto shadow-lg md:shadow-none'}`}>
      
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        {sidebarCollapsed ? (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg transition-colors w-full justify-center"
            title="Expand sidebar"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-black font-bold text-sm">
              C
            </div>
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-black font-bold text-sm">
                C
              </div>
              <span className="font-semibold text-black">Claryfy</span>
            </div>
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Collapse sidebar"
            >
              <span className="text-black text-sm">◀️</span>
            </button>
          </>
        )}
      </div>

      {!sidebarCollapsed && (
        <>
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'courses' 
                  ? 'text-black border-b-2 border-blue-600 bg-blue-50' 
                  : 'text-black hover:text-black hover:bg-gray-50'
              }`}
            >
              📚 Courses
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'profile' 
                  ? 'text-black border-b-2 border-blue-600 bg-blue-50' 
                  : 'text-black hover:text-black hover:bg-gray-50'
              }`}
            >
              👤 Profile
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'courses' && (
              <div className="p-4 space-y-4">
                {/* Connection Status */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium text-black">
                    {isConnected ? 'Connected to Canvas' : 'Not Connected'}
                  </span>
                </div>

                {/* Loading Message */}
                {showLoadingMessage && canvasData && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs">
                    <div className="font-medium text-black mb-1">⚡ Optimized Loading</div>
                    <div className="text-black">
                      Loaded {canvasData.courses.length} courses, {canvasData.assignments.length} assignments, 
                      and {canvasData.announcements.length} announcements using parallel processing
                    </div>
                  </div>
                )}

                {/* Course Selection */}
                <div>
                  <h3 className="text-sm font-medium text-black mb-2">Select Course</h3>
                  <select
                    value={selectedCourseId || ''}
                    onChange={(e) => setSelectedCourseId(e.target.value ? Number(e.target.value) : null)}
                    disabled={!canvasData}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-black disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {canvasData ? 'Select a course' : 'Load your content first'}
                    </option>
                    {canvasData?.courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.courseCode}: {course.shortName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recording Controls Section - Always show */}
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-black">🎥 Lecture Recording</span>
                    {isRecording && (
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`}></div>
                        <span className="text-xs text-black">{isPaused ? 'Paused' : 'Recording'}</span>
                      </div>
                    )}
                  </div>

                  {/* Duration and Time Remaining */}
                  {isRecording && (
                    <div className="mb-2 text-xs text-gray-600 space-y-1">
                      <div>Duration: {formatDuration(duration)}</div>
                      <div>{formatTimeRemaining(duration)}</div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-red-500 h-1 rounded-full transition-all duration-1000" 
                          style={{ width: `${(duration / MAX_RECORDING_SECONDS) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Recording Controls */}
                  <div className="flex items-center gap-2 mb-2">
                    {!isRecording ? (
                      <button
                        onClick={handleStartRecording}
                        disabled={isProcessing || !selectedCourseId}
                        className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                        title={!selectedCourseId ? "Select a course to start recording" : "Start Recording"}
                      >
                        {isProcessing ? '⏳ Processing...' : '● Record'}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handlePauseRecording}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                          title={isPaused ? "Resume Recording" : "Pause Recording"}
                        >
                          {isPaused ? '▶ Resume' : '⏸ Pause'}
                        </button>
                        <button
                          onClick={handleStopRecording}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                          title="Stop Recording"
                        >
                          ⏹ Stop
                        </button>
                      </>
                    )}
                  </div>

                  {!selectedCourseId && (
                    <div className="text-xs text-gray-600 mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      Select a course above to start recording
                    </div>
                  )}

                  {/* Recording Error */}
                  {recordingError && (
                    <div className="text-xs text-red-600 mb-2 p-2 bg-red-50 border border-red-200 rounded">
                      {recordingError}
                    </div>
                  )}

                  {/* Recording History */}
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">
                        {selectedCourseId ? 'Course Recordings' : 'All Recordings'}
                      </span>
                      {loadingRecordings && (
                        <div className="text-xs text-gray-500">Loading...</div>
                      )}
                    </div>
                    
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {recordings.length === 0 ? (
                        <div className="text-xs text-gray-500 italic">No recordings yet</div>
                      ) : (
                        recordings.slice(0, 5).map((recording) => (
                          <div 
                            key={recording.id} 
                            className="bg-white p-2 rounded border text-xs cursor-pointer hover:bg-blue-50 transition-colors"
                            onClick={() => openRecording(recording)}
                            title={recording.summary ? `Click to view summary: ${recording.summary.substring(0, 100)}...` : 'Processing...'}
                          >
                            <div className="font-medium text-gray-800 truncate">
                              {recording.title}
                            </div>
                            <div className="text-gray-500 flex justify-between items-center">
                              <span>{formatDuration(recording.duration || 0)}</span>
                              <span className={`px-1 py-0.5 rounded text-xs ${
                                recording.status === 'completed' 
                                  ? 'bg-green-100 text-green-700' 
                                  : recording.status === 'failed'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {recording.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Course Sections - Only show when course is selected */}
                {selectedCourse && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-black uppercase tracking-wide">
                      {selectedCourse.courseCode}
                    </div>

                    {/* Assignments */}
                    <div className="border border-gray-200 rounded-lg">
                      <div
                        className={`px-3 py-2 cursor-pointer flex justify-between items-center transition-colors ${
                          collapsedSections.assignments ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-100'
                        }`}
                        onClick={() => toggleSection('assignments')}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-black">📝</span>
                          <span className="text-sm font-medium text-black">Assignments</span>
                          <span className="bg-red-500 text-black rounded-full px-2 py-0.5 text-xs font-medium">
                            {courseAssignments.length}
                          </span>
                        </div>
                        <span className={`transform transition-transform text-black text-xs ${
                          collapsedSections.assignments ? '' : 'rotate-180'
                        }`}>
                          ▼
                        </span>
                      </div>
                      {!collapsedSections.assignments && (
                        <div className="max-h-48 overflow-y-auto">
                          {courseAssignments.length === 0 ? (
                            <div className="text-center py-4 text-black text-xs">
                              No assignments found
                            </div>
                          ) : (
                            courseAssignments.slice(0, 10).map(assignment => (
                              <div 
                                key={assignment.id} 
                                className="px-3 py-2 border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                                onClick={() => toggleExpanded('assignment', assignment.id)}
                              >
                                <div className="text-xs font-medium text-black truncate">{assignment.name}</div>
                                <div className="text-xs text-black">
                                  {assignment.due_at ? `Due: ${formatDate(assignment.due_at)}` : 'No due date'}
                                </div>
                                {expandedItems[`assignment-${assignment.id}`] && assignment.description && (
                                  <div className="mt-2 p-2 bg-white rounded border text-xs">
                                    <div 
                                      className="prose prose-xs max-w-none"
                                      dangerouslySetInnerHTML={{ __html: assignment.description }}
                                    />
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    {/* Announcements */}
                    <div className="border border-gray-200 rounded-lg">
                      <div
                        className={`px-3 py-2 cursor-pointer flex justify-between items-center transition-colors ${
                          collapsedSections.announcements ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-100'
                        }`}
                        onClick={() => toggleSection('announcements')}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-black">📢</span>
                          <span className="text-sm font-medium text-black">Announcements</span>
                          <span className="bg-green-500 text-black rounded-full px-2 py-0.5 text-xs font-medium">
                            {courseAnnouncements.length}
                          </span>
                        </div>
                        <span className={`transform transition-transform text-black text-xs ${
                          collapsedSections.announcements ? '' : 'rotate-180'
                        }`}>
                          ▼
                        </span>
                      </div>
                      {!collapsedSections.announcements && (
                        <div className="max-h-48 overflow-y-auto">
                          {courseAnnouncements.length === 0 ? (
                            <div className="text-center py-4 text-black text-xs">
                              No announcements found
                            </div>
                          ) : (
                            courseAnnouncements.slice(0, 10).map(announcement => (
                              <div 
                                key={announcement.id} 
                                className="px-3 py-2 border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                                onClick={() => toggleExpanded('announcement', announcement.id)}
                              >
                                <div className="text-xs font-medium text-black truncate">{announcement.title}</div>
                                <div className="text-xs text-black">
                                  Posted: {formatDate(announcement.posted_at)}
                                </div>
                                {expandedItems[`announcement-${announcement.id}`] && announcement.message && (
                                  <div className="mt-2 p-2 bg-white rounded border text-xs">
                                    <div 
                                      className="prose prose-xs max-w-none"
                                      dangerouslySetInnerHTML={{ __html: announcement.message }}
                                    />
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    {/* Files */}
                    <div className="border border-gray-200 rounded-lg">
                      <div
                        className={`px-3 py-2 cursor-pointer flex justify-between items-center transition-colors ${
                          collapsedSections.files ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-100'
                        }`}
                        onClick={() => toggleSection('files')}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-black">📁</span>
                          <span className="text-sm font-medium text-black">Files</span>
                          <span className="bg-blue-500 text-black rounded-full px-2 py-0.5 text-xs font-medium">
                            {courseFiles.length}
                          </span>
                        </div>
                        <span className={`transform transition-transform text-black text-xs ${
                          collapsedSections.files ? '' : 'rotate-180'
                        }`}>
                          ▼
                        </span>
                      </div>
                      {!collapsedSections.files && (
                        <div className="max-h-48 overflow-y-auto">
                          {courseFiles.length === 0 ? (
                            <div className="text-center py-4 text-black text-xs">
                              No files found
                            </div>
                          ) : (
                            courseFiles.slice(0, 10).map(file => (
                              <div 
                                key={file.id} 
                                className="px-3 py-2 border-t border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => openFile(file)}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{getFileIcon(file)}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-black truncate">{file.display_name}</div>
                                    <div className="text-xs text-black">
                                      {file.size ? formatFileSize(file.size) : 'Unknown size'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>


                  </div>
                )}

                {/* Chat Section */}
                {isAuthenticated && isConnected && (
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <div className="text-xs font-medium text-black uppercase tracking-wide">
                      💬 Chat Assistant
                    </div>

                    {/* New Chat Button */}
                    <button
                      onClick={handleNewChat}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <span>💬</span>
                      New Chat
                    </button>

                    {/* Recent Conversations */}
                    {conversations.length > 0 && (
                      <div className="border border-gray-200 rounded-lg">
                        <div
                          className={`px-3 py-2 cursor-pointer flex justify-between items-center transition-colors ${
                            collapsedChatSections.conversations ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-100'
                          }`}
                          onClick={() => toggleChatSection('conversations')}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-black">📚</span>
                            <span className="text-sm font-medium text-black">Recent Chats</span>
                            <span className="bg-purple-500 text-white rounded-full px-2 py-0.5 text-xs font-medium">
                              {conversations.length}
                            </span>
                          </div>
                          <span className={`transform transition-transform text-black text-xs ${
                            collapsedChatSections.conversations ? '' : 'rotate-180'
                          }`}>
                            ▼
                          </span>
                        </div>
                        {!collapsedChatSections.conversations && (
                          <div className="max-h-48 overflow-y-auto">
                            {loadingConversations ? (
                              <div className="text-center py-4 text-black text-xs">
                                Loading conversations...
                              </div>
                            ) : (
                              conversations.slice(0, 10).map(conversation => {
                                const conversationCourse = canvasData?.courses.find(course => course.id === conversation.course_id);
                                return (
                                  <div 
                                    key={conversation.id} 
                                    className="px-3 py-2 border-t border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => handleLoadConversation(conversation.id)}
                                  >
                                    <div className="text-xs font-medium text-black truncate">{conversation.title}</div>
                                    <div className="text-xs text-gray-600">
                                      {conversationCourse ? `${conversationCourse.courseCode}` : 'General'} • {formatDate(conversation.last_message_at)}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Course-specific conversations if a course is selected */}
                    {selectedCourse && conversations.filter(c => c.course_id === selectedCourseId).length > 0 && (
                      <div className="border border-gray-200 rounded-lg">
                        <div
                          className={`px-3 py-2 cursor-pointer flex justify-between items-center transition-colors ${
                            collapsedChatSections.courseChats ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-100'
                          }`}
                          onClick={() => toggleChatSection('courseChats')}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-black">🎓</span>
                            <span className="text-sm font-medium text-black">{selectedCourse.courseCode} Chats</span>
                            <span className="bg-green-500 text-white rounded-full px-2 py-0.5 text-xs font-medium">
                              {conversations.filter(c => c.course_id === selectedCourseId).length}
                            </span>
                          </div>
                          <span className={`transform transition-transform text-black text-xs ${
                            collapsedChatSections.courseChats ? '' : 'rotate-180'
                          }`}>
                            ▼
                          </span>
                        </div>
                        {!collapsedChatSections.courseChats && (
                          <div className="max-h-48 overflow-y-auto">
                            {conversations
                              .filter(c => c.course_id === selectedCourseId)
                              .slice(0, 10)
                              .map(conversation => (
                                <div 
                                  key={conversation.id} 
                                  className="px-3 py-2 border-t border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                  onClick={() => handleLoadConversation(conversation.id)}
                                >
                                  <div className="text-xs font-medium text-black truncate">{conversation.title}</div>
                                  <div className="text-xs text-gray-600">
                                    {formatDate(conversation.last_message_at)}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="p-4 space-y-4">
                {/* Authentication Section */}
                {!isAuthenticated ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-black mb-2">Welcome to Claryfy</h3>
                      <p className="text-sm text-gray-600">Create an account or sign in to get started</p>
                    </div>

                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setAuthMode('signin')}
                        className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                          authMode === 'signin' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => setAuthMode('signup')}
                        className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                          authMode === 'signup' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Sign Up
                      </button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={authMode === 'signup' ? 'Create a password' : 'Enter your password'}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        {authMode === 'signup' && (
                          <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                        )}
                      </div>

                      {/* Canvas fields for signup */}
                      {authMode === 'signup' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-black mb-1">
                              Canvas Domain
                            </label>
                            <input
                              type="text"
                              value={signupCanvasDomain}
                              onChange={(e) => setSignupCanvasDomain(e.target.value)}
                              placeholder="e.g., university.instructure.com"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black mb-1">
                              Access Token
                            </label>
                            <input
                              type="password"
                              value={signupCanvasToken}
                              onChange={(e) => setSignupCanvasToken(e.target.value)}
                              placeholder="Your Canvas access token"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowSignupTokenHelp(!showSignupTokenHelp)}
                            className="text-sm text-green-600 hover:text-green-800 underline mt-1"
                          >
                            How to get your Canvas Access Token?
                          </button>
                          {showSignupTokenHelp && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-md text-sm mt-2">
                              <h4 className="font-medium text-black mb-2">How to get your Canvas Access Token:</h4>
                              <ol className="list-decimal list-inside space-y-1 text-black">
                                <li>Log in to your Canvas account in your browser.</li>
                                <li>Go to <b>Account</b> &rarr; <b>Settings</b>.</li>
                                <li>Scroll down to <b>Approved Integrations</b>.</li>
                                <li>Click <b>+ New Access Token</b>.</li>
                                <li>Enter a purpose (e.g., "Claryfy").</li>
                                <li>Set an expiration date (optional).</li>
                                <li>Click <b>Generate Token</b>.</li>
                                <li>Copy the token immediately and paste it here.</li>
                              </ol>
                              <p className="mt-2 text-xs text-gray-600">Never share your token with anyone. You can always revoke it from your Canvas settings.</p>
                            </div>
                          )}
                        </>
                      )}

                      <button
                        type="submit"
                        disabled={isAuthenticating || authLoading}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isAuthenticating ? 'Processing...' : authMode === 'signup' ? 'Create Account' : 'Sign In'}
                      </button>
                    </form>

                    {authError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                        {authError}
                      </div>
                    )}

                    {authSuccess && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-600">
                        {authSuccess}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* User Account Info */}
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-black">{user?.email}</h3>
                          <p className="text-sm text-gray-600">Claryfy Account</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Link 
                          href="/profile"
                          className="block w-full text-center bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Manage Account
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-center bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>

                    {/* Canvas Profile Info */}
                    {canvasData?.profile && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {canvasData.profile.name?.charAt(0).toUpperCase() || 'C'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-black">{canvasData.profile.name}</h3>
                            <p className="text-sm text-gray-600">Canvas Profile</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Canvas Connection - Only show when authenticated */}
                {isAuthenticated && !isConnected ? (
                  <div className="space-y-4">
                    {checkingCredentials ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-600">Checking Canvas credentials...</p>
                      </div>
                    ) : hasSavedCredentials ? (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-black">Connecting to Canvas automatically...</span>
                        </div>
                        <p className="text-xs text-gray-600">Using your saved credentials</p>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-base font-medium text-black">Load Your Content</h3>
                        
                        <button
                          onClick={() => setShowTokenHelp(!showTokenHelp)}
                          className="text-sm text-black hover:text-black underline"
                        >
                          How to get your Canvas Access Token?
                        </button>

                        {showTokenHelp && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                            <h4 className="font-medium text-black mb-2">How to get your Canvas Access Token:</h4>
                            <ol className="list-decimal list-inside space-y-1 text-black text-xs">
                              <li>Go to your Canvas account settings</li>
                              <li>Click on &quot;Approved Integrations&quot;</li>
                              <li>Click &quot;+ New Access Token&quot;</li>
                              <li>Enter a purpose (e.g., &quot;Claryfy&quot;)</li>
                              <li>Set expiration date (optional)</li>
                              <li>Click &quot;Generate Token&quot;</li>
                              <li>Copy the token immediately</li>
                            </ol>
                          </div>
                        )}

                        <form onSubmit={handleConnect} className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-black mb-1">
                              Canvas Domain
                            </label>
                            <input
                              type="text"
                              value={domain}
                              onChange={(e) => setDomain(e.target.value)}
                              placeholder="e.g., university.instructure.com"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black mb-1">
                              Access Token
                            </label>
                            <input
                              type="password"
                              value={token}
                              onChange={(e) => setToken(e.target.value)}
                              placeholder="Your Canvas access token"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={isConnecting || !token || !domain}
                            className="w-full bg-green-600 text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isConnecting ? 'Loading...' : 'Load Content'}
                          </button>
                        </form>

                        {/* Loading Progress */}
                        {isConnecting && (
                          <div className="space-y-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${loadingProgress}%` }}
                              ></div>
                            </div>
                            {loadingStep && (
                              <div className="text-center">
                                <p className="text-xs text-black">{loadingStep}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {error && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-black">
                            {error}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : isAuthenticated && isConnected ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-black">Connected to Canvas</span>
                      </div>
                      <p className="text-xs text-black">Domain: {domain}</p>
                      <p className="text-xs text-black">
                        Courses: {canvasData?.courses.length || 0}
                      </p>
                    </div>

                    {/* PHASE 4: Refresh Button */}
                    <button
                      onClick={handleRefresh}
                      disabled={isConnecting}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {isConnecting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Refreshing...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Refresh & Sync Data
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsConnected(false);
                        setCanvasData(null);
                        setToken('');
                        setSelectedCourseId(null);
                      }}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      Disconnect from Canvas
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}