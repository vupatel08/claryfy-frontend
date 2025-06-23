'use client';

import { useState, useRef, useEffect } from 'react';
import { CanvasData, File } from '../types/canvas';
import FileViewer from './FileViewer';
import RecentContent from './RecentContent';


interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  file?: {
    name: string;
    size: number;
    type: string;
  };
}

interface ChatGPTStyleInterfaceProps {
  canvasData: CanvasData | null;
  selectedCourseId: number | null;
  isConnected: boolean;
  setActiveTab: (tab: 'courses' | 'profile') => void;
  closedRecentBoxes: Set<string>;
  closeRecentBox: (boxType: string) => void;
  expandedItems: {[key: string]: boolean};
  toggleExpanded: (type: string, id: number) => void;
  formatDate: (dateString: string | null) => string;
  formatFileSize: (bytes: number) => string;
  getFileIcon: (file: File) => string;
  viewingFile: File | null;
  openFile: (file: File) => void;
  closeFile: () => void;
}

export default function ChatGPTStyleInterface({
  canvasData,
  selectedCourseId,
  isConnected,
  setActiveTab,
  closedRecentBoxes,
  closeRecentBox,
  expandedItems,
  toggleExpanded,
  formatDate,
  formatFileSize,
  getFileIcon,
  viewingFile,
  openFile,
  closeFile,
}: ChatGPTStyleInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);
  const [isChatMode, setIsChatMode] = useState(false); // Track if we're in chat mode
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useState(false);
  

  
  // Ensure we're on the client side to prevent hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

  const selectedCourse = canvasData?.courses.find(course => course.id === selectedCourseId);
  const courseAssignments = canvasData?.assignments.filter(assignment => assignment.course_id === selectedCourseId) || [];
  const courseAnnouncements = canvasData?.announcements.filter(announcement => announcement.course_id === selectedCourseId) || [];
  const courseFiles = canvasData?.files.filter(file => file.course_id === selectedCourseId) || [];



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatMode) {
      scrollToBottom();
    }
  }, [messages, isChatMode]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedFile) return;

    // Only execute on client side to prevent hydration mismatch
    if (!isClient) return;

    // Switch to chat mode
    setIsChatMode(true);

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      file: selectedFile ? {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
      } : undefined,
    };

    setMessages([newMessage]);
    setInputValue('');
    setSelectedFile(null);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I received your message about your Canvas courses. This is a placeholder response. In the future, I\'ll be able to help you with specific Canvas-related questions and analyze uploaded files based on your selected course!',
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const formatTime = (date: Date): string => {
    if (!isClient) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Dashboard Content Component
  const DashboardContent = () => (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        {!selectedCourse ? (
          <div className="text-center space-y-8">
            <h2 className="text-3xl font-bold text-black mb-4">Welcome to Claryfy</h2>
            <p className="text-lg text-black mb-8">
              Your intelligent Canvas assistant for streamlined course management and assignment tracking.
            </p>
            
            {!isConnected ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-black text-4xl mb-4">🔗</div>
                <h3 className="text-xl font-semibold text-black mb-2">Get Started</h3>
                <p className="text-black mb-4">
                  Connect your Canvas account to access your courses, assignments, and announcements.
                </p>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="bg-blue-600 text-black px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Connect to Canvas
                </button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-black text-4xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-black mb-2">Choose a Course</h3>
                <p className="text-black mb-4">
                  Select a course from the sidebar to view assignments, announcements, and files.
                </p>
                <div className="text-sm text-black">
                  Available Courses: {canvasData?.courses.length || 0}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Course Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-black mb-2">
                {selectedCourse.courseCode}: {selectedCourse.shortName}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-black justify-center">
                <span>📝 {courseAssignments.length} Assignments</span>
                <span>📢 {courseAnnouncements.length} Announcements</span>
                <span>📁 {courseFiles.length} Files</span>
              </div>
            </div>

            {/* Recent Content Grid - Remove any event capturing */}
            <div style={{ pointerEvents: 'auto' }}>
              <RecentContent
                assignments={courseAssignments}
                announcements={courseAnnouncements}
                files={courseFiles}
                expandedItems={expandedItems}
                toggleExpanded={toggleExpanded}
                formatDate={formatDate}
                formatFileSize={formatFileSize}
                getFileIcon={getFileIcon}
                openFile={openFile}
                closedRecentBoxes={closedRecentBoxes}
                closeRecentBox={closeRecentBox}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Chat Messages Component
  const ChatMessages = () => (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Course Header in Chat Mode */}
        {selectedCourse ? (
          <div className="text-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-black mb-1">
              {selectedCourse.courseCode}: {selectedCourse.shortName}
            </h2>
            <div className="flex flex-wrap gap-3 text-xs text-black justify-center">
              <span>📝 {courseAssignments.length} Assignments</span>
              <span>📢 {courseAnnouncements.length} Announcements</span>
              <span>📁 {courseFiles.length} Files</span>
            </div>
            {viewingFile && (
              <div className="mt-2 text-sm text-black bg-blue-50 px-3 py-1 rounded-full inline-block">
                Currently viewing: {viewingFile.display_name}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-black mb-1">
              Welcome to Claryfy
            </h2>
            <p className="text-sm text-black">
              {!isConnected 
                ? "Connect your Canvas account and select a course to get started" 
                : "Select a course from the sidebar to get specific assistance"
              }
            </p>
            {viewingFile && (
              <div className="mt-2 text-sm text-black bg-blue-50 px-3 py-1 rounded-full inline-block">
                Currently viewing: {viewingFile.display_name}
              </div>
            )}
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-black'
                  : 'bg-gray-100 text-black'
              }`}
            >
              {message.file && (
                <div className="mb-2 p-2 bg-white bg-opacity-20 rounded text-sm">
                  <div className="flex items-center gap-2">
                    <span>📎</span>
                    <span className="font-medium">{message.file.name}</span>
                  </div>
                  <div className="text-xs opacity-75">
                    {formatFileSize(message.file.size)}
                  </div>
                </div>
              )}
              <div className="text-sm">{message.content}</div>
              <div className="text-xs mt-1 opacity-75">
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-black p-4 rounded-lg">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex bg-white min-h-screen">
      {/* File Viewer (Left Side) */}
      {viewingFile && (
        <div className="w-1/2 hidden md:block">
          <FileViewer file={viewingFile} onClose={closeFile} />
        </div>
      )}
      
      {/* Chat Interface (Right Side or Full Width) */}
      <div className={`flex flex-col ${viewingFile ? 'w-1/2 md:w-1/2' : 'w-full'}`}>
        {/* Main Content Area */}
        {!isChatMode ? <DashboardContent /> : <ChatMessages />}

      {/* File Selection Display */}
      {selectedFile && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span>📎</span>
              <span className="font-medium text-black">{selectedFile.name}</span>
              <span className="text-black text-xs">({formatFileSize(selectedFile.size)})</span>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-black hover:text-black p-1"
              title="Remove file"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Fixed Bottom Input */}
      <div className="border-t border-gray-200 p-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  !selectedCourse 
                    ? "Ask about Canvas or connect your account to get started..." 
                    : `Ask about ${selectedCourse.courseCode} or upload a file...`
                }
                className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                rows={1}
                style={{ minHeight: '56px', maxHeight: '200px' }}
              />
            </div>
            
            <div className="flex items-center gap-2">
              {/* File Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-600 hover:bg-gray-700 text-black w-12 h-12 rounded-lg transition-colors flex items-center justify-center"
                title="Upload file"
              >
                <span className="text-lg">📎</span>
              </button>
              
              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() && !selectedFile}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-black w-12 h-12 rounded-lg transition-colors flex items-center justify-center"
                title="Send message"
              >
                <span className="text-lg">→</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
        />
        </div>
      </div>
      
      {/* Mobile File Viewer - Full Screen */}
      {viewingFile && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <FileViewer file={viewingFile} onClose={closeFile} />
        </div>
      )}
    </div>
  );
} 