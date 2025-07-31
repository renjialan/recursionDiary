# Success Diary

A minimalistic, AI-powered daily journaling app inspired by Notion and Airbnb design. Track your thoughts, goals, and progress with intelligent insights, secure Google authentication, and cross-device sync.

## Features

### ✨ Core Experience
- **Daily Journaling**: Rich text editor with minimalistic, distraction-free design
- **Template System**: Pre-built templates (Success Diary, Founder's Log, Couples Journal) with Airbnb-style card selection
- **Google Authentication**: Secure sign-in with Google OAuth through Supabase
- **Cross-device Sync**: Your entries sync seamlessly across all your devices
- **Interactive Fish Tank**: Relaxing emoji aquarium with touch interactions and bubble effects

### 🤖 AI-Powered Insights
- **GPT-4 Analysis**: AI analyzes your diary entries and provides personalized insights
- **Memory Context**: AI remembers your past entries and references them in conversations
- **Multi-turn Conversations**: Ask follow-up questions and have natural conversations
- **Pattern Recognition**: Identifies recurring themes, goals, and personal growth areas
- **Independent Scrolling**: AI insights panel scrolls independently for better UX

### 🔒 Privacy & Security
- **Row-Level Security**: Your data is protected by Supabase RLS policies
- **Local Storage Fallback**: Works offline with automatic local storage backup
- **Input Sanitization**: XSS protection for all user inputs
- **No Tracking**: Privacy-first approach with no analytics or tracking

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

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd success-diary
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up Supabase database**
   
   Run this SQL in your Supabase SQL editor:
   ```sql
   -- Create memories table for AI context
   CREATE TABLE IF NOT EXISTS memories (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id TEXT NOT NULL,
     content TEXT NOT NULL,
     embedding VECTOR(1536),
     metadata JSONB DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable RLS
   ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

   -- Create RLS policy
   CREATE POLICY "Users can manage their own memories" ON memories
     FOR ALL USING (auth.uid()::text = user_id);
   ```

5. **Configure Google OAuth in Supabase**
   - Go to Authentication > Providers in your Supabase dashboard
   - Enable Google provider
   - Add your domain to authorized redirect URLs:
     - For local: `http://localhost:3000`
     - For production: `https://your-vercel-domain.vercel.app`

6. **Start development server**
   ```bash
   npm run dev
   ```

## Deployment to Vercel

### 1. Prepare Your Repository

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

### 2. Deploy to Vercel

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   
   In Vercel dashboard, add these environment variables:
   ```
   VITE_SUPABASE_URL → your_supabase_project_url
   VITE_SUPABASE_ANON_KEY → your_supabase_anon_key  
   VITE_OPENAI_API_KEY → your_openai_api_key
   ```

3. **Update Google OAuth Settings**
   - In Supabase dashboard, go to Authentication > Providers
   - Update Google OAuth redirect URLs to include:
     ```
     https://your-app-name.vercel.app
     ```

4. **Deploy**
   - Click "Deploy" in Vercel
   - Your app will be live at `https://your-app-name.vercel.app`

### 3. Post-Deployment

1. **Test Authentication**
   - Visit your deployed app
   - Try Google sign-in
   - Create a test journal entry
   - Generate AI insights

2. **Monitor Performance**
   - Check Vercel analytics
   - Monitor Supabase usage
   - Watch OpenAI API costs

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

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite with production optimizations
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: OpenAI GPT-4 with memory context
- **Authentication**: Google OAuth via Supabase
- **Deployment**: Vercel
- **Styling**: Tailwind CSS with minimalistic design

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `VITE_OPENAI_API_KEY` | OpenAI API key for AI insights | Yes |
| `VITE_PINECONE_API_KEY` | Pinecone API key (optional) | No |
| `VITE_PINECONE_ENVIRONMENT` | Pinecone environment (optional) | No |
| `VITE_PINECONE_INDEX_NAME` | Pinecone index name (optional) | No |

## Security

- All API keys are client-side only and encrypted in transit
- User data is protected by Supabase Row Level Security (RLS)
- Google OAuth provides secure authentication
- Input sanitization prevents XSS attacks
- No sensitive data is logged or stored in plain text

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