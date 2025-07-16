'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfileService } from '../../services/supabase';
import { ArrowLeft, User, Settings, RefreshCw, LogOut, Globe, Key, CheckCircle, AlertCircle } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  canvas_token?: string;
  canvas_domain?: string;
  created_at: string;
  updated_at: string;
}

interface CanvasProfile {
  id: string;
  name: string;
  email?: string;
  login_id?: string;
  avatar_url?: string;
}

export default function ProfilePage() {
  const { user, signOut, isAuthenticated } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [canvasProfile, setCanvasProfile] = useState<CanvasProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Canvas connection form state
  const [canvasToken, setCanvasToken] = useState('');
  const [canvasDomain, setCanvasDomain] = useState('umd.instructure.com');
  const [showTokenHelp, setShowTokenHelp] = useState(false);

  const API_URL = process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_API_URL 
    : 'http://localhost:3000';

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const profile = await UserProfileService.getUserProfile(user.id);
      setUserProfile(profile);
      
      if (profile.canvas_token) {
        setCanvasToken(profile.canvas_token);
        setCanvasDomain(profile.canvas_domain || 'umd.instructure.com');
        
        // Fetch Canvas profile if token exists
        try {
          const response = await fetch(`${API_URL}/api/profile`);
          if (response.ok) {
            const canvasData = await response.json();
            setCanvasProfile(canvasData);
          }
        } catch (err) {
          console.log('Canvas profile not available');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const saveCanvasCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await UserProfileService.updateCanvasCredentials(user.id, canvasToken, canvasDomain);
      setSuccess('Canvas credentials updated successfully!');
      
      // Try to fetch Canvas profile
      try {
        const response = await fetch(`${API_URL}/api/profile`);
        if (response.ok) {
          const canvasData = await response.json();
          setCanvasProfile(canvasData);
        }
      } catch (err) {
        console.log('Canvas profile not available');
      }
      
      await fetchUserProfile();
    } catch (err: any) {
      setError(err.message || 'Failed to update Canvas credentials');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Authentication Required</h2>
          <p className="text-secondary mb-6">Please sign in to view your profile</p>
          <Link 
            href="/dashboard" 
            className="btn btn-primary"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-primary">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-subtle px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-primary">Account Management</h1>
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-6 space-y-6">
        {/* User Account Section */}
        <div className="bg-surface border border-subtle rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-accent/10 to-accent/5 px-6 py-6 border-b border-subtle">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center text-accent font-semibold text-xl border-2 border-accent/30">
                {canvasProfile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary">
                  {canvasProfile?.name || user?.email || 'Unknown User'}
                </h2>
                <p className="text-secondary">
                  {canvasProfile ? 'Canvas Profile' : 'Claryfy Account'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Email Address
                </label>
                <div className="bg-muted border border-subtle rounded-lg px-3 py-2 text-primary">
                  {user?.email || 'N/A'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Account Created
                </label>
                <div className="bg-muted border border-subtle rounded-lg px-3 py-2 text-primary">
                  {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            <div className="border-t border-subtle pt-6">
              <h3 className="text-lg font-medium text-primary mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Account Actions
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => window.location.reload()}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Profile
                </button>
                <button
                  onClick={signOut}
                  className="btn btn-destructive flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Integration Section */}
        <div className="bg-surface border border-subtle rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 px-6 py-6 border-b border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary">Canvas Integration</h2>
                <p className="text-secondary">Connect your Canvas LMS account to unlock AI features</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Canvas Connection Form */}
            <form onSubmit={saveCanvasCredentials} className="space-y-4">
              <button
                type="button"
                onClick={() => setShowTokenHelp(!showTokenHelp)}
                className="text-sm text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
              >
                <Key className="w-4 h-4" />
                How to get your Canvas Access Token?
              </button>

              {showTokenHelp && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <h4 className="font-medium text-primary mb-2">How to get your Canvas Access Token:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-secondary">
                    <li>Go to your Canvas account settings</li>
                    <li>Click on "Approved Integrations"</li>
                    <li>Click "+ New Access Token"</li>
                    <li>Enter a purpose (e.g., "Claryfy")</li>
                    <li>Set expiration date (optional)</li>
                    <li>Click "Generate Token"</li>
                    <li>Copy the token immediately</li>
                  </ol>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Canvas Domain
                  </label>
                  <input
                    type="text"
                    value={canvasDomain}
                    onChange={(e) => setCanvasDomain(e.target.value)}
                    placeholder="e.g., university.instructure.com"
                    className="w-full px-3 py-2 border border-subtle rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-surface text-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Access Token
                  </label>
                  <input
                    type="password"
                    value={canvasToken}
                    onChange={(e) => setCanvasToken(e.target.value)}
                    placeholder="Your Canvas access token"
                    className="w-full px-3 py-2 border border-subtle rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-surface text-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving || !canvasToken || !canvasDomain}
                className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Canvas Credentials'}
              </button>
            </form>

            {error && (
              <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-sm text-error flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg text-sm text-success flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {success}
              </div>
            )}

            {/* Canvas Profile Display */}
            {canvasProfile && (
              <div className="border-t border-subtle pt-6">
                <h3 className="text-lg font-medium text-primary mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Connected Canvas Profile
                </h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-blue-300">
                      {canvasProfile.name?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary">{canvasProfile.name}</h4>
                      <p className="text-sm text-secondary">{canvasProfile.email}</p>
                      <p className="text-sm text-secondary">Login ID: {canvasProfile.login_id}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 