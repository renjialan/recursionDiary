# Success Diary

A Notion-like diary application with AI-powered insights, built with React, TypeScript, and Supabase.

## 🚀 Features

- **Rich Text Editor**: Markdown-style formatting with real-time preview
- **AI-Powered Insights**: Generate intelligent insights about your diary entries
- **Document Management**: Create, edit, and organize your diary entries
- **Google Authentication**: Secure login with Google OAuth
- **Cross-Device Sync**: Data syncs across devices via Supabase
- **Memory Context**: AI remembers your past entries for better insights
- **Template System**: Pre-built templates for different types of entries
- **Fish Tank Animation**: Delightful UI element with interactive animations

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth (Google OAuth)
- **Database**: Supabase (PostgreSQL)
- **AI Services**: OpenAI GPT-4
- **Memory/Vector DB**: Pinecone
- **Deployment**: Vercel

### Project Structure
```
success-diary/
├── src/
│   ├── components/          # React components
│   ├── services/           # API and external service integrations
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── public/                # Static assets
├── dist/                  # Build output
└── Configuration files
```

## 📁 Component Architecture

### Core Components

#### `App.tsx` - Main Application Component
**Location**: `src/App.tsx`
**Purpose**: Main application orchestrator and state management

**Key Responsibilities**:
- User authentication state management
- Document CRUD operations
- AI insight generation coordination
- Memory context management
- Local/Supabase data synchronization

**Key State Variables**:
```typescript
const [documents, setDocuments] = useState<Document[]>([]);
const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
const [insights, setInsights] = useState<Insight[]>([]);
const [user, setUser] = useState<any>(null);
const [memoryContext, setMemoryContext] = useState<MemoryContext | undefined>();
```

**Key Functions**:
- `handleGoogleLogin()` - Initiates Google OAuth flow
- `handleLogout()` - Signs out user and clears state
- `handleSaveDocument()` - Saves document to local storage and Supabase
- `handleGenerateInsight()` - Generates AI insights for current document
- `loadMemoryContext()` - Loads relevant past entries for AI context

#### `Editor.tsx` - Rich Text Editor
**Location**: `src/components/Editor.tsx`
**Purpose**: Main text editing interface with formatting tools

**Features**:
- Real-time markdown-style formatting
- Template system integration
- Auto-save functionality
- Preview mode for non-authenticated users
- Authentication UI in toolbar

**Key Props**:
```typescript
interface EditorProps {
  document: Document | null;
  onSave: (document: Document) => void;
  onUpdate: (document: Document) => void;
  isPreviewMode?: boolean;
  user?: any;
  onLogout?: () => void;
  onLogin?: () => void;
}
```

**Key Functions**:
- `handleSave()` - Saves current document with sanitization
- `insertText()` - Inserts formatted text at cursor position
- `handleSelectTemplate()` - Applies template to current document

#### `Sidebar.tsx` - Document Navigation
**Location**: `src/components/Sidebar.tsx`
**Purpose**: Document list and navigation interface

**Features**:
- Document list with search functionality
- Document preview snippets
- Create new document button
- Authentication buttons (login/logout)
- Delete document functionality

**Key Props**:
```typescript
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
```

#### `InsightsPanel.tsx` - AI Insights Interface
**Location**: `src/components/InsightsPanel.tsx`
**Purpose**: AI-powered insights generation and display

**Features**:
- Single-turn insight generation
- Multi-turn conversation insights
- Insight export (JSON/Text)
- Insight sharing
- Memory context display
- Resizable panel

**Key Props**:
```typescript
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
```

#### `FishTank.tsx` - Interactive Animation
**Location**: `src/components/FishTank.tsx`
**Purpose**: Delightful UI animation element

**Features**:
- Expandable fish tank animation
- Interactive fish movement
- Bubble generation
- Click interactions
- Performance-optimized animations

## 🔧 Services Architecture

### Authentication Service (`supabase.ts`)
**Location**: `src/services/supabase.ts`
**Purpose**: Handles all Supabase interactions

**Key Functions**:
```typescript
// Authentication
export const signInWithGoogle = async () => Promise<AuthResponse>
export const signOut = async () => Promise<{ data: null, error: any }>
export const handleAuthCallback = async () => Promise<{ data: any, error: any }>

// Document Operations
export const saveDocumentToSupabase = async (document: Document) => Promise<void>
export const loadDocumentsFromSupabase = async () => Promise<Document[]>
export const deleteDocumentFromSupabase = async (documentId: string) => Promise<void>

// Insight Operations
export const saveInsightToSupabase = async (insight: Insight) => Promise<void>
export const loadInsightsFromSupabase = async (documentId: string) => Promise<Insight[]>
export const deleteInsightFromSupabase = async (insightId: string) => Promise<void>
```

### AI Service (`ai.ts`)
**Location**: `src/services/ai.ts`
**Purpose**: OpenAI GPT-4 integration for insight generation

**Key Functions**:
```typescript
export const generateInsight = async (request: InsightRequest) => Promise<Insight>
export const generateEnhancedInsight = async (request: EnhancedInsightRequest) => Promise<Insight>
```

**AI Prompt Engineering**:
- Context-aware prompts using memory system
- Structured output for consistent insights
- Multi-turn conversation support
- Error handling and fallbacks

