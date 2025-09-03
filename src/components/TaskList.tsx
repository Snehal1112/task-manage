import React, { useState, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useAppSelector } from '@/app/hooks';
import { selectUnassignedTasks, selectTasksByQuadrant, selectAllTasks } from '@/features/tasks/tasksSelectors';
import { Task, TaskQuadrant } from '@/features/tasks/TaskTypes';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import TaskCard from './TaskCard';
import { useDragContext } from '@/hooks/useDragContext';
import { Plus, Inbox, Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskFilters {
  search: string;
  showCompleted: boolean;
  showUrgent: boolean;
  showImportant: boolean;
}

interface TaskListProps {
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  quadrant?: TaskQuadrant;
  onFilteredTasksChange?: (tasks: Task[]) => void;
}

export interface TaskListRef {
  focusSearch: () => void;
  toggleCompleted: () => void;
  clearFilters: () => void;
}

const TaskList = forwardRef<TaskListRef, TaskListProps>(({ onAddTask, onEditTask, quadrant = 'UNASSIGNED', onFilteredTasksChange }, ref) => {
  const allTasks = useAppSelector(selectAllTasks);
  const unassignedTasks = useAppSelector(selectUnassignedTasks);
  const quadrantTasks = useAppSelector(selectTasksByQuadrant(quadrant));
  const { activeId, overId } = useDragContext();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    showCompleted: false,
    showUrgent: false,
    showImportant: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Get base tasks for the quadrant
  const baseTasks = quadrant === 'UNASSIGNED' ? unassignedTasks : quadrantTasks;

  // Apply filters to tasks
  const displayTasks = useMemo(() => {
    let filtered = baseTasks;

    // Search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm) ||
        task.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Completion filter
    if (!filters.showCompleted) {
      filtered = filtered.filter(task => !task.completed);
    }

    // Urgent filter
    if (filters.showUrgent) {
      filtered = filtered.filter(task => task.urgent);
    }

    // Important filter
    if (filters.showImportant) {
      filtered = filtered.filter(task => task.important);
    }

    return filtered;
  }, [baseTasks, filters]);

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) count++;
    if (filters.showCompleted) count++;
    if (filters.showUrgent) count++;
    if (filters.showImportant) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFiltersCount > 0;

  // Notify parent of all filtered tasks (for global state)
  React.useEffect(() => {
    if (onFilteredTasksChange) {
      let allFiltered = allTasks;

      // Search filter
      if (filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase();
        allFiltered = allFiltered.filter(task =>
          task.title.toLowerCase().includes(searchTerm) ||
          task.description?.toLowerCase().includes(searchTerm)
        );
      }

      // Completion filter
      if (!filters.showCompleted) {
        allFiltered = allFiltered.filter(task => !task.completed);
      }

      // Urgent filter
      if (filters.showUrgent) {
        allFiltered = allFiltered.filter(task => task.urgent);
      }

      // Important filter
      if (filters.showImportant) {
        allFiltered = allFiltered.filter(task => task.important);
      }

      onFilteredTasksChange(allFiltered);
    }
  }, [filters, allTasks, onFilteredTasksChange]);

  const updateFilter = (key: keyof TaskFilters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      showCompleted: false,
      showUrgent: false,
      showImportant: false,
    });
  };

  const focusSearch = () => {
    searchInputRef.current?.focus();
  };

  const toggleCompleted = () => {
    updateFilter('showCompleted', !filters.showCompleted);
  };

  // Expose functions via ref for keyboard shortcuts
  useImperativeHandle(ref, () => ({
    focusSearch,
    toggleCompleted,
    clearFilters,
  }));

  const { setNodeRef, isOver } = useDroppable({
    id: quadrant,
  });

  const isBeingDraggedOver = overId === quadrant;
  const isDragActive = !!activeId;

  return (
    <Card className="h-full"> {/* Added padding to the Card */}
      <CardHeader className="pb-6"> {/* Increased bottom padding for better spacing */}
        <div className="flex items-center justify-between mb-4"> {/* Added margin-bottom for spacing */}
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            Task Panel
            <span className="text-sm font-normal text-muted-foreground">
              ({displayTasks.length})
            </span>
          </CardTitle>
          <Button onClick={onAddTask} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Integrated Search and Filter */}
        <div className="space-y-4 pt-3"> {/* Adjusted spacing between sections */}
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10 pr-10 h-9"
              aria-label="Search tasks"
            />
            {filters.search && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('search', '')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 h-8"
              aria-expanded={showFilters}
            >
              <Filter className="h-3 w-3" />
              Filters
              {hasActiveFilters && (
                <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground h-8 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg"> {/* Adjusted padding for better spacing */}
              <div className="space-y-2">
                <label className="text-xs font-medium">Status</label>
                <Checkbox
                  checked={filters.showCompleted}
                  onChange={(e) => updateFilter('showCompleted', e.target.checked)}
                  label="Show completed"
                  className="text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Priority</label>
                <div className="space-y-1">
                  <Checkbox
                    checked={filters.showUrgent}
                    onChange={(e) => updateFilter('showUrgent', e.target.checked)}
                    label="Urgent only"
                    className="text-xs"
                  />
                  <Checkbox
                    checked={filters.showImportant}
                    onChange={(e) => updateFilter('showImportant', e.target.checked)}
                    label="Important only"
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto max-h-[calc(100vh-240px)] scrollbar-on-hover"> {/* Added padding for better spacing */}
        <div
          ref={setNodeRef}
          className={cn(
            "min-h-[300px] transition-all duration-300 rounded-md p-1 relative", /* Adjusted padding */
            isDragActive && "ring-2 ring-primary/10 bg-accent/20",
            isBeingDraggedOver && "bg-primary/10 ring-2 ring-primary/40 scale-102 shadow-lg",
            isOver && !isBeingDraggedOver && "bg-accent/50 ring-2 ring-primary/20 scale-101"
          )}
        >
          {/* Drop placeholder */}
          {isBeingDraggedOver && (
            <div className="absolute inset-2 border-2 border-dashed border-primary/50 rounded-md bg-primary/5 flex items-center justify-center z-10 animate-pulse">
              <div className="text-center text-primary/70">
                <Inbox className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Drop task here</p>
                <p className="text-xs">Return to Task Panel</p>
              </div>
            </div>
          )}

          {displayTasks.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Inbox className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No tasks yet</p>
              <p className="text-xs mt-1">Click "Add Task" to get started</p>
            </div>
          ) : (
            displayTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={onEditTask}
                className="mb-4" /* Added margin-bottom for spacing between tasks */
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
});

TaskList.displayName = 'TaskList';

export default TaskList;
