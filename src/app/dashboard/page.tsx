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
import AssignmentViewer from '../../components/AssignmentViewer';
import AnnouncementViewer from '../../components/AnnouncementViewer';

export default function Dashboard() {
  const [canvasData, setCanvasData] = useState<CanvasData | null>(null);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [mockRecordingsInitialized, setMockRecordingsInitialized] = useState(false);
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
    recordings: true,
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'courses' | 'profile'>('courses');
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);
  const [closedRecentBoxes, setClosedRecentBoxes] = useState<Set<string>>(new Set());
  const [viewingFile, setViewingFile] = useState<File | null>(null);
  const [selectedRecording, setSelectedRecording] = useState<any | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(null);
  const { user, isAuthenticated } = useAuth();
  
  // Chat interface ref for communication from sidebar
  const chatInterfaceRef = useRef<ChatGPTStyleInterfaceRef>(null);

  const API_URL = process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_API_URL 
    : 'http://localhost:3000';

  // Add mock CMSC422 recordings
  const mockCMSC422Recordings = [
    {
      id: 'rec1',
      title: 'Lecture 1: Introduction to Machine Learning',
      summary: `# Introduction to Machine Learning

## Course Overview
- Welcome to CMSC422: Introduction to Machine Learning
- Course structure and expectations
- Overview of assignments and projects
- Required background in statistics and programming

## What is Machine Learning?
- Definition and core concepts
- Historical perspective and evolution
- Relationship to artificial intelligence and statistics
- Current state of the field and future directions

## Types of Machine Learning
### Supervised Learning
- Classification problems
  * Binary classification
  * Multi-class classification
  * Examples: spam detection, image recognition
- Regression problems
  * Continuous value prediction
  * Examples: house price prediction, stock market forecasting

### Unsupervised Learning
- Clustering
  * K-means
  * Hierarchical clustering
- Dimensionality reduction
  * Principal Component Analysis (PCA)
  * t-SNE

### Reinforcement Learning
- Basic concepts
- Real-world applications
- Recent advances in the field

## Key Machine Learning Concepts
### Training Data vs Test Data
- Importance of data splitting
- Cross-validation techniques
- Avoiding data leakage

### Model Evaluation
- Accuracy metrics
- Precision and recall
- ROC curves and AUC
- F1 score

### Bias-Variance Tradeoff
- Understanding underfitting
- Dealing with overfitting
- Model complexity vs performance

## Real-world Applications
### Healthcare
- Disease diagnosis
- Drug discovery
- Patient outcome prediction

### Finance
- Fraud detection
- Risk assessment
- Algorithmic trading

### Technology
- Computer vision
- Natural language processing
- Recommendation systems

## Tools and Technologies
- Python ecosystem for ML
- Popular libraries: scikit-learn, TensorFlow, PyTorch
- Development environments and notebooks

## Next Steps
- Reading assignments
- First programming assignment overview
- Preview of next lecture on decision trees`,
      transcription: `Welcome everyone to CMSC422, Introduction to Machine Learning. I'm excited to begin this journey with you into one of the most dynamic and rapidly evolving fields in computer science.

Before we dive into the technical content, let's talk about what you can expect from this course. We'll be covering the fundamental concepts of machine learning, from basic algorithms to modern approaches. You'll need a solid foundation in probability, statistics, and Python programming.

Let's start by understanding what machine learning actually is. At its core, machine learning is about creating systems that can learn from data. Unlike traditional programming where we write explicit rules, in machine learning, we create models that can identify patterns and make decisions based on examples.

The field of machine learning can be broadly categorized into three main types: supervised learning, unsupervised learning, and reinforcement learning. Let's break these down...

[Continues with detailed explanations of each concept, including examples and interactive discussions with students]

Now, let's look at some real-world applications. Who here uses Netflix or Spotify? Their recommendation systems are prime examples of machine learning in action. Your social media feeds, email spam filters, and even the face recognition on your phones – all of these use machine learning algorithms.

For our first assignment, you'll be implementing a simple classification algorithm. This will help you understand the basic workflow of a machine learning project, from data preprocessing to model evaluation. Don't worry if some of these concepts seem abstract right now – we'll be diving deeper into each topic throughout the semester.

Remember, machine learning is not just about algorithms and mathematics; it's about solving real-world problems. As we progress through this course, I want you to think about how you might apply these concepts to problems you're passionate about.

Any questions before we move on to discussing the specific types of machine learning in more detail?

[Addresses student questions about prerequisites and course expectations]

Excellent questions! Now, let's dive deeper into supervised learning, which will be our focus for the next few weeks...`,
      duration: 2700,
      status: 'completed',
      created_at: '2024-03-10T14:00:00Z',
      course_id: 422,
      verified: true
    },
    {
      id: 'rec2',
      title: 'Lecture 2: Decision Trees and Random Forests',
      summary: `# Decision Trees and Random Forests

## Decision Trees: Fundamentals
### Basic Concepts
- Tree structure and terminology
- Nodes, branches, and leaves
- Decision rules and splitting criteria
- Path from root to leaf

### Building Decision Trees
- Recursive partitioning
- Feature selection
- Splitting criteria:
  * Information gain
  * Gini impurity
  * Entropy measures
- Stopping criteria and tree depth

### Tree Properties
- Interpretability advantages
- Handling missing values
- Categorical vs numerical features
- Computational complexity

## Advanced Decision Tree Concepts
### Pruning Techniques
- Pre-pruning (early stopping)
- Post-pruning
- Cost complexity pruning
- Validation approaches

### Handling Overfitting
- Tree depth control
- Minimum samples per leaf
- Maximum features
- Cross-validation strategies

## Random Forests
### Ensemble Methods Overview
- Wisdom of crowds in machine learning
- Bagging vs boosting
- Voting mechanisms
- Parallel vs sequential ensembles

### Random Forest Algorithm
- Bootstrap aggregating (bagging)
- Random feature selection
- Out-of-bag (OOB) error
- Parallel training benefits

### Feature Importance
- Mean decrease impurity
- Permutation importance
- Feature selection techniques
- Visualization methods

## Implementation and Best Practices
### Scikit-learn Implementation
- DecisionTreeClassifier
- RandomForestClassifier
- Important parameters
- Cross-validation

### Hyperparameter Tuning
- Grid search
- Random search
- Bayesian optimization
- Common parameters to tune

### Model Evaluation
- Classification metrics
- Regression metrics
- Feature importance plots
- Tree visualization

## Real-world Applications
### Financial Decision Making
- Credit risk assessment
- Fraud detection
- Portfolio management

### Medical Diagnosis
- Disease prediction
- Treatment recommendation
- Patient risk stratification

### Environmental Science
- Species classification
- Habitat prediction
- Climate change impact

## Practical Considerations
### Scalability
- Memory usage
- Training time
- Prediction speed
- Distributed training

### Limitations
- Handling high dimensionality
- Dealing with imbalanced data
- Extrapolation challenges
- Categorical variable encoding

## Hands-on Exercise Preview
- Dataset introduction
- Implementation steps
- Common pitfalls
- Evaluation criteria`,
      transcription: `Welcome back, everyone! Today we're diving into one of the most intuitive yet powerful algorithms in machine learning: Decision Trees and their ensemble counterpart, Random Forests.

Let's start with a simple example. Imagine you're trying to decide whether to play tennis based on weather conditions. A decision tree would create a series of yes/no questions: Is it raining? Is it humid? Is it windy? Each answer leads you down a different path until you reach a final decision.

[Draws decision tree example on the board]

This intuitive nature of decision trees is one of their biggest advantages. Unlike many other machine learning algorithms that act as black boxes, decision trees give us clear, interpretable rules for their decisions.

Now, let's talk about how we actually build these trees. The key concept here is recursive partitioning. At each node, we're trying to find the best question to ask – the best feature to split on – that will give us the most information about our target variable.

[Demonstrates calculation of information gain and Gini impurity]

One of the challenges with decision trees is that they can overfit the training data. They might create very specific rules that work perfectly for our training data but fail to generalize to new cases. This is where Random Forests come in...

[Explains the concept of ensemble methods and bagging]

Random Forests address this overfitting problem by creating multiple trees, each trained on a random subset of the data and features. It's like asking multiple experts for their opinion and then taking a vote.

Let's look at some code examples. Open up your laptops and follow along as we implement this in scikit-learn...

[Walks through code implementation and parameter tuning]

Remember, while Random Forests often perform better than single decision trees, they sacrifice some interpretability. In situations where you need to explain your model's decisions, like in medical diagnosis or loan approval, you might still prefer a single, well-pruned decision tree.

Now, let's talk about feature importance. One of the great advantages of tree-based methods is that they can tell us which features are most important for making predictions...

[Demonstrates feature importance visualization]

For next week's assignment, you'll be implementing both a decision tree and a random forest on a real-world dataset. Pay special attention to the hyperparameter tuning section we just covered – it will be crucial for getting good performance.

Any questions about decision trees or random forests before we move on to the practical exercise?

[Addresses student questions about entropy calculation and tree visualization]

Excellent questions! Now, let's break into groups and work on a practical example...`,
      duration: 2850,
      status: 'completed',
      created_at: '2024-03-12T14:00:00Z',
      course_id: 422,
      verified: true
    },
    {
      id: 'rec3',
      title: 'Lecture 3: Neural Networks',
      summary: `# Neural Networks: From Perceptrons to Deep Learning

## Foundations of Neural Networks
### Historical Context
- Biological inspiration
- Early developments
  * McCulloch-Pitts neuron
  * Rosenblatt's perceptron
- AI winters and renaissance
- Deep learning revolution

### Basic Building Blocks
#### Neurons (Perceptrons)
- Input connections
- Weights and biases
- Activation functions
  * Sigmoid
  * ReLU
  * Tanh
  * Softmax
- Output computation

#### Network Architecture
- Layers and their purposes
- Feed-forward networks
- Network depth and width
- Connectivity patterns

## Deep Learning Fundamentals
### Forward Propagation
- Matrix operations
- Layer computations
- Activation functions
- Output generation

### Backpropagation
- Chain rule application
- Gradient computation
- Error propagation
- Weight updates

### Loss Functions
- Mean Squared Error
- Cross-Entropy
- Custom loss functions
- Loss landscapes

## Training Neural Networks
### Optimization Algorithms
- Gradient Descent variants
  * Batch GD
  * Stochastic GD
  * Mini-batch GD
- Momentum
- Adam optimizer
- Learning rate schedules

### Regularization Techniques
- Dropout
- L1/L2 regularization
- Batch normalization
- Early stopping

### Hyperparameter Tuning
- Network architecture
- Learning rate
- Batch size
- Initialization methods

## Advanced Architectures
### Convolutional Neural Networks (CNNs)
- Convolution operations
- Pooling layers
- Feature maps
- Popular architectures
  * LeNet
  * AlexNet
  * VGG
  * ResNet

### Recurrent Neural Networks (RNNs)
- Sequential data processing
- Hidden state
- Vanishing gradients
- LSTM and GRU cells

### Transformers
- Attention mechanism
- Self-attention
- Multi-head attention
- Position encoding

## Practical Implementation
### Deep Learning Frameworks
- PyTorch
- TensorFlow
- Framework comparison
- Ecosystem tools

### GPU Acceleration
- CUDA basics
- Memory management
- Batch processing
- Multi-GPU training

### Best Practices
- Data preprocessing
- Model checkpointing
- Experiment tracking
- Deployment considerations

## Applications and Case Studies
### Computer Vision
- Image classification
- Object detection
- Semantic segmentation
- Style transfer

### Natural Language Processing
- Text classification
- Machine translation
- Question answering
- Language generation

### Generative Models
- Autoencoders
- GANs
- Diffusion models
- Neural style transfer

## Future Directions
### Emerging Trends
- Few-shot learning
- Self-supervised learning
- Neural architecture search
- Efficient architectures

### Ethical Considerations
- Bias in neural networks
- Environmental impact
- Privacy concerns
- Responsible AI practices`,
      transcription: `Welcome to our lecture on Neural Networks! Today we're diving into one of the most fascinating and powerful concepts in machine learning. Neural networks have revolutionized the field of AI, enabling breakthroughs in everything from image recognition to language translation.

Let's start with the fundamentals. Neural networks are inspired by the human brain, but it's important to understand that this is a very loose inspiration. We're not actually replicating biological neurons – we're using a mathematical abstraction that captures some key properties of information processing.

[Draws neural network diagram on board]

At its core, a neural network is built from simple building blocks called neurons or perceptrons. Each neuron takes multiple inputs, applies weights to them, adds a bias term, and then passes the result through an activation function.

Let's write out the mathematical formula for a single neuron:
output = f(Σ(w_i * x_i) + b)
where f is our activation function, w_i are the weights, x_i are the inputs, and b is the bias term.

[Demonstrates calculation with simple example]

Now, the magic of neural networks comes from connecting many of these neurons together in layers. The term "deep learning" simply refers to neural networks with multiple layers between the input and output.

One of the most important concepts to understand is backpropagation. This is how neural networks learn. When we make a prediction, we calculate the error and then propagate that error backward through the network, adjusting weights to minimize future errors.

[Walks through backpropagation example]

Let's talk about activation functions. The choice of activation function is crucial for the network's ability to learn. In the early days, people used sigmoid functions, but today ReLU (Rectified Linear Unit) is more common. Can anyone tell me why?

[Discusses student responses about vanishing gradients]

Excellent points! Now, let's open up PyTorch and implement a simple neural network together...

[Live coding session demonstrating neural network implementation]

One of the biggest challenges in training neural networks is choosing the right hyperparameters. Let's talk about some common pitfalls and how to avoid them...

[Discusses learning rate selection, batch size, and architecture decisions]

Now, let's look at some more advanced architectures. Who here has heard of CNNs or Convolutional Neural Networks?

[Explains CNNs with visual examples]

These specialized architectures have revolutionized computer vision. Similarly, RNNs and more recently Transformers have revolutionized natural language processing.

Before we end, let's discuss some ethical considerations. Neural networks are powerful tools, but they can also perpetuate biases present in training data. As future AI practitioners, you need to be aware of these issues...

[Discusses ethical implications and responsible AI practices]

For next week's assignment, you'll be implementing a neural network from scratch, then comparing it with a PyTorch implementation. This will help you understand both the theoretical foundations and practical considerations.

Any questions before we wrap up?

[Addresses questions about gradient descent and optimization techniques]

Excellent questions! Remember to review the supplementary materials on the course website, especially the interactive visualizations of backpropagation...`,
      duration: 3000,
      status: 'completed',
      created_at: '2024-03-14T14:00:00Z',
      course_id: 422,
      verified: true
    }
  ];

  // Move mock data initialization into useEffect
  useEffect(() => {
    if (!mockRecordingsInitialized) {
      // Initialize mock data with the current course ID if it's CMSC422
        const selectedCourse = canvasData?.courses.find(course => course.id === selectedCourseId);
      if (selectedCourse && selectedCourse.longName.includes('CMSC422')) {
        const mockData = mockCMSC422Recordings.map(rec => ({
          ...rec,
          course_id: selectedCourseId
        }));
        setRecordings(mockData);
        console.log('📚 Initialized mock CMSC422 recordings:', mockData.length);
      }
      setMockRecordingsInitialized(true);
    }
  }, [canvasData, selectedCourseId, mockRecordingsInitialized]);

  // Modify fetchRecordings to only handle course changes
  const fetchRecordings = () => {
    const selectedCourse = canvasData?.courses.find(course => course.id === selectedCourseId);
    if (selectedCourse && selectedCourse.longName.includes('CMSC422')) {
      // If we're switching to CMSC422, make sure mock data is loaded
      if (recordings.length === 0) {
        const mockData = mockCMSC422Recordings.map(rec => ({
          ...rec,
          course_id: selectedCourseId
        }));
        setRecordings(mockData);
        console.log('📚 Loaded mock CMSC422 recordings:', mockData.length);
      }
    } else {
      // For non-CMSC422 courses, show empty
      setRecordings([]);
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

  // Keep the course selection effect
  useEffect(() => {
    if (selectedCourseId) {
      fetchRecordings();
    }
  }, [selectedCourseId]);

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

  const toggleSection = (section: 'assignments' | 'announcements' | 'files' | 'recordings') => {
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
    // Close all other viewers
    setSelectedRecording(null);
    setSelectedAssignment(null);
    setSelectedAnnouncement(null);
    // Open file viewer
    setViewingFile(file);
    setSidebarCollapsed(true); // Close sidebar when opening file
  };

  const closeFile = () => {
    setViewingFile(null);
    setSidebarCollapsed(false); // Reopen sidebar when closing file
  };

  const openRecording = (recording: any) => {
    // Close all other viewers
    setViewingFile(null);
    setSelectedAssignment(null);
    setSelectedAnnouncement(null);
    // Open recording viewer
    setSelectedRecording(recording);
    setSidebarCollapsed(true); // Close sidebar when opening recording
  };

  const closeRecording = () => {
    setSelectedRecording(null);
    setSidebarCollapsed(false); // Reopen sidebar when closing recording
  };

  const openAssignment = (assignment: any) => {
    // Close all other viewers
    setSelectedAnnouncement(null);
    setViewingFile(null);
    setSelectedRecording(null);
    // Open assignment viewer
    setSelectedAssignment(assignment);
    setSidebarCollapsed(true); // Close sidebar when opening assignment
  };

  const closeAssignment = () => {
    setSelectedAssignment(null);
    setSidebarCollapsed(false); // Reopen sidebar when closing assignment
  };

  const openAnnouncement = (announcement: any) => {
    // Close all other viewers
    setSelectedAssignment(null);
    setViewingFile(null);
    setSelectedRecording(null);
    // Open announcement viewer
    setSelectedAnnouncement(announcement);
    setSidebarCollapsed(true); // Close sidebar when opening announcement
  };

  const closeAnnouncement = () => {
    setSelectedAnnouncement(null);
    setSidebarCollapsed(false); // Reopen sidebar when closing announcement
  };

  const getFileIcon = (file: File): string => {
    const contentType = file.content_type || '';
    const mimeClass = file.mime_class || '';
    
    if (contentType.includes('pdf')) return 'FileText';
    if (contentType.includes('word') || mimeClass === 'doc') return 'FileText';
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) return 'FileSpreadsheet';
    if (contentType.includes('powerpoint') || contentType.includes('presentation')) return 'Presentation';
    if (contentType.includes('image') || mimeClass === 'image') return 'Image';
    if (contentType.includes('video') || mimeClass === 'video') return 'Video';
    if (contentType.includes('audio') || mimeClass === 'audio') return 'FileAudio';
    if (contentType.includes('zip') || contentType.includes('archive')) return 'Archive';
    if (contentType.includes('text') || mimeClass === 'text') return 'FileText';
    if (contentType.includes('html') || mimeClass === 'html') return 'Globe';
    if (contentType.includes('javascript') || contentType.includes('json')) return 'Settings';
    return 'Archive';
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
    <div className="min-h-screen bg-background flex">
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
        openAssignment={openAssignment}
        openAnnouncement={openAnnouncement}
      />

      {/* Main Content */}
      <div className="flex-1 bg-background min-w-0 flex">
        {/* Mobile sidebar overlay */}
        {!sidebarCollapsed && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}

        {/* Left Side Viewers */}
        {(selectedRecording || viewingFile || selectedAssignment || selectedAnnouncement) && (
          <div className="w-1/2 h-screen bg-surface">
            {selectedRecording && (
              <RecordingViewer
                recording={selectedRecording}
                onClose={closeRecording}
              />
            )}
            {viewingFile && (
              <FileViewer
                file={viewingFile}
                onClose={closeFile}
              />
            )}
            {selectedAssignment && (
              <AssignmentViewer
                assignment={selectedAssignment}
                onClose={closeAssignment}
              />
            )}
            {selectedAnnouncement && (
              <AnnouncementViewer
                announcement={selectedAnnouncement}
                onClose={closeAnnouncement}
              />
            )}
          </div>
        )}

        {/* ChatGPT Style Interface - Right Side */}
        <div className={`${(selectedRecording || viewingFile || selectedAssignment || selectedAnnouncement) ? "w-1/2" : "w-full"} h-screen bg-background`}>
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
            selectedAssignment={selectedAssignment}
            openAssignment={openAssignment}
            closeAssignment={closeAssignment}
            selectedAnnouncement={selectedAnnouncement}
            openAnnouncement={openAnnouncement}
            closeAnnouncement={closeAnnouncement}
            isConnecting={isConnecting}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />
        </div>
      </div>


    </div>
  );
} 