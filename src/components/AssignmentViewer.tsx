'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, Calendar, Award, ExternalLink, X, Clock } from 'lucide-react';

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
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 border border-gray-300 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-gray-700" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate" title={assignment.name}>
              {assignment.name}
            </h2>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Assignment Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
        {/* Basic Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-800">Due Date</h3>
            </div>
            <span className="text-sm font-medium text-gray-900">{formatDate(assignment.due_at)}</span>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-800">Points</h3>
            </div>
            <span className="text-sm font-medium text-gray-900">{assignment.points_possible || 'Not specified'}</span>
          </div>
        </div>

        {/* Assignment Description */}
        {assignment.description && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Description
              </h3>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-h-96 overflow-y-auto">
              <div className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: assignment.description }}
              />
            </div>
          </div>
        )}

        {/* Canvas Link */}
        {assignment.html_url && (
          <div className="pt-6 border-t border-gray-200">
            <a
              href={assignment.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              View in Canvas
            </a>
          </div>
        )}
      </div>
    </div>
  );
} 