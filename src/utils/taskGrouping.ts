import { Task, GroupBy, TaskQuadrant } from '@/features/tasks/TaskTypes';
import { format, isBefore, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';

export interface TaskGroup {
  id: string;
  label: string;
  tasks: Task[];
  count: number;
}

export const getQuadrantLabel = (quadrant: TaskQuadrant): string => {
  switch (quadrant) {
    case 'DO':
      return 'Do (Urgent & Important)';
    case 'SCHEDULE':
      return 'Schedule (Important, Not Urgent)';
    case 'DELEGATE':
      return 'Delegate (Urgent, Not Important)';
    case 'DELETE':
      return 'Delete (Neither Urgent nor Important)';
    case 'UNASSIGNED':
      return 'Unassigned Tasks';
    default:
      return 'Unknown';
  }
};

export const getDateGroupLabel = (date: string): string => {
  try {
    const parsedDate = parseISO(date);
    const today = new Date();
    
    if (isToday(parsedDate)) {
      return 'Today';
    } else if (isTomorrow(parsedDate)) {
      return 'Tomorrow';
    } else if (isYesterday(parsedDate)) {
      return 'Yesterday';
    } else if (isBefore(parsedDate, today)) {
      return 'Overdue';
    } else {
      return format(parsedDate, 'MMM d, yyyy');
    }
  } catch {
    return 'No Date';
  }
};

export const isTaskOverdue = (task: Task): boolean => {
  if (!task.dueDate || task.completed) return false;
  try {
    const dueDate = parseISO(task.dueDate);
    const today = new Date();
    return isBefore(dueDate, today) && !isToday(dueDate);
  } catch {
    return false;
  }
};

export const getPriorityLabel = (task: Task): string => {
  if (task.urgent && task.important) return 'High Priority (Urgent & Important)';
  if (task.important && !task.urgent) return 'Medium Priority (Important)';
  if (task.urgent && !task.important) return 'Medium Priority (Urgent)';
  return 'Low Priority';
};

export const groupTasks = (tasks: Task[], groupBy: GroupBy): TaskGroup[] => {
  if (groupBy === 'none') {
    return [{
      id: 'all',
      label: 'All Tasks',
      tasks,
      count: tasks.length,
    }];
  }

  const groups: { [key: string]: Task[] } = {};

  tasks.forEach(task => {
    let groupKey: string;
    
    switch (groupBy) {
      case 'quadrant':
        groupKey = task.quadrant;
        break;
      case 'date':
        if (task.dueDate) {
          groupKey = getDateGroupLabel(task.dueDate);
        } else {
          groupKey = 'No Date';
        }
        break;
      case 'overdue':
        if (task.completed) {
          groupKey = 'Completed';
        } else if (isTaskOverdue(task)) {
          groupKey = 'Overdue';
        } else if (task.dueDate) {
          groupKey = 'Upcoming';
        } else {
          groupKey = 'No Due Date';
        }
        break;
      case 'priority':
        groupKey = getPriorityLabel(task);
        break;
      default:
        groupKey = 'Other';
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(task);
  });

  // Convert to array and sort
  const groupsArray: TaskGroup[] = Object.entries(groups).map(([key, tasks]) => ({
    id: key,
    label: groupBy === 'quadrant' ? getQuadrantLabel(key as TaskQuadrant) : key,
    tasks,
    count: tasks.length,
  }));

  // Sort groups based on type
  switch (groupBy) {
    case 'quadrant':
      return groupsArray.sort((a, b) => {
        const order = ['DO', 'SCHEDULE', 'DELEGATE', 'DELETE', 'UNASSIGNED'];
        return order.indexOf(a.id) - order.indexOf(b.id);
      });
    case 'overdue':
      return groupsArray.sort((a, b) => {
        const order = ['Overdue', 'Upcoming', 'No Due Date', 'Completed'];
        return order.indexOf(a.id) - order.indexOf(b.id);
      });
    case 'priority':
      return groupsArray.sort((a, b) => {
        const order = [
          'High Priority (Urgent & Important)',
          'Medium Priority (Important)',
          'Medium Priority (Urgent)',
          'Low Priority'
        ];
        return order.indexOf(a.id) - order.indexOf(b.id);
      });
    case 'date':
      return groupsArray.sort((a, b) => {
        // Sort by actual date when possible
        if (a.id === 'No Date') return 1;
        if (b.id === 'No Date') return -1;
        if (a.id === 'Overdue') return -1;
        if (b.id === 'Overdue') return 1;
        if (a.id === 'Today') return -1;
        if (b.id === 'Today') return 1;
        if (a.id === 'Tomorrow') return -1;
        if (b.id === 'Tomorrow') return 1;
        return a.label.localeCompare(b.label);
      });
    default:
      return groupsArray.sort((a, b) => a.label.localeCompare(b.label));
  }
};