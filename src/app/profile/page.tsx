'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';


interface Profile {
  id: string;
  name: string;
  email?: string;
  login_id?: string;
  avatar_url?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const API_URL = process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_API_URL 
    : 'http://localhost:3000';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/profile`);
      
      if (!response.ok) {
        throw new Error('Not authenticated');
      }

      const profileData = await response.json();
      setProfile(profileData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">Authentication Required</h2>
          <p className="text-black mb-6">{error}</p>
          <Link 
            href="/dashboard" 
            className="bg-green-500 hover:bg-green-600 text-black px-6 py-2 rounded-md font-medium"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-black">Profile</h1>
          <Link 
            href="/dashboard" 
            className="text-black hover:text-black font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-2xl mx-auto py-8 px-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-black font-bold text-2xl">
                {profile?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">
                  {profile?.name || 'Unknown User'}
                </h2>
                <p className="text-black">
                  Canvas Student
                </p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  User ID
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-black">
                  {profile?.id || 'N/A'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Login ID
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-black">
                  {profile?.login_id || 'N/A'}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-2">
                  Email
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-black">
                  {profile?.email || 'N/A'}
                </div>
              </div>
            </div>



            {/* Additional Profile Actions */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-black mb-4">Account Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-md font-medium"
                >
                  Refresh Profile
                </button>
                <Link 
                  href="/dashboard"
                  className="block w-full md:w-auto md:inline-block bg-gray-500 hover:bg-gray-600 text-black px-4 py-2 rounded-md font-medium text-center md:ml-3"
                >
                  View Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 