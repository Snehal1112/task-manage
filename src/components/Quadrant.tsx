import { memo, useMemo } from 'react';
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
  tasks?: Task[];
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
        bg: 'bg-red-100',
        header: 'bg-red-100 text-red-800',
        icon: 'text-red-600'
      };
    case 'SCHEDULE':
      return {
        border: 'border-blue-200',
        bg: 'bg-blue-100',
        header: 'bg-blue-100 text-blue-800',
        icon: 'text-blue-600'
      };
    case 'DELEGATE':
      return {
        border: 'border-yellow-200',
        bg: 'bg-yellow-100',
        header: 'bg-yellow-100 text-yellow-800',
        icon: 'text-yellow-600'
      };
    case 'DELETE':
      return {
        border: 'border-gray-200',
        bg: 'bg-gray-100',
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

const Quadrant = memo<QuadrantProps>(({ quadrant, onEditTask, tasks: externalTasks }) => {
  const allTasksInQuadrant = useAppSelector(selectTasksByQuadrant(quadrant));
  
  const tasks = useMemo(() => 
    externalTasks ? externalTasks.filter(task => task.quadrant === quadrant) : allTasksInQuadrant,
    [externalTasks, quadrant, allTasksInQuadrant]
  );
  
  const colors = useMemo(() => getQuadrantColors(quadrant), [quadrant]);
  const Icon = useMemo(() => getQuadrantIcon(quadrant), [quadrant]);
  
  const { activeId, overId } = useDragContext();

  const { setNodeRef, isOver } = useDroppable({
    id: quadrant,
  });

  const isBeingDraggedOver = overId === quadrant;
  const isDragActive = !!activeId;

  if (quadrant === 'UNASSIGNED') return null;

  return (
    <div className="h-full">
      <Card className={cn(
        'h-full transition-all duration-200 hover:shadow-md',
        colors.border,
        'border-2'
      )}>
        <CardHeader className={cn('pb-3 border-b', colors.header)}>
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Icon className={cn('h-4 w-4', colors.icon)} />
              <span className="font-bold text-sm">
                {QUADRANT_LABELS[quadrant]}
              </span>
            </div>
            <div className={cn(
              'px-2 py-1 rounded-full text-xs font-bold',
              tasks.length > 0 ? colors.bg + ' ' + colors.icon : 'bg-gray-100 text-gray-500'
            )}>
              {tasks.length}
            </div>
          </CardTitle>
          <p className={cn('text-xs font-medium opacity-90', colors.icon)}>
            {QUADRANT_DESCRIPTIONS[quadrant]}
          </p>
        </CardHeader>
        
        <CardContent className={cn("flex-1 overflow-hidden p-0", colors.bg)}>
          <div
            ref={setNodeRef}
            className={cn(
              "h-full transition-all duration-300 relative overflow-y-auto",
              "min-h-[200px] p-3",
              colors.bg,
              isDragActive && !isBeingDraggedOver && "bg-opacity-60",
              isBeingDraggedOver && "bg-white/90 ring-2 ring-primary/40 ring-inset",
              isOver && !isBeingDraggedOver && "bg-white/70 ring-1 ring-primary/30 ring-inset"
            )}
          >
            {/* Enhanced Drop placeholder */}
            {isBeingDraggedOver && (
              <div className="absolute inset-3 border-2 border-dashed border-primary/60 rounded-lg bg-white/80 backdrop-blur-sm flex items-center justify-center z-20 animate-pulse">
                <div className="text-center">
                  <div className={cn(
                    'w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center',
                    colors.bg, colors.icon
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{QUADRANT_LABELS[quadrant]}</p>
                  <p className="text-xs text-gray-600 mt-1">Drop your task here</p>
                </div>
              </div>
            )}
            
            {/* Empty state */}
            {tasks.length === 0 && !isBeingDraggedOver && (
              <div className="h-full flex items-center justify-center text-center">
                <div className="text-muted-foreground">
                  <Icon className={cn('h-8 w-8 mx-auto mb-3 opacity-30', colors.icon)} />
                  <p className="text-sm font-medium opacity-60">No tasks yet</p>
                  <p className="text-xs opacity-40 mt-1">Drag tasks from the panel</p>
                </div>
              </div>
            )}
            
            {/* Task list with improved spacing */}
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onEdit={onEditTask}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

Quadrant.displayName = 'Quadrant';

export default Quadrant;