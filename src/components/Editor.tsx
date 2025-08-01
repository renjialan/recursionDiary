import React from 'react';
import { Bold, Italic, List, ListOrdered, Quote, Code, Save, Layout } from 'lucide-react';
import { Document, Template } from '../types';
import TemplateModal from './TemplateModal';
import { sanitizeText, sanitizeTitle } from '../utils/sanitize';

interface EditorProps {
  document: Document | null;
  onSave: (document: Document) => void;
  onUpdate: (document: Document) => void;
  isPreviewMode?: boolean;
  user?: any;
  onLogout?: () => void;
  onLogin?: () => void;
}

const Editor: React.FC<EditorProps> = ({ document, onSave, onUpdate, isPreviewMode = false, user, onLogout, onLogin }) => {
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [document]);

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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isPreviewMode) return;
    
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    if (document) {
      onUpdate({
        ...document,
        title: newTitle,
        updatedAt: new Date(),
      });
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isPreviewMode) return;
    
    const newContent = e.target.value;
    setContent(newContent);
    
    if (document) {
      onUpdate({
        ...document,
        content: newContent,
        updatedAt: new Date(),
      });
    }
  };

  const handleSave = () => {
    if (document) {
      const sanitizedTitle = sanitizeTitle(title);
      const sanitizedContent = sanitizeText(content);
      
      onSave({
        ...document,
        title: sanitizedTitle,
        content: sanitizedContent,
        updatedAt: new Date(),
      });
      
      // Update local state with sanitized values
      setTitle(sanitizedTitle);
      setContent(sanitizedContent);
    }
  };

  const insertText = (text: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + text + content.substring(end);
      setContent(newContent);
      
      if (document) {
        onUpdate({
          ...document,
          content: newContent,
          updatedAt: new Date(),
        });
      }
      
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    try {
      const isEmptyDocument = !content.trim() && !title.trim();
      
      if (isEmptyDocument) {
        // Replace entire content for empty documents
        setContent(template.content);
        setTitle(template.name);
        
        if (document) {
          onUpdate({
            ...document,
            title: template.name,
            content: template.content,
            updatedAt: new Date(),
          });
        }
      } else {
        // Insert at cursor position for existing content
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const prefix = start > 0 ? '\n\n' : '';
          const templateContent = prefix + template.content;
          const newContent = content.substring(0, start) + templateContent + content.substring(end);
          setContent(newContent);
          
          if (document) {
            onUpdate({
              ...document,
              content: newContent,
              updatedAt: new Date(),
            });
          }
          
          // Set cursor position after inserted template
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
              start + templateContent.length,
              start + templateContent.length
            );
          }, 0);
        }
      }
    } catch (error) {
      console.error('Failed to insert template:', error);
      // Fallback: just append template to end of content
      setContent(prev => prev + '\n\n' + template.content);
    }
  };

  if (!document) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">Welcome to Success Diary</h2>
          <p className="text-gray-500">Select a document from the sidebar or create a new one to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPreviewMode && (
              <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-xs font-medium">
                Preview Mode - Sign in to edit
              </div>
            )}
            <button
              onClick={() => !isPreviewMode && insertText('**bold**')}
              className={`p-2 rounded transition-colors ${
                isPreviewMode 
                  ? "text-gray-400 cursor-not-allowed" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              title={isPreviewMode ? "Sign in to use formatting" : "Bold"}
              disabled={isPreviewMode}
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => !isPreviewMode && insertText('*italic*')}
              className={`p-2 rounded transition-colors ${
                isPreviewMode 
                  ? "text-gray-400 cursor-not-allowed" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              title={isPreviewMode ? "Sign in to use formatting" : "Italic"}
              disabled={isPreviewMode}
            >
              <Italic size={16} />
            </button>
            <button
              onClick={() => !isPreviewMode && insertText('\n- List item')}
              className={`p-2 rounded transition-colors ${
                isPreviewMode 
                  ? "text-gray-400 cursor-not-allowed" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              title={isPreviewMode ? "Sign in to use formatting" : "Bullet List"}
              disabled={isPreviewMode}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => !isPreviewMode && insertText('\n1. Numbered item')}
              className={`p-2 rounded transition-colors ${
                isPreviewMode 
                  ? "text-gray-400 cursor-not-allowed" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              title={isPreviewMode ? "Sign in to use formatting" : "Numbered List"}
              disabled={isPreviewMode}
            >
              <ListOrdered size={16} />
            </button>
            <button
              onClick={() => !isPreviewMode && insertText('\n> Quote')}
              className={`p-2 rounded transition-colors ${
                isPreviewMode 
                  ? "text-gray-400 cursor-not-allowed" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              title={isPreviewMode ? "Sign in to use formatting" : "Quote"}
              disabled={isPreviewMode}
            >
              <Quote size={16} />
            </button>
            <button
              onClick={() => !isPreviewMode && insertText('`code`')}
              className={`p-2 rounded transition-colors ${
                isPreviewMode 
                  ? "text-gray-400 cursor-not-allowed" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              title={isPreviewMode ? "Sign in to use formatting" : "Code"}
              disabled={isPreviewMode}
            >
              <Code size={16} />
            </button>
            
            {/* Divider */}
            <div className="w-px h-6 bg-gray-300 mx-2" />
            
            {/* Template Button */}
            <button
              onClick={() => !isPreviewMode && setIsTemplateModalOpen(true)}
              className={`p-2 rounded transition-colors ${
                isPreviewMode 
                  ? "text-gray-400 cursor-not-allowed" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              title={isPreviewMode ? "Sign in to use templates" : "Templates"}
              disabled={isPreviewMode}
            >
              <Layout size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isPreviewMode
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-gray-900 dark:bg-gray-100 text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
              }`}
              disabled={isPreviewMode}
              title={isPreviewMode ? "Sign in to save documents" : "Save"}
            >
              <Save size={16} />
              {isPreviewMode ? "Preview" : "Save"}
            </button>
            
            {/* Authentication UI */}
            {user ? (
              /* User Profile Button for authenticated users */
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 bg-gray-900 dark:bg-gray-100 rounded-full flex items-center justify-center text-white dark:text-black font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200"
                  title="User menu"
                >
                  {user.email?.charAt(0).toUpperCase()}
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 z-50">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gray-900 dark:bg-gray-100 rounded-full flex items-center justify-center text-white dark:text-black font-medium text-sm">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {user.user_metadata?.full_name || user.email?.split('@')[0]}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">{user.email}</div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                      <button 
                        onClick={() => {
                          onLogout?.();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Sign In Button for unauthenticated users */
              <button
                onClick={onLogin}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                title="Sign in with Google"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder={isPreviewMode ? "Sample Document Title" : "Untitled"}
            className={`w-full text-3xl font-bold mb-6 border-none outline-none bg-transparent ${
              isPreviewMode
                ? "text-gray-500 placeholder-gray-400 cursor-not-allowed"
                : "text-gray-900 placeholder-gray-400"
            }`}
            readOnly={isPreviewMode}
          />
          
          {/* Content Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder={isPreviewMode ? "This is a preview of the Success Diary editor. Sign in to create and edit your own documents with AI-powered insights." : "Start writing your thoughts..."}
            readOnly={isPreviewMode}
            className="w-full h-full min-h-[500px] text-gray-700 leading-relaxed border-none outline-none bg-transparent resize-none font-sans"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          />
        </div>
      </div>
      
      {/* Template Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
};

export default Editor; 