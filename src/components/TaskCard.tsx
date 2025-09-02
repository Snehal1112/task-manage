import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useAppDispatch } from '@/app/hooks';
import { deleteTask } from '@/features/tasks/tasksSlice';
import { Task } from '@/features/tasks/TaskTypes';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Calendar, AlertCircle, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  isDragOverlay?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index: _index, onEdit, isDragOverlay = false }) => {
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      dispatch(deleteTask(task.id));
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(task);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

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
        "mb-3 transition-all duration-300 ease-out",
        isDragging && !isDragOverlay && "opacity-30 scale-95",
        isDragOverlay && "rotate-3 scale-105 z-50"
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
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-sm line-clamp-2">
                {task.title}
              </h3>
              <div className="flex items-center space-x-1 ml-2">
                {task.urgent && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                {task.important && (
                  <Target className="h-4 w-4 text-blue-500" />
                )}
              </div>
            </div>

            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}

            {task.dueDate && (
              <div className={cn(
                "flex items-center text-xs",
                isOverdue ? "text-red-600" : "text-muted-foreground"
              )}>
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(task.dueDate)}
                {isOverdue && (
                  <span className="ml-1 font-semibold">(Overdue)</span>
                )}
              </div>
            )}
          </div>
        </CardContent>

        {!isDragOverlay && (
          <CardFooter className="p-4 pt-0">
            <div className="flex justify-end space-x-1 w-full">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                className="h-8 w-8 p-0"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default TaskCard;