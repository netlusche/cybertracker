import React, { useState, useEffect } from 'react';
import { DndContext, useSensor, useSensors, PointerSensor, TouchSensor, KeyboardSensor, closestCorners } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import KanbanColumn from './KanbanColumn';
import { useTaskContext } from '../contexts/TaskContext';
import { useStatusContext } from '../contexts/StatusContext';

const KanbanBoard = ({ tasks, onDelete, onTaskClick }) => {
    const { t } = useTranslation();
    const { handleUpdateTask: onUpdateTask, handleToggleStatus: onToggleStatus } = useTaskContext();
    const { taskStatuses = [] } = useStatusContext();

    // We maintain a local copy of tasks to allow instant UI updates 
    // before the server responds, ensuring a snappy drag-and-drop experience.
    const [localTasks, setLocalTasks] = useState(tasks);

    // Sync if parent updates tasks significantly
    useEffect(() => {
        setLocalTasks(tasks);
    }, [tasks]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // minimum distance to drag before it starts
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor)
    );

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over) return; // Dropped nowhere

        const activeTask = active.data.current.task;
        const targetStatusId = over.id; // e.g. 'open', 'completed', or custom status name
        const newTargetStatusName = targetStatusId === 'open' ? 'open' : over.data.current.statusName;

        // If dropped in the same column, do nothing
        if ((activeTask.workflow_status || 'open') === newTargetStatusName) return;

        // If moving TO completed
        if (newTargetStatusName === 'completed') {
            onToggleStatus(activeTask);
            setLocalTasks(prev => prev.map(t => {
                if (t.id === activeTask.id) return { ...t, status: 1, workflow_status: 'completed' };
                return t;
            }));
            return;
        }

        // If moving FROM completed to an active status
        if (activeTask.status == 1 && newTargetStatusName !== 'completed') {
            onToggleStatus(activeTask); // will uncomplete it
        }

        // Optimistic UI Update for regular columns
        setLocalTasks(prev => prev.map(t => {
            if (t.id === activeTask.id) {
                return { ...t, status: 0, workflow_status: newTargetStatusName };
            }
            return t;
        }));

        // Send to backend
        try {
            await onUpdateTask(activeTask, { workflow_status: newTargetStatusName });
        } catch (err) {
            console.error('Failed to update task status in Kanban Board', err);
            setLocalTasks(tasks);
        }
    };

    // Columns Configuration
    // Filter out 'completed' since it's a dropzone, and 'open' to prevent duplicates
    const filteredStatuses = taskStatuses.filter(ts =>
        ts.name.toLowerCase() !== 'completed' &&
        ts.name.toLowerCase() !== 'open'
    );

    const columns = [
        { id: 'open', name: 'open', is_system: true },
        ...filteredStatuses,
        { id: 'completed', name: 'completed', is_system: true }
    ];

    return (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <div className="fixed inset-0 top-0 pt-16 bg-cyber-black/95 z-40 pb-12 flex items-start justify-center">
                {/* Horizontal Scrolling Area */}
                <div className="w-full max-w-full overflow-x-auto overflow-y-hidden px-4 md:px-8 pb-4 custom-scrollbar flex items-start h-full mt-4">
                    <div className="flex gap-6 h-[75vh] min-h-[500px] items-start mx-auto">
                        {columns.map(status => {
                            const columnTasks = localTasks.filter(t => {
                                const tStatus = t.workflow_status || 'open';
                                return tStatus === status.name || (status.id === 'open' && tStatus === 'open');
                            });

                            return (
                                <KanbanColumn
                                    key={status.id || status.name}
                                    status={status}
                                    tasks={columnTasks}
                                    onTaskClick={onTaskClick}
                                    onDelete={onDelete}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

        </DndContext>
    );
};

export default KanbanBoard;