### Memory Service (`memory.ts`)
**Location**: `src/services/memory.ts`
**Purpose**: Vector-based memory system for AI context

**Key Functions**:
```typescript
export const storeMemory = async (memory: Memory) => Promise<string>
export const searchMemories = async (query: string, userId: string) => Promise<MemorySearchResult[]>
export const getMemoryContext = async (currentContent: string, userId: string) => Promise<MemoryContext>
export const extractMemoryFromContent = async (content: string, userId: string) => Promise<string>
```

**Memory System Features**:
- Semantic search using embeddings
- Context summarization
- Suggestion generation
- Local storage fallback

### Template Service (`templates.ts`)
**Location**: `src/services/templates.ts`
**Purpose**: Pre-built document templates

**Key Functions**:
```typescript
export const getTemplates = (): Template[]
export const getTemplateById = (id: string): Template | undefined
```

## 📊 Data Models

### Core Types (`types/index.ts`)

```typescript
// Document Model
interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  insights?: Insight[];
}

// Insight Model
interface Insight {
  id: string;
  documentId: string;
  type: 'single' | 'multi';
  content: string;
  createdAt: Date;
  conversationHistory?: any[];
  metadata?: any;
}

// Memory Model
interface Memory {
  id: string;
  userId: string;
  content: string;
  tags: string[];
  context: string;
  createdAt: Date;
  embedding?: number[];
}

// AI Request Models
interface InsightRequest {
  documentId: string;
  type: 'single' | 'multi';
  prompt?: string;
  conversationHistory?: any[];
}

interface EnhancedInsightRequest extends InsightRequest {
  memoryContext?: MemoryContext;
  previousInsights?: Insight[];
}
```

## 🔐 Authentication Flow

### OAuth Configuration
1. **Google OAuth Console**: Configure authorized origins and redirect URIs
2. **Supabase Auth Settings**: Set up site URL and redirect URLs
3. **Environment Variables**: Configure Supabase URL and keys

### Authentication States
- **Unauthenticated**: Preview mode with sample documents
- **Authenticated**: Full functionality with data persistence

## 🚀 Deployment

### Vercel Configuration
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Node Version**: 18+
- **Environment Variables**: Required for Supabase and OpenAI

### Environment Variables
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_PINECONE_API_KEY=your_pinecone_api_key
VITE_PINECONE_ENVIRONMENT=your_pinecone_environment
```

## 🛠️ Development Guidelines

### Adding New Features

#### 1. Component Development
- Follow existing component patterns in `src/components/`
- Use TypeScript interfaces for props
- Implement proper error handling
- Add loading states where appropriate

#### 2. Service Integration
- Add new services to `src/services/`
- Follow existing error handling patterns
- Implement local storage fallbacks
- Add proper TypeScript types

#### 3. State Management
- Use React hooks for local state
- Follow existing patterns in `App.tsx`
- Consider data persistence requirements
- Implement proper cleanup

### Code Quality Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React and TypeScript
- **Prettier**: Consistent code formatting
- **Error Handling**: Comprehensive error boundaries
- **Performance**: Optimized re-renders and animations

### Testing Strategy
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: Service and API testing
- **E2E Tests**: User flow testing
- **Performance Tests**: Animation and rendering optimization

## 🔍 Debugging Guide

### Common Issues

#### Authentication Problems
1. Check Google OAuth configuration
2. Verify Supabase auth settings
3. Check environment variables
4. Review browser console for errors

#### AI Insights Not Working
1. Verify OpenAI API key
2. Check Pinecone configuration
3. Review memory service logs
4. Test with simple prompts

#### Data Sync Issues
1. Check Supabase connection
2. Verify local storage permissions
3. Review network connectivity
4. Check data validation

### Debug Tools
- **Browser DevTools**: Network and console monitoring
- **Supabase Dashboard**: Real-time database monitoring
- **OpenAI API**: Usage and error monitoring
- **Vercel Analytics**: Performance monitoring

## 📈 Performance Optimization

### Current Optimizations
- **Code Splitting**: Vendor and utility chunks
- **Lazy Loading**: Component-level code splitting
- **Memoization**: React.memo for expensive components
- **Animation Optimization**: RequestAnimationFrame usage
- **Bundle Optimization**: Tree shaking and minification

### Future Optimizations
- **Service Worker**: Offline functionality
- **Virtual Scrolling**: Large document lists
- **Image Optimization**: Asset compression
- **Caching Strategy**: Intelligent data caching

## 🤝 Contributing

### Development Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start development server: `npm run dev`
5. Build for production: `npm run build`

### Code Review Process
1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Submit pull request
5. Code review and approval

## 📄 License

MIT License - see LICENSE file for details

---

**For AI Coders**: This documentation provides a comprehensive overview of the Success Diary application architecture. Key areas to focus on when making changes:

1. **State Management**: All main state is managed in `App.tsx`
2. **Service Layer**: External integrations are in `src/services/`
3. **Component Structure**: Follow existing patterns in `src/components/`
4. **Type Safety**: All interfaces are defined in `src/types/`
5. **Error Handling**: Implement comprehensive error handling
6. **Performance**: Consider impact on animations and user experience 