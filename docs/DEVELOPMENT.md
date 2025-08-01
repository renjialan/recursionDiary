# Development Guide

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **Git**: For version control
- **Code Editor**: VS Code recommended with TypeScript support

### Environment Setup

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd success-diary
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Environment Variables
Create a `.env.local` file in the root directory:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_PINECONE_API_KEY=your_pinecone_api_key
VITE_PINECONE_ENVIRONMENT=your_pinecone_environment
```

#### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🏗️ Project Structure

### Directory Organization
```
success-diary/
├── src/
│   ├── components/          # React components
│   │   ├── Editor.tsx      # Main text editor
│   │   ├── Sidebar.tsx     # Document navigation
│   │   ├── InsightsPanel.tsx # AI insights interface
│   │   ├── FishTank.tsx    # Interactive animation
│   │   └── ...             # Other components
│   ├── services/           # External service integrations
│   │   ├── supabase.ts     # Database and auth
│   │   ├── ai.ts          # OpenAI integration
│   │   ├── memory.ts      # Vector database
│   │   └── templates.ts   # Document templates
│   ├── types/              # TypeScript definitions
│   │   └── index.ts       # All type definitions
│   ├── utils/              # Utility functions
│   │   ├── storage.ts     # Local storage
│   │   ├── sanitize.ts    # Input sanitization
│   │   └── fishTankAnimations.ts # Animation utilities
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── public/                # Static assets
├── docs/                  # Documentation
├── dist/                  # Build output
└── Configuration files
```

### File Naming Conventions
- **Components**: PascalCase (e.g., `Editor.tsx`, `InsightsPanel.tsx`)
- **Services**: camelCase (e.g., `supabase.ts`, `ai.ts`)
- **Utilities**: camelCase (e.g., `storage.ts`, `sanitize.ts`)
- **Types**: camelCase (e.g., `index.ts` in types folder)

## 🧩 Component Development

### Component Structure Template

```typescript
import React from 'react';
import { ComponentProps } from '../types';

interface ComponentNameProps {
  // Define props interface
  prop1: string;
  prop2?: number; // Optional prop
  onAction?: (data: any) => void; // Callback prop
}

const ComponentName: React.FC<ComponentNameProps> = ({
  prop1,
  prop2,
  onAction,
}) => {
  // State management
  const [state, setState] = React.useState<string>('');

  // Effects
  React.useEffect(() => {
    // Effect logic
  }, [prop1]);

  // Event handlers
  const handleClick = () => {
    // Handler logic
    onAction?.(data);
  };

  // Render
  return (
    <div className="component-name">
      {/* Component content */}
    </div>
  );
};

export default ComponentName;
```

### Component Guidelines

#### 1. Props Interface
- Always define a clear props interface
- Use descriptive prop names
- Include JSDoc comments for complex props
- Make props optional when appropriate

#### 2. State Management
- Use React hooks for local state
- Keep state as close to where it's used as possible
- Lift state up when needed for sharing between components

#### 3. Event Handling
- Use descriptive handler names (e.g., `handleSave`, `handleDelete`)
- Always check if optional callbacks exist before calling
- Provide proper TypeScript types for event parameters

#### 4. Styling
- Use Tailwind CSS classes
- Follow the design system patterns
- Use consistent spacing and typography
- Implement responsive design

### Adding New Components

#### 1. Create Component File
```bash
touch src/components/NewComponent.tsx
```

#### 2. Implement Component
Follow the component structure template above

#### 3. Add to Types
Update `src/types/index.ts` if new types are needed

#### 4. Export Component
Add export to `src/components/index.ts` (if using barrel exports)

#### 5. Test Component
Create tests and verify functionality

## 🔧 Service Development

### Service Structure Template

```typescript
// src/services/newService.ts

import { ServiceType } from '../types';

// Configuration
const SERVICE_CONFIG = {
  baseUrl: import.meta.env.VITE_SERVICE_URL,
  timeout: 5000,
};

