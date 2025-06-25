'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfileService } from '../../services/supabase';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">Authentication Required</h2>
          <p className="text-black mb-6">Please sign in to view your profile</p>
          <Link 
            href="/dashboard" 
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-black">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-black">Account Management</h1>
          <Link 
            href="/dashboard" 
            className="text-black hover:text-black font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-6 space-y-8">
        {/* User Account Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {user?.email || 'Unknown User'}
                </h2>
                <p className="text-green-100">
                  Claryfy Account
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Email Address
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-black">
                  {user?.email || 'N/A'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Account Created
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-black">
                  {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-black mb-4">Account Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium"
                >
                  Refresh Profile
                </button>
                <button
                  onClick={signOut}
                  className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium md:ml-3"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Integration Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-6">
            <h2 className="text-xl font-bold text-white">Canvas Integration</h2>
            <p className="text-blue-100">Connect your Canvas LMS account to unlock AI features</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Canvas Connection Form */}
            <form onSubmit={saveCanvasCredentials} className="space-y-4">
              <button
                type="button"
                onClick={() => setShowTokenHelp(!showTokenHelp)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                How to get your Canvas Access Token?
              </button>

              {showTokenHelp && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-sm">
                  <h4 className="font-medium text-black mb-2">How to get your Canvas Access Token:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-black">
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
                  <label className="block text-sm font-medium text-black mb-2">
                    Canvas Domain
                  </label>
                  <input
                    type="text"
                    value={canvasDomain}
                    onChange={(e) => setCanvasDomain(e.target.value)}
                    placeholder="e.g., university.instructure.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Access Token
                  </label>
                  <input
                    type="password"
                    value={canvasToken}
                    onChange={(e) => setCanvasToken(e.target.value)}
                    placeholder="Your Canvas access token"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving || !canvasToken || !canvasDomain}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save Canvas Credentials'}
              </button>
            </form>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-600">
                {success}
              </div>
            )}

            {/* Canvas Profile Display */}
            {canvasProfile && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-black mb-4">Connected Canvas Profile</h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {canvasProfile.name?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-black">{canvasProfile.name}</h4>
                      <p className="text-sm text-gray-600">{canvasProfile.email}</p>
                      <p className="text-sm text-gray-600">Login ID: {canvasProfile.login_id}</p>
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