'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CanvasData, File } from '../types/canvas';

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
}: SidebarProps) {
  
  // Add recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const selectedCourse = canvasData?.courses.find(course => course.id === selectedCourseId);
  const courseAssignments = canvasData?.assignments.filter(assignment => assignment.course_id === selectedCourseId) || [];
  const courseAnnouncements = canvasData?.announcements.filter(announcement => announcement.course_id === selectedCourseId) || [];
  const courseFiles = canvasData?.files.filter(file => file.course_id === selectedCourseId) || [];

  const handleStartRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    console.log('Started recording');
  };

  const handlePauseRecording = () => {
    setIsPaused(!isPaused);
    console.log(isPaused ? 'Resumed recording' : 'Paused recording');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    console.log('Stopped recording');
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
                      {canvasData ? 'Select a course' : 'Connect to Canvas first'}
                    </option>
                    {canvasData?.courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.courseCode}: {course.shortName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Course Sections - Only show when course is selected */}
                {selectedCourse && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-black uppercase tracking-wide">
                      {selectedCourse.courseCode}
                    </div>

                    {/* Record Controls Section */}
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
                      <div className="flex items-center gap-2">
                        {!isRecording ? (
                          <button
                            onClick={handleStartRecording}
                            className="bg-red-500 hover:bg-red-600 text-black px-3 py-1 rounded text-xs font-medium transition-colors"
                            title="Start Recording"
                          >
                            ● Record
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={handlePauseRecording}
                              className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded text-xs font-medium transition-colors"
                              title={isPaused ? "Resume Recording" : "Pause Recording"}
                            >
                              {isPaused ? '▶ Resume' : '⏸ Pause'}
                            </button>
                            <button
                              onClick={handleStopRecording}
                              className="bg-gray-500 hover:bg-gray-600 text-black px-3 py-1 rounded text-xs font-medium transition-colors"
                              title="Stop Recording"
                            >
                              ⏹ Stop
                            </button>
                          </>
                        )}
                      </div>
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
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="p-4 space-y-4">
                {/* Profile Info */}
                {canvasData?.profile && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-black font-bold text-lg">
                        {canvasData.profile.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-black">{canvasData.profile.name}</h3>
                        <p className="text-sm text-black">Canvas User</p>
                      </div>
                    </div>
                    <Link 
                      href="/profile"
                      className="block w-full text-center bg-blue-600 text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      View Full Profile
                    </Link>
                  </div>
                )}

                {/* Canvas Connection */}
                {!isConnected ? (
                  <div className="space-y-4">
                    <h3 className="text-base font-medium text-black">Connect to Canvas</h3>
                    
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
                        {isConnecting ? 'Connecting...' : 'Connect to Canvas'}
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
                  </div>
                ) : (
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
                    
                    <button
                      onClick={() => {
                        setIsConnected(false);
                        setCanvasData(null);
                        setToken('');
                        setSelectedCourseId(null);
                      }}
                      className="w-full bg-red-600 text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}