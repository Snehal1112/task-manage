import React from 'react';
import { Task } from '@/features/tasks/TaskTypes';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, AlertCircle, CheckCircle, Edit, Clock, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CONTEXT_ICON_SIZES } from '@/utils/iconSizes';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose, onEdit }) => {
  if (!task) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  const getQuadrantInfo = (quadrant: string) => {
    switch (quadrant) {
      case 'DO':
        return { label: 'Do', color: 'bg-red-100 text-red-800', description: 'Urgent & Important' };
      case 'SCHEDULE':
        return { label: 'Schedule', color: 'bg-blue-100 text-blue-800', description: 'Not Urgent but Important' };
      case 'DELEGATE':
        return { label: 'Delegate', color: 'bg-yellow-100 text-yellow-800', description: 'Urgent but Not Important' };
      case 'DELETE':
        return { label: 'Delete', color: 'bg-gray-100 text-gray-800', description: 'Not Urgent & Not Important' };
      default:
        return { label: 'Unassigned', color: 'bg-slate-100 text-slate-800', description: 'Not categorized yet' };
    }
  };

  const quadrantInfo = getQuadrantInfo(task.quadrant);

  const handleEdit = () => {
    onEdit(task);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold leading-tight pr-8">
            {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className={quadrantInfo.color}>
              {quadrantInfo.label}
            </Badge>
            
            {task.urgent && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Urgent
              </Badge>
            )}
            
            {task.important && (
              <Badge variant="default" className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700">
                <Flag className="h-3 w-3" />
                Important
              </Badge>
            )}
            
            {task.completed && (
              <Badge variant="outline" className="flex items-center gap-1 text-green-700 border-green-300">
                <CheckCircle className="h-3 w-3" />
                Completed
              </Badge>
            )}
          </div>

          {/* Quadrant Description */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Category:</span> {quadrantInfo.description}
            </p>
          </div>

          {/* Description */}
          {task.description && (
            <div className="space-y-2">
              <h3 className="font-semibold text-base">Description</h3>
              <div className="bg-muted/30 p-4 rounded-lg">
                <div
                  className="text-xs leading-tight prose prose-xs max-w-none"
                  dangerouslySetInnerHTML={{ __html: task.description }}
                />
              </div>
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div className="space-y-2">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Calendar className={CONTEXT_ICON_SIZES.taskStatusIcon} />
                Due Date
              </h3>
              <div className={cn(
                "flex items-center gap-2 p-3 rounded-lg",
                isOverdue && !task.completed 
                  ? "bg-red-50 text-red-800 border border-red-200" 
                  : "bg-muted/30"
              )}>
                {isOverdue && !task.completed && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <div>
                  <p className={cn(
                    "font-medium",
                    isOverdue && !task.completed && "text-red-800"
                  )}>
                    {formatDate(task.dueDate)}
                  </p>
                  {isOverdue && !task.completed && (
                    <p className="text-xs text-red-600 mt-1">
                      This task is overdue
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <Separator />
          <div className="space-y-2">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Clock className={CONTEXT_ICON_SIZES.taskStatusIcon} />
              Task Details
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><span className="font-medium">Created:</span> {formatDateTime(task.createdAt)}</p>
              <p><span className="font-medium">Last Updated:</span> {formatDateTime(task.updatedAt)}</p>
              <p><span className="font-medium">ID:</span> <code className="text-xs bg-muted px-1 py-0.5 rounded">{task.id}</code></p>
            </div>
          </div>

          {/* Actions */}
          <Separator />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleEdit} className="flex items-center gap-2">
              <Edit className={CONTEXT_ICON_SIZES.formButton} />
              Edit Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;