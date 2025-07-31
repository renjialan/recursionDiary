import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import InsightsPanel from './components/InsightsPanel';
import FishTank from './components/FishTank';
import LandingPage from './components/LandingPage';
import PreviewBanner from './components/PreviewBanner';
import { Document, Insight, InsightRequest, EnhancedInsightRequest } from './types';
import { 
  loadDocuments, 
  saveDocument, 
  deleteDocument as deleteDocumentStorage,
  loadInsightsForDocument as loadInsightsFromLocal,
  saveInsight as saveInsightToLocal,
  deleteInsight as deleteInsightFromLocal
} from './utils/storage';
import { generateInsight, generateEnhancedInsight } from './services/ai';
import { saveInsightToSupabase, loadInsightsFromSupabase, deleteInsightFromSupabase, signInWithGoogle, signOut, supabase } from './services/supabase';
import { getMemoryContext } from './services/memory';
import { MemoryContext } from './types';

const App: React.FC = () => {
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [currentDocument, setCurrentDocument] = React.useState<Document | null>(null);
  const [insights, setInsights] = React.useState<Insight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = React.useState(false);
  const [showInsightsPanel, setShowInsightsPanel] = React.useState(false);
  const [forceUpdate, setForceUpdate] = React.useState(0); // Force re-render
  const [userId, setUserId] = React.useState<string>('');
  const [memoryContext, setMemoryContext] = React.useState<MemoryContext | undefined>(undefined);
  
  // Auth state
  const [user, setUser] = React.useState<any>(null);
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  // Initialize or load user ID
  React.useEffect(() => {
    let storedUserId = localStorage.getItem('success-diary-user-id');
    if (!storedUserId) {
      storedUserId = `user-${uuidv4()}`;
      localStorage.setItem('success-diary-user-id', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  // Auth testing - check current user
  React.useEffect(() => {
    if (supabase) {
      // Check current session
      supabase.auth.getSession().then(({ data: { session } }: any) => {
        setUser(session?.user ?? null);
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Login functions
  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      alert('Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // Load documents on app start
  React.useEffect(() => {
    if (user) {
      // Load real user documents
      const savedDocuments = loadDocuments();
      setDocuments(savedDocuments);
      
      // Select the most recent document if available
      if (savedDocuments.length > 0) {
        const mostRecent = savedDocuments.reduce((latest, current) =>
          current.updatedAt > latest.updatedAt ? current : latest
        );
        setCurrentDocument(mostRecent);
      }
    } else {
      // Load sample documents for preview mode
      const sampleDocuments: Document[] = [
        {
          id: 'sample-1',
          title: 'My Morning Reflection',
          content: `Today I woke up feeling grateful for the opportunities ahead. \n\nI've been thinking about:\n- Personal growth goals\n- Career aspirations\n- Building better habits\n\nThis Success Diary helps me track my thoughts and progress. The AI insights feature (available after signing in) helps me understand patterns in my thinking and provides valuable feedback.`,
          createdAt: new Date(Date.now() - 86400000), // 1 day ago
          updatedAt: new Date(Date.now() - 86400000),
        },
        {
          id: 'sample-2',
          title: 'Weekly Goals Review', 
          content: `Reviewing this week's achievements:\n\n✅ Completed project milestone\n✅ Exercised 4 times\n✅ Read 2 chapters of my book\n\n🎯 Next week's focus:\n- Improve time management\n- Connect with mentors\n- Practice mindfulness\n\nThe Success Diary helps me stay accountable to my goals and celebrate progress along the way.`,
          createdAt: new Date(Date.now() - 172800000), // 2 days ago
          updatedAt: new Date(Date.now() - 172800000),
        },
      ];
      
      setDocuments(sampleDocuments);
      setCurrentDocument(sampleDocuments[0]);
    }
  }, [user]);

  // Load insights when current document changes
  React.useEffect(() => {
    if (currentDocument) {
      // Only load insights if we don't already have insights for this document
      const hasInsightsForDocument = insights.some(insight => insight.documentId === currentDocument.id);
      if (!hasInsightsForDocument) {
        loadInsightsForDocument(currentDocument.id);
      }
      
      // Load memory context for the current document
      if (userId && currentDocument.content.trim()) {
        loadMemoryContext(currentDocument.content);
      }
    } else {
      setInsights([]);
      setMemoryContext(undefined);
    }
  }, [currentDocument?.id, userId]); // Depend on userId as well

  const loadInsightsForDocument = async (documentId: string) => {
    // Check if we already have insights for this document in local state
    const hasInsightsForDocument = insights.some(insight => insight.documentId === documentId);
    if (hasInsightsForDocument) {
      console.log('App: Already have insights for document, skipping load');
      return;
    }

    // Always try local storage first
    const localInsights = loadInsightsFromLocal(documentId);
    console.log('App: Loaded insights from local storage for document:', documentId, localInsights);
    
    if (localInsights.length > 0) {
      // If we have local insights, use them
      setInsights(localInsights);
      console.log('App: Using local insights, skipping Supabase load');
      return;
    }

    // Only try Supabase if local storage is empty
    try {
      const documentInsights = await loadInsightsFromSupabase(documentId);
      console.log('App: Loaded insights from Supabase for document:', documentId, documentInsights);
      setInsights(documentInsights);
    } catch (error) {
      console.error('Failed to load insights from Supabase, using empty array:', error);
      setInsights([]);
    }
  };

  const loadMemoryContext = async (content: string) => {
    if (!userId) return;
    
    try {
      console.log('App: Loading memory context...');
      const context = await getMemoryContext(content, userId, 3);
      setMemoryContext(context);
      console.log('App: Memory context loaded:', context.summary);
    } catch (error) {
      console.error('App: Failed to load memory context:', error);
      setMemoryContext(undefined);
    }
  };

  const handleNewDocument = () => {
    const newDocument: Document = {
      id: uuidv4(),
      title: '',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setDocuments(prev => [newDocument, ...prev]);
    setCurrentDocument(newDocument);
  };

  const handleSelectDocument = (document: Document) => {
    // Save current insights to local storage before switching
    if (currentDocument && insights.length > 0) {
      insights.forEach(insight => saveInsightToLocal(insight));
      console.log('App: Saved insights to local storage before switching documents');
    }
    
    setCurrentDocument(document);
  };

  const handleUpdateDocument = (updatedDocument: Document) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === updatedDocument.id ? updatedDocument : doc
      )
    );
    setCurrentDocument(updatedDocument);
  };

  const handleSaveDocument = (document: Document) => {
    try {
      saveDocument(document);
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === document.id ? document : doc
        )
      );
      setCurrentDocument(document);
    } catch (error) {
      console.error('Failed to save document:', error);
      // Continue with UI updates even if storage fails
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === document.id ? document : doc
        )
      );
      setCurrentDocument(document);
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    try {
      deleteDocumentStorage(documentId);
    } catch (error) {
      console.error('Failed to delete document from storage:', error);
    }
    
    // Always update UI even if storage delete fails
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    
    // If we're deleting the current document, select another one
    if (currentDocument?.id === documentId) {
      const remainingDocs = documents.filter(doc => doc.id !== documentId);
      setCurrentDocument(remainingDocs.length > 0 ? remainingDocs[0] : null);
    }
  };

  const handleGenerateInsight = async (request: InsightRequest) => {
    if (!currentDocument) {
      console.error('No current document');
      return;
    }

    setIsLoadingInsights(true);
    try {
      // Use enhanced insight generation with memory context if userId is available
      let aiResponse;
      if (userId) {
        const enhancedRequest: EnhancedInsightRequest = {
          ...request,
          userId
        };
        aiResponse = await generateEnhancedInsight(currentDocument.content, enhancedRequest);
      } else {
        aiResponse = await generateInsight(currentDocument.content, request, userId);
      }
      
      const newInsight: Insight = {
        id: uuidv4(),
        documentId: currentDocument.id,
        type: request.type,
        content: aiResponse.insight,
        createdAt: new Date(),
        conversationHistory: aiResponse.conversationHistory,
        metadata: aiResponse.metadata,
      };

      // Save to both Supabase and local storage
      try {
        await saveInsightToSupabase(newInsight);
      } catch (error) {
        console.error('Failed to save insight to Supabase:', error);
      }

      // Always save to local storage as backup
      try {
        saveInsightToLocal(newInsight);
        
        // Verify it was saved by loading it back
        const savedInsights = loadInsightsFromLocal(currentDocument.id);
      } catch (error) {
        console.error('Failed to save insight to local storage:', error);
      }

      // Update local state - this is the key part
      const updatedInsights = [newInsight, ...insights];
      setInsights(updatedInsights);
      
      // Force a re-render
      setForceUpdate(prev => prev + 1);
      
    } catch (error) {
      console.error('App: Failed to generate insight:', error);
      throw error; // Re-throw to show error in UI
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleDeleteInsight = async (insightId: string) => {
    try {
      await deleteInsightFromSupabase(insightId);
    } catch (error) {
      console.error('Failed to delete insight from Supabase:', error);
    }

    // Always delete from local storage
    deleteInsightFromLocal(insightId);

    setInsights(prev => prev.filter(insight => insight.id !== insightId));
    
    // Update document
    if (currentDocument) {
      const updatedDocument = {
        ...currentDocument,
        insights: (currentDocument.insights || []).filter(insight => insight.id !== insightId),
      };
      setCurrentDocument(updatedDocument);
    }
  };

  const handleSyncInsights = async () => {
    if (!currentDocument) return;
    
    try {
      // Save all current insights to Supabase
      for (const insight of insights) {
        try {
          await saveInsightToSupabase(insight);
        } catch (error) {
          console.error('Failed to save insight to Supabase:', insight.id, error);
          // Continue with other insights even if one fails
        }
      }
      
      // Always save to local storage as backup
      insights.forEach(insight => saveInsightToLocal(insight));
      
      console.log('Insights synced successfully');
    } catch (error) {
      console.error('Failed to sync insights:', error);
      // Even if Supabase fails, ensure local storage is updated
      insights.forEach(insight => saveInsightToLocal(insight));
    }
  };

  // Debug logging for insights state
  React.useEffect(() => {
    console.log('App: Insights state changed:', insights);
  }, [insights]);

  // Auto-save insights to local storage whenever they change
  React.useEffect(() => {
    if (currentDocument && insights.length > 0) {
      insights.forEach(insight => saveInsightToLocal(insight));
      console.log('App: Auto-saved insights to local storage');
    }
  }, [insights, currentDocument]);

  return (
    <div className="h-screen flex bg-gray-50">
      <div className="flex-1 flex">
        {/* User Menu */}
        {user && (
          <div className="fixed top-6 right-6 z-50">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200"
                title="User menu"
              >
                {user.email?.charAt(0).toUpperCase()}
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </div>
                      <div className="text-gray-500 text-xs">{user.email}</div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4">
                    <button 
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Welcome message for non-authenticated users */}
        {!user && (
          <div className="fixed top-6 right-6 z-50">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 min-w-[320px]">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Welcome to Success Diary</h2>
                <p className="text-gray-600 text-sm">Sign in to sync your diary across devices</p>
              </div>
              
              <button 
                onClick={handleGoogleLogin}
                className="w-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-3 shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                Your data stays private and secure
              </p>
            </div>
          </div>
        )}
        
        <Sidebar
          documents={documents}
          currentDocument={currentDocument}
          onNewDocument={user ? handleNewDocument : () => {}}
          onSelectDocument={handleSelectDocument}
          onDeleteDocument={user ? handleDeleteDocument : () => {}}
          isPreviewMode={!user}
        />
        <div className="flex-1 flex">
          <Editor
            document={currentDocument}
            onSave={user ? handleSaveDocument : () => {}}
            onUpdate={user ? handleUpdateDocument : () => {}}
            isPreviewMode={!user}
          />
          {currentDocument && (
            <div className="flex items-center">
              <button
                onClick={user ? () => setShowInsightsPanel(!showInsightsPanel) : () => {}}
                className={`p-2 rounded-lg transition-colors ${
                  user 
                    ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100" 
                    : "text-gray-400 cursor-not-allowed"
                }`}
                title={user ? "Toggle AI Insights" : "Sign in to access AI Insights"}
                disabled={!user}
              >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
          </div>
        )}
          {showInsightsPanel && currentDocument && user && (
            <InsightsPanel
              documentId={currentDocument.id}
              documentContent={currentDocument.content}
              insights={insights}
              onGenerateInsight={handleGenerateInsight}
              onDeleteInsight={handleDeleteInsight}
              onSyncInsights={handleSyncInsights}
              isLoading={isLoadingInsights}
              memoryContext={memoryContext}
              key={`insights-${currentDocument.id}-${forceUpdate}`}
            />
          )}
        </div>
      
        {/* Fish Tank */}
        <FishTank />
        
        {/* Logout Button - Bottom Left (circular, next to fish tank) */}
        {user && (
          <div className="fixed bottom-5 left-24 z-30">
            <button
              onClick={handleLogout}
              className="w-14 h-14 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-full shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center text-gray-600 hover:text-gray-800"
              title="Sign out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App; 