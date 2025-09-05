import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { moveTaskToQuadrant } from '@/features/tasks/tasksSlice';
import { selectTaskById } from '@/features/tasks/tasksSelectors';
import { TaskQuadrant } from '@/features/tasks/TaskTypes';
import TaskCard from './TaskCard';
import DragContext from '@/contexts/DragContext';

interface DragDropWrapperProps {
  children: React.ReactNode;
}

const DragDropWrapper: React.FC<DragDropWrapperProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const activeTask = useAppSelector((state) => 
    activeId ? selectTaskById(activeId)(state) : undefined
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      // Add keyboard support for accessibility
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setOverId(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? over.id as string : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setOverId(null);
      return;
    }

    const taskId = active.id as string;
    const newQuadrant = over.id as TaskQuadrant;

    // Only update if the quadrant actually changed
    if (active.data.current?.quadrant !== newQuadrant) {
      dispatch(moveTaskToQuadrant({ 
        id: taskId, 
        quadrant: newQuadrant 
      }));
    }

    setActiveId(null);
    setOverId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
  };

  return (
    <DragContext.Provider value={{ activeId, overId }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
        <DragOverlay
          dropAnimation={{
            duration: 150,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          {activeTask ? (
            <div className="rotate-2 scale-105 transition-all duration-150 shadow-2xl ring-2 ring-primary/30 ring-offset-2">
              <TaskCard
                task={activeTask}
                index={-1}
                onEdit={() => {}}
                isDragOverlay
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </DragContext.Provider>
  );
};

export default DragDropWrapper;