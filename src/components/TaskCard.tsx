import { memo, useCallback, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useAppDispatch } from '@/app/hooks';
import { deleteTask, toggleTaskCompletion } from '@/features/tasks/tasksSlice';
import { Task } from '@/features/tasks/TaskTypes';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Calendar, AlertCircle, Target, Check, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CONTEXT_ICON_SIZES } from '@/utils/iconSizes';

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  isDragOverlay?: boolean;
  className?: string; // Added optional className prop
}

const TaskCard = memo<TaskCardProps>(({ task, index: _index, onEdit, isDragOverlay = false, className }) => { // Added className to destructuring
  const dispatch = useAppDispatch();
  const [isExpanded, setIsExpanded] = useState(false);

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

  const handleToggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

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
        "transition-all duration-200 ease-out w-full",
        isDragging && !isDragOverlay && "opacity-40 scale-98",
        isDragOverlay && "rotate-2 scale-105 z-50",
        className // Applied custom className
      )}
    >
      <Card className={cn(
        "cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 ease-out",
        isDragging && "shadow-xl ring-2 ring-primary/30 bg-white",
        isDragOverlay && "shadow-2xl ring-2 ring-primary/40",
        task.quadrant !== 'UNASSIGNED' && "border-l-4",
        task.quadrant === 'DO' && "border-l-red-500 bg-red-50/50",
        task.quadrant === 'SCHEDULE' && "border-l-blue-500 bg-blue-50/50",
        task.quadrant === 'DELEGATE' && "border-l-yellow-500 bg-yellow-50/50",
        task.quadrant === 'DELETE' && "border-l-gray-500 bg-gray-50/50",
        !isDragging && !isDragOverlay && "hover:scale-102 hover:shadow-lg"
      )}>
        <CardContent className={cn(
          "transition-all duration-300 ease-in-out",
          isExpanded ? "p-2 sm:p-4" : "p-2 pb-0"
        )}>
          <div className="space-y-1 sm:space-y-3">
            <div className="flex items-start justify-between gap-1 sm:gap-3">
              <h3 className={cn(
                "font-bold text-sm sm:text-base leading-tight flex-1 min-w-0 break-words tracking-tight",
                task.completed && "line-through text-muted-foreground"
              )}>
                <span className="block truncate">{task.title}</span>
              </h3>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleExpand}
                  className="p-1 h-6 w-6 hover:bg-gray-100"
                  aria-label={isExpanded ? "Collapse task" : "Expand task"}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
                {task.completed && (
                  <CheckCircle className={cn(CONTEXT_ICON_SIZES.taskStatusIcon, "text-green-500")} />
                )}
                {isOverdue && !task.completed && (
                  <AlertCircle className={cn(
                    CONTEXT_ICON_SIZES.taskStatusIcon,
                    "text-red-500 animate-pulse"
                  )} />
                )}
              </div>
            </div>

            <div
              className={cn(
                "transition-all duration-300 ease-in-out overflow-hidden",
                isExpanded ? "opacity-100 max-h-96" : "opacity-0 max-h-0"
              )}
            >
              {task.description && (
                <div className="min-w-0 mb-2">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-relaxed break-words">
                    <span className="line-clamp-2">{task.description}</span>
                  </p>
                </div>
              )}

              {task.dueDate && (
                <div className={cn(
                  "text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2",
                  isOverdue && !task.completed
                    ? "text-red-600 font-bold"
                    : "text-muted-foreground"
                )}>
                  <Calendar className={cn(
                    CONTEXT_ICON_SIZES.taskStatusIcon,
                    "inline-block flex-shrink-0",
                    isOverdue && !task.completed && "text-red-500"
                  )} />
                  <span className={cn(
                    "truncate",
                    isOverdue && !task.completed && "font-bold text-red-600"
                  )}>
                    {formatDate(task.dueDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        {isExpanded && (
          <CardFooter className="flex items-center justify-between p-2 sm:p-4 pt-0">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleEdit} 
            className="text-xs sm:text-sm font-medium px-2 sm:px-3 touch-target focus-visible"
            aria-label={`Edit task: ${task.title}`}
          >
            <Edit className={cn(CONTEXT_ICON_SIZES.taskActionIcon, "mr-1 sm:mr-2")} aria-hidden="true" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleToggleCompletion} 
              className="p-2 sm:p-2 touch-target focus-visible"
              aria-label={task.completed ? `Mark as incomplete: ${task.title}` : `Mark as complete: ${task.title}`}
            >
              {task.completed ? <Check className={CONTEXT_ICON_SIZES.taskActionIcon} aria-hidden="true" /> : <Target className={CONTEXT_ICON_SIZES.taskActionIcon} aria-hidden="true" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDelete} 
              className="p-2 sm:p-2 touch-target focus-visible"
              aria-label={`Delete task: ${task.title}`}
            >
              <Trash2 className={CONTEXT_ICON_SIZES.taskActionIcon} aria-hidden="true" />
            </Button>
          </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;
