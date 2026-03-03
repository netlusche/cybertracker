import React, { useState, useEffect } from 'react';
import { DndContext, useSensor, useSensors, PointerSensor, KeyboardSensor, closestCorners } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import KanbanColumn from './KanbanColumn';

const CompletedDropzone = () => {
    const { t } = useTranslation();
    const { isOver, setNodeRef } = useDroppable({
        id: 'completed_zone',
        data: { statusName: 'completed' }
    });

    return (
        <div
            ref={setNodeRef}
            className={`fixed bottom-0 left-0 right-0 h-24 border-t-2 border-cyber-success bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center transition-all duration-300 ${isOver ? 'bg-cyber-success/30 shadow-[0_0_30px_rgba(0,255,100,0.5)]' : ''}`}
        >
            <div className="flex flex-col items-center gap-2">
                <span className={`text-2xl ${isOver ? 'animate-bounce' : ''}`}>✅</span>
                <span className="text-cyber-success font-bold tracking-widest uppercase font-mono text-[10px] md:text-sm drop-shadow-[0_0_5px_var(--theme-success)]">
                    {t('tasks.drop_complete', 'DROP HERE TO COMPLETE DIRECTIVE')}
                </span>
            </div>
        </div>
    );
};

const KanbanBoard = ({ tasks, taskStatuses, onUpdateTask, onToggleStatus, onTaskClick }) => {
    const { t } = useTranslation();

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
        useSensor(KeyboardSensor)
    );

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over) return; // Dropped nowhere

        const activeTask = active.data.current.task;
        const targetStatusId = over.id; // e.g. 'open', 'completed_zone', or custom status name

        // Handle Completed Dropzone
        if (targetStatusId === 'completed_zone') {
            // Optimistic update
            setLocalTasks(prev => prev.filter(t => t.id !== activeTask.id));
            onToggleStatus(activeTask); // this triggers XP and confetti in App.jsx
            return;
        }

        const newTargetStatusName = targetStatusId === 'open' ? 'open' : over.data.current.statusName;

        // If dropped in the same column, do nothing (unless we implement sortable inside columns later)
        if ((activeTask.workflow_status || 'open') === newTargetStatusName) return;

        // Optimistic UI Update
        setLocalTasks(prev => prev.map(t => {
            if (t.id === activeTask.id) {
                return { ...t, workflow_status: newTargetStatusName };
            }
            return t;
        }));

        // Send to backend
        try {
            await onUpdateTask(activeTask, { workflow_status: newTargetStatusName });
        } catch (err) {
            console.error('Failed to update task status in Kanban Board', err);
            // Revert optimistic update on error by triggering a full fetch
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
        ...filteredStatuses
    ];

    return (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <div className="fixed inset-0 top-0 pt-24 bg-cyber-black/95 z-40 pb-24 flex items-end">
                {/* Horizontal Scrolling Area */}
                <div className="w-full h-full overflow-x-auto overflow-y-hidden px-4 md:px-8 pb-4 custom-scrollbar">
                    <div className="flex gap-6 h-full items-start">
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
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            <CompletedDropzone />
        </DndContext>
    );
};

export default KanbanBoard;
