# Quick Reference Guide

## 🚀 For AI Coders - Start Here!

This guide helps AI coders quickly understand the Success Diary codebase and find what they need.

## 📁 Key Files & Locations

### **Main Application Logic**
- **`src/App.tsx`** - Main application component, state management, authentication
- **`src/main.tsx`** - Application entry point

### **Core Components**
- **`src/components/Editor.tsx`** - Rich text editor with formatting tools
- **`src/components/Sidebar.tsx`** - Document navigation and authentication UI
- **`src/components/InsightsPanel.tsx`** - AI insights generation and display
- **`src/components/FishTank.tsx`** - Interactive animation component

### **Services (External Integrations)**
- **`src/services/supabase.ts`** - Database, authentication, document CRUD
- **`src/services/ai.ts`** - OpenAI GPT-4 integration for insights
- **`src/services/memory.ts`** - Vector database for AI context
- **`src/services/templates.ts`** - Document templates

### **Data & Types**
- **`src/types/index.ts`** - All TypeScript interfaces and types
- **`src/utils/storage.ts`** - Local storage operations
- **`src/utils/sanitize.ts`** - Input sanitization utilities

## 🔧 Common Tasks & Where to Look

### **Adding a New Feature**

1. **Component Changes**: Look in `src/components/`
2. **API Integration**: Add to `src/services/`
3. **Type Definitions**: Update `src/types/index.ts`
4. **State Management**: Modify `src/App.tsx`

### **Authentication Issues**
- **Login/Logout**: `src/services/supabase.ts` (lines 22-50)
- **Auth UI**: `src/components/Sidebar.tsx` (lines 30-60)
- **Auth State**: `src/App.tsx` (lines 45-75)

### **Document Management**
- **Save/Load**: `src/utils/storage.ts` (local) + `src/services/supabase.ts` (remote)
- **CRUD Operations**: `src/App.tsx` (lines 180-250)
- **Document List**: `src/components/Sidebar.tsx` (lines 70-120)

### **AI Features**
- **Insight Generation**: `src/services/ai.ts`
- **Memory System**: `src/services/memory.ts`
- **AI UI**: `src/components/InsightsPanel.tsx`

### **Styling & UI**
- **Design System**: `docs/DESIGN.md`
- **Tailwind Classes**: Used throughout components
- **Responsive Design**: Mobile-first approach

## 🎯 Key Functions to Know

### **Authentication Functions**
```typescript
// src/services/supabase.ts
signInWithGoogle()     // Google OAuth login
signOut()             // User logout
handleAuthCallback()  // OAuth callback handler
```

### **Document Functions**
```typescript
// src/App.tsx
handleSaveDocument()    // Save to local + Supabase
handleNewDocument()     // Create new document
handleDeleteDocument()  // Delete document
loadDocuments()         // Load from storage
```

### **AI Functions**
```typescript
// src/services/ai.ts
generateInsight()           // Basic AI insight
generateEnhancedInsight()  // AI with memory context

// src/services/memory.ts
storeMemory()              // Store in vector DB
searchMemories()           // Semantic search
getMemoryContext()         // Get AI context
```

## 🔍 Debugging Quick Guide

### **Common Issues & Solutions**

#### **Authentication Not Working**
1. Check `src/services/supabase.ts` - environment variables
2. Verify Google OAuth configuration
3. Check browser console for errors

#### **AI Insights Not Generating**
1. Check `src/services/ai.ts` - OpenAI API key
2. Verify `src/services/memory.ts` - Pinecone configuration
3. Check network requests in browser dev tools

#### **Data Not Syncing**
1. Check `src/services/supabase.ts` - Supabase connection
2. Verify local storage in `src/utils/storage.ts`
3. Check authentication state in `src/App.tsx`

#### **Build Errors**
1. Check TypeScript errors: `npx tsc --noEmit`
2. Verify dependencies: `npm install`
3. Check environment variables

### **Development Commands**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npx tsc --noEmit     # Check TypeScript errors
```

## 📊 Data Flow Overview

```
User Action → Component → App.tsx → Service → External API
     ↓
Local Storage ← Supabase ← Response
```

### **Example: Saving a Document**
1. User clicks save in `Editor.tsx`
2. Calls `onSave` prop → `App.tsx`
3. `handleSaveDocument()` in `App.tsx`
4. Calls `saveDocument()` in `storage.ts` (local)
5. Calls `saveDocumentToSupabase()` in `supabase.ts` (remote)

## 🎨 UI Component Hierarchy

```
App.tsx
├── Sidebar.tsx (Document list + Auth)
├── Editor.tsx (Text editor + Toolbar)
├── InsightsPanel.tsx (AI insights)
└── FishTank.tsx (Animation)
```

## 🔧 Configuration Files

- **`package.json`** - Dependencies and scripts
- **`tsconfig.json`** - TypeScript configuration
- **`vite.config.ts`** - Build configuration
- **`vercel.json`** - Deployment configuration
- **`tailwind.config.js`** - Styling configuration

## 🚨 Important Notes for AI Coders

### **State Management**
- **All main state** is managed in `src/App.tsx`
- **Local component state** uses React hooks
- **No external state management** (Redux, Zustand, etc.)

### **Error Handling**
- **Graceful degradation** - fallback to local storage
- **User-friendly messages** - no technical jargon
- **Console logging** - for debugging

### **Performance**
- **Code splitting** - vendor chunks in `vite.config.ts`
- **Animation optimization** - `requestAnimationFrame` in FishTank
- **Lazy loading** - for non-critical components

### **Security**
- **Input sanitization** - `src/utils/sanitize.ts`
- **Authentication checks** - before sensitive operations
- **Environment variables** - for API keys

## 🎯 Quick Fixes

### **Add a New Button**
1. Add to component JSX
2. Add click handler
3. Update props interface if needed
4. Add to parent component if needed

### **Add a New Service Function**
1. Add to appropriate service file
2. Add TypeScript types
3. Add error handling
4. Test with console.log

### **Add a New Component**
1. Create file in `src/components/`
2. Follow component template
3. Add to types if needed
4. Import and use in parent

### **Fix TypeScript Errors**
1. Check `src/types/index.ts` for missing types
2. Add proper interfaces
3. Use proper type annotations
4. Avoid `any` types

## 📚 Additional Resources

- **Full Documentation**: `README.md`
- **API Reference**: `docs/API.md`
- **Design System**: `docs/DESIGN.md`
- **Development Guide**: `docs/DEVELOPMENT.md`

## 🆘 Need Help?

1. **Check the console** - Browser dev tools for errors
2. **Check the logs** - Console.log statements throughout code
3. **Check the docs** - Comprehensive documentation available
4. **Check the types** - TypeScript interfaces show expected data

---

**Remember**: This is a React + TypeScript + Vite application with Supabase backend and OpenAI AI features. Follow existing patterns and maintain consistency with the current codebase. 