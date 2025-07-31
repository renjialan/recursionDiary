import { Document, Insight } from '../types';

const STORAGE_KEY = 'success-diary-documents';
const INSIGHTS_STORAGE_KEY = 'success-diary-insights';

export const saveDocuments = (documents: Document[]): void => {
  try {
    const serialized = documents.map(doc => ({
      ...doc,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.error('Failed to save documents:', error);
  }
};

export const loadDocuments = (): Document[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((doc: any) => ({
      ...doc,
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt),
    }));
  } catch (error) {
    console.error('Failed to load documents:', error);
    return [];
  }
};

export const saveDocument = (document: Document): void => {
  const documents = loadDocuments();
  const existingIndex = documents.findIndex(doc => doc.id === document.id);
  
  if (existingIndex >= 0) {
    documents[existingIndex] = document;
  } else {
    documents.push(document);
  }
  
  saveDocuments(documents);
};

export const deleteDocument = (documentId: string): void => {
  const documents = loadDocuments();
  const filtered = documents.filter(doc => doc.id !== documentId);
  saveDocuments(filtered);
};

// Insight storage functions
export const saveInsights = (insights: Insight[]): void => {
  try {
    const serialized = insights.map(insight => ({
      ...insight,
      createdAt: insight.createdAt.toISOString(),
      conversationHistory: insight.conversationHistory?.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      })) || [],
    }));
    
    localStorage.setItem(INSIGHTS_STORAGE_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.error('Failed to save insights:', error);
  }
};

export const loadInsights = (): Insight[] => {
  try {
    const stored = localStorage.getItem(INSIGHTS_STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((insight: any) => ({
      ...insight,
      createdAt: new Date(insight.createdAt),
      conversationHistory: insight.conversationHistory?.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })) || [],
    }));
  } catch (error) {
    console.error('Failed to load insights:', error);
    return [];
  }
};

export const saveInsight = (insight: Insight): void => {
  const insights = loadInsights();
  const existingIndex = insights.findIndex(i => i.id === insight.id);
  
  if (existingIndex >= 0) {
    insights[existingIndex] = insight;
  } else {
    insights.push(insight);
  }
  
  saveInsights(insights);
};

export const loadInsightsForDocument = (documentId: string): Insight[] => {
  const allInsights = loadInsights();
  return allInsights.filter(insight => insight.documentId === documentId);
};

export const deleteInsight = (insightId: string): void => {
  const insights = loadInsights();
  const filtered = insights.filter(insight => insight.id !== insightId);
  saveInsights(filtered);
}; 