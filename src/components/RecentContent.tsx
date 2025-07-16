'use client';

import { File, Assignment, Announcement } from '../types/canvas';
import { useState } from 'react';

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
  openAssignment: (assignment: Assignment) => void;
  openAnnouncement: (announcement: Announcement) => void;
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
  openAssignment,
  openAnnouncement,
  closedRecentBoxes,
  closeRecentBox,
}: RecentContentProps) {
  const [collapsedSections, setCollapsedSections] = useState({
    assignments: false,
    announcements: false,
    files: false,
  });

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="space-y-2">
      {/* Recent Assignments */}
      <div className="border border-gray-200 rounded-lg">
        <div
          className={`px-3 py-2 cursor-pointer flex justify-between items-center transition-colors ${
            collapsedSections.assignments ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-100'
          }`}
          onClick={() => toggleSection('assignments')}
        >
          <div className="flex items-center gap-2">
            <span className="text-black">📝</span>
            <span className="text-sm font-medium text-black">Recent Assignments</span>
            <span className="bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs font-medium">
              {assignments.length}
            </span>
          </div>
          <span className={`transform transition-transform text-black text-xs ${
            collapsedSections.assignments ? '' : 'rotate-180'
          }`}>
            ▼
          </span>
        </div>
        {!collapsedSections.assignments && (
          <div className="max-h-32 overflow-y-auto">
            {assignments.length === 0 ? (
              <div className="text-center py-2 text-gray-500 text-xs">
                No assignments found
              </div>
            ) : (
              assignments.slice(0, 8).map(assignment => (
                <div 
                  key={assignment.id} 
                  className="px-3 py-1.5 border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => openAssignment(assignment)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-black truncate">{assignment.name}</div>
                      <div className="text-xs text-gray-600">
                        {assignment.due_at ? `Due: ${formatDate(assignment.due_at)}` : 'No due date'}
                      </div>
                      {assignment.points_possible && (
                        <div className="text-xs text-gray-600">Points: {assignment.points_possible}</div>
                      )}
                    </div>
                    <span className="text-xs text-blue-500 ml-2">View →</span>
                  </div>
                </div>
              ))
            )}
            {assignments.length > 8 && (
              <div className="text-center py-1 text-xs text-gray-500">
                +{assignments.length - 8} more assignments
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Announcements */}
      <div className="border border-gray-200 rounded-lg">
        <div
          className={`px-3 py-2 cursor-pointer flex justify-between items-center transition-colors ${
            collapsedSections.announcements ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-100'
          }`}
          onClick={() => toggleSection('announcements')}
        >
          <div className="flex items-center gap-2">
            <span className="text-black">📢</span>
            <span className="text-sm font-medium text-black">Recent Announcements</span>
            <span className="bg-yellow-500 text-white rounded-full px-2 py-0.5 text-xs font-medium">
              {announcements.length}
            </span>
          </div>
          <span className={`transform transition-transform text-black text-xs ${
            collapsedSections.announcements ? '' : 'rotate-180'
          }`}>
            ▼
          </span>
        </div>
        {!collapsedSections.announcements && (
          <div className="max-h-32 overflow-y-auto">
            {announcements.length === 0 ? (
              <div className="text-center py-2 text-gray-500 text-xs">
                No announcements found
              </div>
            ) : (
              announcements.slice(0, 8).map(announcement => (
                <div 
                  key={announcement.id} 
                  className="px-3 py-1.5 border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => openAnnouncement(announcement)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-black truncate">{announcement.title}</div>
                      <div className="text-xs text-gray-600">
                        Posted: {formatDate(announcement.posted_at)}
                      </div>
                      {announcement.author?.display_name && (
                        <div className="text-xs text-gray-600">By: {announcement.author.display_name}</div>
                      )}
                    </div>
                    <span className="text-xs text-blue-500 ml-2">View →</span>
                  </div>
                </div>
              ))
            )}
            {announcements.length > 8 && (
              <div className="text-center py-1 text-xs text-gray-500">
                +{announcements.length - 8} more announcements
              </div>
            )}
          </div>
        )}
      </div>

      {/* Course Files */}
      <div className="border border-gray-200 rounded-lg">
        <div
          className={`px-3 py-2 cursor-pointer flex justify-between items-center transition-colors ${
            collapsedSections.files ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-100'
          }`}
          onClick={() => toggleSection('files')}
        >
          <div className="flex items-center gap-2">
            <span className="text-black">📁</span>
            <span className="text-sm font-medium text-black">Course Files</span>
            <span className="bg-green-500 text-white rounded-full px-2 py-0.5 text-xs font-medium">
              {files.length}
            </span>
          </div>
          <span className={`transform transition-transform text-black text-xs ${
            collapsedSections.files ? '' : 'rotate-180'
          }`}>
            ▼
          </span>
        </div>
        {!collapsedSections.files && (
          <div className="max-h-32 overflow-y-auto">
            {files.length === 0 ? (
              <div className="text-center py-2 text-gray-500 text-xs">
                No files found
              </div>
            ) : (
              files.slice(0, 8).map(file => (
                <div 
                  key={file.id} 
                  className="px-3 py-1.5 border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => openFile(file)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs">{getFileIcon(file)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-black truncate">{file.display_name}</div>
                        <div className="text-xs text-gray-600">
                          {formatFileSize(file.size)}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-blue-500 ml-2">View →</span>
                  </div>
                </div>
              ))
            )}
            {files.length > 8 && (
              <div className="text-center py-1 text-xs text-gray-500">
                +{files.length - 8} more files
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 