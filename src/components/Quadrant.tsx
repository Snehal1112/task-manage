import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useAppSelector } from '@/app/hooks';
import { selectTasksByQuadrant } from '@/features/tasks/tasksSelectors';
import { Task, TaskQuadrant } from '@/features/tasks/TaskTypes';
import { QUADRANT_LABELS, QUADRANT_DESCRIPTIONS } from '@/utils/constants';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import TaskCard from './TaskCard';
import { useDragContext } from '@/hooks/useDragContext';
import { AlertCircle, Calendar, Users, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuadrantProps {
  quadrant: TaskQuadrant;
  onEditTask: (task: Task) => void;
}

const getQuadrantIcon = (quadrant: TaskQuadrant) => {
  switch (quadrant) {
    case 'DO':
      return AlertCircle;
    case 'SCHEDULE':
      return Calendar;
    case 'DELEGATE':
      return Users;
    case 'DELETE':
      return Trash2;
    default:
      return AlertCircle;
  }
};

const getQuadrantColors = (quadrant: TaskQuadrant) => {
  switch (quadrant) {
    case 'DO':
      return {
        border: 'border-red-200',
        bg: 'bg-red-50',
        header: 'bg-red-100 text-red-800',
        icon: 'text-red-600'
      };
    case 'SCHEDULE':
      return {
        border: 'border-blue-200',
        bg: 'bg-blue-50',
        header: 'bg-blue-100 text-blue-800',
        icon: 'text-blue-600'
      };
    case 'DELEGATE':
      return {
        border: 'border-yellow-200',
        bg: 'bg-yellow-50',
        header: 'bg-yellow-100 text-yellow-800',
        icon: 'text-yellow-600'
      };
    case 'DELETE':
      return {
        border: 'border-gray-200',
        bg: 'bg-gray-50',
        header: 'bg-gray-100 text-gray-800',
        icon: 'text-gray-600'
      };
    default:
      return {
        border: 'border-gray-200',
        bg: 'bg-white',
        header: 'bg-gray-100 text-gray-800',
        icon: 'text-gray-600'
      };
  }
};

const Quadrant: React.FC<QuadrantProps> = ({ quadrant, onEditTask }) => {
  const tasks = useAppSelector(selectTasksByQuadrant(quadrant));
  const colors = getQuadrantColors(quadrant);
  const Icon = getQuadrantIcon(quadrant);
  const { activeId, overId } = useDragContext();

  const { setNodeRef, isOver } = useDroppable({
    id: quadrant,
  });

  const isBeingDraggedOver = overId === quadrant;
  const isDragActive = !!activeId;

  if (quadrant === 'UNASSIGNED') return null;

  return (
    <Card className={cn('h-full', colors.border, colors.bg)}>
      <CardHeader className={cn('pb-3', colors.header)}>
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Icon className={cn('h-4 w-4', colors.icon)} />
            <span className="font-semibold">
              {QUADRANT_LABELS[quadrant]}
            </span>
          </div>
          <span className="text-xs font-normal">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </span>
        </CardTitle>
        <p className="text-xs opacity-80">
          {QUADRANT_DESCRIPTIONS[quadrant]}
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto pt-0 max-h-[calc((100vh-300px)/2)] scrollbar-on-hover">
        <div
          ref={setNodeRef}
          className={cn(
            "min-h-[180px] transition-all duration-300 rounded-md p-2 relative",
            isDragActive && "ring-2 ring-primary/10",
            isBeingDraggedOver && "bg-white/90 ring-2 ring-primary/50 scale-105 shadow-lg",
            isOver && !isBeingDraggedOver && "bg-white/70 ring-2 ring-primary/40 scale-103"
          )}
        >
          {/* Drop placeholder */}
          {isBeingDraggedOver && (
            <div className="absolute inset-2 border-2 border-dashed border-primary/60 rounded-md bg-primary/10 flex items-center justify-center z-10 animate-pulse">
              <div className="text-center text-primary/80">
                <Icon className={cn('h-6 w-6 mx-auto mb-2', colors.icon)} />
                <p className="text-xs font-medium">{QUADRANT_LABELS[quadrant]}</p>
                <p className="text-xs opacity-80">Drop task here</p>
              </div>
            </div>
          )}
          
          {tasks.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">
              <Icon className={cn('h-8 w-8 mx-auto mb-2 opacity-50', colors.icon)} />
              <p className="text-xs">Drop tasks here</p>
            </div>
          ) : (
            tasks.map((task, index) => (
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

export default Quadrant;