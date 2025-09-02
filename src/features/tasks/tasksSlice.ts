import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, TasksState, TaskFormData, TaskQuadrant } from './TaskTypes';
import { saveTasksToStorage, loadTasksFromStorage } from '@/utils/storage';

const initialState: TasksState = {
  tasks: loadTasksFromStorage(),
  loading: false,
  error: null,
};

// Tasks can only move between quadrants via drag and drop
// The urgent/important flags are for display purposes only

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<TaskFormData>) => {
      try {
        // Validate required fields
        if (!action.payload.title || action.payload.title.trim().length === 0) {
          state.error = 'Task title is required';
          return;
        }

        // Validate title length
        if (action.payload.title.trim().length > 100) {
          state.error = 'Task title must be 100 characters or less';
          return;
        }

        // Validate description length
        if (action.payload.description && action.payload.description.length > 500) {
          state.error = 'Task description must be 500 characters or less';
          return;
        }

        // Validate due date
        if (action.payload.dueDate) {
          const dueDate = new Date(action.payload.dueDate);
          if (isNaN(dueDate.getTime())) {
            state.error = 'Invalid due date format';
            return;
          }
        }

        const now = new Date().toISOString();
        
        const newTask: Task = {
          id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          title: action.payload.title.trim(),
          description: action.payload.description?.trim() || undefined,
          dueDate: action.payload.dueDate,
          urgent: Boolean(action.payload.urgent),
          important: Boolean(action.payload.important),
          quadrant: 'UNASSIGNED', // Always start new tasks in Task Panel
          createdAt: now,
          updatedAt: now,
        };

        state.tasks.push(newTask);
        state.error = null; // Clear any previous errors
        saveTasksToStorage(state.tasks);
      } catch (error) {
        state.error = 'Failed to add task. Please try again.';
        console.error('Error adding task:', error);
      }
    },

    updateTask: (state, action: PayloadAction<Partial<Task> & { id: string }>) => {
      try {
        const { id, ...updates } = action.payload;
        
        if (!id) {
          state.error = 'Task ID is required for update';
          return;
        }

        const taskIndex = state.tasks.findIndex(task => task.id === id);
        
        if (taskIndex === -1) {
          state.error = 'Task not found';
          return;
        }

        // Validate updates if they exist
        if (updates.title !== undefined) {
          if (!updates.title || updates.title.trim().length === 0) {
            state.error = 'Task title cannot be empty';
            return;
          }
          if (updates.title.trim().length > 100) {
            state.error = 'Task title must be 100 characters or less';
            return;
          }
        }

        if (updates.description !== undefined && updates.description && updates.description.length > 500) {
          state.error = 'Task description must be 500 characters or less';
          return;
        }

        const updatedTask = { ...state.tasks[taskIndex], ...updates };
        
        // Do NOT automatically change quadrant when urgent/important flags change
        // Tasks can only move between quadrants via drag and drop
        
        updatedTask.updatedAt = new Date().toISOString();
        state.tasks[taskIndex] = updatedTask;
        state.error = null;
        saveTasksToStorage(state.tasks);
      } catch (error) {
        state.error = 'Failed to update task. Please try again.';
        console.error('Error updating task:', error);
      }
    },

    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
      saveTasksToStorage(state.tasks);
    },

    moveTaskToQuadrant: (state, action: PayloadAction<{ id: string; quadrant: TaskQuadrant }>) => {
      const { id, quadrant } = action.payload;
      const task = state.tasks.find(task => task.id === id);
      
      if (task) {
        task.quadrant = quadrant;
        task.updatedAt = new Date().toISOString();
        
        // Update urgent/important flags based on quadrant
        switch (quadrant) {
          case 'DO':
            task.urgent = true;
            task.important = true;
            break;
          case 'SCHEDULE':
            task.urgent = false;
            task.important = true;
            break;
          case 'DELEGATE':
            task.urgent = true;
            task.important = false;
            break;
          case 'DELETE':
            task.urgent = false;
            task.important = false;
            break;
          case 'UNASSIGNED':
            // Keep existing flags for unassigned tasks
            break;
        }
        
        saveTasksToStorage(state.tasks);
      }
    },

    clearAllTasks: (state) => {
      state.tasks = [];
      saveTasksToStorage(state.tasks);
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  addTask,
  updateTask,
  deleteTask,
  moveTaskToQuadrant,
  clearAllTasks,
  setLoading,
  setError,
  clearError,
} = tasksSlice.actions;

export default tasksSlice.reducer;