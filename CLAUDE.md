# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based task management application implementing the **Eisenhower Matrix** method for task prioritization. The app features a two-column layout with a Task Panel and a 2×2 Eisenhower Matrix grid supporting drag-and-drop task categorization.

### Key Features
- **Task Management**: Create, edit, delete tasks with title, description, due dates, and priority flags
- **Task Editing**: Full edit functionality available from both Task Panel and Matrix quadrants with pre-filled modal forms
- **Eisenhower Matrix**: Drag tasks into four quadrants (Do, Schedule, Delegate, Delete) with properly aligned axis labels
- **Enhanced Drag & Drop**: Smooth animations, visual placeholders, drop zone highlighting, and improved visual feedback
- **Custom Scrollbars**: Show-on-hover scrollbars for better UX in both Task Panel and Matrix quadrants
- **Automatic Categorization**: Tasks automatically update urgency/importance flags based on quadrant placement
- **Local Persistence**: Tasks are saved to localStorage
- **Responsive Design**: Works on desktop and mobile devices

## Development Commands

### Essential Commands
```bash
# Install dependencies
yarn install

# Start development server
yarn dev                    # Runs on http://localhost:5173 (or next available port)

# Build for production
yarn build                  # Creates optimized build in dist/

# Preview production build
yarn preview

# Type checking (separate from build due to react-beautiful-dnd compatibility)
yarn type-check

# Lint code
yarn lint
```

### Development Workflow
1. `yarn dev` - Start development with hot reload
2. Make changes and test in browser
3. `yarn lint` - Check for code style issues (now fully working)
4. `yarn type-check` - Verify TypeScript types (strict mode enabled)
5. `yarn build` - Production build with type checking included

## Architecture Overview

### Tech Stack
- **React 18** + **TypeScript** - Core framework with strict mode enabled
- **Redux Toolkit** - State management with automatic localStorage persistence
- **@dnd-kit** - Modern drag and drop functionality (core, sortable, utilities)
- **shadcn/ui** + **Tailwind CSS** - UI components and styling
- **Vite** - Build tool and development server
- **Lucide React** - Icons
- **ESLint** + **@typescript-eslint** - Code quality and type checking

### Project Structure
```
src/
├── app/                    # Redux store configuration
│   ├── store.ts           # Store setup with tasksSlice
│   └── hooks.ts           # Typed Redux hooks (useAppDispatch, useAppSelector)
├── features/tasks/        # Task-related logic
│   ├── TaskTypes.ts       # TypeScript interfaces for Task, TaskQuadrant, etc.
│   ├── tasksSlice.ts      # Redux slice with CRUD operations
│   └── tasksSelectors.ts  # Reusable state selectors
├── components/            # React components
│   ├── ui/               # shadcn/ui base components (Button, Card, Input, etc.)
│   ├── TaskCard.tsx      # Individual task display with enhanced drag animations
│   ├── TaskForm.tsx      # Create/edit task modal with pre-fill functionality
│   ├── TaskList.tsx      # Left panel with unassigned tasks and custom scrollbars
│   ├── Quadrant.tsx      # Individual matrix quadrant with drop placeholders
│   ├── EisenhowerMatrix.tsx # 2×2 matrix layout with proper axis alignment
│   ├── DragDropWrapper.tsx # Enhanced drag-drop context with visual feedback
│   └── ErrorBoundary.tsx # Error handling component
├── contexts/              # React contexts
│   └── DragContext.tsx   # Drag state context for visual feedback
├── hooks/                # Custom hooks
│   └── useDragContext.ts # Hook for accessing drag state
├── pages/
│   └── Dashboard.tsx     # Main application page
├── utils/
│   ├── constants.ts      # Quadrant labels, descriptions, storage keys
│   └── storage.ts        # localStorage utilities
└── lib/
    └── utils.ts          # Utility functions (cn for className merging)
```

### State Management Pattern
- **Redux Toolkit** manages all task state
- **Automatic persistence** to localStorage on every state change
- **Selectors** for efficient component subscriptions
- **Type-safe** dispatchers and selectors via custom hooks

### Component Hierarchy
```
Dashboard
├── DragDropWrapper (react-beautiful-dnd context)
│   ├── TaskList (left column)
│   │   └── TaskCard[] (draggable)
│   └── EisenhowerMatrix (right column)
│       └── Quadrant[4] (droppable zones)
│           └── TaskCard[] (draggable)
└── TaskForm (modal for create/edit)
```

