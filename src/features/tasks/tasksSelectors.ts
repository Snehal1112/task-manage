import { RootState } from '@/app/store';
import { TaskQuadrant } from './TaskTypes';

export const selectAllTasks = (state: RootState) => state.tasks.tasks;

export const selectTasksLoading = (state: RootState) => state.tasks.loading;

export const selectTasksError = (state: RootState) => state.tasks.error;

export const selectTasksByQuadrant = (quadrant: TaskQuadrant) => (state: RootState) =>
  state.tasks.tasks.filter(task => task.quadrant === quadrant);

export const selectUnassignedTasks = (state: RootState) =>
  state.tasks.tasks.filter(task => task.quadrant === 'UNASSIGNED');

export const selectTaskById = (id: string) => (state: RootState) =>
  state.tasks.tasks.find(task => task.id === id);

export const selectTasksCount = (state: RootState) => state.tasks.tasks.length;

export const selectTasksCountByQuadrant = (state: RootState) => {
  return state.tasks.tasks.reduce((counts, task) => {
    counts[task.quadrant] = (counts[task.quadrant] || 0) + 1;
    return counts;
  }, {} as Record<TaskQuadrant, number>);
};