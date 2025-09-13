import React from 'react';
import { Task } from '@/features/tasks/TaskTypes';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { CONTEXT_ICON_SIZES } from '@/utils/iconSizes';

interface DeleteConfirmModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  task,
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!task) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="space-y-4 pb-4">
          <div className="flex items-center justify-center w-12 h-12 m-auto bg-red-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <DialogTitle className="text-center text-xl font-semibold">
            Delete Task
          </DialogTitle>
          <DialogDescription className="text-center text-base leading-relaxed px-2">
            Are you sure you want to delete this task? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {/* Task Preview */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-3 my-6">
          <h4 className="font-medium text-sm text-muted-foreground">Task to be deleted:</h4>
          <p className="font-semibold text-foreground line-clamp-2">
            {task.title}
          </p>
          {task.description && (
            <div
              className="text-xs text-muted-foreground line-clamp-2 prose prose-xs max-w-none leading-none"
              dangerouslySetInnerHTML={{
                __html: task.description.length > 150
                  ? task.description.substring(0, 150) + '...'
                  : task.description
              }}
            />
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-3 pt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <X className={CONTEXT_ICON_SIZES.formButton} />
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Trash2 className={CONTEXT_ICON_SIZES.formButton} />
            Delete Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmModal;