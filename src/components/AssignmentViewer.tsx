'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Assignment {
  id: number;
  name: string;
  description?: string;
  due_at?: string;
  points_possible?: number;
  course_id: number;
  html_url?: string;
}

interface AssignmentViewerProps {
  assignment: Assignment;
  onClose: () => void;
}

export default function AssignmentViewer({ assignment, onClose }: AssignmentViewerProps) {
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'No due date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-white border-r border-gray-200">
      {/* Assignment Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">📝</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-black truncate" title={assignment.name}>
              {assignment.name}
            </h2>
            <div className="text-sm text-gray-600">
              {assignment.points_possible ? `${assignment.points_possible} points` : 'No points'} • Due: {formatDate(assignment.due_at)}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Close"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Assignment Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Due Date</h3>
              <span className="text-sm text-black">{formatDate(assignment.due_at)}</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Points</h3>
              <span className="text-sm text-black">{assignment.points_possible || 'Not specified'}</span>
            </div>
          </div>
        </div>

        {/* Assignment Description */}
        {assignment.description && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-black border-b border-gray-200 pb-2">
              📄 Description
            </h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: assignment.description }}
              />
            </div>
          </div>
        )}

        {/* Canvas Link */}
        {assignment.html_url && (
          <div className="pt-4 border-t border-gray-200">
            <a
              href={assignment.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              View in Canvas
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>
  );
} 