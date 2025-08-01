# API Documentation

## Authentication API

### Google OAuth Flow

#### `signInWithGoogle()`
**Location**: `src/services/supabase.ts`
**Purpose**: Initiates Google OAuth authentication flow

```typescript
export const signInWithGoogle = async () => {
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}`
    }
  });
};
```

**Returns**: `Promise<AuthResponse>`
**Error Handling**: Returns error object if Supabase is not configured

#### `signOut()`
**Location**: `src/services/supabase.ts`
**Purpose**: Signs out the current user

```typescript
export const signOut = async () => {
  if (!supabase) {
    return { error: 'Supabase not configured' };
  }
  
  try {
    const { error } = await supabase.auth.signOut();
    return { data: null, error };
  } catch (error) {
    return { error };
  }
};
```

**Returns**: `Promise<{ data: null, error: any }>`

#### `handleAuthCallback()`
**Location**: `src/services/supabase.ts`
**Purpose**: Handles OAuth callback after authentication

```typescript
export const handleAuthCallback = async () => {
  if (!supabase) return;
  
  try {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  } catch (error) {
    return { error };
  }
};
```

**Returns**: `Promise<{ data: any, error: any }>`

## Document Management API

### Local Storage Operations

#### `saveDocument(document: Document)`
**Location**: `src/utils/storage.ts`
**Purpose**: Saves document to local storage

```typescript
export const saveDocument = (document: Document): void => {
  const documents = loadDocuments();
  const existingIndex = documents.findIndex(doc => doc.id === document.id);
  
  if (existingIndex >= 0) {
    documents[existingIndex] = document;
  } else {
    documents.push(document);
  }
  
  localStorage.setItem('documents', JSON.stringify(documents));
};
```

#### `loadDocuments()`
**Location**: `src/utils/storage.ts`
**Purpose**: Loads all documents from local storage

```typescript
export const loadDocuments = (): Document[] => {
  try {
    const stored = localStorage.getItem('documents');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading documents:', error);
    return [];
  }
};
```

**Returns**: `Document[]`

#### `deleteDocument(documentId: string)`
**Location**: `src/utils/storage.ts`
**Purpose**: Deletes document from local storage

```typescript
export const deleteDocument = (documentId: string): void => {
  const documents = loadDocuments();
  const filtered = documents.filter(doc => doc.id !== documentId);
  localStorage.setItem('documents', JSON.stringify(filtered));
};
```

### Supabase Operations

#### `saveDocumentToSupabase(document: Document)`
**Location**: `src/services/supabase.ts`
**Purpose**: Saves document to Supabase database

```typescript
export const saveDocumentToSupabase = async (document: Document): Promise<void> => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping save');
    return;
  }

  try {
    const { error } = await supabase
      .from('documents')
      .upsert({
        id: document.id,
        title: document.title,
        content: document.content,
        created_at: document.createdAt.toISOString(),
        updated_at: document.updatedAt.toISOString(),
        tags: document.tags || [],
      });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to save document to Supabase:', error);
  }
};
```

#### `loadDocumentsFromSupabase()`
**Location**: `src/services/supabase.ts`
**Purpose**: Loads all documents from Supabase

```typescript
export const loadDocumentsFromSupabase = async (): Promise<Document[]> => {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) return [];

    return data.map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      createdAt: new Date(doc.created_at),
      updatedAt: new Date(doc.updated_at),
      tags: doc.tags || [],
    }));
  } catch (error) {
    return [];
  }
};
```

**Returns**: `Promise<Document[]>`

## AI Insights API

### Insight Generation

#### `generateInsight(request: InsightRequest)`
**Location**: `src/services/ai.ts`
**Purpose**: Generates AI insights for a document

```typescript
export const generateInsight = async (request: InsightRequest): Promise<Insight> => {
  const { documentId, type, prompt, conversationHistory } = request;
  
  const systemPrompt = buildSystemPrompt(type, conversationHistory);
  const userPrompt = buildUserPrompt(prompt);
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 1000
  });

  return {
    id: crypto.randomUUID(),
    documentId,
    type,
    content: response.choices[0].message.content || '',
    createdAt: new Date(),
    conversationHistory: conversationHistory || [],
    metadata: { model: 'gpt-4', temperature: 0.7 }
  };
};
```

**Returns**: `Promise<Insight>`

#### `generateEnhancedInsight(request: EnhancedInsightRequest)`
**Location**: `src/services/ai.ts`
**Purpose**: Generates enhanced insights with memory context

```typescript
export const generateEnhancedInsight = async (request: EnhancedInsightRequest): Promise<Insight> => {
  const { memoryContext, previousInsights, ...baseRequest } = request;
  
  const enhancedPrompt = buildEnhancedPrompt(baseRequest, memoryContext, previousInsights);
  
  // Similar implementation to generateInsight but with enhanced context
};
```

**Returns**: `Promise<Insight>`

### Memory System API

#### `storeMemory(memory: Memory)`
**Location**: `src/services/memory.ts`
**Purpose**: Stores memory in vector database

```typescript
export const storeMemory = async (memory: Omit<Memory, 'id' | 'createdAt'>): Promise<string> => {
  try {
    // Try Pinecone first
    const embedding = await generateEmbedding(memory.content);
    const memoryId = await storeMemoryInPinecone(memory, embedding);
    return memoryId;
  } catch (error) {
    // Fallback to local storage
    return storeMemoryLocally(memory);
  }
};
```

**Returns**: `Promise<string>` (memory ID)

#### `searchMemories(query: string, userId: string)`
**Location**: `src/services/memory.ts`
**Purpose**: Searches memories semantically

```typescript
export const searchMemories = async (
  query: string,
  userId: string,
  limit: number = 5
): Promise<MemorySearchResult[]> => {
  try {
    // Try vector search first
    const results = await searchMemoriesByVector(query, userId, limit);
    if (results.length > 0) return results;
    
    // Fallback to text search
    return searchMemoriesByText(query, userId, limit);
  } catch (error) {
    // Fallback to local search
    return searchMemoriesLocally(query, userId, limit);
  }
};
```

**Returns**: `Promise<MemorySearchResult[]>`

#### `getMemoryContext(currentContent: string, userId: string)`
**Location**: `src/services/memory.ts`
**Purpose**: Gets relevant memory context for AI

```typescript
export const getMemoryContext = async (
  currentContent: string,
  userId: string,
  maxMemories: number = 3
): Promise<MemoryContext> => {
  const searchResults = await searchMemories(currentContent, userId, maxMemories);
  
  return {
    relevantMemories: searchResults,
    summary: generateContextSummary(searchResults),
    suggestions: generateSuggestions(searchResults, currentContent)
  };
};
```

**Returns**: `Promise<MemoryContext>`

## Template System API

#### `getTemplates()`
**Location**: `src/services/templates.ts`
**Purpose**: Returns all available templates

```typescript
export const getTemplates = (): Template[] => {
  return [
    {
      id: 'morning-reflection',
      title: 'Morning Reflection',
      content: 'Today I woke up feeling...\n\nI\'m grateful for...\n\nToday I want to focus on...',
      category: 'reflection'
    },
    // ... more templates
  ];
};
```

**Returns**: `Template[]`

#### `getTemplateById(id: string)`
**Location**: `src/services/templates.ts`
**Purpose**: Returns specific template by ID

```typescript
export const getTemplateById = (id: string): Template | undefined => {
  return getTemplates().find(template => template.id === id);
};
```

**Returns**: `Template | undefined`

## Utility Functions API

### Text Sanitization

#### `sanitizeText(text: string)`
**Location**: `src/utils/sanitize.ts`
**Purpose**: Sanitizes user input text

```typescript
export const sanitizeText = (text: string): string => {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .trim();
};
```

**Returns**: `string`

#### `sanitizeTitle(title: string)`
**Location**: `src/utils/sanitize.ts`
**Purpose**: Sanitizes document titles

```typescript
export const sanitizeTitle = (title: string): string => {
  return title
    .replace(/[<>]/g, '')
    .substring(0, 100)
    .trim();
};
```

**Returns**: `string`

### Fish Tank Animations

#### `createFish(id: string)`
**Location**: `src/utils/fishTankAnimations.ts`
**Purpose**: Creates a new fish for animation

```typescript
export const createFish = (id: string): Fish => ({
  id,
  x: Math.random() * TANK_CONFIG.width,
  y: Math.random() * TANK_CONFIG.height,
  vx: (Math.random() - 0.5) * 2,
  vy: (Math.random() - 0.5) * 2,
  size: Math.random() * 20 + 10,
  color: FISH_COLORS[Math.floor(Math.random() * FISH_COLORS.length)]
});
```

**Returns**: `Fish`

#### `updateFishPosition(fish: Fish)`
**Location**: `src/utils/fishTankAnimations.ts`
**Purpose**: Updates fish position for animation

```typescript
export const updateFishPosition = (fish: Fish): Fish => {
  let newX = fish.x + fish.vx;
  let newY = fish.y + fish.vy;
  let newVx = fish.vx;
  let newVy = fish.vy;

  // Bounce off walls
  if (newX <= 0 || newX >= TANK_CONFIG.width) {
    newVx = -newVx;
    newX = Math.max(0, Math.min(TANK_CONFIG.width, newX));
  }

  if (newY <= 0 || newY >= TANK_CONFIG.height) {
    newVy = -newVy;
    newY = Math.max(0, Math.min(TANK_CONFIG.height, newY));
  }

  return {
    ...fish,
    x: newX,
    y: newY,
    vx: newVx,
    vy: newVy
  };
};
```

**Returns**: `Fish`

## Error Handling

All API functions follow consistent error handling patterns:

1. **Graceful Degradation**: Fallback to local storage when external services fail
2. **Error Logging**: Console errors for debugging
3. **User Feedback**: Alert messages for critical errors
4. **Type Safety**: TypeScript interfaces for all return values

## Rate Limiting

- **OpenAI API**: Implemented in AI service functions
- **Supabase**: Handled by Supabase client
- **Pinecone**: Implemented in memory service

## Authentication Requirements

Most API functions require authentication:
- Document operations require valid user session
- AI insights require authentication
- Memory operations are user-specific
- Templates are available to all users 