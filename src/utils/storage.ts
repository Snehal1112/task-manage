import { Task } from '@/features/tasks/TaskTypes';
import { STORAGE_KEY } from './constants';
import { demoTasks } from './demoData';

export const loadTasksFromStorage = (): Task[] => {
  try {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    if (storedTasks) {
      const parsedTasks = JSON.parse(storedTasks);
      // Return demo data if storage is empty or only has empty array
      return parsedTasks.length > 0 ? parsedTasks : demoTasks;
    }
    // Return demo data for first-time users
    return demoTasks;
  } catch (error) {
    console.error('Failed to load tasks from storage:', error);
    // Return demo data as fallback
    return demoTasks;
  }
};

export const saveTasksToStorage = (tasks: Task[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks to storage:', error);
  }
};

export const clearTasksFromStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear tasks from storage:', error);
  }
};

export const loadDemoData = (): Task[] => {
  return demoTasks;
};