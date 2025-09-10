# Component Architecture

## Design System
This application uses a component-based architecture with shadcn/ui as the foundation, built on top of Tailwind CSS and Radix UI primitives.

## Core Components

### UI Components (`src/components/ui/`)
- **Button**: Consistent button styles with variants (default, destructive, outline, ghost, link)
- **Input**: Form input with focus states and validation styling
- **Textarea**: Multi-line text input with character limits
- **Checkbox**: Accessible checkbox with proper label association
- **Dialog**: Modal dialog with focus trapping and ARIA support
- **Card**: Content containers with consistent spacing
- **Badge**: Status indicators and labels
- **Separator**: Visual dividers

### Feature Components

#### TaskCard
**Purpose**: Display individual tasks with actions
**Props**:
- `task`: Task object
- `index`: Position in list
- `onEdit`: Edit callback
- `isDragOverlay`: Drag state indicator
- `className`: Additional styling

**Accessibility Features**:
- Keyboard navigation (Enter/Space to view details)
- ARIA labels for all actions
- Focus management
- Screen reader announcements

**Performance**: Uses `React.memo` to prevent unnecessary re-renders

#### TaskForm
**Purpose**: Create and edit tasks
**Features**:
- Character counter (2000 limit)
- Form validation
- Error display
- Auto-focus on title field

**Accessibility**:
- Proper form labels
- Error announcements
- Keyboard navigation

#### TaskList
**Purpose**: Display and filter tasks
**Features**:
- Search functionality
- Filter controls
- Add new task button
- Responsive layout

#### EisenhowerMatrix
**Purpose**: Visual task organization
**Features**:
- Drag and drop interface
- Quadrant-based layout
- Real-time updates

## State Management
- **Redux Toolkit**: Centralized state management
- **Slices**: Feature-based state organization
- **Selectors**: Memoized state access
- **Middleware**: Async operations and error handling

## Styling Approach
- **Tailwind CSS**: Utility-first CSS framework
- **Design Tokens**: Consistent color, spacing, and typography
- **Dark Mode**: Built-in theme support
- **Responsive**: Mobile-first design patterns

## Patterns and Conventions

### Component Structure
```
ComponentName/
  index.ts          # Exports
  ComponentName.tsx # Main component
  types.ts          # TypeScript types
  utils.ts          # Helper functions
```

### Naming Conventions
- Components: PascalCase
- Files: PascalCase for components, camelCase for utilities
- Props: camelCase
- CSS classes: kebab-case with Tailwind utilities

### Props Interface
```typescript
interface ComponentNameProps {
  requiredProp: string;
  optionalProp?: number;
  onAction: () => void;
}
```

### Event Handlers
- Prefix with `handle` (e.g., `handleClick`)
- Use `useCallback` for performance
- Pass event objects when needed

## Best Practices
- Use TypeScript for type safety
- Implement error boundaries
- Test components with React Testing Library
- Document props and usage
- Follow accessibility guidelines
- Optimize for performance with memoization
