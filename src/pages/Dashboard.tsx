import React, { useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { selectTasksCount } from '@/features/tasks/tasksSelectors';
import { Task } from '@/features/tasks/TaskTypes';
import DragDropWrapper from '@/components/DragDropWrapper';
import TaskList from '@/components/TaskList';
import EisenhowerMatrix from '@/components/EisenhowerMatrix';
import TaskForm from '@/components/TaskForm';

const Dashboard: React.FC = () => {
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const totalTasks = useAppSelector(selectTasksCount);

  const handleAddTask = () => {
    setEditingTask(undefined);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleCloseTaskForm = () => {
    setIsTaskFormOpen(false);
    setEditingTask(undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Task Management</h1>
              <p className="text-sm text-muted-foreground">
                Eisenhower Matrix - {totalTasks} total task{totalTasks !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-xs text-muted-foreground max-w-sm text-right">
              <p className="font-medium mb-1">How to use:</p>
              <p>Create tasks in the Task Panel, then drag them into the appropriate quadrant based on urgency and importance</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <DragDropWrapper>
          <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)]">
            {/* Task Panel - Left Column */}
            <div className="w-full lg:w-1/3 lg:min-w-[320px]">
              <TaskList 
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
              />
            </div>

            {/* Eisenhower Matrix - Right Column */}
            <div className="flex-1 lg:min-w-[600px]">
              <EisenhowerMatrix onEditTask={handleEditTask} />
            </div>
          </div>
        </DragDropWrapper>
      </main>

      {/* Task Form Modal */}
      <TaskForm
        task={editingTask}
        isOpen={isTaskFormOpen}
        onClose={handleCloseTaskForm}
      />
    </div>
  );
};

export default Dashboard;