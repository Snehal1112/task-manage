export type TaskQuadrant = 'DO' | 'SCHEDULE' | 'DELEGATE' | 'DELETE' | 'UNASSIGNED';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  urgent: boolean;
  important: boolean;
  quadrant: TaskQuadrant;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  dueDate?: string;
  urgent: boolean;
  important: boolean;
}

export interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}