// Main service functions
export const serviceFunction = async (params: ServiceParams): Promise<ServiceResult> => {
  try {
    // Service logic
    const result = await performOperation(params);
    return { data: result, error: null };
  } catch (error) {
    console.error('Service error:', error);
    return { data: null, error };
  }
};

// Helper functions
const performOperation = async (params: ServiceParams): Promise<any> => {
  // Implementation
};

// Error handling
const handleServiceError = (error: any): ServiceError => {
  // Error handling logic
};
```

### Service Guidelines

#### 1. Error Handling
- Always wrap operations in try-catch blocks
- Return consistent error objects
- Log errors for debugging
- Provide fallback mechanisms

#### 2. Configuration
- Use environment variables for configuration
- Provide sensible defaults
- Document configuration requirements

#### 3. Type Safety
- Define proper TypeScript interfaces
- Use strict typing for all parameters and returns
- Avoid `any` types when possible

#### 4. Performance
- Implement caching where appropriate
- Use efficient data structures
- Minimize network requests

### Adding New Services

#### 1. Create Service File
```bash
touch src/services/newService.ts
```

#### 2. Define Types
Add service-specific types to `src/types/index.ts`

#### 3. Implement Service
Follow the service structure template

#### 4. Add Environment Variables
Update `.env.local` with required variables

#### 5. Test Service
Create tests and verify integration

## 🎨 Styling Guidelines

### Tailwind CSS Usage

#### 1. Utility Classes
- Use Tailwind utility classes for styling
- Follow the design system color palette
- Use consistent spacing scale
- Implement responsive design

#### 2. Custom Classes
```css
/* src/index.css */
@layer components {
  .btn-primary {
    @apply bg-gray-900 text-white px-4 py-2 rounded-lg 
           hover:bg-gray-800 transition-colors duration-200;
  }
  
  .card {
    @apply bg-white rounded-xl shadow-sm border border-gray-100 p-4;
  }
}
```

#### 3. Responsive Design
```jsx
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Responsive content */}
</div>
```

### Design System Compliance

#### 1. Colors
- Use semantic color variables
- Maintain proper contrast ratios
- Support dark mode when applicable

#### 2. Typography
- Use consistent font sizes and weights
- Follow the type scale
- Ensure readability

#### 3. Spacing
- Use the spacing scale consistently
- Maintain visual hierarchy
- Create breathing room

## 🔍 Testing Strategy

### Testing Levels

#### 1. Unit Tests
- Test individual functions and components
- Mock external dependencies
- Test edge cases and error conditions

#### 2. Integration Tests
- Test component interactions
- Test service integrations
- Test data flow

#### 3. E2E Tests
- Test user workflows
- Test cross-browser compatibility
- Test responsive design

### Testing Tools

#### 1. Jest
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

#### 2. Testing Library
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Component from './Component';

test('renders component', () => {
  render(<Component />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

#### 3. Mocking
```typescript
// Mock external services
jest.mock('../services/supabase', () => ({
  signInWithGoogle: jest.fn(),
  signOut: jest.fn(),
}));
```

### Test Structure

#### 1. Component Tests
```typescript
// Component.test.tsx
import { render, screen } from '@testing-library/react';
import Component from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles user interactions', () => {
    const mockHandler = jest.fn();
    render(<Component onAction={mockHandler} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockHandler).toHaveBeenCalled();
  });
});
```

#### 2. Service Tests
```typescript
// service.test.ts
import { serviceFunction } from './service';

describe('Service', () => {
  it('handles successful operations', async () => {
    const result = await serviceFunction({ param: 'value' });
    expect(result.data).toBeDefined();
    expect(result.error).toBeNull();
  });

  it('handles errors gracefully', async () => {
    // Mock error condition
    const result = await serviceFunction({ param: 'invalid' });
    expect(result.error).toBeDefined();
  });
});
```

## 🚀 Performance Optimization

### React Optimization

#### 1. Memoization
```typescript
const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});

