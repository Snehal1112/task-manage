import React, { useState, useRef } from 'react';
import { useAppSelector } from '@/app/hooks';
import { selectTasksCount } from '@/features/tasks/tasksSelectors';
import { Task } from '@/features/tasks/TaskTypes';
import DragDropWrapper from '@/components/DragDropWrapper';
import TaskList, { TaskListRef } from '@/components/TaskList';
import EisenhowerMatrix from '@/components/EisenhowerMatrix';
import TaskForm from '@/components/TaskForm';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';

const Dashboard: React.FC = () => {
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const totalTasks = useAppSelector(selectTasksCount);
  const taskListRef = useRef<TaskListRef>(null);

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
    <div className="h-screen bg-background overflow-hidden flex flex-col">
      {/* Header */}
      <header className="border-b bg-card flex-shrink-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Task Management</h1>
              <p className="text-sm text-muted-foreground">
                Eisenhower Matrix - {filteredTasks.length} of {totalTasks} task{totalTasks !== 1 ? 's' : ''} shown
              </p>
            </div>
            <div className="text-xs text-muted-foreground max-w-sm text-right">
              <p className="font-medium mb-1">How to use:</p>
              <p>Create tasks in the Task Panel, then drag them into the appropriate quadrant based on urgency and importance</p>
              <p className="mt-2 text-xs opacity-75">Tip: Press Ctrl+K to search, Ctrl+/ for shortcuts</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 flex-1 min-h-0">
        <DragDropWrapper>
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Task Panel - Left Column */}
            <div className="w-full lg:w-1/3 lg:min-w-[320px]">
              <TaskList 
                ref={taskListRef}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onFilteredTasksChange={setFilteredTasks}
              />
            </div>

            {/* Eisenhower Matrix - Right Column */}
            <div className="flex-1 lg:min-w-[600px]">
              <EisenhowerMatrix 
                onEditTask={handleEditTask} 
                tasks={filteredTasks}
              />
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

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts 
        onAddTask={handleAddTask}
        onToggleSearch={() => taskListRef.current?.focusSearch()}
        onToggleCompleted={() => taskListRef.current?.toggleCompleted()}
        onClearFilters={() => taskListRef.current?.clearFilters()}
      />
    </div>
  );
};

export default Dashboard;