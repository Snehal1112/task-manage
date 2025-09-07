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
      {/* Matrix Container */}
      <div className="flex-1 min-h-0">
        <Card className="h-full shadow-sm">
          <div className="p-2 h-full flex flex-col">
            {/* Enhanced Axis Labels with Better Typography - Responsive */}
            <div className="relative mb-2 sm:mb-3">
              {/* Top axis - Urgency */}
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                <div className="grid grid-cols-2 gap-4 sm:gap-8 w-full">
                  <div className="text-center">
                    <div className="text-xs sm:text-sm font-bold text-red-700 tracking-wider mb-1 sm:mb-2 uppercase">Urgent</div>
                    <div className="w-12 sm:w-16 h-0.5 bg-red-600 mx-auto rounded-full"></div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs sm:text-sm font-bold text-blue-700 tracking-wider mb-1 sm:mb-2 uppercase">Not Urgent</div>
                    <div className="w-12 sm:w-16 h-0.5 bg-blue-600 mx-auto rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Matrix Grid with Left Axis Integration - Responsive */}
            <div className="flex-1 flex gap-1 sm:gap-2 min-h-0">
              {/* Enhanced Left Axis Labels with Better Typography - Hidden on very small screens */}
              <div className="hidden xs:flex sm:flex flex-col justify-between min-w-[30px] sm:min-w-[45px]">
                {/* Important Label */}
                <div className="flex-1 flex items-center justify-center py-2 sm:py-3">
                  <div className="text-center">
                    <div className="text-sm sm:text-base font-bold text-green-700 -rotate-90 whitespace-nowrap tracking-wider uppercase transform origin-center">
                      ⭐ Important
                    </div>
                  </div>
                </div>

                {/* Not Important Label */}
                <div className="flex-1 flex items-center justify-center py-2 sm:py-3">
                  <div className="text-center">
                    <div className="text-sm sm:text-base font-bold text-gray-600 -rotate-90 whitespace-nowrap tracking-wider uppercase transform origin-center">
                      📝 Not Important
                    </div>
                  </div>
                </div>
              </div>

              {/* Matrix Grid - Responsive with better mobile layout */}
              <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1 sm:gap-2 lg:gap-4 h-full min-h-0 overflow-hidden">
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

            {/* Enhanced Legend with Better Typography - Responsive */}
            <div className="mt-2 pt-2 sm:pt-3 border-t">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 sm:p-4">
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs sm:text-sm font-semibold text-foreground">1. Do First</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs sm:text-sm font-semibold text-foreground">2. Schedule</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs sm:text-sm font-semibold text-foreground">3. Delegate</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-xs sm:text-sm font-semibold text-foreground">4. Delete</span>
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
