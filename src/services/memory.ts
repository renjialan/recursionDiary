import { createClient } from '@supabase/supabase-js';
import { Memory, MemorySearchResult, MemoryContext } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Create Supabase client only if environment variables are available
let supabase: any = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.warn('Failed to initialize Supabase client for memory service:', error);
  }
}

// Generate embeddings using OpenAI
const generateEmbedding = async (text: string): Promise<number[]> => {
  if (!openaiApiKey) {
    console.warn('OpenAI API key not available for embeddings');
    return [];
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return [];
  }
};

// Store a new memory
export const storeMemory = async (memory: Omit<Memory, 'id' | 'createdAt'>): Promise<string> => {
  if (!supabase) {
    console.warn('Supabase not configured, storing in local storage');
    return storeMemoryLocally(memory);
  }

  try {
    // Generate embedding for the memory content
    const embedding = await generateEmbedding(memory.content);
    
    const memoryId = crypto.randomUUID();
    const now = new Date();

    const { error } = await supabase
      .from('memories')
      .insert({
        id: memoryId,
        user_id: memory.userId,
        content: memory.content,
        context: memory.context,
        tags: memory.tags || [],
        embedding: embedding,
        created_at: now.toISOString(),
        metadata: memory.metadata || {}
      });

    if (error) {
      console.error('Error storing memory to Supabase:', error);
      throw error;
    }

    return memoryId;
  } catch (error) {
    console.error('Failed to store memory to Supabase:', error);
    // Fallback to local storage
    return storeMemoryLocally(memory);
  }
};

// Search for relevant memories using semantic similarity
export const searchMemories = async (
  query: string,
  userId: string,
  limit: number = 5
): Promise<MemorySearchResult[]> => {
  if (!supabase) {
    console.warn('Supabase not configured, searching local storage');
    return searchMemoriesLocally(query, userId, limit);
  }

  try {
    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query);
    
    if (queryEmbedding.length === 0) {
      console.warn('Could not generate embedding for query, falling back to text search');
      return searchMemoriesByText(query, userId, limit);
    }

    // Perform vector similarity search
    const { data, error } = await supabase.rpc('match_memories', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: limit,
      user_id: userId
    });

    if (error) {
      console.error('Error searching memories:', error);
      return searchMemoriesByText(query, userId, limit);
    }

    return data.map((item: any) => ({
      memory: {
        id: item.id,
        userId: item.user_id,
        content: item.content,
        context: item.context,
        tags: item.tags || [],
        createdAt: new Date(item.created_at),
        metadata: item.metadata || {}
      },
      similarity: item.similarity,
      relevance: item.similarity > 0.8 ? 'high' : item.similarity > 0.6 ? 'medium' : 'low'
    }));
  } catch (error) {
    console.error('Failed to search memories:', error);
    return searchMemoriesByText(query, userId, limit);
  }
};

// Text-based search fallback
const searchMemoriesByText = async (
  query: string,
  userId: string,
  limit: number
): Promise<MemorySearchResult[]> => {
  if (!supabase) {
    return searchMemoriesLocally(query, userId, limit);
  }

  try {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .or(`content.ilike.%${query}%,tags.cs.{${query}}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error in text search:', error);
      return [];
    }

    return data.map((item: any) => ({
      memory: {
        id: item.id,
        userId: item.user_id,
        content: item.content,
        context: item.context,
        tags: item.tags || [],
        createdAt: new Date(item.created_at),
        metadata: item.metadata || {}
      },
      similarity: 0.5, // Default similarity for text search
      relevance: 'medium'
    }));
  } catch (error) {
    console.error('Failed to search memories by text:', error);
    return [];
  }
};

// Get memory context for AI responses
export const getMemoryContext = async (
  currentContent: string,
  userId: string,
  maxMemories: number = 3
): Promise<MemoryContext> => {
  try {
    // Search for relevant memories
    const searchResults = await searchMemories(currentContent, userId, maxMemories);
    
    if (searchResults.length === 0) {
      return {
        relevantMemories: [],
        summary: 'No relevant past memories found.',
        suggestions: []
      };
    }

    // Extract high-relevance memories
    const highRelevanceMemories = searchResults
      .filter(result => result.relevance === 'high')
      .map(result => result.memory);

    // Generate context summary
    const contextSummary = generateContextSummary(searchResults);
    
    // Generate suggestions based on memories
    const suggestions = generateSuggestions(searchResults, currentContent);

    return {
      relevantMemories: highRelevanceMemories,
      summary: contextSummary,
      suggestions
    };
  } catch (error) {
    console.error('Error getting memory context:', error);
    return {
      relevantMemories: [],
      summary: 'Unable to retrieve memory context.',
      suggestions: []
    };
  }
};

// Generate a summary of relevant memories
const generateContextSummary = (searchResults: MemorySearchResult[]): string => {
  if (searchResults.length === 0) return 'No relevant past memories found.';

  const highRelevance = searchResults.filter(r => r.relevance === 'high');
  const mediumRelevance = searchResults.filter(r => r.relevance === 'medium');

  let summary = '';
  
  if (highRelevance.length > 0) {
    summary += `I found ${highRelevance.length} highly relevant memory${highRelevance.length > 1 ? 'ies' : 'y'} from your past entries. `;
  }
  
  if (mediumRelevance.length > 0) {
    summary += `There are also ${mediumRelevance.length} somewhat related memory${mediumRelevance.length > 1 ? 'ies' : 'y'}. `;
  }

  // Add specific references
  const specificReferences = searchResults
    .slice(0, 2)
    .map(result => {
      const date = result.memory.createdAt.toLocaleDateString();
      const preview = result.memory.content.length > 100 
        ? result.memory.content.substring(0, 100) + '...'
        : result.memory.content;
      return `On ${date}, you mentioned: "${preview}"`;
    })
    .join(' ');

  if (specificReferences) {
    summary += specificReferences;
  }

  return summary;
};

// Generate suggestions based on memories
const generateSuggestions = (searchResults: MemorySearchResult[], _currentContent: string): string[] => {
  const suggestions: string[] = [];
  
  // Look for recurring themes
  const themes = extractThemes(searchResults);
  if (themes.length > 0) {
    suggestions.push(`Consider how this relates to your recurring theme of ${themes[0]}`);
  }

  // Look for past goals or commitments
  const pastGoals = searchResults
    .filter(result => 
      result.memory.content.toLowerCase().includes('goal') ||
      result.memory.content.toLowerCase().includes('commit') ||
      result.memory.content.toLowerCase().includes('promise')
    );

  if (pastGoals.length > 0) {
    suggestions.push('Reflect on how this connects to goals you\'ve mentioned before');
  }

  // Look for patterns in challenges
  const challenges = searchResults
    .filter(result => 
      result.memory.content.toLowerCase().includes('challenge') ||
      result.memory.content.toLowerCase().includes('struggle') ||
      result.memory.content.toLowerCase().includes('difficult')
    );

  if (challenges.length > 0) {
    suggestions.push('Consider what you\'ve learned from similar challenges in the past');
  }

  return suggestions.slice(0, 3); // Limit to 3 suggestions
};

// Extract recurring themes from memories
const extractThemes = (searchResults: MemorySearchResult[]): string[] => {
  const themes = [
    'work-life balance', 'personal growth', 'relationships', 'health', 'productivity',
    'creativity', 'learning', 'stress management', 'goal setting', 'self-care'
  ];

  const content = searchResults.map(r => r.memory.content.toLowerCase()).join(' ');
  
  return themes.filter(theme => content.includes(theme));
};

// Local storage fallbacks
const storeMemoryLocally = (memory: Omit<Memory, 'id' | 'createdAt'>): string => {
  const memoryId = crypto.randomUUID();
  const now = new Date();
  
  const fullMemory: Memory = {
    id: memoryId,
    ...memory,
    createdAt: now
  };

  const existingMemories = JSON.parse(localStorage.getItem('memories') || '[]');
  existingMemories.push(fullMemory);
  localStorage.setItem('memories', JSON.stringify(existingMemories));
  
  return memoryId;
};

const searchMemoriesLocally = (
  query: string,
  userId: string,
  limit: number
): MemorySearchResult[] => {
  try {
    const memories: Memory[] = JSON.parse(localStorage.getItem('memories') || '[]');
    const userMemories = memories.filter(m => m.userId === userId);
    
    // Simple text search
    const results = userMemories
      .filter(memory => 
        memory.content.toLowerCase().includes(query.toLowerCase()) ||
        memory.tags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, limit)
      .map(memory => ({
        memory,
        similarity: 0.5,
        relevance: 'medium' as const
      }));

    return results;
  } catch (error) {
    console.error('Error searching local memories:', error);
    return [];
  }
};

// Extract key information from diary content for memory storage
export const extractMemoryFromContent = (
  content: string,
  userId: string,
  context: string = 'diary_entry'
): Omit<Memory, 'id' | 'createdAt'> => {
  // Extract key phrases and topics
  const topics = extractTopicsFromContent(content);
  
  // Identify if this contains goals, challenges, or achievements
  const categories = identifyContentCategories(content);
  
  return {
    userId,
    content,
    context,
    tags: [...topics, ...categories],
    metadata: {
      wordCount: content.split(' ').length,
      categories,
      hasGoals: categories.includes('goals'),
      hasChallenges: categories.includes('challenges'),
      hasAchievements: categories.includes('achievements')
    }
  };
};

const extractTopicsFromContent = (content: string): string[] => {
  const topics = [
    'work', 'career', 'relationships', 'health', 'fitness', 'learning', 'creativity',
    'family', 'friends', 'goals', 'stress', 'anxiety', 'happiness', 'productivity',
    'time management', 'self-care', 'growth', 'challenges', 'success', 'failure',
    'exercise', 'diet', 'sleep', 'meditation', 'reading', 'writing', 'music',
    'travel', 'hobbies', 'finances', 'education', 'spirituality'
  ];

  const lowerContent = content.toLowerCase();
  return topics.filter(topic => lowerContent.includes(topic));
};

const identifyContentCategories = (content: string): string[] => {
  const categories: string[] = [];
  const lowerContent = content.toLowerCase();

  if (lowerContent.includes('goal') || lowerContent.includes('aim') || lowerContent.includes('target')) {
    categories.push('goals');
  }
  
  if (lowerContent.includes('challenge') || lowerContent.includes('struggle') || lowerContent.includes('difficult')) {
    categories.push('challenges');
  }
  
  if (lowerContent.includes('achieve') || lowerContent.includes('accomplish') || lowerContent.includes('success')) {
    categories.push('achievements');
  }
  
  if (lowerContent.includes('learn') || lowerContent.includes('study') || lowerContent.includes('understand')) {
    categories.push('learning');
  }
  
  if (lowerContent.includes('feel') || lowerContent.includes('emotion') || lowerContent.includes('mood')) {
    categories.push('emotions');
  }

  return categories;
}; 