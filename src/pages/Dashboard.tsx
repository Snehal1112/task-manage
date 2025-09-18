import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { selectTasksCount } from '@/features/tasks/tasksSelectors';
import { fetchTasks, toggleTaskCompletion } from '@/features/tasks/tasksSlice';
import { Task } from '@/features/tasks/TaskTypes';
import DragDropWrapper from '@/components/DragDropWrapper';
import TaskList, { TaskListRef } from '@/components/TaskList';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import ViewSelector from '@/components/ViewSelector';

// Lazy load heavy components
const EisenhowerMatrix = lazy(() => import('@/components/EisenhowerMatrix'));
const TableView = lazy(() => import('@/components/TableView'));
const TaskForm = lazy(() => import('@/components/TaskForm'));

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const allTasks = useAppSelector(state => state.tasks.tasks);
  const totalTasks = useAppSelector(selectTasksCount);
  const currentView = useAppSelector(state => state.tasks.view.currentView);
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

  const handleToggleTask = (task: Task) => {
    dispatch(toggleTaskCompletion(task.id));
  };

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col" role="application" aria-label="Task Management Dashboard">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-card via-card to-card/95 flex-shrink-0 shadow-sm" role="banner">
        <div className="container mx-auto px-3 sm:px-6 py-4">
          {/* Title and Stats */}
          <div className="flex items-center justify-between gap-6 mb-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Task Management</h1>
                <div className="hidden sm:block w-2 h-2 bg-primary/60 rounded-full"></div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground/80" aria-live="polite">
                <span className="font-medium">{currentView === 'matrix' ? 'Eisenhower Matrix' : 'Table View'}</span>
                <span className="mx-1 text-muted-foreground/60">•</span>
                <span>{currentView === 'table' ? allTasks.length : filteredTasks.length} of {totalTasks} task{totalTasks !== 1 ? 's' : ''}</span>
              </p>
            </div>
          </div>

          {/* View Controls */}
          <ViewSelector />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-1 sm:px-2 md:px-4 py-1 sm:py-2 flex-1 min-h-0" role="main" id="main-content">
        {currentView === 'matrix' ? (
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
                <Suspense fallback={
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground">Loading Matrix...</p>
                    </div>
                  </div>
                }>
                  <EisenhowerMatrix
                    onEditTask={handleEditTask}
                    tasks={filteredTasks}
                  />
                </Suspense>
              </div>
            </div>
          </DragDropWrapper>
        ) : (
          <div className="h-full overflow-auto">
            <Suspense fallback={
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Loading Table...</p>
                </div>
              </div>
            }>
              <TableView
                tasks={currentView === 'table' ? allTasks : filteredTasks}
                onEditTask={handleEditTask}
                onToggleTask={handleToggleTask}
                onAddTask={handleAddTask}
              />
            </Suspense>
          </div>
        )}
      </main>

      {/* Task Form Modal */}
      <Suspense fallback={null}>
        <TaskForm
          task={editingTask}
          isOpen={isTaskFormOpen}
          onClose={handleCloseTaskForm}
        />
      </Suspense>

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
