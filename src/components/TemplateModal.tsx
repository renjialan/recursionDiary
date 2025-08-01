import React, { useEffect, useState } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Template } from '../types';
import { getAvailableTemplates } from '../services/templates';
import TemplateCard from './TemplateCard';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const templates = getAvailableTemplates();
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSelectTemplate = (template: Template) => {
    onSelectTemplate(template);
    onClose();
  };

  const handlePreviewTemplate = (template: Template) => {
    setPreviewTemplate(template);
  };

  const handleClosePreview = () => {
    setPreviewTemplate(null);
  };

  if (!isOpen) return null;

  // Preview mode
  if (previewTemplate) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClosePreview}
        />
        
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Preview Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-8 py-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleClosePreview}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">{previewTemplate.name}</h2>
                    <p className="text-gray-600 mt-1">{previewTemplate.description}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="px-4 sm:px-8 py-8">
              <div className="prose prose-gray max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                >
                  {previewTemplate.content}
                </ReactMarkdown>
              </div>
              
              {/* Use Template Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleSelectTemplate(previewTemplate)}
                  className="w-full py-4 px-6 bg-gray-900 text-white rounded-lg font-medium text-lg transition-colors hover:bg-gray-800 active:bg-gray-900"
                >
                  Use This Template
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-8 py-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Templates</h2>
                <p className="text-gray-600 mt-1">Choose a template to get started</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Template Grid */}
          <div className="px-4 sm:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleSelectTemplate}
                  onPreview={handlePreviewTemplate}
                />
              ))}
            </div>

            {/* Empty state for future templates */}
            <div className="mt-8 p-6 border-2 border-dashed border-gray-200 rounded-xl text-center">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">More templates coming soon</h3>
              <p className="text-gray-600 text-sm">
                We're working on adding more templates to help you with different aspects of your success journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;