## Key Implementation Details

### Enhanced Drag & Drop Workflow (@dnd-kit)
1. **All new tasks start in TaskList** (`UNASSIGNED` quadrant) regardless of priority flags
2. **Modern @dnd-kit implementation** with React 18 compatibility and TypeScript support
3. **Drag-only movement**: Tasks can ONLY move between quadrants via drag and drop:
   - **DO**: urgent=true, important=true (when dropped here)
   - **SCHEDULE**: urgent=false, important=true (when dropped here)  
   - **DELEGATE**: urgent=true, important=false (when dropped here)
   - **DELETE**: urgent=false, important=false (when dropped here)
4. **Important**: Editing urgent/important flags does NOT automatically move tasks between quadrants
5. **Enhanced visual feedback and animations**: 
   - Smooth drag overlay with rotation and scaling effects
   - Visual placeholders showing exactly where tasks will be dropped
   - Contextual drop zone highlighting with animated borders
   - Smooth cubic-bezier animations for natural feel
   - Enhanced shadow and ring effects for better depth perception
6. **Better accessibility** and touch device support with keyboard navigation

### UX Enhancements
1. **Custom Scrollbars**:
   - Hidden by default for clean UI
   - Appear on hover/focus for better visibility
   - Smooth transitions and proper theming
2. **Smart Edit Modal**:
   - Pre-fills all task details when editing existing tasks
   - Reacts properly to task prop changes
   - Clear visual distinction between create and edit modes
3. **Contextual Drop Zones**:
   - Real-time feedback showing target quadrant information
   - Animated placeholders with quadrant-specific icons and labels
   - Different visual states for drag active vs. drag over
4. **Improved Task Cards**:
   - Better hover effects and scaling animations
   - Enhanced visual indicators during drag operations
   - Smooth transitions with proper easing functions

### Redux Actions
- `addTask(TaskFormData)` - Creates task with auto-generated ID, always starts in `UNASSIGNED` quadrant
- `updateTask(Partial<Task> & {id})` - Updates task fields (title, description, due date, flags) without changing quadrant
- `deleteTask(id)` - Removes task completely
- `moveTaskToQuadrant({id, quadrant})` - ONLY way to move tasks between quadrants, also updates priority flags accordingly

### TypeScript Configuration
- **Strict mode enabled** with full type safety
- **Modern @dnd-kit** provides excellent TypeScript support
- **Build includes type checking** - `yarn build` runs type-check first
- **ESLint integration** with @typescript-eslint for code quality
- **No type compatibility issues** - all libraries work perfectly with React 18

### Styling Approach
- **Tailwind CSS** for all styling
- **shadcn/ui** components provide consistent design system
- **Custom CSS utilities** for line clamping and scaling animations
- **Fully responsive design** with mobile-first approach and adaptive layouts
- **Clear visual hierarchy** with properly aligned axis labels (URGENT/NOT URGENT aligned with quadrant columns, IMPORTANT/NOT IMPORTANT aligned with quadrant rows)
- **Enhanced drag feedback** with hover effects, scaling, and color-coded quadrants

## Development Guidelines

### When Adding Features
1. **State changes** go through Redux actions in `tasksSlice.ts`
2. **New task fields** require updating `TaskTypes.ts` interfaces
3. **UI components** should follow shadcn/ui patterns
4. **Persistence** is automatic via storage utilities

### Common Patterns
- Use `useAppSelector` for state access
- Use `useAppDispatch` for state updates
- Follow existing component structure for new features
- Maintain full type safety with modern TypeScript patterns

### Quality Standards
- **TypeScript strict mode** enabled for maximum type safety
- **ESLint configuration** working with proper @typescript-eslint integration
- **Modern drag-drop library** (@dnd-kit) actively maintained and well-supported
- **Production-ready build process** with comprehensive type checking
- **No compatibility issues** - all libraries work seamlessly with React 18

## File Conventions
- **Components**: PascalCase (e.g., `TaskCard.tsx`)
- **Utils/Hooks**: camelCase (e.g., `useTaskForm.ts`)
- **Types**: Interfaces with descriptive names (e.g., `TaskFormData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `QUADRANT_LABELS`)

This application provides a production-ready task prioritization system with modern React patterns and a clean, maintainable architecture.