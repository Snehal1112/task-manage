import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, TasksState, TaskFormData, TaskQuadrant } from './TaskTypes';
import { taskAPI } from '@/services/api';

// Initial state with loading and error handling
const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
};

// Async thunks for API operations
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const tasks = await taskAPI.getAllTasks();
      return tasks;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch tasks');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: TaskFormData, { rejectWithValue }) => {
    try {
      const newTask = await taskAPI.createTask(taskData);
      return newTask;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async (params: { id: string; updates: Partial<TaskFormData> }, { rejectWithValue }) => {
    try {
      const updatedTask = await taskAPI.updateTask(params.id, params.updates);
      return updatedTask;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { rejectWithValue }) => {
    try {
      await taskAPI.deleteTask(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete task');
    }
  }
);

export const moveTaskToQuadrant = createAsyncThunk(
  'tasks/moveTaskToQuadrant',
  async (params: { id: string; quadrant: TaskQuadrant }, { rejectWithValue }) => {
    try {
      const updatedTask = await taskAPI.moveTaskToQuadrant(params.id, params.quadrant);
      return updatedTask;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to move task to quadrant');
    }
  }
);

export const toggleTaskCompletion = createAsyncThunk(
  'tasks/toggleTaskCompletion',
  async (id: string, { rejectWithValue }) => {
    try {
      const updatedTask = await taskAPI.toggleTaskCompletion(id);
      return updatedTask;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to toggle task completion');
    }
  }
);

export const clearAllTasks = createAsyncThunk(
  'tasks/clearAllTasks',
  async (_, { rejectWithValue }) => {
    try {
      await taskAPI.clearAllTasks();
      return;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to clear all tasks');
    }
  }
);

export const loadDemoTasks = createAsyncThunk(
  'tasks/loadDemoTasks',
  async (_, { rejectWithValue }) => {
    try {
      const demoTasks = await taskAPI.loadDemoTasks();
      return demoTasks;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load demo tasks');
    }
  }
);

// Tasks slice
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Synchronous actions for immediate UI updates
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },

    // Local task updates for optimistic updates
    updateTaskLocal: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },

    // Add task locally for optimistic updates
    addTaskLocal: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },

    // Remove task locally for optimistic updates
    removeTaskLocal: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch Tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Task
    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        // Add the new task to the state
        state.tasks.push(action.payload);
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Task
    builder
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        // Update the task in state
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Task
    builder
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the task from state
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Move Task to Quadrant
    builder
      .addCase(moveTaskToQuadrant.pending, (state, action) => {
        // Optimistic update: immediately update the task in the UI
        const { id, quadrant } = action.meta.arg;
        const index = state.tasks.findIndex(task => task.id === id);
        if (index !== -1) {
          state.tasks[index] = {
            ...state.tasks[index],
            quadrant: quadrant,
            // Update priority flags based on quadrant for immediate UI consistency
            urgent: quadrant === 'DO' || quadrant === 'DELEGATE' ? true : false,
            important: quadrant === 'DO' || quadrant === 'SCHEDULE' ? true : false,
            updatedAt: new Date().toISOString(),
          };
        }
        state.error = null;
      })
      .addCase(moveTaskToQuadrant.fulfilled, (state, action) => {
        // Server response confirms the change - ensure data is in sync
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(moveTaskToQuadrant.rejected, (state, action) => {
        // Revert optimistic update on failure by refetching
        state.error = action.payload as string;
        // Note: In a full app, you might want to revert the specific task
        // or trigger a refetch here, but for simplicity we'll let the error be shown
      });

    // Toggle Task Completion
    builder
      .addCase(toggleTaskCompletion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleTaskCompletion.fulfilled, (state, action) => {
        state.loading = false;
        // Update the task in state
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(toggleTaskCompletion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Clear All Tasks
    builder
      .addCase(clearAllTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearAllTasks.fulfilled, (state) => {
        state.loading = false;
        state.tasks = [];
        state.error = null;
      })
      .addCase(clearAllTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Load Demo Tasks
    builder
      .addCase(loadDemoTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadDemoTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
        state.error = null;
      })
      .addCase(loadDemoTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export synchronous actions
export const {
  setLoading,
  setError,
  clearError,
  updateTaskLocal,
  addTaskLocal,
  removeTaskLocal,
} = tasksSlice.actions;

// Legacy action names for backward compatibility with existing components
export const addTask = createTask;

export default tasksSlice.reducer;