import React from 'react';
import { Megaphone, Calendar, User, ExternalLink, X } from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  course_id: number;
  posted_at: string | null;
  author?: {
    display_name: string;
  };
  message: string;
  html_url?: string;
}

interface AnnouncementViewerProps {
  announcement: Announcement;
  onClose: () => void;
}

export default function AnnouncementViewer({ announcement, onClose }: AnnouncementViewerProps) {
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'No date';
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
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 border border-gray-300 rounded-xl flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-gray-700" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate" title={announcement.title}>
              {announcement.title}
            </h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Posted: {formatDate(announcement.posted_at)}</span>
              </div>
              {announcement.author?.display_name && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>by {announcement.author.display_name}</span>
                </div>
              )}
            </div>
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

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
        {/* Message */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-h-96 overflow-y-auto">
          <div className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: announcement.message }}
          />
        </div>

        {/* Canvas Link */}
        {announcement.html_url && (
          <div className="pt-6 border-t border-gray-200">
            <a
              href={announcement.html_url}
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