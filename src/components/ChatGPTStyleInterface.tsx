'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { CanvasData, File } from '../types/canvas';
import FileViewer from './FileViewer';
import RecentContent from './RecentContent';
import { AuthService, ConversationService } from '../services/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  MessageSquare, 
  ChevronLeft, 
  BookOpen, 
  User, 
  ChevronDown, 
  ChevronRight,
  Mic,
  MicOff,
  Pause,
  Play,
  Square,
  FileText,
  Video,
  FileAudio,
  Image,
  Archive,
  Globe,
  Settings,
  HelpCircle,
  Download,
  Upload,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Link,
  Paperclip,
  X,
  Mail,
  Bot
} from 'lucide-react';

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
  selectedAssignment: any | null;
  openAssignment: (assignment: any) => void;
  closeAssignment: () => void;
  selectedAnnouncement: any | null;
  openAnnouncement: (announcement: any) => void;
  closeAnnouncement: () => void;
  isConnecting?: boolean;
  sidebarCollapsed?: boolean;
  setSidebarCollapsed?: (collapsed: boolean) => void;
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
  selectedAssignment,
  openAssignment,
  closeAssignment,
  selectedAnnouncement,
  openAnnouncement,
  closeAnnouncement,
  isConnecting = false,
  sidebarCollapsed = false,
  setSidebarCollapsed,
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
    <div className="h-full flex flex-col p-6">
      <div className="flex-1 space-y-6">
        {!selectedCourse ? (
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-primary mb-2">Welcome to Claryfy</h2>
            </div>
            
            {!isConnected ? (
              <div className="bg-surface border border-subtle rounded-xl p-6 max-w-sm mx-auto shadow-sm">
                {isConnecting ? (
                  <div className="text-center space-y-4">
                    <div className="flex justify-center space-x-1">
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <h3 className="text-lg font-semibold text-primary">Connecting to Canvas...</h3>
                    <p className="text-secondary text-sm">
                      Loading your courses and content
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-accent text-3xl mb-3 flex justify-center">
                      <Link className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-primary mb-2">Get Started</h3>
                    <p className="text-secondary text-sm mb-4">
                      Let's get your Canvas content loaded up so you can start getting help with your courses!
                    </p>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className="btn btn-primary w-full"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div 
                className="bg-surface border border-subtle rounded-xl p-6 max-w-sm mx-auto shadow-sm cursor-pointer hover:bg-surface/80 transition-colors"
                onClick={() => {
                  setActiveTab('courses');
                  if (sidebarCollapsed && setSidebarCollapsed) {
                    setSidebarCollapsed(false);
                  }
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-primary">Choose a Course</h3>
                  <div className="text-accent">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <div className="text-xs text-secondary bg-muted px-3 py-2 rounded-lg">
                  Available Courses: {canvasData?.courses.length || 0}
                </div>
              </div>
            )}

            {/* Prompt Cards */}
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-surface border border-subtle rounded-xl p-4 cursor-pointer hover:bg-surface/80 transition-colors shadow-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <FileText className="w-4 h-4 text-accent" />
                    </div>
                    <p className="text-sm text-primary font-medium">Write a to-do list for a personal project or task</p>
                  </div>
                </div>
                <div className="bg-surface border border-subtle rounded-xl p-4 cursor-pointer hover:bg-surface/80 transition-colors shadow-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Mail className="w-4 h-4 text-accent" />
                    </div>
                    <p className="text-sm text-primary font-medium">Generate an email to reply to a job offer</p>
                  </div>
                </div>
                <div className="bg-surface border border-subtle rounded-xl p-4 cursor-pointer hover:bg-surface/80 transition-colors shadow-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <FileText className="w-4 h-4 text-accent" />
                    </div>
                    <p className="text-sm text-primary font-medium">Summarize this article or text for me in one paragraph</p>
                  </div>
                </div>
                <div className="bg-surface border border-subtle rounded-xl p-4 cursor-pointer hover:bg-surface/80 transition-colors shadow-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Bot className="w-4 h-4 text-accent" />
                    </div>
                    <p className="text-sm text-primary font-medium">How does AI work in a technical capacity</p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <button className="text-secondary hover:text-primary text-sm flex items-center gap-2 mx-auto transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Prompts
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Course Header */}
            <div className="text-center">
              <h1 className="text-xl font-bold text-primary mb-2">
                {selectedCourse.courseCode}: {selectedCourse.shortName}
              </h1>
            </div>

            {/* Prompt Cards for Course */}
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-surface border border-subtle rounded-xl p-4 cursor-pointer hover:bg-surface/80 transition-colors shadow-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <BookOpen className="w-4 h-4 text-accent" />
                    </div>
                    <p className="text-sm text-primary font-medium">Help me understand this week's assignments</p>
                  </div>
                </div>
                <div className="bg-surface border border-subtle rounded-xl p-4 cursor-pointer hover:bg-surface/80 transition-colors shadow-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <AlertCircle className="w-4 h-4 text-accent" />
                    </div>
                    <p className="text-sm text-primary font-medium">Summarize the latest announcements</p>
                  </div>
                </div>
                <div className="bg-surface border border-subtle rounded-xl p-4 cursor-pointer hover:bg-surface/80 transition-colors shadow-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Calendar className="w-4 h-4 text-accent" />
                    </div>
                    <p className="text-sm text-primary font-medium">What's due this week in my courses</p>
                  </div>
                </div>
                <div className="bg-surface border border-subtle rounded-xl p-4 cursor-pointer hover:bg-surface/80 transition-colors shadow-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Archive className="w-4 h-4 text-accent" />
                    </div>
                    <p className="text-sm text-primary font-medium">Find course materials and resources</p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <button className="text-secondary hover:text-primary text-sm flex items-center gap-2 mx-auto transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Prompts
                </button>
              </div>
            </div>

            {/* Recent Content Grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="w-full max-w-2xl mx-auto">
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
                  openAssignment={openAssignment}
                  openAnnouncement={openAnnouncement}
                  closedRecentBoxes={closedRecentBoxes}
                  closeRecentBox={closeRecentBox}
                />
              </div>
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
      <div className="p-6 border-b border-subtle bg-surface flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          {/* Course Header in Chat Mode */}
          {selectedCourse ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-primary mb-2">
                {selectedCourse.courseCode}: {selectedCourse.shortName}
              </h2>
              {viewingFile && (
                <div className="mt-2 text-sm text-primary bg-accent/10 border border-accent/20 px-3 py-1 rounded-full inline-block">
                  Currently viewing: {viewingFile.display_name}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-primary mb-2">
                Welcome to Claryfy
              </h2>
              <p className="text-secondary text-sm">
                {!isConnected 
                  ? "Get your Canvas content loaded up and select a course to start chatting" 
                  : "Select a course from the sidebar to get specific assistance"
                }
              </p>
              {viewingFile && (
                <div className="mt-2 text-sm text-primary bg-accent/10 border border-accent/20 px-3 py-1 rounded-full inline-block">
                  Currently viewing: {viewingFile.display_name}
                </div>
              )}
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
                className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-accent to-accent/90 text-white'
                    : 'bg-surface border border-subtle text-primary'
                }`}
              >
                {message.file && (
                  <div className="mb-2 p-2 bg-white bg-opacity-20 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
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
                          h1: ({children}) => <h1 className="text-lg font-bold mb-3 mt-4">{children}</h1>,
                          h2: ({children}) => <h2 className="text-base font-bold mb-2 mt-3">{children}</h2>,
                          h3: ({children}) => <h3 className="text-sm font-bold mb-2 mt-2">{children}</h3>,
                          p: ({children}) => <p className="mb-3 leading-relaxed">{children}</p>,
                          ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                          li: ({children}) => <li className="mb-0.5">{children}</li>,
                          code: ({children, className}) => (
                            <code className={`bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono ${className || ''}`}>
                              {children}
                            </code>
                          ),
                          pre: ({children}) => (
                            <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto mb-3 font-mono leading-relaxed">
                              {children}
                            </pre>
                          ),
                          blockquote: ({children}) => (
                            <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-3 py-1 bg-gray-50 rounded-r">
                              {children}
                            </blockquote>
                          ),
                          table: ({children}) => (
                            <div className="overflow-x-auto mb-3">
                              <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
                                {children}
                              </table>
                            </div>
                          ),
                          th: ({children}) => (
                            <th className="border border-gray-300 px-3 py-2 bg-gray-100 font-bold text-xs">
                              {children}
                            </th>
                          ),
                          td: ({children}) => (
                            <td className="border border-gray-300 px-3 py-2 text-xs">
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
              </div>
            </div>
          ))}
          

          
          {/* Typing Indicator at bottom */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="text-primary text-sm">
                <span className="inline-flex items-center gap-1">
                  Thinking
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-accent rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </span>
                </span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Chat Interface - Full Height */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Main Content Area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {!isChatMode ? <DashboardContent /> : <ChatMessages />}
        </div>

        {/* File Selection Display */}
        {selectedFile && (
          <div className="px-6 py-3 border-t border-subtle bg-surface/50 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <Paperclip className="w-4 h-4 text-accent" />
                  <div>
                    <span className="font-medium text-primary">{selectedFile.name}</span>
                    <span className="text-secondary text-xs ml-2">({formatFileSize(selectedFile.size)})</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-secondary hover:text-primary p-1 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modern Chat Input Area */}
        <div className="border-t border-subtle p-6 bg-surface flex-shrink-0">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Main Input Field */}
            <div className="relative">
              <div className="relative">
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
                  className="w-full p-4 pr-12 border-2 border-transparent bg-white rounded-2xl resize-none focus:outline-none focus:ring-0 focus:border-gradient-to-r focus:from-blue-400 focus:to-purple-500 text-primary placeholder-secondary"
                  rows={1}
                  style={{ 
                    minHeight: '56px', 
                    maxHeight: '120px',
                    background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #60a5fa, #a855f7) border-box'
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() && !selectedFile}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-50 disabled:bg-muted disabled:cursor-not-allowed text-black w-8 h-8 rounded-full transition-all flex items-center justify-center shadow-sm border border-gray-300"
                  title="Send message"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Action Buttons and Character Counter */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Attach Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 text-secondary hover:text-primary transition-colors rounded-lg hover:bg-surface/50"
                  title="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                  <span className="text-sm">Attach</span>
                </button>
                
                {/* Voice Message Button */}
                <button
                  className="flex items-center gap-2 px-3 py-2 text-secondary hover:text-primary transition-colors rounded-lg hover:bg-surface/50"
                  title="Voice message"
                >
                  <Mic className="w-4 h-4" />
                  <span className="text-sm">Voice Message</span>
                </button>
                
                {/* Browse Prompts Button */}
                <button
                  className="flex items-center gap-2 px-3 py-2 text-secondary hover:text-primary transition-colors rounded-lg hover:bg-surface/50"
                  title="Browse prompts"
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">Browse Prompts</span>
                </button>
              </div>
              
              {/* Character Counter */}
              <div className="text-xs text-secondary">
                {inputValue.length} / 3,000
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
      </div>
    </div>
  );
});

ChatGPTStyleInterface.displayName = 'ChatGPTStyleInterface';

export default ChatGPTStyleInterface;