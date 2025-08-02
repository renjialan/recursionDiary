import { createClient } from '@supabase/supabase-js';
import { Document, Insight } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client only if environment variables are available
let supabase: any = null;

console.log('🔧 Supabase Initialization:');
console.log('  - VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('  - VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('  - Supabase Client: ✅ Created successfully');
  } catch (error) {
    console.warn('❌ Failed to initialize Supabase client:', error);
  }
} else {
  console.warn('❌ Supabase client not created - missing environment variables');
}

// Export supabase client for auth testing
export { supabase };

// Auth functions for testing
export const signInWithGoogle = async () => {
  console.log('🔐 Google Sign In Initiated:');
  console.log('  - Current URL:', window.location.href);
  console.log('  - Redirect URL:', `${window.location.origin}/auth/callback`);
  
  if (!supabase) {
    console.warn('❌ Supabase not configured');
    return { error: 'Supabase not configured' };
  }
  
  console.log('  - Supabase client: ✅ Available');
  
  try {
    const result = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    console.log('  - OAuth redirect result:', result);
    return result;
  } catch (error) {
    console.error('❌ Google sign in error:', error);
    return { error };
  }
};

// Handle OAuth callback
export const handleAuthCallback = async () => {
  if (!supabase) return;
  
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Auth callback error:', error);
    }
    return { data, error };
  } catch (error) {
    console.error('Error handling auth callback:', error);
    return { error };
  }
};

export const signOut = async () => {
  console.log('🚪 Sign Out Process Started:');
  console.log('  - Timestamp:', new Date().toISOString());
  console.log('  - Current URL:', window.location.href);
  console.log('  - Supabase Client Available:', !!supabase);
  console.log('  - Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('  - Supabase Key:', supabaseKey ? '✅ Set' : '❌ Missing');
  
  if (!supabase) {
    console.warn('❌ Supabase not configured');
    return { error: 'Supabase not configured' };
  }
  
  try {
    console.log('📤 Step 1: Signing out from Supabase...');
    
    // Step 1: Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    console.log('  - Supabase signOut result:', { error });
    
    if (error) {
      console.error('❌ Supabase sign out error:', error);
      return { error };
    }
    
    console.log('✅ Step 1 Complete: Supabase sign out successful');
    
    // Step 2: Clear Google OAuth session (if available)
    try {
      console.log('🧹 Step 2: Clearing Google OAuth session...');
      
      // Method 1: Try to revoke Google access token
      console.log('  - Checking for Google provider token...');
      const session = await supabase.auth.getSession();
      console.log('  - Session data:', session?.data?.session ? 'Available' : 'None');
      
      if (session?.data?.session?.provider_token) {
        const token = session.data.session.provider_token;
        console.log('  - Revoking Google token...');
        await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
          method: 'POST',
        });
        console.log('✅ Google token revoked successfully');
      } else {
        console.log('  - No Google provider token found');
      }
      
      // Method 2: Clear any Google OAuth state from localStorage
      console.log('  - Clearing Google-related localStorage...');
      const googleKeys = Object.keys(localStorage).filter(key => 
        key.includes('google') || key.includes('oauth') || key.includes('gapi')
      );
      console.log('  - Found Google-related keys:', googleKeys);
      googleKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log('    - Cleared:', key);
      });
      
      // Method 3: Clear sessionStorage
      console.log('  - Clearing sessionStorage...');
      sessionStorage.clear();
      console.log('✅ SessionStorage cleared');
      
      console.log('✅ Step 2 Complete: Google OAuth cleanup successful');
      
    } catch (googleError) {
      console.warn('⚠️ Google OAuth cleanup failed (this is normal):', googleError);
      // Don't fail the sign out if Google cleanup fails
    }
    
    // Step 3: Force page reload to clear any remaining state
    console.log('🔄 Step 3: Reloading page for complete cleanup...');
    console.log('✅ SignOut successful, page will reload in 500ms');
    
    setTimeout(() => {
      console.log('🔄 Reloading page now...');
      window.location.reload();
    }, 500);
    
    return { data: null, error: null };
  } catch (error) {
    console.error('❌ Error during sign out:', error);
    return { error };
  }
};

