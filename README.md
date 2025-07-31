# Success Diary - AI-Powered Personal Journal

A Notion-like personal diary application with AI-powered insights and memory system. Built with React, TypeScript, Tailwind CSS, and OpenAI integration.

## Features

### Core Functionality
- **Document Management**: Create, edit, save, and organize diary entries
- **Rich Text Editor**: Clean, distraction-free writing experience
- **Document Navigation**: Easy switching between entries with sidebar
- **Local Storage**: Automatic saving to browser storage
- **Cloud Sync**: Optional Supabase integration for cross-device access

### AI-Powered Insights
- **Smart Analysis**: AI analyzes your diary entries and provides personalized insights
- **Multi-turn Conversations**: Ask follow-up questions and have natural conversations
- **Actionable Advice**: Get specific, practical recommendations
- **Emotional Intelligence**: AI recognizes patterns in your emotions and experiences
- **Export & Share**: Download insights as JSON or text files

### 🧠 Memory System & RAG (Retrieval Augmented Generation)
- **Personal Memory**: AI remembers your past entries and references them in conversations
- **Semantic Search**: Uses vector embeddings to find relevant past experiences
- **Contextual Responses**: AI provides insights that build on your personal history
- **Pattern Recognition**: Identifies recurring themes, goals, and challenges
- **Smart Reminders**: References past commitments and encourages follow-through

#### How Memory Works
1. **Automatic Storage**: Every diary entry is automatically stored as a memory with semantic embeddings
2. **Smart Retrieval**: When you write new entries, the AI searches for relevant past experiences
3. **Contextual Insights**: AI responses include references like "You mentioned before that..." or "This reminds me of when you..."
4. **Personal Growth Tracking**: The system helps you see patterns and progress over time

#### Memory Features
- **Vector Embeddings**: Uses OpenAI's text-embedding-ada-002 for semantic similarity
- **Fallback Search**: Text-based search when embeddings aren't available
- **Memory Context Display**: See what past experiences the AI is referencing
- **Local Storage**: Memories work offline with local storage fallback
- **Privacy-First**: All memories are stored locally by default

## Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- OpenAI API key (for AI insights)
- Supabase account (optional, for cloud sync)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd success-diary
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Database Setup (Optional)**
   If using Supabase for cloud sync:
   
   a. Run the main setup script:
   ```sql
   -- Copy and run the contents of supabase-setup.sql in your Supabase SQL editor
   ```
   
   b. Run the memory system setup:
   ```sql
   -- Copy and run the contents of supabase-memory-setup.sql in your Supabase SQL editor
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

### Basic Diary Writing
1. Click "New Document" to create a new diary entry
2. Write your thoughts, experiences, or reflections
3. The document auto-saves as you type
4. Use the sidebar to navigate between entries

### AI Insights
1. Write a diary entry with some content
2. Click the brain icon to open the AI Insights panel
3. Click "Generate" to get AI analysis of your entry
4. Ask follow-up questions in the chat interface
5. Export or share insights as needed

### Memory System
1. **Automatic**: The memory system works automatically - just write diary entries
2. **Memory Context**: When you generate insights, the AI will reference relevant past entries
3. **Pattern Recognition**: Look for recurring themes and patterns in your insights
4. **Personal Growth**: Use the memory system to track progress on goals and commitments

### Tips for Better AI Insights
- **Be Specific**: Include details about your experiences, emotions, and thoughts
- **Ask Questions**: Use the follow-up chat to dive deeper into specific areas
- **Regular Writing**: The more you write, the better the AI understands your patterns
- **Goal Setting**: Mention goals and the AI will help track your progress
- **Challenges**: Share struggles and the AI will reference similar past experiences

## Technical Architecture

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for fast development and building
- **React Markdown** for rendering AI responses
- **Date-fns** for date formatting

### AI Integration
- **OpenAI GPT-3.5-turbo** for text generation
- **OpenAI text-embedding-ada-002** for vector embeddings
- **Direct API calls** for reliability and simplicity
- **Memory system** for contextual responses

### Data Storage
- **Local Storage**: Primary storage for documents and insights
- **Supabase**: Optional cloud storage with PostgreSQL
- **Vector Database**: pgvector extension for semantic search
- **Memory System**: Automatic storage and retrieval of user experiences

### Memory System Architecture
```
User writes diary entry
    ↓
Extract key information (topics, categories, goals)
    ↓
Generate vector embeddings
    ↓
Store in memory database
    ↓
When generating new insights:
    ↓
Search for relevant memories
    ↓
Include memory context in AI prompt
    ↓
Generate personalized, contextual response
```

## API Keys and Services

### OpenAI
- **Purpose**: AI text generation and vector embeddings
- **Models Used**: 
  - `gpt-3.5-turbo` for insights and conversations
  - `text-embedding-ada-002` for memory embeddings
- **Cost**: ~$0.002 per 1K tokens for GPT-3.5, ~$0.0001 per 1K tokens for embeddings

### Supabase (Optional)
- **Purpose**: Cloud storage and vector database
- **Features**: 
  - Document and insight storage
  - Vector similarity search
  - Real-time sync
- **Extensions**: pgvector for vector operations

## Development

### Project Structure
```
src/
├── components/          # React components
│   ├── Editor.tsx      # Rich text editor
│   ├── Sidebar.tsx     # Document navigation
│   └── InsightsPanel.tsx # AI insights interface
├── services/           # External service integrations
│   ├── ai.ts          # OpenAI integration
│   ├── memory.ts      # Memory system and RAG
│   └── supabase.ts    # Database operations
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── App.tsx           # Main application component
```

### Key Features Implementation

#### Memory System
- **Vector Embeddings**: Automatic generation and storage of semantic embeddings
- **Similarity Search**: Fast retrieval of relevant memories using cosine similarity
- **Context Integration**: Seamless integration with AI prompts for personalized responses
- **Fallback Mechanisms**: Text-based search when vector search isn't available

#### RAG Implementation
- **Memory Retrieval**: Smart search for relevant past experiences
- **Context Enhancement**: AI prompts include memory context for better responses
- **Personal References**: AI naturally references past entries in conversations
- **Pattern Recognition**: Identifies recurring themes and personal growth areas

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed information
3. Include your environment details and error messages

---

**Note**: This application stores your personal diary entries and memories. While it uses local storage by default, consider your privacy needs when using cloud sync features. 