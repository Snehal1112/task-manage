import React from 'react';
import { Task } from '@/features/tasks/TaskTypes';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Quadrant from './Quadrant';
import { Target, TrendingUp, ArrowUp, ArrowRight } from 'lucide-react';

interface EisenhowerMatrixProps {
  onEditTask: (task: Task) => void;
  tasks?: Task[];
}

const EisenhowerMatrix: React.FC<EisenhowerMatrixProps> = ({ onEditTask, tasks }) => {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <Card className="mb-4 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-lg font-bold">Eisenhower Matrix</div>
              <div className="text-sm font-normal text-muted-foreground">
                Organize tasks by urgency and importance
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Matrix Container */}
      <div className="flex-1 min-h-0">
        <Card className="h-full shadow-sm">
          <div className="p-6 h-full flex flex-col">
            {/* Axis Labels Container */}
            <div className="relative mb-4">
              {/* Top axis - Urgency */}
              <div className="flex items-center justify-center mb-4 lg:mb-6">
                <div className="flex items-center gap-4 lg:gap-8 bg-gradient-to-r from-red-50 via-orange-50 to-blue-50 px-4 lg:px-8 py-2 lg:py-3 rounded-full border shadow-sm">
                  <div className="flex items-center gap-1 lg:gap-2">
                    <ArrowUp className="h-3 w-3 lg:h-4 lg:w-4 text-red-600" />
                    <span className="text-xs lg:text-sm font-semibold text-red-700">URGENT</span>
                  </div>
                  <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400" />
                  <div className="flex items-center gap-1 lg:gap-2">
                    <span className="text-xs lg:text-sm font-semibold text-blue-700">NOT URGENT</span>
                    <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Matrix Grid with Left Axis Integration */}
            <div className="flex-1 flex gap-2 lg:gap-4">
              {/* Left Axis Labels - Properly Aligned */}
              <div className="flex flex-col justify-center">
                {/* Important Label */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="bg-gradient-to-b from-green-50 via-emerald-50 to-green-100 px-3 lg:px-4 py-4 lg:py-5 rounded-full border shadow-sm">
                    <div className="flex flex-col items-center gap-1 lg:gap-2">
                      <ArrowUp className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                      <div className="text-xs lg:text-sm font-bold text-green-700 -rotate-90 whitespace-nowrap">
                        IMPORTANT
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Not Important Label */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="bg-gradient-to-b from-slate-50 via-gray-50 to-gray-100 px-3 lg:px-4 py-4 lg:py-5 rounded-full border shadow-sm">
                    <div className="flex flex-col items-center gap-1 lg:gap-2">
                      <div className="text-xs lg:text-sm font-bold text-gray-600 -rotate-90 whitespace-nowrap">
                        NOT IMPORTANT
                      </div>
                      <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500 rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Matrix Grid */}
              <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2 lg:gap-4">
                {/* Quadrant I: Urgent & Important (DO) */}
                <div className="relative">
                  <div className="absolute -top-2 -left-2 lg:-top-3 lg:-left-3 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center z-10 shadow-md">
                    1
                  </div>
                  <Quadrant quadrant="DO" onEditTask={onEditTask} tasks={tasks} />
                </div>

                {/* Quadrant II: Not Urgent & Important (SCHEDULE) */}
                <div className="relative">
                  <div className="absolute -top-2 -left-2 lg:-top-3 lg:-left-3 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center z-10 shadow-md">
                    2
                  </div>
                  <Quadrant quadrant="SCHEDULE" onEditTask={onEditTask} tasks={tasks} />
                </div>

                {/* Quadrant III: Urgent & Not Important (DELEGATE) */}
                <div className="relative">
                  <div className="absolute -top-2 -left-2 lg:-top-3 lg:-left-3 bg-yellow-500 text-white text-xs font-bold rounded-full w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center z-10 shadow-md">
                    3
                  </div>
                  <Quadrant quadrant="DELEGATE" onEditTask={onEditTask} tasks={tasks} />
                </div>

                {/* Quadrant IV: Not Urgent & Not Important (DELETE) */}
                <div className="relative">
                  <div className="absolute -top-2 -left-2 lg:-top-3 lg:-left-3 bg-gray-500 text-white text-xs font-bold rounded-full w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center z-10 shadow-md">
                    4
                  </div>
                  <Quadrant quadrant="DELETE" onEditTask={onEditTask} tasks={tasks} />
                </div>
              </div>
            </div>

            {/* Responsive Legend */}
            <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
                <div className="flex items-center gap-1.5 lg:gap-2">
                  <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs lg:text-xs font-medium">1. Do First</span>
                </div>
                <div className="flex items-center gap-1.5 lg:gap-2">
                  <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs lg:text-xs font-medium">2. Schedule</span>
                </div>
                <div className="flex items-center gap-1.5 lg:gap-2">
                  <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs lg:text-xs font-medium">3. Delegate</span>
                </div>
                <div className="flex items-center gap-1.5 lg:gap-2">
                  <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-xs lg:text-xs font-medium">4. Delete</span>
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