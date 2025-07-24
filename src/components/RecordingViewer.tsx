'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Mic, X, Clock, Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Recording {
  id: string;
  title: string;
  transcription?: string;
  summary?: string;
  duration: number;
  status: string;
  created_at: string;
  course_id?: number;
  verified?: boolean;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-error" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-warning animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-secondary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'failed':
        return 'bg-error/10 text-error border-error/20';
      case 'processing':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-secondary/10 text-secondary border-secondary/20';
    }
  };

  return (
    <div className="h-screen w-full bg-surface border-r border-subtle flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-subtle bg-surface/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center border-2 border-accent/30">
            <Mic className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary truncate">{displayRecording.title}</h2>
            <div className="flex items-center gap-4 text-sm text-secondary mt-1">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(displayRecording.duration)}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(displayRecording.created_at)}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-surface/50 rounded-lg transition-normal"
          title="Close"
        >
          <X className="w-5 h-5 text-secondary" />
        </button>
      </div>

      {/* Content - Fixed height with scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto" />
              <p className="mt-3 text-sm text-secondary">Loading recording details...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-primary">Status:</span>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-2 ${getStatusColor(displayRecording.status)}`}>
                  {getStatusIcon(displayRecording.status)}
                  {displayRecording.status}
                </div>
                {displayRecording.verified && (
                  <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </div>
                )}
              </div>
            </div>

            {/* Summary Section */}
            {displayRecording.summary && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary border-b border-subtle pb-3">
                  Summary
                </h3>
                <div className="bg-surface border border-subtle rounded-xl p-6 max-h-96 overflow-y-auto">
                  <div className="text-primary leading-relaxed prose prose-sm max-w-none prose-headings:text-primary prose-p:text-primary prose-strong:text-primary prose-ul:text-primary prose-ol:text-primary prose-li:text-primary">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-3 text-primary" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg font-semibold mb-2 text-primary" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-base font-medium mb-2 text-primary" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 text-primary" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 text-primary" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 text-primary" {...props} />,
                        li: ({node, ...props}) => <li className="mb-1 text-primary" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold text-primary" {...props} />,
                        em: ({node, ...props}) => <em className="italic text-primary" {...props} />,
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
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary border-b border-subtle pb-3">
                  Full Transcription
                </h3>
                <div className="bg-surface border border-subtle rounded-xl p-6 max-h-64 overflow-y-auto">
                  <div className="text-primary whitespace-pre-wrap leading-relaxed font-mono text-sm">
                    {displayRecording.transcription}
                  </div>
                </div>
              </div>
            )}

            {/* No content message */}
            {!displayRecording.summary && !displayRecording.transcription && displayRecording.status === 'completed' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-surface border border-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-8 h-8 text-secondary" />
                </div>
                <p className="text-secondary">No summary or transcription available for this recording.</p>
              </div>
            )}

            {/* Processing message */}
            {displayRecording.status === 'processing' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-surface border border-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-8 h-8 text-warning animate-spin" />
                </div>
                <p className="text-secondary">Recording is being processed...</p>
                <p className="text-sm text-secondary/70 mt-2">Transcription and summary will be available soon.</p>
              </div>
            )}

            {/* Failed message */}
            {displayRecording.status === 'failed' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-surface border border-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-error" />
                </div>
                <p className="text-secondary">Recording processing failed.</p>
                <p className="text-sm text-secondary/70 mt-2">Please try recording again.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 