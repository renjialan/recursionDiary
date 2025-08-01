import React from 'react';
import { Plus, FileText, Trash2, Search } from 'lucide-react';
import { Document } from '../types';
import { format } from 'date-fns';

interface SidebarProps {
  documents: Document[];
  currentDocument: Document | null;
  onNewDocument: () => void;
  onSelectDocument: (document: Document) => void;
  onDeleteDocument: (documentId: string) => void;
  isPreviewMode?: boolean;
  user?: any;
  onLogout?: () => void;
  onLogin?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  documents,
  currentDocument,
  onNewDocument,
  onSelectDocument,
  onDeleteDocument,
  isPreviewMode = false,
  user,
  onLogout,
  onLogin,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDocumentPreview = (content: string) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Success Diary</h1>
          <div className="flex items-center gap-2">
            {user ? (
              <button
                onClick={onLogout}
                className="p-2 rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                title="Sign out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            ) : (
              <button
                onClick={onLogin}
                className="p-2 rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                title="Sign in with Google"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
            )}
            <button
              onClick={onNewDocument}
              className={`p-2 rounded-lg transition-colors ${
                isPreviewMode 
                  ? "text-gray-400 cursor-not-allowed" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              title={isPreviewMode ? "Sign in to create documents" : "New Document"}
              disabled={isPreviewMode}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto">
        {filteredDocuments.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No documents found' : 'No documents yet'}
          </div>
        ) : (
          <div className="p-2">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  currentDocument?.id === doc.id
                    ? 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => onSelectDocument(doc)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={16} className="text-gray-400 flex-shrink-0" />
                      <h3 className="font-medium text-gray-900 truncate">
                        {doc.title || 'Untitled'}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                      {getDocumentPreview(doc.content)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(doc.updatedAt, 'MMM d, yyyy')}
                    </p>
                  </div>
                  {!isPreviewMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDocument(doc.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Delete document"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 