import React from 'react';
import { Task } from '@/features/tasks/TaskTypes';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Quadrant from './Quadrant';
import { Target } from 'lucide-react';
import { CONTEXT_ICON_SIZES } from '@/utils/iconSizes';

interface EisenhowerMatrixProps {
  onEditTask: (task: Task) => void;
  tasks?: Task[];
}

const EisenhowerMatrix: React.FC<EisenhowerMatrixProps> = ({ onEditTask, tasks }) => {
  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Header with Improved Typography and Professional Branding */}
      <Card className="mb-4 lg:mb-6 shadow-lg">
        <CardHeader className="py-4 px-4 lg:py-8 lg:px-8">
          <CardTitle className="flex items-center gap-3 lg:gap-6 text-2xl">
            <div className="p-2 lg:p-4 bg-primary/15 rounded-xl shadow-sm">
              <Target className={CONTEXT_ICON_SIZES.mainHeader + " text-primary"} />
            </div>
            <div className="flex-1">
              <div className="text-lg lg:text-2xl font-bold tracking-tight text-foreground mb-1 lg:mb-3">Eisenhower Matrix</div>
              <div className="text-xs lg:text-sm font-medium text-muted-foreground leading-relaxed">
                Organize by urgency and importance
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Matrix Container */}
      <div className="flex-1 min-h-0">
        <Card className="h-full shadow-sm">
          <div className="p-2 lg:p-4 h-full flex flex-col">
            {/* Enhanced Axis Labels with Better Typography */}
            <div className="relative mb-2 lg:mb-4">
              {/* Top axis - Urgency */}
              <div className="flex items-center justify-center mb-2 lg:mb-4">
                <div className="grid grid-cols-2 gap-4 lg:gap-12 w-full">
                  <div className="text-center">
                    <div className="text-xs lg:text-sm font-bold text-red-700 tracking-wider mb-1 lg:mb-2 uppercase">Urgent</div>
                    <div className="w-12 lg:w-20 h-0.5 bg-red-600 mx-auto rounded-full"></div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs lg:text-sm font-bold text-blue-700 tracking-wider mb-1 lg:mb-2 uppercase">Not Urgent</div>
                    <div className="w-12 lg:w-20 h-0.5 bg-blue-600 mx-auto rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Matrix Grid with Left Axis Integration */}
            <div className="flex-1 flex gap-1 lg:gap-3 min-h-0">
              {/* Enhanced Left Axis Labels with Better Typography */}
              <div className="flex flex-col justify-between min-w-[40px] lg:min-w-[80px]">
                {/* Important Label */}
                <div className="flex-1 flex items-center justify-center py-1 lg:py-3">
                  <div className="text-center">
                    <div className="text-xs lg:text-sm font-bold text-green-700 -rotate-90 whitespace-nowrap tracking-wider uppercase">
                      Important
                    </div>
                  </div>
                </div>

                {/* Not Important Label */}
                <div className="flex-1 flex items-center justify-center py-1 lg:py-3">
                  <div className="text-center">
                    <div className="text-xs lg:text-sm font-bold text-gray-600 -rotate-90 whitespace-nowrap tracking-wider uppercase">
                      Not Important
                    </div>
                  </div>
                </div>
              </div>

              {/* Matrix Grid */}
              <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2 lg:gap-6 h-full min-h-0 overflow-hidden">
                {/* Quadrant I: Urgent & Important (DO) */}
                <div className="relative h-full min-h-0">
                  <Quadrant quadrant="DO" onEditTask={onEditTask} tasks={tasks} />
                </div>

                {/* Quadrant II: Not Urgent & Important (SCHEDULE) */}
                <div className="relative h-full min-h-0">
                  <Quadrant quadrant="SCHEDULE" onEditTask={onEditTask} tasks={tasks} />
                </div>

                {/* Quadrant III: Urgent & Not Important (DELEGATE) */}
                <div className="relative h-full min-h-0">
                  <Quadrant quadrant="DELEGATE" onEditTask={onEditTask} tasks={tasks} />
                </div>

                {/* Quadrant IV: Not Urgent & Not Important (DELETE) */}
                <div className="relative h-full min-h-0">
                  <Quadrant quadrant="DELETE" onEditTask={onEditTask} tasks={tasks} />
                </div>
              </div>
            </div>

            {/* Enhanced Legend with Better Typography */}
            <div className="mt-1 lg:mt-3 pt-2 lg:pt-4 border-t">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 lg:gap-3 p-2 lg:p-6">
                <div className="flex items-center gap-1 lg:gap-2">
                  <div className="w-2 h-2 lg:w-4 lg:h-4 bg-red-500 rounded-full"></div>
                  <span className="text-xs lg:text-sm font-semibold text-foreground">1. Do First</span>
                </div>
                <div className="flex items-center gap-1 lg:gap-2">
                  <div className="w-2 h-2 lg:w-4 lg:h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-xs lg:text-sm font-semibold text-foreground">2. Schedule</span>
                </div>
                <div className="flex items-center gap-1 lg:gap-2">
                  <div className="w-2 h-2 lg:w-4 lg:h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs lg:text-sm font-semibold text-foreground">3. Delegate</span>
                </div>
                <div className="flex items-center gap-1 lg:gap-2">
                  <div className="w-2 h-2 lg:w-4 lg:h-4 bg-gray-500 rounded-full"></div>
                  <span className="text-xs lg:text-sm font-semibold text-foreground">4. Delete</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EisenhowerMatrix;
