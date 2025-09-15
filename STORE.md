# Redux Store Documentation

## Overview

The Redux store (`src/app/store.ts`) serves as the central state management solution for the Task Management application. It configures a Redux store using `@reduxjs/toolkit` with task management functionality, persistence handling, and development tools integration.

## Store Configuration

### Reducers
- **tasks**: Manages task-related state including CRUD operations, loading states, and error handling
  - Source: `@/features/tasks/tasksSlice`
  - Handles: Task creation, updates, deletion, fetching, and quadrant management

### Middleware Configuration

#### Serializable Check
- **Ignored Actions**: `persist/PERSIST`, `persist/REHYDRATE`
- **Purpose**: Allows Redux Persist actions to bypass serialization checks for state persistence

#### Immutable Check
- **Ignored Paths**: `tasks.tasks`
- **Purpose**: Excludes task array from immutability checks to allow direct mutations from drag-and-drop operations

### Development Tools
- **Enabled**: `process.env.NODE_ENV !== 'production'`
- **Purpose**: Provides Redux DevTools integration in development environment for debugging and state inspection

## Exported Types

### RootState
```typescript
export type RootState = ReturnType<typeof store.getState>;
```
- Represents the complete state tree of the application
- Used for typing selectors and useSelector hooks

### AppDispatch
```typescript
export type AppDispatch = typeof store.dispatch;
```
- Typed dispatch function for the store
- Used for typing useDispatch hooks and thunk dispatch

## Architecture Considerations

### State Management Pattern
- **Feature-based**: State is organized by feature domains (tasks)
- **Async Operations**: Uses createAsyncThunk for API interactions
- **Error Handling**: Centralized error state management with loading indicators

### Persistence Strategy
- **Redux Persist Compatible**: Middleware configured to work with state persistence
- **Selective Persistence**: Task data can be persisted across sessions

### Performance Optimizations
- **Selective Immutability**: Tasks array excluded from deep immutability checks for drag-and-drop performance
- **Development-only Tools**: DevTools only enabled in development to avoid production overhead

## Usage Patterns

### In Components
```typescript
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/app/store';

const dispatch = useDispatch<AppDispatch>();
const tasks = useSelector((state: RootState) => state.tasks.tasks);
```

### In Services/Selectors
```typescript
import type { RootState } from '@/app/store';
// Used for creating typed selectors and API integrations
```

## Dependencies

- **@reduxjs/toolkit**: Core Redux toolkit for store configuration and utilities
- **@/features/tasks/tasksSlice**: Task management reducer and actions
- **Environment Variables**: NODE_ENV for development/production detection

## Testing Considerations

- Store configuration should be tested for proper reducer integration
- Middleware behavior should be verified in test environments
- Type safety should be maintained across all store interactions

## Future Extensions

The store is designed to be extensible for additional feature domains:
- Additional reducers can be added to the reducer object
- Middleware can be extended for new cross-cutting concerns
- Types can be expanded as the application grows</content>
<parameter name="filePath">/Users/snehaldangroshiya/task-manage/STORE.md
