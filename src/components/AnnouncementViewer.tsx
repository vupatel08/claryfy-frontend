import React from 'react';

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
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-yellow-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">📢</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-black truncate" title={announcement.title}>
              {announcement.title}
            </h2>
            <div className="text-sm text-gray-600">
              Posted: {formatDate(announcement.posted_at)}
              {announcement.author?.display_name && (
                <span className="ml-2">by {announcement.author.display_name}</span>
              )}
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

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
        {/* Message */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
          <div className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: announcement.message }}
          />
        </div>

        {/* Canvas Link */}
        {announcement.html_url && (
          <div className="pt-4 border-t border-gray-200">
            <a
              href={announcement.html_url}
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