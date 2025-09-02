import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useAppSelector } from '@/app/hooks';
import { selectUnassignedTasks } from '@/features/tasks/tasksSelectors';
import { Task } from '@/features/tasks/TaskTypes';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TaskCard from './TaskCard';
import { useDragContext } from '@/hooks/useDragContext';
import { Plus, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskListProps {
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ onAddTask, onEditTask }) => {
  const unassignedTasks = useAppSelector(selectUnassignedTasks);
  const { activeId, overId } = useDragContext();
  
  const { setNodeRef, isOver } = useDroppable({
    id: 'UNASSIGNED',
  });

  const isBeingDraggedOver = overId === 'UNASSIGNED';
  const isDragActive = !!activeId;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            Task Panel
            <span className="text-sm font-normal text-muted-foreground">
              ({unassignedTasks.length})
            </span>
          </CardTitle>
          <Button onClick={onAddTask} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto max-h-[calc(100vh-240px)] scrollbar-on-hover">
        <div
          ref={setNodeRef}
          className={cn(
            "min-h-[300px] transition-all duration-300 rounded-md p-2 relative",
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
          
          {unassignedTasks.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Inbox className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No tasks yet</p>
              <p className="text-xs mt-1">Click "Add Task" to get started</p>
            </div>
          ) : (
            unassignedTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={onEditTask}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskList;