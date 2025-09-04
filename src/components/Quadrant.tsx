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
import { CONTEXT_ICON_SIZES } from '@/utils/iconSizes';

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
    <div className="h-full flex flex-col">
      <Card className={cn(
        'h-full flex flex-col transition-all duration-200 hover:shadow-md',
        colors.border,
        'border'
      )}>
        <CardHeader className={cn('py-2 lg:py-4 px-3 lg:px-6 border-b flex-shrink-0', colors.header)}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-4">
              <Icon className={cn(CONTEXT_ICON_SIZES.cardHeaderIcon, colors.icon)} />
              <span className="font-bold text-sm lg:text-base tracking-tight">
                {QUADRANT_LABELS[quadrant]}
              </span>
            </div>
            <div className={cn(
              'px-2 lg:px-4 py-1 lg:py-2 rounded-full text-xs lg:text-sm font-bold flex-shrink-0 min-w-[24px] lg:min-w-[32px] text-center',
              tasks.length > 0 ? colors.bg + ' ' + colors.icon : 'bg-gray-100 text-gray-500'
            )}>
              {tasks.length}
            </div>
          </CardTitle>
          <p className={cn('text-xs lg:text-sm font-medium opacity-90 leading-relaxed mt-1 lg:mt-3', colors.icon)}>
            {QUADRANT_DESCRIPTIONS[quadrant]}
          </p>
        </CardHeader>

        <CardContent className={cn('flex-1 min-h-0 overflow-hidden p-0', colors.bg)}>
          <div
            ref={setNodeRef}
            className={cn(
              "h-full w-full transition-all duration-300 relative overflow-y-auto overflow-x-hidden",
              "p-2 lg:p-4 scrollbar-hover",
              colors.bg,
              isDragActive && !isBeingDraggedOver && "bg-opacity-60",
              isBeingDraggedOver && "bg-white/90 ring-2 ring-primary/40 ring-inset",
              isOver && !isBeingDraggedOver && "bg-white/70 ring-1 ring-primary/30 ring-inset"
            )}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
            }}
          >
            {/* Enhanced Drop placeholder with Better Typography */}
            {isBeingDraggedOver && (
              <div className="absolute inset-3 border-2 border-dashed border-primary/60 rounded-lg bg-white/80 backdrop-blur-sm flex items-center justify-center z-20 animate-pulse">
                <div className="text-center">
                  <div className={cn(
                    'w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center',
                    colors.bg, colors.icon
                  )}>
                    <Icon className={CONTEXT_ICON_SIZES.quadrantBadgeIcon} />
                  </div>
                  <p className="text-base font-bold text-gray-800 tracking-tight">{QUADRANT_LABELS[quadrant]}</p>
                  <p className="text-sm font-medium text-gray-600 mt-1">Drop task here</p>
                </div>
              </div>
            )}

            {/* Enhanced empty state with Better Typography */}
            {tasks.length === 0 && !isBeingDraggedOver && (
              <div className="h-full flex items-center justify-center text-center">
                <div className="text-muted-foreground">
                  <Icon className={cn(CONTEXT_ICON_SIZES.quadrantEmptyIcon + ' mx-auto mb-3 opacity-30', colors.icon)} />
                  <p className="text-base font-semibold opacity-60">No tasks yet</p>
                  <p className="text-sm opacity-40 mt-1">Drag tasks here</p>
                </div>
              </div>
            )}

            {/* Task list with improved spacing and proper overflow handling */}
            <div className="space-y-2 min-h-0">
              {tasks.map((task, index) => (
                <div key={task.id} className="flex-shrink-0">
                  <TaskCard
                    task={task}
                    index={index}
                    onEdit={onEditTask}
                  />
                </div>
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
