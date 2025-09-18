export type TaskQuadrant = 'DO' | 'SCHEDULE' | 'DELEGATE' | 'DELETE' | 'UNASSIGNED';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  urgent: boolean;
  important: boolean;
  quadrant: TaskQuadrant;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  dueDate?: string;
  urgent: boolean;
  important: boolean;
  completed: boolean;
}

export type ViewType = 'matrix' | 'table';
export type GroupBy = 'none' | 'quadrant' | 'date' | 'overdue' | 'priority';

export interface ViewState {
  currentView: ViewType;
  groupBy: GroupBy;
}

export interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  view: ViewState;
}