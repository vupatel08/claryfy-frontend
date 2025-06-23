'use client';

import { File, Assignment, Announcement } from '../types/canvas';

interface RecentContentProps {
  assignments: Assignment[];
  announcements: Announcement[];
  files: File[];
  expandedItems: {[key: string]: boolean};
  toggleExpanded: (type: string, id: number) => void;
  formatDate: (dateString: string | null) => string;
  formatFileSize: (bytes: number) => string;
  getFileIcon: (file: File) => string;
  openFile: (file: File) => void;
  closedRecentBoxes: Set<string>;
  closeRecentBox: (boxType: string) => void;
}

export default function RecentContent({
  assignments,
  announcements,
  files,
  expandedItems,
  toggleExpanded,
  formatDate,
  formatFileSize,
  getFileIcon,
  openFile,
  closedRecentBoxes,
  closeRecentBox,
}: RecentContentProps) {

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Recent Assignments */}
      {!closedRecentBoxes.has('assignments') && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 relative">
          <button
            onClick={() => closeRecentBox('assignments')}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg"
            title="Close"
          >
            ×
          </button>
          <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
            <span>📝</span>
            Recent Assignments
          </h3>
          {assignments.length === 0 ? (
            <p className="text-gray-500 text-sm">No assignments found</p>
          ) : (
            <div className="space-y-3">
              {assignments.slice(0, 5).map(assignment => (
                <div 
                  key={assignment.id}
                  className="p-3 bg-gray-50 rounded cursor-pointer"
                  onClick={() => {
                    console.log('Assignment clicked:', assignment.id);
                    toggleExpanded('assignment', assignment.id);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-black text-sm">{assignment.name}</h4>
                    <span className="text-xs text-gray-500">
                      {expandedItems[`assignment-${assignment.id}`] ? '▼' : '▶'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {assignment.due_at ? `Due: ${formatDate(assignment.due_at)}` : 'No due date'}
                  </p>
                  {assignment.points_possible && (
                    <p className="text-xs text-gray-600">Points: {assignment.points_possible}</p>
                  )}
                  {expandedItems[`assignment-${assignment.id}`] && assignment.description && (
                    <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                      <div className="text-xs text-blue-700 font-semibold mb-2">📝 Description:</div>
                      <div 
                        className="text-xs text-gray-800"
                        dangerouslySetInnerHTML={{ __html: assignment.description }}
                      />
                    </div>
                  )}
                </div>
              ))}
              {assignments.length > 5 && (
                <p className="text-xs text-gray-500 text-center">
                  +{assignments.length - 5} more assignments
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recent Announcements */}
      {!closedRecentBoxes.has('announcements') && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 relative">
          <button
            onClick={() => closeRecentBox('announcements')}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg"
            title="Close"
          >
            ×
          </button>
          <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
            <span>📢</span>
            Recent Announcements
          </h3>
          {announcements.length === 0 ? (
            <p className="text-gray-500 text-sm">No announcements found</p>
          ) : (
            <div className="space-y-3">
              {announcements.slice(0, 5).map(announcement => (
                <div 
                  key={announcement.id}
                  className="p-3 bg-gray-50 rounded cursor-pointer"
                  onClick={() => {
                    console.log('Announcement clicked:', announcement.id);
                    toggleExpanded('announcement', announcement.id);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-black text-sm">{announcement.title}</h4>
                    <span className="text-xs text-gray-500">
                      {expandedItems[`announcement-${announcement.id}`] ? '▼' : '▶'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Posted: {formatDate(announcement.posted_at)}
                  </p>
                  {announcement.author?.display_name && (
                    <p className="text-xs text-gray-600">By: {announcement.author.display_name}</p>
                  )}
                  {expandedItems[`announcement-${announcement.id}`] && announcement.message && (
                    <div className="mt-3 p-3 bg-green-50 rounded border-l-4 border-green-400">
                      <div className="text-xs text-green-700 font-semibold mb-2">📢 Message:</div>
                      <div 
                        className="text-xs text-gray-800"
                        dangerouslySetInnerHTML={{ __html: announcement.message }}
                      />
                    </div>
                  )}
                </div>
              ))}
              {announcements.length > 5 && (
                <p className="text-xs text-gray-500 text-center">
                  +{announcements.length - 5} more announcements
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Files */}
      {!closedRecentBoxes.has('files') && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 relative">
          <button
            onClick={() => closeRecentBox('files')}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg"
            title="Close"
          >
            ×
          </button>
          <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
            <span>📁</span>
            Course Files
          </h3>
          {files.length === 0 ? (
            <p className="text-gray-500 text-sm">No files found</p>
          ) : (
            <div className="space-y-3">
              {files.slice(0, 5).map(file => (
                <div 
                  key={file.id}
                  className="p-3 bg-gray-50 rounded cursor-pointer"
                  onClick={() => {
                    console.log('File clicked:', file.display_name);
                    openFile(file);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{getFileIcon(file)}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-black text-sm truncate">{file.display_name}</h4>
                      <p className="text-xs text-gray-600">
                        {file.size ? formatFileSize(file.size) : 'Unknown size'}
                      </p>
                    </div>
                    <span className="text-xs text-blue-500">View →</span>
                  </div>
                </div>
              ))}
              {files.length > 5 && (
                <p className="text-xs text-gray-500 text-center">
                  +{files.length - 5} more files
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 