import React from 'react';
import { format, parseISO } from 'date-fns';
import { Task } from '@/features/tasks/TaskTypes';
import { groupTasks, isTaskOverdue } from '@/utils/taskGrouping';
import { useAppSelector } from '@/app/hooks';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  Flag, 
  Edit, 
  CheckCircle2,
  Circle,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onToggleTask?: (task: Task) => void;
  onAddTask?: () => void;
}

const getQuadrantBadgeVariant = (quadrant: string) => {
  switch (quadrant) {
    case 'DO':
      return 'destructive';
    case 'SCHEDULE':
      return 'default';
    case 'DELEGATE':
      return 'secondary';
    case 'DELETE':
      return 'outline';
    case 'UNASSIGNED':
      return 'outline';
    default:
      return 'outline';
  }
};

const getPriorityIcon = (task: Task) => {
  if (task.urgent && task.important) {
    return <Flag className="h-4 w-4 text-red-500" />;
  } else if (task.important) {
    return <Flag className="h-4 w-4 text-yellow-500" />;
  } else if (task.urgent) {
    return <Clock className="h-4 w-4 text-orange-500" />;
  }
  return <Flag className="h-4 w-4 text-gray-400" />;
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
};

const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
  } catch {
    return 'Invalid date';
  }
};

const TaskRow: React.FC<{
  task: Task;
  onEditTask: (task: Task) => void;
  onToggleTask?: (task: Task) => void;
}> = ({ task, onEditTask, onToggleTask }) => {
  const isOverdue = isTaskOverdue(task);

  return (
    <TableRow 
      className={cn(
        task.completed && "opacity-60",
        isOverdue && !task.completed && "bg-red-50 dark:bg-red-950/20"
      )}
    >
      <TableCell className="w-12">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleTask?.(task)}
          className="h-8 w-8 p-0"
        >
          {task.completed ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
        </Button>
      </TableCell>
      
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <span className={cn(task.completed && "line-through")}>
            {task.title}
          </span>
          {isOverdue && !task.completed && (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
        </div>
        {task.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {task.description}
          </p>
        )}
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          {getPriorityIcon(task)}
          <Badge variant={getQuadrantBadgeVariant(task.quadrant)}>
            {task.quadrant}
          </Badge>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className={cn(
            isOverdue && !task.completed && "text-red-500 font-medium"
          )}>
            {formatDate(task.dueDate)}
          </span>
        </div>
      </TableCell>
      
      <TableCell className="text-sm text-muted-foreground">
        {formatDateTime(task.createdAt)}
      </TableCell>
      
      <TableCell className="text-sm text-muted-foreground">
        {formatDateTime(task.updatedAt)}
      </TableCell>
      
      <TableCell className="w-12">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEditTask(task)}
          className="h-8 w-8 p-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

const TableView: React.FC<TableViewProps> = ({ 
  tasks, 
  onEditTask, 
  onToggleTask,
  onAddTask 
}) => {
  const groupBy = useAppSelector(state => state.tasks.view.groupBy);
  const groupedTasks = groupTasks(tasks, groupBy);

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
        <div className="text-center space-y-4">
          <div>
            <p className="text-lg font-medium text-muted-foreground">No tasks found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first task to get started
            </p>
          </div>
          {onAddTask && (
            <Button onClick={onAddTask} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedTasks.map((group) => (
        <div key={group.id} className="space-y-2">
          {groupBy !== 'none' && (
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{group.label}</h3>
              <Badge variant="outline" className="text-xs">
                {group.count} task{group.count !== 1 ? 's' : ''}
              </Badge>
            </div>
          )}
          
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Priority & Quadrant</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onEditTask={onEditTask}
                    onToggleTask={onToggleTask}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableView;