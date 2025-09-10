import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addTask, updateTask, setError } from '@/features/tasks/tasksSlice';
import { selectTasksError } from '@/features/tasks/tasksSelectors';
import { Task, TaskFormData } from '@/features/tasks/TaskTypes';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Save, X } from 'lucide-react';
import { CONTEXT_ICON_SIZES } from '@/utils/iconSizes';
import { cn } from '@/lib/utils';

interface TaskFormProps {
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectTasksError);

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    dueDate: '',
    urgent: false,
    important: false,
    completed: false,
  });

  // Update form data when task prop changes (for editing)
  useEffect(() => {
    if (task) {
      // Convert ISO date to YYYY-MM-DD format for input[type="date"]
      let formattedDate = '';
      if (task.dueDate) {
        const date = new Date(task.dueDate);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0];
        }
      }

      setFormData({
        title: task.title,
        description: task.description || '',
        dueDate: formattedDate,
        urgent: task.urgent,
        important: task.important,
        completed: task.completed,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        urgent: false,
        important: false,
        completed: false,
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return;

    // Convert date to ISO format if provided, preserving local timezone
    let dueDate = formData.dueDate;
    if (dueDate) {
      // Create date in local timezone to avoid date shifting
      const date = new Date(dueDate + 'T00:00:00');
      dueDate = date.toISOString();
    }

    const taskData = {
      ...formData,
      title: formData.title.trim(),
      dueDate: dueDate || undefined,
    };

    if (task) {
      dispatch(updateTask({
        id: task.id,
        updates: taskData
      }));
    } else {
      dispatch(addTask(taskData));
    }

    onClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      urgent: false,
      important: false,
      completed: false,
    });
  };

  const handleClose = () => {
    dispatch(setError(null)); // Clear any errors when closing
    onClose();
    if (!task) {
      resetForm();
    }
  };

  const updateFormData = (field: keyof TaskFormData, value: string | boolean) => {
    if (field === 'description' && typeof value === 'string' && value.length > 2000) {
      // Truncate to 2000 characters
      value = value.substring(0, 2000);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {task ? (
              <>
                <Save className={CONTEXT_ICON_SIZES.formButton} />
                Edit Task
              </>
            ) : (
              <>
                <Plus className={CONTEXT_ICON_SIZES.formButton} />
                Add New Task
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="px-6 py-2">
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Task Title *
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              placeholder="Enter task title..."
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Optional task description..."
              rows={3}
            />
            <div className="text-xs mt-1 text-muted-foreground">
              {2000 - (formData.description || '').length} characters remaining
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Due Date
            </label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => updateFormData('dueDate', e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Priority Flags
            </label>
            <div className="flex flex-col space-y-2">
              <Checkbox
                checked={formData.urgent}
                onChange={(e) => updateFormData('urgent', e.target.checked)}
                label="Urgent - Requires immediate attention"
              />
              <Checkbox
                checked={formData.important}
                onChange={(e) => updateFormData('important', e.target.checked)}
                label="Important - Has significant impact"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Status
            </label>
            <Checkbox
              checked={formData.completed}
              onChange={(e) => updateFormData('completed', e.target.checked)}
              label="Mark as completed"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              <X className={`${CONTEXT_ICON_SIZES.formButton} mr-2`} />
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={(formData.description || '').length > 2000}
            >
              {task ? (
                <>
                  <Save className={`${CONTEXT_ICON_SIZES.formButton} mr-2`} />
                  Update Task
                </>
              ) : (
                <>
                  <Plus className={`${CONTEXT_ICON_SIZES.formButton} mr-2`} />
                  Add Task
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
