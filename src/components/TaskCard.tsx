import { memo, useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useAppDispatch } from '@/app/hooks';
import { deleteTask, toggleTaskCompletion } from '@/features/tasks/tasksSlice';
import { Task } from '@/features/tasks/TaskTypes';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Calendar, AlertCircle, Target, Check, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  isDragOverlay?: boolean;
  className?: string; // Added optional className prop
}

const TaskCard = memo<TaskCardProps>(({ task, index: _index, onEdit, isDragOverlay = false, className }) => { // Added className to destructuring
  const dispatch = useAppDispatch();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
    data: {
      task,
      quadrant: task.quadrant,
    },
  });

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      dispatch(deleteTask(task.id));
    }
  }, [dispatch, task.id, task.title]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(task);
  }, [onEdit, task]);

  const handleToggleCompletion = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleTaskCompletion(task.id));
  }, [dispatch, task.id]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "transition-all duration-300 ease-out w-full",
        isDragging && !isDragOverlay && "opacity-30 scale-95",
        isDragOverlay && "rotate-3 scale-105 z-50",
        className // Applied custom className
      )}
    >
      <Card className={cn(
        "cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-300 ease-out",
        isDragging && "shadow-xl ring-2 ring-primary/30 bg-white",
        isDragOverlay && "shadow-2xl ring-2 ring-primary/40",
        task.quadrant !== 'UNASSIGNED' && "border-l-4",
        task.quadrant === 'DO' && "border-l-red-500 bg-red-50/50",
        task.quadrant === 'SCHEDULE' && "border-l-blue-500 bg-blue-50/50",
        task.quadrant === 'DELEGATE' && "border-l-yellow-500 bg-yellow-50/50",
        task.quadrant === 'DELETE' && "border-l-gray-500 bg-gray-50/50",
        !isDragging && !isDragOverlay && "hover:scale-102 hover:shadow-lg"
      )}>
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className={cn(
                "font-bold text-base leading-tight flex-1 min-w-0 break-words tracking-tight",
                task.completed && "line-through text-muted-foreground"
              )}>
                <span className="block truncate">{task.title}</span>
              </h3>
              <div className="flex items-center space-x-1 flex-shrink-0">
                {task.completed && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {isOverdue && !task.completed && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>

            {task.description && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground leading-relaxed break-words">
                  <span className="line-clamp-2">{task.description}</span>
                </p>
              </div>
            )}

            {task.dueDate && (
              <div className="text-sm font-medium text-muted-foreground">
                <Calendar className="inline-block h-4 w-4 mr-1.5" />
                {formatDate(task.dueDate)}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-3">
          <Button variant="ghost" size="sm" onClick={handleEdit} className="text-sm font-medium">
            <Edit className="h-4 w-4 mr-1.5" /> Edit
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleToggleCompletion}>
              {task.completed ? <Check className="h-4 w-4" /> : <Target className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;
