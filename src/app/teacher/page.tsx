'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Send, Check, Edit, MessageSquare, BookOpen, AlertCircle, User, ListChecks, Eye, Shield, FileText, Calendar, Archive, X, Clock, Square, CheckSquare } from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ApprovalItem {
  id: string;
  type: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  content?: string;
}

// Approval Item Component
function ApprovalItem({ item, onApprove, onReject, onEdit }: { 
  item: ApprovalItem; 
  onApprove: () => void;
  onReject: () => void;
  onEdit: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Helper to close after approve/reject
  const handleApprove = () => {
    onApprove();
    setIsOpen(false);
  };
  const handleReject = () => {
    onReject();
    setIsOpen(false);
  };

  return (
    <div className="border border-subtle rounded-lg overflow-hidden mb-2 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            {item.type === 'Summary' && <FileText className="w-4 h-4 text-blue-500" />}
            {item.type === 'Flashcard' && <BookOpen className="w-4 h-4 text-green-500" />}
            {item.type === 'Q&A' && <MessageSquare className="w-4 h-4 text-purple-500" />}
            <span className="text-xs font-medium">{item.type}</span>
          </div>
          <span className="text-sm text-primary flex-1">{item.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1
            ${item.status === 'approved' ? 'bg-success/10 text-success' : 
              item.status === 'rejected' ? 'bg-error/10 text-error' : 
              'bg-warning/10 text-warning'}`}>
            {item.status === 'approved' ? <Check className="w-3 h-3" /> :
             item.status === 'rejected' ? <X className="w-3 h-3" /> :
             <Clock className="w-3 h-3" />}
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4 text-secondary" /> : <ChevronDown className="w-4 h-4 text-secondary" />}
        </div>
      </div>

      {/* Content */}
      {isOpen && (
        <div className="border-t border-subtle">
          <div className="p-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm space-y-4">
                {item.content?.split('\n\n').map((section, idx) => (
                  <div key={idx} className="space-y-2">
                    {section.split('\n').map((line, lineIdx) => (
                      <div key={lineIdx} className={`${line.endsWith(':') ? 'font-semibold' : ''}`}>
                        {line}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end mt-3">
              <button
                onClick={onEdit}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-subtle hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                <Edit className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={handleReject}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-error/20 bg-error/10 text-error hover:bg-error/20 transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Reject
              </button>
              <button
                onClick={handleApprove}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1
                  ${item.status === 'approved' 
                    ? 'bg-success text-white hover:bg-success/90' 
                    : 'border border-success/20 bg-success/10 text-success hover:bg-success/20'}`}
              >
                <Check className="w-3 h-3" />
                {item.status === 'approved' ? 'Verified' : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add type for toggles
interface Toggles {
  slides: boolean;
  assignments: boolean;
  flashcards: boolean;
}

// Add type for SidebarCard props
interface SidebarCardProps {
  children: React.ReactNode;
}

// Add type for Toggle props
interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

// Add CollapsibleCard component
interface CollapsibleCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleCard({ title, icon, children, defaultOpen = true }: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-surface border border-subtle rounded-xl shadow-sm">
      <div 
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-surface/80 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-sm">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-secondary" />
        ) : (
          <ChevronDown className="w-4 h-4 text-secondary" />
        )}
      </div>
      {isOpen && (
        <div className="p-3 border-t border-subtle">
          {children}
        </div>
      )}
    </div>
  );
}

// Mock lecture content for streaming
const MOCK_LAST_LECTURE_CONTENT = `In our last lecture, we covered Decision Trees and Random Forests, which are fundamental concepts in machine learning.

Key topics we discussed:
• Decision Tree fundamentals
  - Tree structure and nodes
  - Information gain and splitting criteria
  - Handling categorical vs numerical features

• Random Forest concepts
  - Ensemble methods and bagging
  - Feature importance
  - Out-of-bag error estimation

We also worked through practical examples using scikit-learn, demonstrating:
• How to build and train decision trees
• Techniques for preventing overfitting
• Methods for visualizing feature importance

The students had great questions about:
• Choosing the right tree depth
• Handling imbalanced datasets
• When to use Random Forests vs single Decision Trees

For next lecture, we'll be covering Neural Networks, so please review the assigned readings on backpropagation and activation functions.`;

export default function TeacherDashboard() {
  // State for dropdown, chat, toggles, etc.
  // Set default course to CMSC422
  const [selectedCourse, setSelectedCourse] = useState('CMSC422');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [toggles, setToggles] = useState<Toggles>({
    slides: true,
    assignments: false,
    flashcards: true,
  });
  
  // Enhanced approval queue with more details
  // Update approval queue for CMSC422
  const [approvalQueue, setApprovalQueue] = useState<ApprovalItem[]>([
    {
      id: '1',
      type: 'Summary',
      title: 'Lecture 1: Introduction to Machine Learning',
      status: 'pending',
      content: `Introduction to Machine Learning Summary

Key Topics Covered:
• What is Machine Learning?
• Types of Machine Learning
• Supervised vs Unsupervised Learning
• Real-world Applications

Student Questions:
• What is the difference between supervised and unsupervised learning?
• How is machine learning used in real life?

Key Takeaways:
1. Machine learning enables computers to learn from data.
2. Supervised learning uses labeled data, unsupervised does not.
3. Applications include spam detection, image recognition, and recommendations.`
    },
    {
      id: '2',
      type: 'Flashcard',
      title: 'ML Concepts Flashcard Set',
      status: 'pending',
      content: `Flashcard Topics:
• Training vs Test Data
• Model Evaluation Metrics
• Bias-Variance Tradeoff
• Overfitting and Underfitting`
    },
    {
      id: '3',
      type: 'Q&A',
      title: 'Supervised vs Unsupervised Learning',
      status: 'pending',
      content: `Student Question:
"What is the main difference between supervised and unsupervised learning?"

AI Response:
Supervised learning uses labeled data to train models, while unsupervised learning finds patterns in unlabeled data.

Key Differences:
• Supervised: Requires labeled data
• Unsupervised: No labels needed
• Supervised: Used for classification/regression
• Unsupervised: Used for clustering/dimensionality reduction`
    }
  ]);

  // Add todo list state
  // Update todos for CMSC422
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: '1', text: 'Review summary for Lecture 1', completed: false },
    { id: '2', text: 'Approve ML flashcards', completed: false },
    { id: '3', text: 'View top ML student questions', completed: false },
    { id: '4', text: 'Flag inaccurate ML answer', completed: false },
  ]);

  const [isStreaming, setIsStreaming] = useState(false);
  
  // Function to simulate streaming text
  const simulateStreamingResponse = async (text: string) => {
    setIsStreaming(true);
    const words = text.split(' ');
    let currentContent = '';
    
    // Add initial AI message
    const messageId = Date.now().toString();
    setChat(prev => [...prev, {
      id: messageId,
      content: '',
      sender: 'ai',
      timestamp: new Date()
    }]);

    // Simulate streaming word by word
    for (let i = 0; i < words.length; i++) {
      currentContent += words[i] + ' ';
      setChat(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: currentContent.trim() }
            : msg
        )
      );
      // Random delay between 10-50ms for natural feeling
      await new Promise(resolve => setTimeout(resolve, Math.random() * 40 + 10));
    }
    
    setIsStreaming(false);
  };

  // Handle message send with mock streaming
  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;

    // Add user message
    setChat(prev => [...prev, {
      id: Date.now().toString(),
      content: messageContent,
      sender: 'user',
      timestamp: new Date()
    }]);

    // Clear input
    setChatInput('');

    // Check for the specific question about last lecture
    if (messageContent.toLowerCase().includes('what did i teach last lecture') ||
        messageContent.toLowerCase().includes('what was the last lecture')) {
      await simulateStreamingResponse(MOCK_LAST_LECTURE_CONTENT);
    } else {
      // Handle other messages normally
      setChat(prev => [...prev, {
        id: Date.now().toString(),
        content: 'I can help you with questions about your CMSC422 Machine Learning course.',
        sender: 'ai',
        timestamp: new Date()
      }]);
    }
  };

  // Handlers
  const handleToggle = (key: keyof Toggles) => setToggles(t => ({ ...t, [key]: !t[key] }));

  const handleApprove = (id: string) => {
    setApprovalQueue(queue => 
      queue.map(item => 
        item.id === id 
          ? { ...item, status: 'approved' }
          : item
      )
    );
  };

  const handleReject = (id: string) => {
    setApprovalQueue(queue => 
      queue.map(item => 
        item.id === id 
          ? { ...item, status: 'rejected' }
          : item
      )
    );
  };

  const handleEdit = (id: string) => {
    // Implement edit functionality
    console.log('Edit item:', id);
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <div className="h-screen overflow-hidden bg-white text-black flex flex-col font-sans">
      {/* Top: Header with Course Selection, Title, and Profile */}
      <div className="border-b border-black px-6 py-3 bg-surface/80 flex items-center justify-between">
        {/* Left: Course Selection */}
        <div className="flex items-center gap-4">
          <label className="font-semibold text-base flex items-center gap-2" htmlFor="course">
            <BookOpen className="w-4 h-4 text-accent" /> Select Course
          </label>
          <select
            id="course"
            className="border border-black rounded px-2 py-1 bg-white text-black focus:outline-none text-sm"
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
          >
            <option value="CMSC422">CMSC422</option>
          </select>
        </div>

        {/* Center: Dashboard Title */}
        <div className="text-center">
          <h1 className="text-lg font-bold text-primary">Claryfy Teacher Dashboard</h1>
        </div>

        {/* Right: Profile Icon */}
        <div className="flex items-center">
          <div className="w-7 h-7 bg-accent rounded-full flex items-center justify-center cursor-pointer hover:bg-accent/90 transition-colors">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Sidebar Cards */}
        <div className="w-[450px] min-w-[400px] max-w-[500px] flex flex-col gap-4 p-4 bg-surface/50 overflow-y-auto border-r border-black">
          {/* Student Insights Card (Collapsible) */}
          <CollapsibleCard
            title="Student Insights"
            icon={<User className="w-4 h-4 text-accent" />}
          >
            <div className="space-y-4">
              <div>
                <div className="text-base font-semibold text-primary mb-2">Most Confused Topic</div>
                <div className="bg-white border border-subtle rounded-lg p-3 text-sm">
                  Difference between supervised and unsupervised learning
                </div>
              </div>
              <div>
                <div className="text-base font-semibold text-primary mb-2">Top Student Question</div>
                <div className="bg-white border border-subtle rounded-lg p-3 text-sm">
                  What is the difference between supervised and unsupervised learning?
                </div>
              </div>
              <div>
                <div className="text-base font-semibold text-primary mb-2">Usage Stats</div>
                <div className="bg-white border border-subtle rounded-lg p-3 text-sm space-y-2">
                  <div>
                    <span className="font-semibold">Most Used:</span> Lecture 1 Slides
                  </div>
                  <div>
                    <span className="font-semibold">Least Viewed:</span> Week 1 Reading
                  </div>
                  <div>
                    8 students asked about <span className="font-semibold">"bias-variance tradeoff"</span>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleCard>

          {/* To-Do Checklist Card (Collapsible) */}
          <CollapsibleCard
            title="To-Do Checklist"
            icon={<ListChecks className="w-4 h-4 text-accent" />}
          >
            <div className="space-y-2">
              {todos.map(todo => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer text-base"
                  onClick={() => toggleTodo(todo.id)}
                >
                  {todo.completed ? (
                    <CheckSquare className="w-5 h-5 text-success" />
                  ) : (
                    <Square className="w-5 h-5 text-secondary" />
                  )}
                  <span className={todo.completed ? 'line-through text-secondary' : 'text-primary'}>
                    {todo.text}
                  </span>
                </div>
              ))}
            </div>
          </CollapsibleCard>

          {/* Approval Queue Card (Collapsible) */}
          <CollapsibleCard
            title="Approval Queue"
            icon={<Eye className="w-4 h-4 text-accent" />}
          >
            <div className="space-y-2">
              {approvalQueue.map((item) => (
                <ApprovalItem
                  key={item.id}
                  item={item}
                  onApprove={() => handleApprove(item.id)}
                  onReject={() => handleReject(item.id)}
                  onEdit={() => handleEdit(item.id)}
                />
              ))}
            </div>
          </CollapsibleCard>

          {/* Privacy & Controls Card (Collapsible) */}
          <CollapsibleCard
            title="Privacy & Controls"
            icon={<Shield className="w-4 h-4 text-accent" />}
            defaultOpen={false}
          >
            <div className="flex flex-col gap-2">
              <Toggle label="Allow AI to use lecture slides" checked={toggles.slides} onChange={() => handleToggle('slides')} />
              <Toggle label="Allow AI to summarize assignments" checked={toggles.assignments} onChange={() => handleToggle('assignments')} />
              <Toggle label="Share flashcards with students" checked={toggles.flashcards} onChange={() => handleToggle('flashcards')} />
            </div>
          </CollapsibleCard>
        </div>

        {/* Right: Chat Interface */}
        <div className="flex-1 min-w-0 flex flex-col bg-surface/50">
          {/* Chat Header */}
          <div className="p-3 border-b border-black bg-surface flex items-center gap-2 sticky top-0 z-10">
            <MessageSquare className="w-4 h-4 text-accent" />
            <span className="font-semibold text-base">Teacher Chat</span>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-0 py-4 flex flex-col gap-2">
            <div className="max-w-2xl w-full mx-auto flex flex-col gap-3 px-4">
              {chat.length === 0 ? (
                /* Prompt Cards - Styled like ChatGPT interface */
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    className="bg-surface border border-subtle rounded-xl p-4 cursor-pointer hover:bg-surface/80 transition-colors shadow-sm"
                    onClick={async () => {
                      const question = "What did I teach last lecture?";
                      // First add the user message
                      setChat(prev => [...prev, {
                        id: `user-${Date.now()}`,
                        content: question,
                        sender: 'user',
                        timestamp: new Date()
                      }]);
                      // Then trigger the AI response
                      await simulateStreamingResponse(MOCK_LAST_LECTURE_CONTENT);
                    }}
                  >
                    <div className="text-center">
                      <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <BookOpen className="w-5 h-5 text-accent" />
                      </div>
                      <p className="text-base text-primary font-medium">Last lecture recap</p>
                    </div>
                  </div>
                  <div className="bg-surface border border-subtle rounded-xl p-4 cursor-pointer hover:bg-surface/80 transition-colors shadow-sm">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-5 h-5 text-accent" />
                      </div>
                      <p className="text-base text-primary font-medium">Create summary</p>
                    </div>
                  </div>
                  <div className="bg-surface border border-subtle rounded-xl p-4 cursor-pointer hover:bg-surface/80 transition-colors shadow-sm">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <MessageSquare className="w-5 h-5 text-accent" />
                      </div>
                      <p className="text-base text-primary font-medium">Show student questions</p>
                    </div>
                  </div>
                  <div className="bg-surface border border-subtle rounded-xl p-4 cursor-pointer hover:bg-surface/80 transition-colors shadow-sm">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Calendar className="w-5 h-5 text-accent" />
                      </div>
                      <p className="text-base text-primary font-medium">See class grades (preview only)</p>
                    </div>
                  </div>
                </div>
              ) : (
                chat.map((msg, i) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`rounded-2xl shadow-sm px-4 py-2 max-w-[75%] text-sm whitespace-pre-wrap
                        ${msg.sender === 'user'
                          ? 'bg-accent text-black' // Changed from white to accent for user messages
                          : 'bg-white border border-subtle text-primary'}
                      `}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              
              {/* Typing Indicator */}
              {isStreaming && (
                <div className="flex justify-start">
                  <div className="text-primary text-sm">
                    <span className="inline-flex items-center gap-1">
                      Typing
                      <span className="flex gap-0.5">
                        <span className="w-1 h-1 bg-accent rounded-full animate-bounce"></span>
                        <span className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Chat Input */}
          <div className="border-t border-black bg-surface/80 p-4 sticky bottom-0 z-10">
            <div className="flex gap-2">
              <input
                className="flex-1 border border-black rounded-2xl px-4 py-2 bg-white text-black focus:outline-none shadow-sm text-sm"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage(chatInput)}
                disabled={isStreaming}
              />
              <button 
                onClick={() => handleSendMessage(chatInput)}
                disabled={isStreaming}
                className="border border-black rounded-2xl px-4 py-2 bg-black text-white hover:bg-gray-800 shadow-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// SidebarCard component
function SidebarCard({ children }: SidebarCardProps) {
  return (
    <div className="bg-surface border border-subtle rounded-xl shadow-sm p-3">
      {children}
    </div>
  );
}

// Toggle component
function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-black w-4 h-4" />
      <span>{label}</span>
    </label>
  );
} 