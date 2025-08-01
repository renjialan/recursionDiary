import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import InsightsPanel from './components/InsightsPanel';
import FishTank from './components/FishTank';
import AuthCallback from './components/AuthCallback';
import DebugPanel from './components/DebugPanel';
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
import { saveInsightToSupabase, loadInsightsFromSupabase, deleteInsightFromSupabase, signInWithGoogle, signOut, handleAuthCallback, supabase } from './services/supabase';
import { getMemoryContext } from './services/memory';
import { MemoryContext } from './types';

const App: React.FC = () => {
  console.log('🚀 App component starting to render...');
  
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
  
  // Route detection
  const isAuthCallback = window.location.pathname === '/auth/callback';
  
  console.log('✅ App component state initialized successfully');

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
    console.log('🔐 Auth Setup Starting:');
    console.log('  - Supabase available:', !!supabase);
    
    if (supabase) {
      console.log('✅ Setting up auth listeners...');
      
      // Handle OAuth callback on page load
      console.log('  - Handling OAuth callback...');
      handleAuthCallback();
      
      // Check current session
      console.log('  - Checking current session...');
      supabase.auth.getSession().then(({ data: { session } }: any) => {
        console.log('📋 Initial session check:');
        console.log('    - Session exists:', !!session);
        console.log('    - User logged in:', !!session?.user);
        if (session?.user) {
          console.log('    - User email:', session.user.email);
          console.log('    - User ID:', session.user.id);
        }
        setUser(session?.user ?? null);
      });

      // Listen for auth changes
      console.log('  - Setting up auth state listener...');
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
        console.log('🔄 Auth state change detected:');
        console.log('    - Event:', event);
        console.log('    - User logged in:', !!session?.user);
        if (session?.user) {
          console.log('    - User email:', session.user.email);
        }
        setUser(session?.user ?? null);
      });

      return () => {
        console.log('🧹 Cleaning up auth subscription');
        subscription.unsubscribe();
      };
    } else {
      console.log('❌ Supabase not available for auth setup');
    }
  }, []);

  // Login functions
  const handleGoogleLogin = async () => {
    console.log('🔐 handleGoogleLogin called');
    console.log('  - Current user state:', !!user);
    
    try {
      const { error } = await signInWithGoogle();
      console.log('📤 signInWithGoogle result:', { error });
      
      if (error) {
        console.error('❌ Login error:', error);
        alert('Login failed. Please try again.');
      } else {
        console.log('✅ Login initiated successfully');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    console.log('🚪 handleLogout called');
    console.log('  - Current user state:', !!user);
    if (user) {
      console.log('  - User email:', user.email);
      console.log('  - User ID:', user.id);
    }
    
    try {
      console.log('📞 Calling signOut function...');
      const { error } = await signOut();
      console.log('📤 signOut result:', { error });
      
      if (error) {
        console.error('❌ Logout error:', error);
        alert('Failed to sign out. Please try again.');
        return;
      }
      
      // Note: The signOut function will handle page reload
      // No need to manually clear state as the page will refresh
      console.log('✅ Logout completed successfully - page will reload');
    } catch (error) {
      console.error('❌ Logout error:', error);
      alert('Failed to sign out. Please try again.');
    }
  };


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
      return;
    }

    // Always try local storage first
    const localInsights = loadInsightsFromLocal(documentId);
    
    if (localInsights.length > 0) {
      // If we have local insights, use them
      setInsights(localInsights);
      return;
    }

    // Only try Supabase if local storage is empty
    try {
      const documentInsights = await loadInsightsFromSupabase(documentId);
      setInsights(documentInsights);
    } catch (error) {
      setInsights([]);
    }
  };

  const loadMemoryContext = async (content: string) => {
    if (!userId) return;
    
    try {
      const context = await getMemoryContext(content, userId, 3);
      setMemoryContext(context);
    } catch (error) {
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
      // Silently handle storage errors
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
        // Silently handle Supabase errors
      }

      // Always save to local storage as backup
      try {
        saveInsightToLocal(newInsight);
        
        // Verify it was saved by loading it back
        loadInsightsFromLocal(currentDocument.id);
      } catch (error) {
        // Silently handle local storage errors
      }

      // Update local state - this is the key part
      const updatedInsights = [newInsight, ...insights];
      setInsights(updatedInsights);
      
      // Force a re-render
      setForceUpdate(prev => prev + 1);
      
    } catch (error) {
      throw error; // Re-throw to show error in UI
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleDeleteInsight = async (insightId: string) => {
    try {
      await deleteInsightFromSupabase(insightId);
    } catch (error) {
      // Silently handle Supabase errors
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
          // Continue with other insights even if one fails
        }
      }
      
      // Always save to local storage as backup
      insights.forEach(insight => saveInsightToLocal(insight));
      
    } catch (error) {
      // Even if Supabase fails, ensure local storage is updated
      insights.forEach(insight => saveInsightToLocal(insight));
    }
  };

  // Auto-save insights to local storage whenever they change
  React.useEffect(() => {
    if (currentDocument && insights.length > 0) {
      insights.forEach(insight => saveInsightToLocal(insight));
    }
  }, [insights, currentDocument]);

  // Show auth callback component if we're on the callback route
  if (isAuthCallback) {
    console.log('🔄 Rendering AuthCallback component');
    return <AuthCallback />;
  }

  console.log('🎨 Rendering main App component');
  console.log('  - User:', !!user);
  console.log('  - Documents count:', documents.length);
  console.log('  - Current document:', !!currentDocument);
  console.log('  - Supabase available:', !!supabase);

  return (
    <div className="h-screen flex bg-gray-50">
      <div className="flex-1 flex">
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
            user={user}
            onLogout={handleLogout}
            onLogin={handleGoogleLogin}
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
        <DebugPanel 
          user={user} 
          onLogin={handleGoogleLogin} 
          onLogout={handleLogout} 
        />
      </div>
    </div>
  );
};

export default App; 