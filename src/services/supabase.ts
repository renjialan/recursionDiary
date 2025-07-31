import { createClient } from '@supabase/supabase-js';
import { Document, Insight } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client only if environment variables are available
let supabase: any = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
  }
}

// Export supabase client for auth testing
export { supabase };

// Auth functions for testing
export const signInWithGoogle = async () => {
  if (!supabase) {
    console.warn('Supabase not configured');
    return { error: 'Supabase not configured' };
  }
  
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}`
    }
  });
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
  if (!supabase) return;
  return await supabase.auth.signOut();
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