import React from 'react';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { setView, setGroupBy } from '@/features/tasks/tasksSlice';
import { ViewType, GroupBy } from '@/features/tasks/TaskTypes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { 
  Grid3X3, 
  Table, 
  Filter,
  Calendar,
  Clock,
  Flag,
  HelpCircle,
} from 'lucide-react';

const ViewSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentView, groupBy } = useAppSelector(state => state.tasks.view);

  const handleViewChange = (view: ViewType) => {
    dispatch(setView(view));
  };

  const handleGroupByChange = (value: GroupBy) => {
    dispatch(setGroupBy(value));
  };

  const getGroupByIcon = (groupBy: GroupBy) => {
    switch (groupBy) {
      case 'quadrant':
        return <Grid3X3 className="h-4 w-4" />;
      case 'date':
        return <Calendar className="h-4 w-4" />;
      case 'overdue':
        return <Clock className="h-4 w-4" />;
      case 'priority':
        return <Flag className="h-4 w-4" />;
      default:
        return <Filter className="h-4 w-4" />;
    }
  };

  const getGroupByLabel = (groupBy: GroupBy) => {
    switch (groupBy) {
      case 'none':
        return 'No Grouping';
      case 'quadrant':
        return 'By Quadrant';
      case 'date':
        return 'By Date';
      case 'overdue':
        return 'By Status';
      case 'priority':
        return 'By Priority';
      default:
        return 'Unknown';
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-border/40">
        {/* View Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 p-0.5 bg-muted/60 rounded-lg border">
              <Button
                variant={currentView === 'matrix' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('matrix')}
                className="h-8 px-3 text-xs font-medium shadow-none"
              >
                <Grid3X3 className="h-3.5 w-3.5 mr-1.5" />
                Matrix
              </Button>
              <Button
                variant={currentView === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('table')}
                className="h-8 px-3 text-xs font-medium shadow-none"
              >
                <Table className="h-3.5 w-3.5 mr-1.5" />
                Table
              </Button>
            </div>
            
            {/* Help Tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm p-3" side="bottom" align="start">
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Quick Tips:</p>
                  <div className="text-xs space-y-1">
                    {currentView === 'matrix' ? (
                      <div className="space-y-1">
                        <p>• Drag tasks between quadrants based on urgency and importance</p>
                        <p>• Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+K</kbd> to search tasks</p>
                        <p>• Use the Task Panel on the left to create new tasks</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p>• Click checkboxes to complete tasks</p>
                        <p>• Use the edit button to modify task details</p>
                        <p>• Group tasks by category for better organization</p>
                        <p>• Sort columns by clicking headers</p>
                      </div>
                    )}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Grouping Controls - Only for Table View */}
          {currentView === 'table' && (
            <>
              <div className="hidden sm:block h-5 w-px bg-border/60" />
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Group by:</span>
                <div className="relative min-w-0">
                  <Select value={groupBy} onValueChange={handleGroupByChange}>
                    <SelectTrigger className="h-9 w-48 text-sm bg-muted/40 border-muted-foreground/20 hover:bg-muted/60 hover:border-muted-foreground/30 transition-colors overflow-hidden">
                      <div className="flex items-center gap-2.5 min-w-0 overflow-hidden w-full">
                        <div className="p-1 bg-background/80 rounded flex-shrink-0">
                          {getGroupByIcon(groupBy)}
                        </div>
                        <span className="font-medium truncate text-left flex-1 min-w-0">
                          {getGroupByLabel(groupBy)}
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="min-w-56 p-1.5" align="start">
                      <SelectItem value="none" className="rounded-md p-3 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-muted rounded">
                            <Filter className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">No Grouping</div>
                            <div className="text-xs text-muted-foreground">Show all tasks in one list</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="quadrant" className="rounded-md p-3 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded">
                            <Grid3X3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">By Quadrant</div>
                            <div className="text-xs text-muted-foreground">Group by Eisenhower Matrix</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="date" className="rounded-md p-3 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded">
                            <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">By Date</div>
                            <div className="text-xs text-muted-foreground">Group by due dates</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="overdue" className="rounded-md p-3 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-orange-100 dark:bg-orange-900 rounded">
                            <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">By Status</div>
                            <div className="text-xs text-muted-foreground">Group by completion status</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="priority" className="rounded-md p-3 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-red-100 dark:bg-red-900 rounded">
                            <Flag className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">By Priority</div>
                            <div className="text-xs text-muted-foreground">Group by urgency & importance</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Status Info - Show active grouping count if needed */}
        {currentView === 'table' && groupBy !== 'none' && (
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-primary/8 border border-primary/15 rounded-full">
              <span className="text-xs font-semibold text-primary">
                Active: {getGroupByLabel(groupBy)}
              </span>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ViewSelector;