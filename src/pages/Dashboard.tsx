import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { selectTasksCount } from '@/features/tasks/tasksSelectors';
import { fetchTasks } from '@/features/tasks/tasksSlice';
import { Task } from '@/features/tasks/TaskTypes';
import DragDropWrapper from '@/components/DragDropWrapper';
import TaskList, { TaskListRef } from '@/components/TaskList';
import EisenhowerMatrix from '@/components/EisenhowerMatrix';
import TaskForm from '@/components/TaskForm';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import {loadTasksFromStorage } from '@/utils/storage';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const demoTask = loadTasksFromStorage();
  console.log('Loaded tasks from storage:', demoTask);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(demoTask || []);
  const totalTasks = useAppSelector(selectTasksCount);
  const taskListRef = useRef<TaskListRef>(null);

  // Fetch tasks when component mounts
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

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
    <div className="h-screen bg-background overflow-hidden flex flex-col" role="application" aria-label="Task Management Dashboard">
      {/* Header */}
      <header className="border-b bg-card flex-shrink-0" role="banner">
        <div className="container mx-auto px-2 sm:px-4 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold truncate">Task Management</h1>
              <p className="text-xs text-muted-foreground" aria-live="polite">
                Eisenhower Matrix - {filteredTasks.length} of {totalTasks} task{totalTasks !== 1 ? 's' : ''} shown
              </p>
            </div>
            <div className="text-xs text-muted-foreground max-w-sm text-right hidden md:block">
              <p className="font-medium mb-0.5">How to use:</p>
              <p className="leading-tight">Create tasks in the Task Panel, then drag them into the appropriate quadrant based on urgency and importance</p>
              <p className="mt-1 text-xs opacity-75">Tip: Press Ctrl+K to search, Ctrl+/ for shortcuts</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-1 sm:px-2 md:px-4 py-1 sm:py-2 flex-1 min-h-0" role="main">
        <DragDropWrapper>
          <div className="flex flex-col lg:flex-row gap-1 sm:gap-2 md:gap-3 h-full">
            {/* Task Panel - Left Column */}
            <div className="w-full lg:w-1/3 lg:min-w-[280px] lg:max-w-[400px]">
              <TaskList
                ref={taskListRef}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onFilteredTasksChange={setFilteredTasks}
              />
            </div>

            {/* Eisenhower Matrix - Right Column */}
            <div className="flex-1 lg:min-w-[400px]">
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
