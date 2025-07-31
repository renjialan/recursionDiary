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
}

const Sidebar: React.FC<SidebarProps> = ({
  documents,
  currentDocument,
  onNewDocument,
  onSelectDocument,
  onDeleteDocument,
  isPreviewMode = false,
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