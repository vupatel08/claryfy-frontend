'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Recording {
  id: string;
  title: string;
  transcription?: string;
  summary?: string;
  duration: number;
  status: string;
  created_at: string;
  course_id?: number;
}

interface RecordingViewerProps {
  recording: Recording;
  onClose: () => void;
}

export default function RecordingViewer({ recording, onClose }: RecordingViewerProps) {
  const [loading, setLoading] = useState(false);
  const [fullRecording, setFullRecording] = useState<Recording | null>(null);

  useEffect(() => {
    const fetchFullRecording = async () => {
      if (!recording.summary || !recording.transcription) {
        setLoading(true);
        try {
          const API_URL = process.env.NODE_ENV === 'production' 
            ? process.env.NEXT_PUBLIC_API_URL 
            : 'http://localhost:3000';
          const response = await fetch(`${API_URL}/api/recordings/${recording.id}`);
          if (response.ok) {
            const fullData = await response.json();
            setFullRecording(fullData);
          }
        } catch (error) {
          console.error('Error fetching full recording:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setFullRecording(recording);
      }
    };

    fetchFullRecording();
  }, [recording]);

  const displayRecording = fullRecording || recording;

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-screen w-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-purple-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🎙️</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-black truncate">{displayRecording.title}</h2>
            <div className="text-sm text-gray-600">
              {formatDuration(displayRecording.duration)} • {formatDate(displayRecording.created_at)}
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

      {/* Content - Fixed height with scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading recording details...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-black">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                displayRecording.status === 'completed' 
                  ? 'bg-green-100 text-green-700' 
                  : displayRecording.status === 'failed'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {displayRecording.status}
              </span>
            </div>

            {/* Summary Section */}
            {displayRecording.summary && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-black border-b border-gray-200 pb-2">
                  📝 Summary
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div className="text-black leading-relaxed prose prose-sm max-w-none prose-headings:text-black prose-p:text-black prose-strong:text-black prose-ul:text-black prose-ol:text-black prose-li:text-black">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-3 text-black" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg font-semibold mb-2 text-black" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-base font-medium mb-2 text-black" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 text-black" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 text-black" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 text-black" {...props} />,
                        li: ({node, ...props}) => <li className="mb-1 text-black" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold text-black" {...props} />,
                        em: ({node, ...props}) => <em className="italic text-black" {...props} />,
                      }}
                    >
                      {displayRecording.summary}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {/* Transcription Section */}
            {displayRecording.transcription && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-black border-b border-gray-200 pb-2">
                  📄 Full Transcription
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="text-black whitespace-pre-wrap leading-relaxed font-mono text-sm">
                    {displayRecording.transcription}
                  </div>
                </div>
              </div>
            )}

            {/* No content message */}
            {!displayRecording.summary && !displayRecording.transcription && displayRecording.status === 'completed' && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">🎙️</div>
                <p className="text-gray-600">No summary or transcription available for this recording.</p>
              </div>
            )}

            {/* Processing message */}
            {displayRecording.status === 'processing' && (
              <div className="text-center py-8">
                <div className="animate-pulse text-yellow-500 text-4xl mb-2">⏳</div>
                <p className="text-gray-600">Recording is being processed...</p>
                <p className="text-sm text-gray-500 mt-2">Transcription and summary will be available soon.</p>
              </div>
            )}

            {/* Failed message */}
            {displayRecording.status === 'failed' && (
              <div className="text-center py-8">
                <div className="text-red-500 text-4xl mb-2">❌</div>
                <p className="text-gray-600">Recording processing failed.</p>
                <p className="text-sm text-gray-500 mt-2">Please try recording again.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 