'use client';

import { useState } from 'react';

export default function TeacherDashboard() {
  const [expandedSections, setExpandedSections] = useState({
    summary: false,
    flashcards: false,
    qa: false
  });
  
  const [verificationStatus, setVerificationStatus] = useState({
    summary: 'Not verified',
    flashcards: 'Verified',
    qa: 'Not verified'
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleVerification = (section: keyof typeof verificationStatus) => {
    setVerificationStatus(prev => ({
      ...prev,
      [section]: prev[section] === 'Verified' ? 'Not verified' : 'Verified'
    }));
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Educate Teacher Dashboard</h1>
            <p className="text-lg text-gray-600 mt-2">Live Insights from Your Canvas Class</p>
          </div>
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Side - Dashboard */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              
              {/* Section 1: Class Overview */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="mr-3">📚</span>
                  Class Overview
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Course Info */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Course Name: Intro to Psychology</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-blue-900">Total AI Questions This Week</span>
                          <span className="text-2xl font-bold text-blue-600">120</span>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-green-900 mb-2">Study Materials Generated</div>
                        <div className="flex justify-between">
                          <span className="text-green-700">📝 65 summaries</span>
                          <span className="text-green-700">🃏 42 flashcard sets</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Top Topics */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Top 3 Topics Students Asked About</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-purple-50 rounded-lg p-3">
                        <span className="font-medium text-purple-900">Cognitive Biases</span>
                        <div className="flex items-center">
                          <div className="w-24 bg-purple-200 rounded-full h-2 mr-3">
                            <div className="bg-purple-600 h-2 rounded-full" style={{width: '90%'}}></div>
                          </div>
                          <span className="text-purple-700 font-semibold">45</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between bg-indigo-50 rounded-lg p-3">
                        <span className="font-medium text-indigo-900">Classical Conditioning</span>
                        <div className="flex items-center">
                          <div className="w-24 bg-indigo-200 rounded-full h-2 mr-3">
                            <div className="bg-indigo-600 h-2 rounded-full" style={{width: '60%'}}></div>
                          </div>
                          <span className="text-indigo-700 font-semibold">30</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between bg-teal-50 rounded-lg p-3">
                        <span className="font-medium text-teal-900">Memory Models</span>
                        <div className="flex items-center">
                          <div className="w-24 bg-teal-200 rounded-full h-2 mr-3">
                            <div className="bg-teal-600 h-2 rounded-full" style={{width: '56%'}}></div>
                          </div>
                          <span className="text-teal-700 font-semibold">28</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Student Engagement */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="mr-3">👥</span>
                  Student Engagement
                </h2>
                
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="min-w-full">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Student ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Questions Asked</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Flashcard Usage</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Summary Views</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Engagement Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-gray-900">Student001</td>
                        <td className="py-4 px-4 text-gray-700">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">12</span>
                        </td>
                        <td className="py-4 px-4 text-gray-700">3 decks</td>
                        <td className="py-4 px-4 text-gray-700">5 summaries</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div className="bg-green-600 h-2 rounded-full" style={{width: '87%'}}></div>
                            </div>
                            <span className="text-green-700 font-semibold">87</span>
                          </div>
                        </td>
                      </tr>
                      
                      <tr className="hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-gray-900">Student024</td>
                        <td className="py-4 px-4 text-gray-700">
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">5</span>
                        </td>
                        <td className="py-4 px-4 text-gray-700">1 deck</td>
                        <td className="py-4 px-4 text-gray-700">3 summaries</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div className="bg-yellow-600 h-2 rounded-full" style={{width: '64%'}}></div>
                            </div>
                            <span className="text-yellow-700 font-semibold">64</span>
                          </div>
                        </td>
                      </tr>
                      
                      <tr className="hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-gray-900">Student109</td>
                        <td className="py-4 px-4 text-gray-700">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">20</span>
                        </td>
                        <td className="py-4 px-4 text-gray-700">5 decks</td>
                        <td className="py-4 px-4 text-gray-700">8 summaries</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div className="bg-green-600 h-2 rounded-full" style={{width: '91%'}}></div>
                            </div>
                            <span className="text-green-700 font-semibold">91</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 3: Grades Overview */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="mr-3">📊</span>
                  Grades Overview
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Grade Distribution */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Current Grade Distribution</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-green-50 rounded-lg p-3">
                        <span className="font-medium text-green-900">A (90-100%)</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-green-200 rounded-full h-3 mr-3">
                            <div className="bg-green-600 h-3 rounded-full" style={{width: '35%'}}></div>
                          </div>
                          <span className="text-green-700 font-semibold">15 students</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                        <span className="font-medium text-blue-900">B (80-89%)</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-blue-200 rounded-full h-3 mr-3">
                            <div className="bg-blue-600 h-3 rounded-full" style={{width: '45%'}}></div>
                          </div>
                          <span className="text-blue-700 font-semibold">18 students</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between bg-yellow-50 rounded-lg p-3">
                        <span className="font-medium text-yellow-900">C (70-79%)</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-yellow-200 rounded-full h-3 mr-3">
                            <div className="bg-yellow-600 h-3 rounded-full" style={{width: '25%'}}></div>
                          </div>
                          <span className="text-yellow-700 font-semibold">10 students</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between bg-red-50 rounded-lg p-3">
                        <span className="font-medium text-red-900">D & F (&lt;70%)</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-red-200 rounded-full h-3 mr-3">
                            <div className="bg-red-600 h-3 rounded-full" style={{width: '10%'}}></div>
                          </div>
                          <span className="text-red-700 font-semibold">4 students</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-700">
                        <p><strong>Class Average:</strong> 83.2%</p>
                        <p><strong>Median:</strong> 85.5%</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Assignments */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Assignments</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      <div className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">Midterm Exam</h4>
                          <span className="text-sm text-gray-500">Oct 20</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">47/47 submitted</span>
                          <div className="text-sm">
                            <span className="text-green-600 font-medium">Avg: 87.3%</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{width: '87%'}}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">Classical Conditioning Quiz</h4>
                          <span className="text-sm text-gray-500">Oct 15</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">45/47 submitted</span>
                          <div className="text-sm">
                            <span className="text-blue-600 font-medium">Avg: 82.1%</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{width: '82%'}}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">Memory Models Essay</h4>
                          <span className="text-sm text-gray-500">Oct 10</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">47/47 submitted</span>
                          <div className="text-sm">
                            <span className="text-purple-600 font-medium">Avg: 89.4%</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{width: '89%'}}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">Cognitive Bias Analysis</h4>
                          <span className="text-sm text-gray-500">Oct 5</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">44/47 submitted</span>
                          <div className="text-sm">
                            <span className="text-orange-600 font-medium">Avg: 85.7%</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full" style={{width: '86%'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700">
                        View Full Gradebook
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Students Needing Attention */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">⚠️</span>
                    Students Needing Attention
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-red-900">Student024</span>
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">At Risk</span>
                      </div>
                      <p className="text-sm text-red-700">Current grade: 68%</p>
                      <p className="text-xs text-red-600 mt-1">Missing 2 assignments</p>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-yellow-900">Student037</span>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Watch</span>
                      </div>
                      <p className="text-sm text-yellow-700">Current grade: 72%</p>
                      <p className="text-xs text-yellow-600 mt-1">Low quiz scores</p>
                    </div>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-orange-900">Student042</span>
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Follow Up</span>
                      </div>
                      <p className="text-sm text-orange-700">Current grade: 75%</p>
                      <p className="text-xs text-orange-600 mt-1">Declining trend</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Sample AI Output */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="mr-3">🤖</span>
                  Sample AI Output
                </h2>
                
                <div className="space-y-4">
                  {/* Auto-generated Lecture Summary */}
                  <div className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleSection('summary')}
                      className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50 rounded-t-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">📄 Auto-generated Lecture Summary</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVerification('summary');
                          }}
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            verificationStatus.summary === 'Verified'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {verificationStatus.summary}
                        </button>
                      </div>
                      <span className="text-gray-500">
                        {expandedSections.summary ? '−' : '+'}
                      </span>
                    </button>
                    {expandedSections.summary && (
                      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 max-h-64 overflow-y-auto">
                        <div className="text-sm text-gray-700">
                          <h4 className="font-semibold mb-2">Lecture 5: Classical Conditioning - October 15, 2024</h4>
                          <div className="space-y-2">
                            <p><strong>Key Concepts:</strong></p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                              <li>Unconditioned Stimulus (UCS) and Response (UCR)</li>
                              <li>Conditioned Stimulus (CS) and Response (CR)</li>
                              <li>Acquisition, Extinction, and Spontaneous Recovery</li>
                              <li>Stimulus Generalization and Discrimination</li>
                            </ul>
                            <p><strong>Examples Discussed:</strong> Pavlov's dogs, Little Albert experiment, taste aversion</p>
                            <p><strong>Next Class:</strong> Operant conditioning and reinforcement schedules</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Flashcard Deck */}
                  <div className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleSection('flashcards')}
                      className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50 rounded-t-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">🃏 Popular Flashcard Deck: "Memory Models"</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVerification('flashcards');
                          }}
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            verificationStatus.flashcards === 'Verified'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {verificationStatus.flashcards}
                        </button>
                      </div>
                      <span className="text-gray-500">
                        {expandedSections.flashcards ? '−' : '+'}
                      </span>
                    </button>
                    {expandedSections.flashcards && (
                      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 max-h-64 overflow-y-auto">
                        <div className="space-y-3 text-sm">
                          <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                            <p><strong>Q:</strong> What are the three stages of the Atkinson-Shiffrin memory model?</p>
                            <p className="mt-1 text-gray-600"><strong>A:</strong> Sensory memory, short-term memory, and long-term memory</p>
                          </div>
                          <div className="bg-white p-3 rounded border-l-4 border-green-400">
                            <p><strong>Q:</strong> How long does information typically stay in short-term memory?</p>
                            <p className="mt-1 text-gray-600"><strong>A:</strong> About 15-30 seconds without rehearsal</p>
                          </div>
                          <div className="bg-white p-3 rounded border-l-4 border-purple-400">
                            <p><strong>Q:</strong> What is the difference between explicit and implicit memory?</p>
                            <p className="mt-1 text-gray-600"><strong>A:</strong> Explicit memory is conscious and declarative; implicit memory is unconscious and procedural</p>
                          </div>
                          <p className="text-gray-500 text-xs">+ 12 more cards in this deck</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Course-specific AI Q&A */}
                  <div className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleSection('qa')}
                      className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50 rounded-t-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">💬 Recent Student Q&A</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVerification('qa');
                          }}
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            verificationStatus.qa === 'Verified'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {verificationStatus.qa}
                        </button>
                      </div>
                      <span className="text-gray-500">
                        {expandedSections.qa ? '−' : '+'}
                      </span>
                    </button>
                    {expandedSections.qa && (
                      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 max-h-64 overflow-y-auto">
                        <div className="space-y-4 text-sm">
                          <div className="bg-white p-3 rounded-lg">
                            <p className="font-medium text-blue-600">Student Question:</p>
                            <p className="mt-1">"Can you explain the difference between negative reinforcement and punishment?"</p>
                            <p className="font-medium text-green-600 mt-2">AI Response:</p>
                            <p className="mt-1 text-gray-700">Negative reinforcement <em>increases</em> behavior by removing something unpleasant, while punishment <em>decreases</em> behavior by adding something unpleasant or removing something pleasant. For example, taking aspirin (behavior) to remove a headache (negative reinforcement) vs. getting a speeding ticket (punishment) to reduce speeding.</p>
                          </div>
                          
                          <div className="bg-white p-3 rounded-lg">
                            <p className="font-medium text-blue-600">Student Question:</p>
                            <p className="mt-1">"I'm confused about the availability heuristic. Can you give me a real-world example?"</p>
                            <p className="font-medium text-green-600 mt-2">AI Response:</p>
                            <p className="mt-1 text-gray-700">The availability heuristic is when we judge probability by how easily examples come to mind. For instance, people often overestimate the danger of shark attacks because they're memorable and widely reported, even though you're statistically more likely to be injured by a vending machine!</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Chat Interface */}
        <div className="w-1/2 bg-white border-l border-gray-200 flex flex-col min-h-0">
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">💬</span>
              AI Teaching Assistant
            </h3>
            <p className="text-sm text-gray-600">Create announcements, assignments, and more</p>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {/* User Message */}
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
                <p className="text-sm">Create an announcement telling students to review these materials using links:</p>
                <div className="mt-2 text-xs bg-blue-700 bg-opacity-50 rounded p-2">
                  <p>• Cognitive Biases reading (Ch. 7)</p>
                  <p>• Classical Conditioning videos</p>
                  <p>• Memory Models flashcards</p>
                </div>
              </div>
            </div>

            {/* AI Response */}
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 rounded-lg p-3 max-w-sm">
                <p className="text-sm mb-3">I'll create an announcement for your Psychology class. Here's what will be sent to students:</p>
                
                <div className="bg-white border border-gray-200 rounded p-3 text-xs mb-3">
                  <p className="font-semibold mb-2">📚 Important Study Materials - Review Before Next Class</p>
                  <p className="mb-2">Hello everyone! Please review the following materials before our next session:</p>
                  <ul className="list-disc list-inside space-y-1 mb-2">
                    <li><a href="#" className="text-blue-600 underline">Cognitive Biases (Chapter 7)</a> - Focus on availability heuristic and confirmation bias</li>
                    <li><a href="#" className="text-blue-600 underline">Classical Conditioning Video Series</a> - Pavlov's experiments and modern applications</li>
                    <li><a href="#" className="text-blue-600 underline">Memory Models Flashcards</a> - Practice Atkinson-Shiffrin model concepts</li>
                  </ul>
                  <p>These materials will help you prepare for our upcoming discussion on learning theories. Feel free to ask questions in class!</p>
                </div>

                <div className="flex space-x-2">
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700">
                    ✓ Send Announcement
                  </button>
                  <button className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs font-medium hover:bg-gray-400">
                    Edit
                  </button>
                </div>
              </div>
            </div>

            {/* Follow-up user message */}
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
                <p className="text-sm">Yes, send the announcement</p>
              </div>
            </div>

            {/* AI Confirmation */}
            <div className="flex justify-start">
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 max-w-sm">
                <p className="text-sm">✅ Announcement sent successfully to all 47 students in "Intro to Psychology"</p>
                <p className="text-xs text-green-600 mt-1">Sent at 2:34 PM • Students will receive email notifications</p>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Ask me to create content, send messages, or analyze student data..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Demo mode - Chat functionality disabled</p>
          </div>
        </div>
      </div>
    </div>
  );
} 