// =============================================
// CLARYFY FRONTEND SUPABASE SERVICE
// =============================================

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a function to get the Supabase client
function getSupabaseClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase configuration. Please check environment variables.');
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
        },
    });
}

// Export a lazy-loaded client to avoid build-time issues
let _supabaseClient: any = null;

export const supabase = new Proxy({} as any, {
    get(target, prop) {
        // Initialize client on first access
        if (!_supabaseClient) {
            try {
                _supabaseClient = getSupabaseClient();
            } catch (error) {
                // During build time or when env vars are missing, return a helpful error
                if (typeof window === 'undefined') {
                    console.warn('Supabase client accessed during build time - this should not happen in production');
                    throw new Error('Supabase client not available during build time');
                }
                throw error;
            }
        }
        return _supabaseClient[prop];
    }
});

// =============================================
// AUTHENTICATION SERVICE
// =============================================

// Helper function to ensure Supabase client is available
function ensureSupabaseClient() {
    // The proxy will handle initialization automatically
    return supabase;
}

export class AuthService {

    // Sign up with email and password
    static async signUp(email: string, password: string, metadata?: any) {
        try {
            const client = ensureSupabaseClient();
            const { data, error } = await client.auth.signUp({
                email,
                password,
                options: {
                    data: metadata
                }
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error signing up:', error);
            throw error;
        }
    }

    // Sign in with email and password
    static async signIn(email: string, password: string) {
        try {
            const client = ensureSupabaseClient();
            const { data, error } = await client.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error signing in:', error);
            throw error;
        }
    }

    // Sign out
    static async signOut() {
        try {
            const client = ensureSupabaseClient();
            const { error } = await client.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    }

    // Get current user
    static async getCurrentUser() {
        try {
            const client = ensureSupabaseClient();
            const { data: { user }, error } = await client.auth.getUser();
            if (error) throw error;
            return user;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    // Get current session
    static async getCurrentSession() {
        try {
            const client = ensureSupabaseClient();
            const { data: { session }, error } = await client.auth.getSession();
            if (error) throw error;
            return session;
        } catch (error) {
            console.error('Error getting current session:', error);
            return null;
        }
    }

    // Listen to auth changes
    static onAuthStateChange(callback: (event: string, session: any) => void) {
        const client = ensureSupabaseClient();
        return client.auth.onAuthStateChange(callback);
    }
}

// =============================================
// USER PROFILE SERVICE
// =============================================

export class UserProfileService {

    // Get user profile
    static async getUserProfile(userId: string) {
        try {
            const client = ensureSupabaseClient();
            const { data, error } = await client
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    }

    // Update user profile
    static async updateUserProfile(userId: string, updates: any) {
        try {
            const client = ensureSupabaseClient();
            const { data, error } = await client
                .from('users')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }

    // Update Canvas credentials
    static async updateCanvasCredentials(userId: string, token: string, domain: string) {
        try {
            const client = ensureSupabaseClient();
            const { data, error } = await client
                .from('users')
                .update({
                    canvas_token: token,
                    canvas_domain: domain,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating Canvas credentials:', error);
            throw error;
        }
    }
}

// =============================================
// CONVERSATION SERVICE
// =============================================

export class ConversationService {

    // Get user conversations
    static async getUserConversations(userId: string, courseId?: number) {
        try {
            const client = ensureSupabaseClient();
            let query = client
                .from('conversation_summary')
                .select('*')
                .eq('user_id', userId)
                .order('last_message_at', { ascending: false });

            if (courseId) {
                query = query.eq('course_id', courseId);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching conversations:', error);
            throw error;
        }
    }

    // Get conversation messages
    static async getConversationMessages(conversationId: string) {
        try {
            const client = ensureSupabaseClient();
            const { data, error } = await client
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    }

    // Create new conversation
    static async createConversation(userId: string, courseId: number, title: string) {
        try {
            const client = ensureSupabaseClient();
            const { data, error } = await client
                .from('conversations')
                .insert({
                    user_id: userId,
                    course_id: courseId,
                    title: title
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating conversation:', error);
            throw error;
        }
    }

    // Add message to conversation
    static async addMessage(conversationId: string, content: string, role: 'user' | 'assistant', metadata?: any) {
        try {
            const client = ensureSupabaseClient();
            const { data, error } = await client
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    content: content,
                    role: role,
                    metadata: metadata || {}
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding message:', error);
            throw error;
        }
    }
}

// =============================================
// RECORDING SERVICE
// =============================================

export class RecordingService {

    // Get user recordings
    static async getUserRecordings(userId: string, courseId?: number) {
        try {
            const client = ensureSupabaseClient();
            let query = client
                .from('recording_summary')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (courseId) {
                query = query.eq('course_id', courseId);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching recordings:', error);
            throw error;
        }
    }

    // Create new recording
    static async createRecording(userId: string, courseId: number, title: string, duration: number) {
        try {
            const client = ensureSupabaseClient();
            const { data, error } = await client
                .from('recordings')
                .insert({
                    user_id: userId,
                    course_id: courseId,
                    title: title,
                    duration: duration,
                    status: 'processing'
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating recording:', error);
            throw error;
        }
    }
}

// =============================================
// STORAGE SERVICE
// =============================================

export class StorageService {

    // Upload audio file
    static async uploadAudioFile(userId: string, recordingId: string, audioBlob: Blob) {
        try {
            const client = ensureSupabaseClient();
            const fileName = `${userId}/${recordingId}.webm`;

            const { data, error } = await client.storage
                .from('recordings')
                .upload(fileName, audioBlob, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error uploading audio file:', error);
            throw error;
        }
    }

    // Get audio file URL
    static async getAudioFileUrl(userId: string, recordingId: string) {
        try {
            const client = ensureSupabaseClient();
            const fileName = `${userId}/${recordingId}.webm`;

            const { data } = client.storage
                .from('recordings')
                .getPublicUrl(fileName);

            return data.publicUrl;
        } catch (error) {
            console.error('Error getting audio file URL:', error);
            throw error;
        }
    }
}

// =============================================
// REALTIME SERVICE
// =============================================

export class RealtimeService {

    // Subscribe to conversation messages
    static subscribeToConversation(conversationId: string, callback: (payload: any) => void) {
        const client = ensureSupabaseClient();
        return client
            .channel(`conversation_${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                callback
            )
            .subscribe();
    }

    // Subscribe to user recordings
    static subscribeToUserRecordings(userId: string, callback: (payload: any) => void) {
        const client = ensureSupabaseClient();
        return client
            .channel(`user_recordings_${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'recordings',
                    filter: `user_id=eq.${userId}`
                },
                callback
            )
            .subscribe();
    }

    // Unsubscribe from channel
    static unsubscribe(subscription: any) {
        if (subscription) {
            const client = ensureSupabaseClient();
            client.removeChannel(subscription);
        }
    }
}

// Export the main client (with safeguards)
export default supabase; 