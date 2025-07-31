import React from 'react';
import { Brain, Trash2, RefreshCw, Sparkles, Download, Share2, Clock, History } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Insight, InsightRequest, MemoryContext } from '../types';
import { format as formatDate } from 'date-fns';

interface InsightsPanelProps {
  documentId: string;
  documentContent: string;
  insights: Insight[];
  onGenerateInsight: (request: InsightRequest) => Promise<void>;
  onDeleteInsight: (insightId: string) => void;
  onSyncInsights: () => Promise<void>;
  isLoading: boolean;
  memoryContext?: MemoryContext;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({
  documentId,
  documentContent,
  insights,
  onGenerateInsight,
  onDeleteInsight,
  onSyncInsights,
  isLoading,
  memoryContext,
}) => {
  const [followUpPrompt, setFollowUpPrompt] = React.useState('');
  const [debugInfo, setDebugInfo] = React.useState<string>('');
  const [panelWidth, setPanelWidth] = React.useState(384); // Default 384px (w-96)
  const [isResizing, setIsResizing] = React.useState(false);

  // Handle mouse events for resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleDoubleClick = () => {
    setPanelWidth(384); // Reset to default width
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = window.innerWidth - e.clientX;
      // Constrain width between 300px and 600px
      const constrainedWidth = Math.max(300, Math.min(600, newWidth));
      setPanelWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleGenerateSingleInsight = async () => {
    setDebugInfo('Starting insight generation...');
    
    const request: InsightRequest = {
      documentId,
      type: 'single',
    };
    
    try {
      setDebugInfo('Calling AI service...');
      await onGenerateInsight(request);
      setDebugInfo('Insight generated successfully!');
    } catch (error) {
      console.error('Error in handleGenerateSingleInsight:', error);
      setDebugInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleGenerateMultiTurnInsight = async () => {
    if (!followUpPrompt.trim() || insights.length === 0) return;

    // Use the most recent insight for the conversation
    const mostRecentInsight = insights[0];

    const request: InsightRequest = {
      documentId,
      type: 'multi',
      prompt: followUpPrompt,
      conversationHistory: mostRecentInsight.conversationHistory,
    };
    
    try {
      await onGenerateInsight(request);
      setFollowUpPrompt('');
    } catch (error) {
      console.error('Error in handleGenerateMultiTurnInsight:', error);
      setDebugInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleExportInsights = (format: 'json' | 'text') => {
    if (insights.length === 0) return;

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `insights-${documentId}-${timestamp}`;

    if (format === 'json') {
      const dataStr = JSON.stringify(insights, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      let textContent = `# AI Insights for Document\nGenerated on ${timestamp}\n\n`;
      
      insights.forEach((insight, index) => {
        textContent += `## Insight ${index + 1}\n`;
        textContent += `**Type:** ${insight.type}\n`;
        textContent += `**Created:** ${formatDate(insight.createdAt, 'PPP p')}\n\n`;
        textContent += `${insight.content}\n\n`;
        
        if (insight.metadata?.topics?.length) {
          textContent += `**Topics:** ${insight.metadata.topics.join(', ')}\n\n`;
        }
        if (insight.metadata?.actionItems?.length) {
          textContent += `**Action Items:**\n`;
          insight.metadata.actionItems.forEach(item => {
            textContent += `- ${item}\n`;
          });
          textContent += '\n';
        }
        textContent += '---\n\n';
      });

      const dataBlob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleShareInsights = async () => {
    if (insights.length === 0) return;

    try {
      const textContent = insights.map(insight => 
        `${insight.content}\n\nGenerated on ${formatDate(insight.createdAt, 'PPP p')}`
      ).join('\n\n---\n\n');

      if (navigator.share) {
        await navigator.share({
          title: 'AI Insights from Success Diary',
          text: textContent,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(textContent);
        setDebugInfo('Insights copied to clipboard!');
        setTimeout(() => setDebugInfo(''), 3000);
      }
    } catch (error) {
      console.error('Error sharing insights:', error);
      setDebugInfo('Failed to share insights');
    }
  };

  return (
    <>
      {/* Resizing overlay */}
      {isResizing && (
        <div className="fixed inset-0 bg-black bg-opacity-10 z-50 pointer-events-none" />
      )}
      
      <div 
        className="bg-white border-l border-gray-200 flex flex-col h-screen relative"
        style={{ width: `${panelWidth}px` }}
      >
        {/* Drag handle */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 transition-colors z-10 ${
            isResizing 
              ? 'bg-primary-500' 
              : 'bg-gray-300 hover:bg-primary-400'
          }`}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          style={{ cursor: 'col-resize' }}
          title="Drag to resize panel, double-click to reset"
        >
          {/* Visual indicator dots */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1">
            <div className="w-1 h-1 bg-gray-500 rounded-full opacity-60"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full opacity-60"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full opacity-60"></div>
          </div>
        </div>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Brain size={20} className="text-primary-600" />
              AI Insights
            </h2>
            <div className="flex items-center gap-2">
              {insights.length > 0 && (
                <>
                  <button
                    onClick={() => handleExportInsights('text')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Export as Text"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={handleShareInsights}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Share Insights"
                  >
                    <Share2 size={16} />
                  </button>
                  <button
                    onClick={onSyncInsights}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Sync to Cloud"
                  >
                    <RefreshCw size={16} />
                  </button>
                </>
              )}
              <button
                onClick={handleGenerateSingleInsight}
                disabled={isLoading || !documentContent.trim()}
                className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Sparkles size={16} />
                Generate
              </button>
            </div>
          </div>

          {/* Memory Context Display */}
          {memoryContext && memoryContext.relevantMemories.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <History size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Memory Context</span>
              </div>
              <p className="text-sm text-blue-700 mb-2">{memoryContext.summary}</p>
              {memoryContext.suggestions.length > 0 && (
                <div className="text-xs text-blue-600">
                  <span className="font-medium">Suggestions:</span>
                  <ul className="mt-1 space-y-1">
                    {memoryContext.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Debug Info */}
          {debugInfo && (
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              Debug: {debugInfo}
            </div>
          )}

          {/* Insights Count Debug */}
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
            Insights Count: {insights.length} | Document ID: {documentId}
          </div>
        </div>

        {/* Chat Messages Area - Independent Scrolling */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4" style={{ minHeight: 0 }}>
          {insights.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <Brain size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No insights yet</p>
              <p className="text-sm">Generate AI insights from your diary entry</p>
              <p className="text-xs text-gray-400 mt-2">
                Document content length: {documentContent.length} characters
              </p>
            </div>
          ) : (
            insights.map((insight) => (
              <div key={insight.id} className="space-y-3">
                {/* User message (document content) */}
                <div className="flex justify-end">
                  <div className="bg-primary-600 text-white rounded-lg p-3 max-w-[80%]">
                    <p className="text-sm">📝 Diary Entry</p>
                    <p className="text-xs opacity-80 mt-1">
                      {documentContent.length > 100 
                        ? `${documentContent.substring(0, 100)}...` 
                        : documentContent
                      }
                    </p>
                  </div>
                </div>

                {/* AI response */}
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain size={16} className="text-primary-600" />
                      <span className="text-sm font-medium text-gray-700">AI Assistant</span>
                      <span className="text-xs text-gray-500">
                        {formatDate(insight.createdAt, 'h:mm a')}
                      </span>
                      {/* Memory indicator */}
                      {insight.content.toLowerCase().includes('you mentioned') || 
                       insight.content.toLowerCase().includes('reminds me') ||
                       insight.content.toLowerCase().includes('previously') && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <Clock size={12} />
                          <span>Memory</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => <h1 className="text-lg font-semibold text-gray-900 mb-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-semibold text-gray-900 mb-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-900 mb-1">{children}</h3>,
                          p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-3">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                          em: ({ children }) => <em className="italic text-gray-800">{children}</em>,
                          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3 text-gray-700">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3 text-gray-700">{children}</ol>,
                          li: ({ children }) => <li className="text-gray-700">{children}</li>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-primary-200 pl-4 italic text-gray-600 mb-3">
                              {children}
                            </blockquote>
                          ),
                          code: ({ children }) => (
                            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {insight.content}
                      </ReactMarkdown>
                    </div>

                    {/* Metadata */}
                    {insight.metadata && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        {insight.metadata.topics && insight.metadata.topics.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs font-medium text-gray-600">Topics: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {insight.metadata.topics.map((topic, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {insight.metadata.actionItems && insight.metadata.actionItems.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-gray-600">Action Items: </span>
                            <ul className="mt-1 space-y-1">
                              {insight.metadata.actionItems.map((item, index) => (
                                <li key={index} className="text-xs text-gray-700 flex items-start gap-2">
                                  <span className="text-primary-600 mt-1">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Delete button */}
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => onDeleteInsight(insight.id)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete insight"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Chat Input Area - Fixed at bottom */}
        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          <div className="flex gap-2">
            <textarea
              value={followUpPrompt}
              onChange={(e) => setFollowUpPrompt(e.target.value)}
              placeholder="Ask a follow-up question..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerateMultiTurnInsight();
                }
              }}
            />
            <button
              onClick={handleGenerateMultiTurnInsight}
              disabled={isLoading || !followUpPrompt.trim() || insights.length === 0}
              className="px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InsightsPanel; 