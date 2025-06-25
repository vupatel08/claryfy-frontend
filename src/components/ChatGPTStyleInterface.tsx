'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { CanvasData, File } from '../types/canvas';
import FileViewer from './FileViewer';
import RecentContent from './RecentContent';
import { AuthService, ConversationService } from '../services/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

interface Conversation {
  id: string;
  title: string;
  course_id?: number;
  created_at: string;
  last_message_at: string;
}

export interface ChatGPTStyleInterfaceRef {
  startNewChat: () => void;
  loadConversationMessages: (conversationId: string) => void;
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

const ChatGPTStyleInterface = forwardRef<ChatGPTStyleInterfaceRef, ChatGPTStyleInterfaceProps>(({
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
}, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);
  const [isChatMode, setIsChatMode] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Reasoning/thinking process state
  const [isReasoning, setIsReasoning] = useState(false);
  const [reasoningSteps, setReasoningSteps] = useState<string[]>([]);
  const [currentReasoningStep, setCurrentReasoningStep] = useState(0);

  // Ensure we're on the client side to prevent hydration mismatches
  useEffect(() => {
    setIsClient(true);
    loadCurrentUser();
  }, []);

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    startNewChat,
    loadConversationMessages,
  }));

  // Load current user on mount
  const loadCurrentUser = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
      if (user) {
        loadConversations(user.id);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  // Load conversations for current user
  const loadConversations = async (userId: string) => {
    try {
      const userConversations = await ConversationService.getUserConversations(userId, selectedCourseId || undefined);
      setConversations(userConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  // Load conversation messages
  const loadConversationMessages = async (conversationId: string) => {
    try {
      const conversationMessages = await ConversationService.getConversationMessages(conversationId);
      const formattedMessages: Message[] = conversationMessages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.role,
        timestamp: new Date(msg.created_at),
      }));
      setMessages(formattedMessages);
      setCurrentConversationId(conversationId);
      setIsChatMode(true);
    } catch (error) {
      console.error('Error loading conversation messages:', error);
    }
  };

  // Create new conversation
  const createNewConversation = async (title: string) => {
    if (!currentUser) return null;
    
    // Don't create conversation if no course is selected
    if (!selectedCourseId) {
      console.warn('Cannot create conversation without a selected course');
      return null;
    }
    
    try {
      const conversation = await ConversationService.createConversation(
        currentUser.id,
        selectedCourseId,
        title
      );
      setCurrentConversationId(conversation.id);
      setMessages([]);
      await loadConversations(currentUser.id);
      return conversation.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const selectedCourse = canvasData?.courses.find(course => course.id === selectedCourseId);
  const courseAssignments = canvasData?.assignments.filter(assignment => assignment.course_id === selectedCourseId) || [];
  const courseAnnouncements = canvasData?.announcements.filter(announcement => announcement.course_id === selectedCourseId) || [];
  const courseFiles = canvasData?.files.filter(file => file.course_id === selectedCourseId) || [];

  // Scroll to bottom (normal chat behavior - newest at bottom)
  const scrollToBottom = (smooth = true) => {
    if (scrollableContainerRef.current) {
      const container = scrollableContainerRef.current;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const maxScrollTop = scrollHeight - clientHeight;
      
      if (smooth) {
        container.scrollTo({
          top: maxScrollTop,
          behavior: 'smooth'
        });
      } else {
        container.scrollTop = maxScrollTop;
      }
    }
  };

  // Auto-scroll for streaming messages (keep newest content visible at bottom)
  const autoScroll = () => {
    if (!scrollableContainerRef.current) return;
    
    const container = scrollableContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50; // Within 50px of bottom
    
    // Only auto-scroll if user is near the bottom (respects manual scrolling)
    if (isNearBottom) {
      // Smooth scroll to bottom during streaming
      container.scrollTop = scrollHeight - clientHeight;
    }
  };

  // Track message count to only scroll when new messages are added
  const prevMessageCountRef = useRef(0);
  
  useEffect(() => {
    if (!isChatMode) return;
    
    // Only scroll when a new message is actually added
    if (messages.length > prevMessageCountRef.current) {
      prevMessageCountRef.current = messages.length;
      // Smooth scroll for new messages
      setTimeout(() => scrollToBottom(true), 0);
    }
  }, [messages.length, isChatMode]);

  // Separate effect for streaming content updates (same message, changing content)
  useEffect(() => {
    if (isTyping && isChatMode && messages.length > 0) {
      // During streaming: gentle auto-scroll if user is near bottom
      // Use a small delay to avoid too frequent scrolling
      const timer = setTimeout(() => {
        autoScroll();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [messages, isTyping, isChatMode]);

  // Auto-scroll during reasoning process
  useEffect(() => {
    if (isReasoning && isChatMode) {
      const timer = setTimeout(() => {
        scrollToBottom(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isReasoning, currentReasoningStep, isChatMode]);

  // Simulate AI reasoning process
  const simulateReasoning = async (userMessage: string, courseId?: number | null) => {
    setIsReasoning(true);
    setCurrentReasoningStep(0);
    
    // Generate reasoning steps based on context
    const steps = [];
    const messageLower = userMessage.toLowerCase();
    
    // Always start with thinking
    steps.push("🧠 Thinking about your question...");
    
    // Add course-specific reasoning if course is selected
    if (courseId && selectedCourse) {
      steps.push(`📚 Looking through your ${selectedCourse.courseCode} content...`);
      
      // Check what type of content we might be searching
      if (messageLower.includes('assignment') || messageLower.includes('homework') || messageLower.includes('hw') || messageLower.includes('project')) {
        steps.push("📝 Searching through assignments and submissions...");
        if (messageLower.includes('due') || messageLower.includes('deadline')) {
          steps.push("⏰ Cross-referencing due dates...");
        }
      }
      
      if (messageLower.includes('announcement') || messageLower.includes('news') || messageLower.includes('update')) {
        steps.push("📢 Checking recent announcements...");
      }
      
      if (messageLower.includes('file') || messageLower.includes('document') || messageLower.includes('pdf') || messageLower.includes('resource')) {
        steps.push("📁 Looking through course files and resources...");
      }
      
      if (messageLower.includes('grade') || messageLower.includes('score') || messageLower.includes('feedback') || messageLower.includes('rubric')) {
        steps.push("📊 Analyzing your grades and feedback...");
      }
      
      if (messageLower.includes('exam') || messageLower.includes('test') || messageLower.includes('quiz')) {
        steps.push("📋 Checking exam information and study materials...");
      }
      
      if (messageLower.includes('syllabus') || messageLower.includes('schedule') || messageLower.includes('calendar')) {
        steps.push("📅 Reviewing course schedule and syllabus...");
      }
      
      if (messageLower.includes('help') || messageLower.includes('how') || messageLower.includes('explain')) {
        steps.push("🤔 Understanding what you need help with...");
        steps.push("📖 Gathering relevant explanations and examples...");
      }
      
      if (messageLower.includes('submission') || messageLower.includes('submit') || messageLower.includes('turn in')) {
        steps.push("📤 Checking submission requirements...");
      }
    } else {
      steps.push("🔍 Searching across all your courses...");
      
      // Add more general reasoning for cross-course queries
      if (messageLower.includes('compare') || messageLower.includes('similar') || messageLower.includes('different')) {
        steps.push("⚖️ Comparing information across courses...");
      }
    }
    
    // Add contextual processing steps
    if (messageLower.includes('?') || messageLower.includes('how') || messageLower.includes('what') || messageLower.includes('why')) {
      steps.push("❓ Understanding your specific question...");
    }
    
    // Final processing steps
    steps.push("🔍 Finding the most relevant content...");
    steps.push("💡 Connecting the pieces together...");
    steps.push("✨ Crafting your personalized response...");
    
    setReasoningSteps(steps);
    
    // Animate through the steps
    for (let i = 0; i < steps.length; i++) {
      setCurrentReasoningStep(i);
      // Wait between steps (varying times for realism)
      const delay = i === 0 ? 800 : (i === steps.length - 1 ? 1200 : 600 + Math.random() * 600);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // Small delay before showing response
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsReasoning(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedFile) return;
    if (!isClient) return;

    // Switch to chat mode
    setIsChatMode(true);

    const userMessage: Message = {
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

    setMessages(prev => [...prev, userMessage]);
    const messageContent = inputValue; // Store before clearing
    setInputValue('');
    setSelectedFile(null);

    try {
      // Get current user for userId
      const user = await AuthService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated. Please sign in to chat.');
      }

      // Start reasoning process
      await simulateReasoning(messageContent, selectedCourseId);
      
      setIsTyping(true);
      
      // Call backend RAG-enabled chat API with streaming
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          userId: user.id,
          courseId: selectedCourseId,
          conversationId: currentConversationId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let aiResponse = '';
      const aiMessageId = (Date.now() + 1).toString();

      // Add initial AI message
      setMessages(prev => [...prev, {
        id: aiMessageId,
        content: '',
        sender: 'ai',
        timestamp: new Date(),
      }]);

      // Read stream (plain text response, not SSE)
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        aiResponse += chunk;
        
        // Update AI message content
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: aiResponse }
            : msg
        ));
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      }]);
    }

    setIsTyping(false);
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

  // Start new chat
  const startNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setIsChatMode(true);
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
                  Let's get your Canvas content loaded up so you can start getting help with your courses!
                </p>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="bg-blue-600 text-black px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Get Started
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
    <div className="flex flex-col h-full max-h-[100dvh]">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          {/* Course Header in Chat Mode */}
          {selectedCourse ? (
            <div className="text-center">
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
            <div className="text-center">
              <h2 className="text-xl font-semibold text-black mb-1">
                Welcome to Claryfy
              </h2>
              <p className="text-sm text-black">
                {!isConnected 
                  ? "Get your Canvas content loaded up and select a course to start chatting" 
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

          {/* Conversation History Toggle */}
          {conversations.length > 0 && (
            <div className="flex justify-center mt-2">
              <button
                onClick={() => setShowConversationHistory(!showConversationHistory)}
                className="bg-gray-100 hover:bg-gray-200 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {showConversationHistory ? '📚 Hide History' : '📚 Show History'}
              </button>
            </div>
          )}

          {/* Conversation History */}
          {showConversationHistory && conversations.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <h3 className="text-sm font-semibold text-black mb-2">Recent Conversations</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => loadConversationMessages(conversation.id)}
                    className={`w-full text-left p-2 rounded text-sm transition-colors ${
                      currentConversationId === conversation.id
                        ? 'bg-blue-100 text-blue-800'
                        : 'hover:bg-gray-100 text-black'
                    }`}
                  >
                    <div className="font-medium truncate">{conversation.title}</div>
                    <div className="text-xs opacity-75">
                      {new Date(conversation.last_message_at).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area (scrollable) */}
      <div className="flex-1 overflow-y-auto p-6" ref={scrollableContainerRef}>
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Messages in normal order (oldest first, newest last) */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
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
                <div className="text-sm prose prose-sm max-w-none">
                  {message.sender === 'user' ? (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Custom styling for markdown elements
                          h1: ({children}) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                          h2: ({children}) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                          h3: ({children}) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                          p: ({children}) => <p className="mb-2">{children}</p>,
                          ul: ({children}) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                          li: ({children}) => <li className="mb-1">{children}</li>,
                          code: ({children, className}) => (
                            <code className={`bg-gray-200 px-1 py-0.5 rounded text-xs ${className || ''}`}>
                              {children}
                            </code>
                          ),
                          pre: ({children}) => (
                            <pre className="bg-gray-200 p-2 rounded text-xs overflow-x-auto mb-2">
                              {children}
                            </pre>
                          ),
                          blockquote: ({children}) => (
                            <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-2">
                              {children}
                            </blockquote>
                          ),
                          table: ({children}) => (
                            <div className="overflow-x-auto mb-2">
                              <table className="min-w-full border border-gray-300">
                                {children}
                              </table>
                            </div>
                          ),
                          th: ({children}) => (
                            <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-bold text-xs">
                              {children}
                            </th>
                          ),
                          td: ({children}) => (
                            <td className="border border-gray-300 px-2 py-1 text-xs">
                              {children}
                            </td>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                <div className="text-xs mt-1 opacity-75">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {/* AI Reasoning Process */}
          {isReasoning && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 text-black p-4 rounded-lg max-w-[80%]">
                <div className="space-y-2">
                  {reasoningSteps.map((step, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-2 transition-all duration-300 ${
                        index <= currentReasoningStep 
                          ? 'opacity-100 translate-x-0' 
                          : 'opacity-30 translate-x-2'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentReasoningStep 
                          ? 'bg-purple-500 animate-pulse' 
                          : index < currentReasoningStep
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`} />
                      <span className={`text-sm ${
                        index === currentReasoningStep 
                          ? 'font-medium text-purple-700' 
                          : index < currentReasoningStep
                          ? 'text-green-700'
                          : 'text-gray-500'
                      }`}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Typing Indicator at bottom */}
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
    </div>
  );

  return (
    <div className="flex-1 flex h-[100dvh]">
      {/* File Viewer (Left Side) - Fixed 50% width when viewing file */}
      {viewingFile && (
        <div className="w-1/2 h-full hidden md:block border-r border-gray-200">
          <FileViewer file={viewingFile} onClose={closeFile} />
        </div>
      )}
      
      {/* Chat Interface (Right Side or Full Width) - Takes remaining 50% or full width */}
      <div className={`flex flex-col h-full ${viewingFile ? 'w-1/2' : 'w-full'}`}>
        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {!isChatMode ? <DashboardContent /> : <ChatMessages />}
        </div>

        {/* File Selection Display */}
        {selectedFile && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
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

        {/* Always Visible Chat Input Area */}
        <div className="border-t border-gray-200 p-6 bg-white flex-shrink-0">
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
                  className="bg-gray-600 hover:bg-gray-700 text-white w-12 h-12 rounded-lg transition-colors flex items-center justify-center"
                  title="Upload file"
                >
                  <span className="text-lg">📎</span>
                </button>
                
                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() && !selectedFile}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white w-12 h-12 rounded-lg transition-colors flex items-center justify-center"
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
});

ChatGPTStyleInterface.displayName = 'ChatGPTStyleInterface';

export default ChatGPTStyleInterface;