import React from 'react';
import { Task } from '@/features/tasks/TaskTypes';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Quadrant from './Quadrant';
import { Target } from 'lucide-react';

interface EisenhowerMatrixProps {
  onEditTask: (task: Task) => void;
  tasks?: Task[];
}

const EisenhowerMatrix: React.FC<EisenhowerMatrixProps> = ({ onEditTask, tasks }) => {
  return (
    <div className="h-full flex flex-col">
      {/* Compact Header */}
      <Card className="mb-2 shadow-sm">
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1 bg-primary/10 rounded-md">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-bold">Eisenhower Matrix</div>
              <div className="text-xs font-normal text-muted-foreground">
                Organize by urgency and importance
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Matrix Container */}
      <div className="flex-1 min-h-0">
        <Card className="h-full shadow-sm">
          <div className="p-2 h-full flex flex-col">
            {/* Compact Axis Labels */}
            <div className="relative mb-2">
              {/* Top axis - Urgency */}
              <div className="flex items-center justify-center mb-2">
                <div className="grid grid-cols-2 gap-8 w-full">
                  <div className="text-center">
                    <div className="text-xs font-bold text-red-700 tracking-wide mb-1">URGENT</div>
                    <div className="w-12 h-0.5 bg-red-600 mx-auto"></div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-blue-700 tracking-wide mb-1">NOT URGENT</div>
                    <div className="w-12 h-0.5 bg-blue-600 mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Matrix Grid with Left Axis Integration */}
            <div className="flex-1 flex gap-2 min-h-0">
              {/* Left Axis Labels - Compact Design */}
              <div className="flex flex-col justify-between min-w-[50px]">
                {/* Important Label */}
                <div className="flex-1 flex items-center justify-center py-1">
                  <div className="text-center">
                    <div className="text-xs font-bold text-green-700 -rotate-90 whitespace-nowrap">
                      IMPORTANT
                    </div>
                  </div>
                </div>

                {/* Not Important Label */}
                <div className="flex-1 flex items-center justify-center py-1">
                  <div className="text-center">
                    <div className="text-xs font-bold text-gray-600 -rotate-90 whitespace-nowrap">
                      NOT IMPORTANT
                    </div>
                  </div>
                </div>
              </div>

              {/* Matrix Grid */}
              <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 h-full min-h-0 overflow-hidden">
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

            {/* Compact Legend */}
            <div className="mt-1 pt-1 border-t">
              <div className="grid grid-cols-4 gap-1 p-5">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs font-medium truncate">1. Do First</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs font-medium truncate">2. Schedule</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs font-medium truncate">3. Delegate</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span className="text-xs font-medium truncate">4. Delete</span>
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