// Alternative sign out without page reload
export const signOutWithoutReload = async () => {
  console.log('SignOut without reload called, supabase client:', !!supabase);
  
  if (!supabase) {
    console.warn('Supabase not configured');
    return { error: 'Supabase not configured' };
  }
  
  try {
    console.log('Attempting to sign out from Supabase...');
    
    // Step 1: Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    console.log('Supabase signOut result:', { error });
    
    if (error) {
      console.error('Supabase sign out error:', error);
      return { error };
    }
    
    // Step 2: Clear Google OAuth session (if available)
    try {
      console.log('Attempting to clear Google OAuth session...');
      
      // Method 1: Try to revoke Google access token
      const session = await supabase.auth.getSession();
      if (session?.data?.session?.provider_token) {
        const token = session.data.session.provider_token;
        await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
          method: 'POST',
        });
        console.log('Google token revoked');
      }
      
      // Method 2: Clear any Google OAuth state from localStorage
      const googleKeys = Object.keys(localStorage).filter(key => 
        key.includes('google') || key.includes('oauth') || key.includes('gapi')
      );
      googleKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log('Cleared localStorage key:', key);
      });
      
      // Method 3: Clear sessionStorage
      sessionStorage.clear();
      console.log('SessionStorage cleared');
      
    } catch (googleError) {
      console.warn('Google OAuth cleanup failed (this is normal):', googleError);
      // Don't fail the sign out if Google cleanup fails
    }
    
    console.log('SignOut without reload successful');
    return { data: null, error: null };
  } catch (error) {
    console.error('Error during sign out:', error);
    return { error };
  }
};

export const getCurrentUser = () => {
  if (!supabase) return null;
  return supabase.auth.getUser();
};

// Document operations
export const saveDocumentToSupabase = async (document: Document): Promise<void> => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping save');
    return;
  }

  try {
    const { error } = await supabase
      .from('documents')
      .upsert({
        id: document.id,
        title: document.title,
        content: document.content,
        created_at: document.createdAt.toISOString(),
        updated_at: document.updatedAt.toISOString(),
        tags: document.tags || [],
      });

    if (error) {
      console.error('Error saving document to Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to save document to Supabase:', error);
    // Don't throw error, just log it
  }
};

export const loadDocumentsFromSupabase = async (): Promise<Document[]> => {
  if (!supabase) {
    console.warn('Supabase not configured, returning empty array');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading documents from Supabase:', error);
      return [];
    }

    return data.map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      createdAt: new Date(doc.created_at),
      updatedAt: new Date(doc.updated_at),
      tags: doc.tags || [],
    }));
  } catch (error) {
    console.error('Failed to load documents from Supabase:', error);
    return [];
  }
};

export const deleteDocumentFromSupabase = async (documentId: string): Promise<void> => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping delete');
    return;
  }

  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      console.error('Error deleting document from Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete document from Supabase:', error);
    // Don't throw error, just log it
  }
};

// Insight operations
export const saveInsightToSupabase = async (insight: Insight): Promise<void> => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping insight save');
    return;
  }

  try {
    const { error } = await supabase
      .from('insights')
      .upsert({
        id: insight.id,
        document_id: insight.documentId,
        type: insight.type,
        content: insight.content,
        created_at: insight.createdAt.toISOString(),
        conversation_history: insight.conversationHistory || [],
        metadata: insight.metadata || {},
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('Error saving insight to Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to save insight to Supabase:', error);
    // Don't throw error, just log it
  }
};

export const loadInsightsFromSupabase = async (documentId: string): Promise<Insight[]> => {
  if (!supabase) {
    console.warn('Supabase not configured, returning empty insights array');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading insights from Supabase:', error);
      return [];
    }

    return data.map((insight: any) => ({
      id: insight.id,
      documentId: insight.document_id,
      type: insight.type,
      content: insight.content,
      createdAt: new Date(insight.created_at),
      conversationHistory: insight.conversation_history || [],
      metadata: insight.metadata || {},
    }));
  } catch (error) {
    console.error('Failed to load insights from Supabase:', error);
    return [];
  }
};

export const deleteInsightFromSupabase = async (insightId: string): Promise<void> => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping insight delete');
    return;
  }

  try {
    const { error } = await supabase
      .from('insights')
      .delete()
      .eq('id', insightId);

    if (error) {
      console.error('Error deleting insight from Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete insight from Supabase:', error);
    // Don't throw error, just log it
  }
}; 