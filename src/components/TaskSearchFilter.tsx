import React, { useState, useMemo, forwardRef, useImperativeHandle, useCallback, useEffect } from 'react';
import { useAppSelector } from '@/app/hooks';
import { selectAllTasks } from '@/features/tasks/tasksSelectors';
import { Task } from '@/features/tasks/TaskTypes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CONTEXT_ICON_SIZES } from '@/utils/iconSizes';
import { performanceUtils } from '@/lib/performance';

interface TaskFilters {
  search: string;
  showCompleted: boolean;
  showUrgent: boolean;
  showImportant: boolean;
  quadrant: string;
}

interface TaskSearchFilterProps {
  onFilteredTasksChange: (tasks: Task[]) => void;
  className?: string;
}

export interface TaskSearchFilterRef {
  focusSearch: () => void;
  toggleCompleted: () => void;
  clearFilters: () => void;
}

const TaskSearchFilter = forwardRef<TaskSearchFilterRef, TaskSearchFilterProps>(
  ({ onFilteredTasksChange, className }, ref) => {
    const allTasks = useAppSelector(selectAllTasks);
    const [filters, setFilters] = useState<TaskFilters>({
      search: '',
      showCompleted: false,
      showUrgent: false,
      showImportant: false,
      quadrant: 'all'
    });
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    // Debounced search to prevent excessive re-renders
    const debouncedSetSearch = useMemo(
      () => performanceUtils.debounce((value: unknown) => {
        setDebouncedSearch(value as string);
      }, 300),
      []
    );

    // Update debounced search when filters.search changes
    useEffect(() => {
      debouncedSetSearch(filters.search);
    }, [filters.search, debouncedSetSearch]);

    useImperativeHandle(ref, () => ({
      focusSearch: () => {
        searchInputRef.current?.focus();
      },
      toggleCompleted: () => {
        updateFilter('showCompleted', !filters.showCompleted);
      },
      clearFilters: () => {
        setFilters({
          search: '',
          showCompleted: false,
          showUrgent: false,
          showImportant: false,
          quadrant: 'all'
        });
        setDebouncedSearch('');
      }
    }));

    // Memoized filtered tasks with debounced search
    const filteredTasks = useMemo(() => {
      let filtered = allTasks;

      // Search filter with debounced value
      if (debouncedSearch.trim()) {
        const searchTerm = debouncedSearch.toLowerCase();
        filtered = filtered.filter(task => {
          const titleMatch = task.title.toLowerCase().includes(searchTerm);
          const descriptionMatch = task.description ? (() => {
            // Extract text content from HTML for searching
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = task.description;
            const textContent = tempDiv.textContent || tempDiv.innerText || '';
            return textContent.toLowerCase().includes(searchTerm);
          })() : false;
          return titleMatch || descriptionMatch;
        });
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

      // Quadrant filter
      if (filters.quadrant !== 'all') {
        filtered = filtered.filter(task => task.quadrant === filters.quadrant);
      }

      return filtered;
    }, [allTasks, debouncedSearch, filters.showCompleted, filters.showUrgent, filters.showImportant, filters.quadrant]);

    // Notify parent component of filtered tasks
    useEffect(() => {
      onFilteredTasksChange(filteredTasks);
    }, [filteredTasks, onFilteredTasksChange]);

    const updateFilter = useCallback((key: keyof TaskFilters, value: string | boolean) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const clearFilters = useCallback(() => {
      setFilters({
        search: '',
        showCompleted: false,
        showUrgent: false,
        showImportant: false,
        quadrant: 'all'
      });
      setDebouncedSearch('');
    }, []);

    const activeFiltersCount = useMemo(() => {
      let count = 0;
      if (debouncedSearch.trim()) count++;
      if (filters.showCompleted) count++;
      if (filters.showUrgent) count++;
      if (filters.showImportant) count++;
      if (filters.quadrant !== 'all') count++;
      return count;
    }, [debouncedSearch, filters]);

    const hasActiveFilters = activeFiltersCount > 0;

    return (
      <div className={cn("space-y-4", className)}>
        {/* Search Bar */}
        <div className="relative">
          <Search className={cn(CONTEXT_ICON_SIZES.searchIcon, "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground")} />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10 pr-10"
            aria-label="Search tasks"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateFilter('search', '')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className={CONTEXT_ICON_SIZES.secondaryButton} />
            </Button>
          )}
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
            aria-expanded={showFilters}
            aria-controls="filter-options"
          >
            <Filter className={CONTEXT_ICON_SIZES.filterIcon} />
            Filters
            {hasActiveFilters && (
              <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {activeFiltersCount} active
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div id="filter-options" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Checkbox
                checked={filters.showCompleted}
                onChange={(e) => updateFilter('showCompleted', e.target.checked)}
                label="Show completed tasks"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <div className="space-y-1">
                <Checkbox
                  checked={filters.showUrgent}
                  onChange={(e) => updateFilter('showUrgent', e.target.checked)}
                  label="Urgent only"
                />
                <Checkbox
                  checked={filters.showImportant}
                  onChange={(e) => updateFilter('showImportant', e.target.checked)}
                  label="Important only"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quadrant</label>
              <select
                value={filters.quadrant}
                onChange={(e) => updateFilter('quadrant', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md"
              >
                <option value="all">All quadrants</option>
                <option value="DO">Do (Urgent + Important)</option>
                <option value="SCHEDULE">Schedule (Not Urgent + Important)</option>
                <option value="DELEGATE">Delegate (Urgent + Not Important)</option>
                <option value="DELETE">Delete (Not Urgent + Not Important)</option>
                <option value="UNASSIGNED">Unassigned</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Results</label>
              <div className="text-sm text-muted-foreground">
                {filteredTasks.length} of {allTasks.length} tasks
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

TaskSearchFilter.displayName = 'TaskSearchFilter';

export default TaskSearchFilter;
