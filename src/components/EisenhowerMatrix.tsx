import React from 'react';
import { Task } from '@/features/tasks/TaskTypes';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Quadrant from './Quadrant';
import { Grid3X3 } from 'lucide-react';

interface EisenhowerMatrixProps {
  onEditTask: (task: Task) => void;
}

const EisenhowerMatrix: React.FC<EisenhowerMatrixProps> = ({ onEditTask }) => {
  return (
    <div className="h-full">
      <Card className="h-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            Eisenhower Matrix
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Drag tasks from the Task Panel into the appropriate quadrant to prioritize them.
          </p>
        </CardHeader>
        
        <div className="relative flex-1 p-4 lg:p-6 pt-0">
          {/* Matrix Labels */}
          <div className="grid grid-cols-[auto_1fr_1fr] gap-2 lg:gap-4 mb-4">
            <div></div> {/* Empty top-left corner */}
            <div className="text-center">
              <div className="text-xs lg:text-sm font-semibold text-muted-foreground mb-1">URGENT</div>
              <div className="w-12 lg:w-16 h-0.5 bg-muted-foreground/30 mx-auto"></div>
            </div>
            <div className="text-center">
              <div className="text-xs lg:text-sm font-semibold text-muted-foreground mb-1">NOT URGENT</div>
              <div className="w-12 lg:w-16 h-0.5 bg-muted-foreground/30 mx-auto"></div>
            </div>
          </div>

          {/* Main Matrix Grid */}
          <div className="grid grid-cols-[auto_1fr_1fr] gap-2 lg:gap-4 min-h-[400px] lg:h-[calc(100%-60px)]">
            {/* Row 1: Important */}
            <div className="flex items-center justify-center">
              <div className="text-center -rotate-90">
                <div className="text-xs lg:text-sm font-semibold text-muted-foreground whitespace-nowrap">IMPORTANT</div>
              </div>
            </div>
            <div>
              <Quadrant quadrant="DO" onEditTask={onEditTask} />
            </div>
            <div>
              <Quadrant quadrant="SCHEDULE" onEditTask={onEditTask} />
            </div>
            
            {/* Row 2: Not Important */}
            <div className="flex items-center justify-center">
              <div className="text-center -rotate-90">
                <div className="text-xs lg:text-sm font-semibold text-muted-foreground whitespace-nowrap">NOT IMPORTANT</div>
              </div>
            </div>
            <div>
              <Quadrant quadrant="DELEGATE" onEditTask={onEditTask} />
            </div>
            <div>
              <Quadrant quadrant="DELETE" onEditTask={onEditTask} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EisenhowerMatrix;