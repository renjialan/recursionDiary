import { InsightRequest, AIResponse, ConversationMessage, MemoryContext, EnhancedInsightRequest } from '../types';
import { getMemoryContext, extractMemoryFromContent, storeMemory } from './memory';

const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Debug logging
console.log('AI Service: Environment check');
console.log('AI Service: VITE_OPENAI_API_KEY exists:', !!openaiApiKey);
console.log('AI Service: VITE_OPENAI_API_KEY length:', openaiApiKey?.length || 0);
console.log('AI Service: VITE_OPENAI_API_KEY starts with sk-:', openaiApiKey?.startsWith('sk-') || false);

// Create API key only if available
let apiKey: string | null = null;

if (openaiApiKey) {
  apiKey = openaiApiKey;
  console.log('AI Service: API key loaded successfully');
} else {
  console.warn('AI Service: No OpenAI API key found in environment variables');
}

const BASE_SYSTEM_PROMPT = `You are an AI life coach and personal development expert with a remarkable memory of your user's journey. Your role is to analyze diary entries and provide insightful, actionable feedback that builds on your understanding of their personal history.

Your responses should be:
1. **Memory-aware** - Reference past entries and show continuity in their journey
2. **Empathetic and supportive** - Recognize emotions and validate feelings
3. **Actionable** - Provide specific, practical advice and next steps
4. **Growth-oriented** - Focus on learning opportunities and personal development
5. **Structured** - Organize insights into clear categories
6. **Encouraging** - Maintain a positive, motivating tone

When you have relevant memories from past entries, incorporate them naturally into your response. Use phrases like:
- "You mentioned before that..."
- "This reminds me of when you..."
- "Building on your previous thoughts about..."
- "I notice a pattern in your entries where..."

For each analysis, provide:
- **Emotional insights**: What emotions are present and why
- **Pattern recognition**: Recurring themes or behaviors (especially from past entries)
- **Action items**: Specific, achievable next steps
- **Growth opportunities**: Areas for personal development
- **Positive reinforcement**: Celebrate wins and progress
- **Memory connections**: How this relates to their past experiences

Keep responses concise but comprehensive, typically 200-400 words.`;