const MemoizedValue = React.useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

#### 2. Lazy Loading
```typescript
const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

#### 3. Bundle Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react'],
          utils: ['date-fns', 'uuid']
        }
      }
    }
  }
});
```

### Animation Performance

#### 1. GPU Acceleration
```css
.animated {
  transform: translateZ(0); /* Force GPU acceleration */
  will-change: transform; /* Hint to browser */
}
```

#### 2. RequestAnimationFrame
```typescript
const animate = () => {
  // Animation logic
  requestAnimationFrame(animate);
};
```

## 🔒 Security Guidelines

### Input Validation

#### 1. Sanitization
```typescript
import { sanitizeText, sanitizeTitle } from '../utils/sanitize';

const cleanText = sanitizeText(userInput);
const cleanTitle = sanitizeTitle(userTitle);
```

#### 2. Type Validation
```typescript
const validateDocument = (doc: any): Document | null => {
  if (!doc.id || !doc.title || !doc.content) {
    return null;
  }
  return doc as Document;
};
```

### Authentication

#### 1. Session Management
- Always verify user authentication
- Implement proper session handling
- Use secure token storage

#### 2. Authorization
- Check user permissions before operations
- Implement role-based access control
- Validate user ownership of resources

## 📝 Code Quality

### ESLint Configuration

#### 1. Rules
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "react-hooks/recommended"
  ],
  "rules": {
    "no-unused-vars": "error",
    "prefer-const": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

#### 2. Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### Code Review Checklist

#### 1. Functionality
- [ ] Does the code work as expected?
- [ ] Are edge cases handled?
- [ ] Is error handling implemented?

#### 2. Code Quality
- [ ] Is the code readable and well-documented?
- [ ] Are TypeScript types properly defined?
- [ ] Are there any code smells or anti-patterns?

#### 3. Performance
- [ ] Are there any performance issues?
- [ ] Is the code optimized for the use case?
- [ ] Are there unnecessary re-renders?

#### 4. Security
- [ ] Is input properly validated and sanitized?
- [ ] Are authentication checks in place?
- [ ] Are there any security vulnerabilities?

## 🚀 Deployment

### Build Process

#### 1. Production Build
```bash
npm run build
```

#### 2. Build Optimization
- Code splitting
- Tree shaking
- Minification
- Asset optimization

#### 3. Environment Configuration
```typescript
// vite.config.ts
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  build: {
    sourcemap: false,
    minify: 'terser',
  }
});
```

### Vercel Deployment

#### 1. Configuration
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### 2. Environment Variables
Set environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_OPENAI_API_KEY`
- `VITE_PINECONE_API_KEY`
- `VITE_PINECONE_ENVIRONMENT`

## 🤝 Contributing

### Development Workflow

#### 1. Feature Development
1. Create feature branch: `git checkout -b feature/new-feature`
2. Implement changes following guidelines
3. Write tests for new functionality
4. Update documentation
5. Create pull request

#### 2. Bug Fixes
1. Create bug fix branch: `git checkout -b fix/bug-description`
2. Identify and fix the issue
3. Add regression tests
4. Update documentation if needed
5. Create pull request

#### 3. Code Review Process
1. Self-review before submitting
2. Request review from team members
3. Address feedback and suggestions
4. Merge after approval

### Documentation Updates

#### 1. Code Documentation
- Update JSDoc comments for new functions
- Add inline comments for complex logic
- Update README.md for new features

#### 2. API Documentation
- Update `docs/API.md` for new services
- Document new endpoints and functions
- Provide usage examples

#### 3. Design Documentation
- Update `docs/DESIGN.md` for UI changes
- Document new design patterns
- Update component guidelines

This development guide ensures consistent code quality, maintainability, and collaboration across the project. 