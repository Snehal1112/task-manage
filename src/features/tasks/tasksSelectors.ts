import { createSelector } from 'reselect';
import { RootState } from '@/app/store';
import { TaskQuadrant } from './TaskTypes';

// Base selectors
export const selectAllTasks = (state: RootState) => state.tasks.tasks;
export const selectTasksLoading = (state: RootState) => state.tasks.loading;
export const selectTasksError = (state: RootState) => state.tasks.error;

// Memoized selectors using reselect
export const selectTasksByQuadrant = (quadrant: TaskQuadrant) => 
  createSelector(
    [selectAllTasks],
    (tasks) => tasks.filter(task => task.quadrant === quadrant)
  );

export const selectUnassignedTasks = createSelector(
  [selectAllTasks],
  (tasks) => tasks.filter(task => task.quadrant === 'UNASSIGNED')
);

export const selectTaskById = (id: string) => 
  createSelector(
    [selectAllTasks],
    (tasks) => tasks.find(task => task.id === id)
  );

export const selectTasksCount = createSelector(
  [selectAllTasks],
  (tasks) => tasks.length
);

export const selectTasksCountByQuadrant = createSelector(
  [selectAllTasks],
  (tasks) => tasks.reduce((counts, task) => {
    counts[task.quadrant] = (counts[task.quadrant] || 0) + 1;
    return counts;
  }, {} as Record<TaskQuadrant, number>)
);

export const selectCompletedTasks = createSelector(
  [selectAllTasks],
  (tasks) => tasks.filter(task => task.completed)
);

export const selectIncompleteTasks = createSelector(
  [selectAllTasks],
  (tasks) => tasks.filter(task => !task.completed)
);

export const selectTasksByCompletionAndQuadrant = (completed: boolean, quadrant: TaskQuadrant) => 
  createSelector(
    [selectAllTasks],
    (tasks) => tasks.filter(task => task.completed === completed && task.quadrant === quadrant)
  );

// Additional performance-oriented selectors
export const selectTasksGroupedByQuadrant = createSelector(
  [selectAllTasks],
  (tasks) => {
    return tasks.reduce((grouped, task) => {
      if (!grouped[task.quadrant]) {
        grouped[task.quadrant] = [];
      }
      grouped[task.quadrant].push(task);
      return grouped;
    }, {} as Record<TaskQuadrant, typeof tasks>);
  }
);

export const selectTasksStats = createSelector(
  [selectAllTasks],
  (tasks) => {
    const stats = {
      total: tasks.length,
      completed: 0,
      overdue: 0,
      urgent: 0,
      important: 0,
      byQuadrant: {} as Record<TaskQuadrant, number>
    };

    const now = new Date();

    tasks.forEach(task => {
      if (task.completed) stats.completed++;
      if (task.dueDate && new Date(task.dueDate) < now) stats.overdue++;
      if (task.urgent) stats.urgent++;
      if (task.important) stats.important++;
      
      stats.byQuadrant[task.quadrant] = (stats.byQuadrant[task.quadrant] || 0) + 1;
    });

    return stats;
  }
);

export const selectOverdueTasks = createSelector(
  [selectAllTasks],
  (tasks) => {
    const now = new Date();
    return tasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) < now && 
      !task.completed
    );
  }
);