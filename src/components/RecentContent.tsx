'use client';

import { File, Assignment, Announcement } from '../types/canvas';
import { useState } from 'react';
import { FileText, AlertCircle, Archive, ChevronDown, ExternalLink } from 'lucide-react';

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
    <div className="space-y-4">
      {/* Recent Assignments */}
      <div className="bg-surface border border-subtle rounded-xl shadow-sm overflow-hidden">
        <div
          className={`px-4 py-3 cursor-pointer flex justify-between items-center transition-normal ${
            collapsedSections.assignments ? 'bg-surface hover:bg-surface/80' : 'bg-surface/80'
          }`}
          onClick={() => toggleSection('assignments')}
        >
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-primary">Recent Assignments</span>
            <span className="bg-error/20 text-error border border-error/30 rounded-full px-2 py-0.5 text-xs font-medium">
              {assignments.length}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-secondary transform transition-transform ${
            collapsedSections.assignments ? '' : 'rotate-180'
          }`} />
        </div>
        {!collapsedSections.assignments && (
          <div className="max-h-48 overflow-y-auto">
            {assignments.length === 0 ? (
              <div className="text-center py-4 text-secondary text-xs">
                No assignments found
              </div>
            ) : (
              assignments.slice(0, 8).map(assignment => (
                <div 
                  key={assignment.id} 
                  className="px-4 py-3 border-t border-subtle hover:bg-surface/50 cursor-pointer transition-normal"
                  onClick={() => openAssignment(assignment)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-primary truncate">{assignment.name}</div>
                      <div className="text-xs text-secondary">
                        {assignment.due_at ? `Due: ${formatDate(assignment.due_at)}` : 'No due date'}
                      </div>
                      {assignment.points_possible && (
                        <div className="text-xs text-secondary">Points: {assignment.points_possible}</div>
                      )}
                    </div>
                    <ExternalLink className="w-3 h-3 text-accent ml-2" />
                  </div>
                </div>
              ))
            )}
            {assignments.length > 8 && (
              <div className="text-center py-2 text-xs text-secondary border-t border-subtle">
                +{assignments.length - 8} more assignments
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Announcements */}
      <div className="bg-surface border border-subtle rounded-xl shadow-sm overflow-hidden">
        <div
          className={`px-4 py-3 cursor-pointer flex justify-between items-center transition-normal ${
            collapsedSections.announcements ? 'bg-surface hover:bg-surface/80' : 'bg-surface/80'
          }`}
          onClick={() => toggleSection('announcements')}
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-primary">Recent Announcements</span>
            <span className="bg-success/20 text-success border border-success/30 rounded-full px-2 py-0.5 text-xs font-medium">
              {announcements.length}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-secondary transform transition-transform ${
            collapsedSections.announcements ? '' : 'rotate-180'
          }`} />
        </div>
        {!collapsedSections.announcements && (
          <div className="max-h-48 overflow-y-auto">
            {announcements.length === 0 ? (
              <div className="text-center py-4 text-secondary text-xs">
                No announcements found
              </div>
            ) : (
              announcements.slice(0, 8).map(announcement => (
                <div 
                  key={announcement.id} 
                  className="px-4 py-3 border-t border-subtle hover:bg-surface/50 cursor-pointer transition-normal"
                  onClick={() => openAnnouncement(announcement)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-primary truncate">{announcement.title}</div>
                      <div className="text-xs text-secondary">
                        Posted: {formatDate(announcement.posted_at)}
                      </div>
                      {announcement.author?.display_name && (
                        <div className="text-xs text-secondary">By: {announcement.author.display_name}</div>
                      )}
                    </div>
                    <ExternalLink className="w-3 h-3 text-accent ml-2" />
                  </div>
                </div>
              ))
            )}
            {announcements.length > 8 && (
              <div className="text-center py-2 text-xs text-secondary border-t border-subtle">
                +{announcements.length - 8} more announcements
              </div>
            )}
          </div>
        )}
      </div>

      {/* Course Files */}
      <div className="bg-surface border border-subtle rounded-xl shadow-sm overflow-hidden">
        <div
          className={`px-4 py-3 cursor-pointer flex justify-between items-center transition-normal ${
            collapsedSections.files ? 'bg-surface hover:bg-surface/80' : 'bg-surface/80'
          }`}
          onClick={() => toggleSection('files')}
        >
          <div className="flex items-center gap-3">
            <Archive className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-primary">Course Files</span>
            <span className="bg-accent/20 text-accent border border-accent/30 rounded-full px-2 py-0.5 text-xs font-medium">
              {files.length}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-secondary transform transition-transform ${
            collapsedSections.files ? '' : 'rotate-180'
          }`} />
        </div>
        {!collapsedSections.files && (
          <div className="max-h-48 overflow-y-auto">
            {files.length === 0 ? (
              <div className="text-center py-4 text-secondary text-xs">
                No files found
              </div>
            ) : (
              files.slice(0, 8).map(file => (
                <div 
                  key={file.id} 
                  className="px-4 py-3 border-t border-subtle hover:bg-surface/50 cursor-pointer transition-normal"
                  onClick={() => openFile(file)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-secondary" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-primary truncate">{file.display_name}</div>
                        <div className="text-xs text-secondary">
                          {formatFileSize(file.size)}
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-accent ml-2" />
                  </div>
                </div>
              ))
            )}
            {files.length > 8 && (
              <div className="text-center py-2 text-xs text-secondary border-t border-subtle">
                +{files.length - 8} more files
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 