export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  insights?: Insight[];
}

export interface DocumentListItem {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  preview: string;
}

export interface AppState {
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  error: string | null;
}

export interface Insight {
  id: string;
  documentId: string;
  type: 'single' | 'multi';
  content: string;
  createdAt: Date;
  conversationHistory?: ConversationMessage[];
  metadata?: {
    sentiment?: 'positive' | 'negative' | 'neutral';
    topics?: string[];
    actionItems?: string[];
    mood?: string;
  };
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface InsightRequest {
  documentId: string;
  type: 'single' | 'multi';
  prompt?: string;
  conversationHistory?: ConversationMessage[];
}

export interface AIResponse {
  insight: string;
  conversationHistory: ConversationMessage[];
  metadata?: {
    sentiment?: 'positive' | 'negative' | 'neutral';
    topics?: string[];
    actionItems?: string[];
    mood?: string;
  };
}

// Memory system types
export interface Memory {
  id: string;
  userId: string;
  content: string;
  context: string;
  tags: string[];
  createdAt: Date;
  metadata?: {
    wordCount?: number;
    categories?: string[];
    hasGoals?: boolean;
    hasChallenges?: boolean;
    hasAchievements?: boolean;
    [key: string]: any;
  };
}

export interface MemorySearchResult {
  memory: Memory;
  similarity: number;
  relevance: 'high' | 'medium' | 'low';
}

export interface MemoryContext {
  relevantMemories: Memory[];
  summary: string;
  suggestions: string[];
}

export interface EnhancedInsightRequest extends InsightRequest {
  memoryContext?: MemoryContext;
  userId: string;
}

// Template system types
export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'personal' | 'business' | 'relationship';
  content: string;
  preview?: string;
}

// Fish Tank types
export interface Fish {
  id: string;
  emoji: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  facingRight: boolean;
  lastDirectionChange: number;
  speed: number;
}

export interface Bubble {
  id: string;
  emoji: '💧' | '🫧' | '○';
  x: number;
  y: number;
  speed: number;
  drift: number;
  opacity: number;
} 