export const generateInsight = async (
  documentContent: string,
  request: InsightRequest,
  userId?: string
): Promise<AIResponse> => {
  console.log('AI Service: generateInsight called');
  console.log('AI Service: apiKey exists:', !!apiKey);
  
  if (!apiKey) {
    console.error('AI Service: No API key available');
    throw new Error('OpenAI not configured. Please check your API key.');
  }

  try {
    console.log('AI Service: Building messages...');
    
    // Get memory context if userId is provided
    let memoryContext: MemoryContext | undefined;
    if (userId) {
      console.log('AI Service: Retrieving memory context...');
      memoryContext = await getMemoryContext(documentContent, userId, 3);
      console.log('AI Service: Memory context retrieved:', memoryContext.summary);
    }

    // Build enhanced system prompt with memory context
    let systemPrompt = BASE_SYSTEM_PROMPT;
    if (memoryContext && memoryContext.relevantMemories.length > 0) {
      systemPrompt += `\n\nRELEVANT MEMORIES FROM PAST ENTRIES:
${memoryContext.relevantMemories.map((memory, index) => 
  `${index + 1}. ${memory.createdAt.toLocaleDateString()}: "${memory.content.substring(0, 150)}${memory.content.length > 150 ? '...' : ''}"`
).join('\n')}

Use these memories to provide more personalized and contextual insights. Reference specific past experiences when relevant.`;
    }

    // Build conversation history
    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history if it's a multi-turn conversation
    if (request.conversationHistory && request.conversationHistory.length > 0) {
      request.conversationHistory.forEach((msg) => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });
    }

    // Add the current document content and request
    let userPrompt = '';
    if (request.type === 'single') {
      userPrompt = `Please analyze this diary entry and provide insights:\n\n${documentContent}`;
      
      // Add memory context to the prompt if available
      if (memoryContext && memoryContext.summary !== 'No relevant past memories found.') {
        userPrompt += `\n\nMEMORY CONTEXT: ${memoryContext.summary}`;
        
        if (memoryContext.suggestions.length > 0) {
          userPrompt += `\n\nSUGGESTIONS TO CONSIDER:\n${memoryContext.suggestions.map(s => `- ${s}`).join('\n')}`;
        }
      }
    } else {
      userPrompt = `Please continue our conversation about this diary entry. Here's the original entry:\n\n${documentContent}\n\nUser's follow-up: ${request.prompt || 'Please provide additional insights.'}`;
      
      // Add memory context for follow-up questions too
      if (memoryContext && memoryContext.summary !== 'No relevant past memories found.') {
        userPrompt += `\n\nMEMORY CONTEXT: ${memoryContext.summary}`;
      }
    }

    messages.push({ role: 'user', content: userPrompt });

    console.log('AI Service: Making API call to OpenAI...');
    console.log('AI Service: Messages count:', messages.length);
    console.log('AI Service: Document content length:', documentContent.length);
    console.log('AI Service: Memory context available:', !!memoryContext);

    // Make direct API call to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 600
      })
    });

    console.log('AI Service: Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('AI Service: OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const insight = data.choices[0]?.message?.content || 'No response generated';

    console.log('AI Service: Insight generated, length:', insight.length);

    // Store this interaction as a memory if userId is provided
    if (userId) {
      try {
        console.log('AI Service: Storing interaction as memory...');
        const memoryData = extractMemoryFromContent(documentContent, userId, 'diary_entry');
        await storeMemory(memoryData);
        console.log('AI Service: Memory stored successfully');
      } catch (error) {
        console.warn('AI Service: Failed to store memory:', error);
      }
    }

    // Extract metadata from the response
    const metadata = extractMetadata(insight);

    // Create conversation history
    const conversationHistory: ConversationMessage[] = [
      ...(request.conversationHistory || []),
      {
        role: 'user',
        content: userPrompt,
        timestamp: new Date(),
      },
      {
        role: 'assistant',
        content: insight,
        timestamp: new Date(),
      },
    ];

    console.log('AI Service: Returning response');

    return {
      insight,
      conversationHistory,
      metadata,
    };
  } catch (error) {
    console.error('AI Service: Error generating insight:', error);
    throw new Error(`Failed to generate insight: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Enhanced insight generation with explicit memory context
export const generateEnhancedInsight = async (
  documentContent: string,
  request: EnhancedInsightRequest
): Promise<AIResponse> => {
  return generateInsight(documentContent, request, request.userId);
};

const extractMetadata = (insight: string) => {
  const metadata: any = {};

  // Extract sentiment
  const positiveWords = ['positive', 'happy', 'excited', 'grateful', 'proud', 'accomplished', 'motivated'];
  const negativeWords = ['negative', 'sad', 'frustrated', 'anxious', 'stressed', 'overwhelmed', 'disappointed'];
  
  const lowerInsight = insight.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerInsight.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerInsight.includes(word)).length;
  
  if (positiveCount > negativeCount) {
    metadata.sentiment = 'positive';
  } else if (negativeCount > positiveCount) {
    metadata.sentiment = 'negative';
  } else {
    metadata.sentiment = 'neutral';
  }

  // Extract topics (simple keyword extraction)
  const topics = extractTopics(insight);
  if (topics.length > 0) {
    metadata.topics = topics;
  }

  // Extract action items
  const actionItems = extractActionItems(insight);
  if (actionItems.length > 0) {
    metadata.actionItems = actionItems;
  }

  return metadata;
};

const extractTopics = (insight: string): string[] => {
  const commonTopics = [
    'work', 'career', 'relationships', 'health', 'fitness', 'learning', 'creativity',
    'family', 'friends', 'goals', 'stress', 'anxiety', 'happiness', 'productivity',
    'time management', 'self-care', 'growth', 'challenges', 'success', 'failure'
  ];

  const lowerInsight = insight.toLowerCase();
  return commonTopics.filter(topic => lowerInsight.includes(topic));
};

const extractActionItems = (insight: string): string[] => {
  const actionPatterns = [
    /try\s+([^.]+)/gi,
    /consider\s+([^.]+)/gi,
    /practice\s+([^.]+)/gi,
    /focus\s+on\s+([^.]+)/gi,
    /work\s+on\s+([^.]+)/gi,
    /develop\s+([^.]+)/gi,
  ];

  const actionItems: string[] = [];
  
  actionPatterns.forEach(pattern => {
    const matches = insight.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const action = match.replace(/^(try|consider|practice|focus on|work on|develop)\s+/i, '').trim();
        if (action.length > 5 && action.length < 100) {
          actionItems.push(action);
        }
      });
    }
  });

  return actionItems.slice(0, 5); // Limit to 5 action items
}; 