import { TaskQuadrant } from '@/features/tasks/TaskTypes';

export const QUADRANT_LABELS: Record<TaskQuadrant, string> = {
  DO: 'Do (Urgent + Important)',
  SCHEDULE: 'Schedule (Not Urgent + Important)',
  DELEGATE: 'Delegate (Urgent + Not Important)',
  DELETE: 'Delete (Not Urgent + Not Important)',
  UNASSIGNED: 'Task Panel'
};

export const QUADRANT_DESCRIPTIONS: Record<TaskQuadrant, string> = {
  DO: 'Critical tasks that require immediate attention',
  SCHEDULE: 'Important goals and strategic work',
  DELEGATE: 'Tasks that can be handled by others',
  DELETE: 'Time-wasters and unnecessary activities',
  UNASSIGNED: 'Newly created tasks awaiting categorization'
};

export const STORAGE_KEY = 'eisenhower-tasks';